import { NAIROBI, PRESET_LOCATIONS, populateLocationList } from './data.js';
import { angleDiff, bearing, directionName, haversine, routeHeading, sunPosition } from './calculations.js';
import { createMapController } from './map.js';
import { createStars, createToastManager, getElements, setLoading } from './ui.js';
import { createSunController } from './sun.js';

const elements = getElements();
const showToast = createToastManager(elements.toastContainer);
const mapController = createMapController();
let darkMode = true;
let userCoords = null;
const ICONS = {
  moon: 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/0fa56a-circle/dynamic/200/color.webp',
  sun: 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/8bbd16-location/dynamic/200/color.webp',
  location: 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/8bbd16-location/dynamic/200/color.webp',
};

function currentLocation() {
  return PRESET_LOCATIONS[elements.startLoc.value.trim()] || userCoords;
}

function updateTheme() {
  document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  if (elements.themeToggle) elements.themeToggle.innerHTML = `<img src="${darkMode ? ICONS.moon : ICONS.sun}" alt="">`;
  mapController.setDarkMode(darkMode);
}

async function resolveCoordinates(name) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  if (trimmed === 'My Location' || trimmed.toLowerCase() === 'gps') return userCoords;
  if (PRESET_LOCATIONS[trimmed]) return PRESET_LOCATIONS[trimmed];
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(trimmed)}`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    const results = await response.json();
    return results?.length ? { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) } : null;
  } catch (error) {
    console.warn('Geocode failed:', error);
    return null;
  }
}

function fetchGPS(showMessage = true) {
  const gpsLabel = `<img class="ui-icon" src="${ICONS.location}" alt=""> GPS`;
  const fallback = () => {
    userCoords = NAIROBI;
    if (showMessage) showToast('GPS unavailable — using Nairobi', 'error');
    sun.update();
  };
  if (!('geolocation' in navigator)) return fallback();
  elements.gpsBtn.textContent = 'Locating…';
  elements.gpsBtn.classList.add('loading');
  navigator.geolocation.getCurrentPosition((position) => {
    userCoords = { lat: position.coords.latitude, lon: position.coords.longitude };
    if (showMessage) elements.startLoc.value = 'My Location';
    elements.gpsBtn.textContent = 'Located';
    elements.gpsBtn.classList.remove('loading');
    setTimeout(() => { elements.gpsBtn.innerHTML = gpsLabel; }, 1800);
    if (showMessage) showToast('GPS acquired', 'success');
    sun.update();
  }, () => {
    elements.gpsBtn.textContent = 'Unavailable';
    elements.gpsBtn.classList.remove('loading');
    setTimeout(() => { elements.gpsBtn.innerHTML = gpsLabel; }, 1800);
    fallback();
  }, { timeout: 8000 });
}

function updateCompass(heading, sunAzimuth, sunAltitude) {
  const relativeSun = (sunAzimuth - heading + 360) % 360;
  const radians = (relativeSun - 90) * Math.PI / 180;
  const x = 140 + Math.cos(radians) * 92;
  const y = 140 + Math.sin(radians) * 92;
  elements.sunIconSvg.setAttribute('transform', `translate(${x}, ${y})`);
  elements.sunIconSvg.classList.toggle('below-horizon', sunAltitude < 0);
  const direction = directionName(heading);
  elements.headingArrowSvg.textContent = `↑ ${direction}`;
  elements.clN.classList.toggle('active', direction.includes('N'));
  elements.clE.classList.toggle('active', direction.includes('E'));
  elements.clS.classList.toggle('active', direction.includes('S'));
  elements.clW.classList.toggle('active', direction.includes('W'));
  elements.matatuShape.setAttribute('stroke-width', sunAltitude > 0 && sunAltitude < 75 ? '2.5' : '2');
}

function updateVerdict(hotSide, safeSide, sunAzimuth, sunAltitude) {
  elements.verdictBox.style.display = 'block';
  if (sunAltitude < 0) {
    elements.verdictTitle.textContent = 'Sun below horizon';
    elements.verdictAdvice.textContent = 'No sun exposure — sit anywhere!';
  } else if (sunAltitude > 75) {
    elements.verdictTitle.textContent = 'Sun overhead';
    elements.verdictAdvice.textContent = 'Both sides equal — pick your favorite!';
  } else if (hotSide === 'EITHER') {
    elements.verdictTitle.textContent = 'Even exposure';
    elements.verdictAdvice.textContent = 'Sun ahead/behind — both sides similar.';
  } else {
    elements.verdictTitle.textContent = `Avoid ${hotSide}`;
    elements.verdictAdvice.innerHTML = `Sit on <strong>${safeSide}</strong> side. Sun from ${directionName(sunAzimuth)}, altitude ${sunAltitude.toFixed(0)}°.`;
    showToast(`Hot side: ${hotSide}`, 'info');
  }
  if (elements.accessibilitySummary) {
    const summary = sunAltitude < 0
      ? 'The sun is below the horizon. Either side of the matatu is suitable.'
      : sunAltitude > 75
        ? 'The sun is overhead. Both sides receive similar exposure.'
        : hotSide === 'EITHER'
          ? 'Sun exposure is even. Both sides are similar.'
          : `Sun is from the ${directionName(sunAzimuth)}. Avoid the ${hotSide.toLowerCase()} side and sit on the ${safeSide.toLowerCase()} side.`;
    elements.accessibilitySummary.textContent = summary;
  }
}

async function calculateRoute() {
  const startName = elements.startLoc.value.trim();
  const destinationName = elements.destLoc.value.trim();
  if (!startName || !destinationName) return showToast('Enter both places', 'error');
  setLoading(elements.calcBtn, true);
  const start = await resolveCoordinates(startName);
  const destination = await resolveCoordinates(destinationName);
  if (!start || !destination) {
    setLoading(elements.calcBtn, false);
    return showToast('Could not find one or both places', 'error');
  }
  let heading = bearing(start.lat, start.lon, destination.lat, destination.lon);
  let distanceKm = haversine(start.lat, start.lon, destination.lat, destination.lon) / 1000;
  let routeCoordinates;
  let isRealRoad = false;
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === 'Ok' && data.routes?.length) {
      const route = data.routes[0];
      routeCoordinates = route.geometry.coordinates;
      distanceKm = route.distance / 1000;
      heading = routeHeading(routeCoordinates);
      isRealRoad = true;
    }
  } catch (error) { console.warn('OSRM failed:', error); }
  setLoading(elements.calcBtn, false);
  elements.routeDist.textContent = `${distanceKm.toFixed(1)} km`;
  elements.routeHeading.textContent = `${directionName(heading)} (${heading.toFixed(1)}°)`;
  elements.routeBadgeMap.textContent = isRealRoad ? 'Road route' : 'Straight line';
  elements.routeBadgeMap.className = `badge ${isRealRoad ? 'real' : 'estimate'}`;
  const { azimuth, altitude } = sunPosition(sun.selectedDateTime(), start);
  const sunAnchor = routeCoordinates?.length
    ? (() => {
      const [lon, lat] = routeCoordinates[Math.floor(routeCoordinates.length / 2)];
      return { lat, lon };
    })()
    : {
      lat: (start.lat + destination.lat) / 2,
      lon: (start.lon + destination.lon) / 2,
    };
  mapController.drawRoute(start, destination, routeCoordinates);
  if (altitude >= 0) mapController.drawSunDirection(sunAnchor, azimuth);
  const leftDistance = angleDiff(azimuth, (heading - 90 + 360) % 360);
  const rightDistance = angleDiff(azimuth, (heading + 90) % 360);
  const hotSide = leftDistance < rightDistance ? 'LEFT' : rightDistance < leftDistance ? 'RIGHT' : 'EITHER';
  const safeSide = hotSide === 'LEFT' ? 'RIGHT' : hotSide === 'RIGHT' ? 'LEFT' : 'EITHER';
  elements.leftLabelSvg.classList.remove('hot', 'safe');
  elements.rightLabelSvg.classList.remove('hot', 'safe');
  if (hotSide === 'LEFT') { elements.leftLabelSvg.classList.add('hot'); elements.rightLabelSvg.classList.add('safe'); }
  if (hotSide === 'RIGHT') { elements.rightLabelSvg.classList.add('hot'); elements.leftLabelSvg.classList.add('safe'); }
  updateCompass(heading, azimuth, altitude);
  sun.updateTimeline();
  updateVerdict(hotSide, safeSide, azimuth, altitude);
}

const sun = createSunController(elements, currentLocation);
populateLocationList(document.getElementById('loc-list'));
createStars(elements.starfield);
if (elements.themeToggle) elements.themeToggle.addEventListener('click', () => { darkMode = !darkMode; updateTheme(); });
elements.resetTimeBtn.addEventListener('click', () => { sun.setDefaultTime(); showToast('Time reset', 'success'); });
elements.checkDate.addEventListener('change', () => { sun.syncSliderFromTime(); sun.update(); });
elements.checkTime.addEventListener('change', () => { sun.syncSliderFromTime(); sun.update(); });
elements.timeSlider.addEventListener('input', sun.syncTimeFromSlider);
elements.gpsBtn.addEventListener('click', () => fetchGPS(true));
elements.calcBtn.addEventListener('click', calculateRoute);
elements.startLoc.addEventListener('change', () => sun.update());
elements.startLoc.addEventListener('blur', () => sun.update());

updateTheme();
fetchGPS(false);
sun.setDefaultTime();
mapController.init();
setInterval(() => sun.update(), 30000);
