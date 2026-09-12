import { PRESET_LOCATIONS } from './data.js';
import { getUV, sunPosition } from './calculations.js';

export function createSunController(elements, getLocation) {
  let lastAltitude = null;

  function selectedDateTime() {
    const date = elements.checkDate.value || new Date().toISOString().split('T')[0];
    const time = elements.checkTime.value || '12:00';
    return new Date(`${date}T${time}`);
  }

  function updateTimeline() {
    const coords = getLocation();
    if (!coords) return;
    const date = selectedDateTime();
    const times = [];
    for (let i = 0; i <= 48; i += 1) {
      const time = new Date(date);
      time.setHours(5, i * 20, 0, 0);
      times.push({ altitude: sunPosition(time, coords).altitude });
    }
    const maxAltitude = Math.max(...times.map((time) => time.altitude), 1);
    const minAltitude = Math.min(...times.map((time) => time.altitude), -10);
    const range = maxAltitude - minAltitude || 1;
    const path = times.map((time, index) => {
      const x = (index / 48) * 600;
      const y = 10 + (1 - (time.altitude - minAltitude) / range) * 50;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join('');
    elements.timelineCurve.setAttribute('d', path);
    const currentMinutes = date.getHours() * 60 + date.getMinutes();
    const fraction = Math.max(0, Math.min(1, (currentMinutes - 300) / 840));
    const markerX = fraction * 600;
    elements.timelineMarker.setAttribute('x1', markerX);
    elements.timelineMarker.setAttribute('x2', markerX);
    const dotY = lastAltitude === null ? 35 : 10 + (1 - (lastAltitude - minAltitude) / range) * 50;
    elements.timelineSunDot.setAttribute('cx', markerX);
    elements.timelineSunDot.setAttribute('cy', dotY);
  }

  function update() {
    const coords = getLocation();
    if (!coords) return;
    const date = selectedDateTime();
    const { azimuth, altitude } = sunPosition(date, coords);
    elements.checkTimeDisplay.textContent = date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    elements.azimuth.textContent = `${azimuth.toFixed(1)}°`;
    elements.altitude.textContent = `${altitude.toFixed(1)}°`;
    elements.uvLevel.textContent = getUV(altitude);
    lastAltitude = altitude;
    [elements.azimuth, elements.altitude, elements.uvLevel].forEach((element) => element.classList.add('updated'));
    setTimeout(() => [elements.azimuth, elements.altitude, elements.uvLevel].forEach((element) => element.classList.remove('updated')), 500);
    updateTimeline();
  }

  function setDefaultTime() {
    const now = new Date();
    elements.checkDate.value = now.toISOString().split('T')[0];
    elements.checkTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    syncSliderFromTime();
    update();
  }

  function syncSliderFromTime() {
    if (!elements.checkTime.value) return;
    const [hours, minutes] = elements.checkTime.value.split(':').map(Number);
    const total = hours * 60 + minutes;
    if (total >= 300 && total <= 1140) elements.timeSlider.value = total;
  }

  function syncTimeFromSlider() {
    const total = Number(elements.timeSlider.value);
    elements.checkTime.value = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    update();
  }

  return { selectedDateTime, update, updateTimeline, setDefaultTime, syncSliderFromTime, syncTimeFromSlider };
}
