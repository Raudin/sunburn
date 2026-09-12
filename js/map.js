import { NAIROBI } from './data.js';
import L from 'leaflet';

export function createMapController() {
  let map;
  let routeLayer;
  let markers = [];
  let sunLayer = [];
  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  function updateTheme() {
    if (!map) return;
    map.eachLayer((layer) => { if (layer instanceof L.TileLayer) map.removeLayer(layer); });
    L.tileLayer(tileUrl, { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
  }

  function init() {
    if (map) return;
    map = L.map('map', { zoomControl: true, scrollWheelZoom: false })
      .setView([NAIROBI.lat, NAIROBI.lon], 11);
    updateTheme();
  }

  function setDarkMode(value) {
    updateTheme();
  }

  function drawRoute(start, destination, routeCoordinates) {
    init();
    if (routeLayer) map.removeLayer(routeLayer);
    markers.forEach((marker) => map.removeLayer(marker));
    sunLayer.forEach((layer) => map.removeLayer(layer));
    markers = [];
    sunLayer = [];
    const bounds = [[start.lat, start.lon], [destination.lat, destination.lon]];
    markers.push(L.circleMarker([start.lat, start.lon], { radius: 6, color: '#2ed573', fillColor: '#2ed573', fillOpacity: 0.9, weight: 2 }).addTo(map).bindPopup('Start'));
    markers.push(L.circleMarker([destination.lat, destination.lon], { radius: 6, color: '#ff4757', fillColor: '#ff4757', fillOpacity: 0.9, weight: 2 }).addTo(map).bindPopup('Dest'));
    if (routeCoordinates?.length) {
      const latLngs = routeCoordinates.map(([lon, lat]) => [lat, lon]);
      routeLayer = L.polyline(latLngs, { color: '#4dabf7', weight: 3, opacity: 0.8, dashArray: '6 6' }).addTo(map);
      bounds.push(...latLngs);
    }
    map.fitBounds(bounds, { padding: [20, 20] });
  }

  function drawSunDirection(start, azimuth, distanceMeters = 2200) {
    init();
    sunLayer.forEach((layer) => map.removeLayer(layer));
    sunLayer = [];

    const earthRadius = 6371e3;
    const bearingRadians = azimuth * Math.PI / 180;
    const latitudeRadians = start.lat * Math.PI / 180;
    const longitudeRadians = start.lon * Math.PI / 180;
    const angularDistance = distanceMeters / earthRadius;
    const sunLatitude = Math.asin(
      Math.sin(latitudeRadians) * Math.cos(angularDistance) +
      Math.cos(latitudeRadians) * Math.sin(angularDistance) * Math.cos(bearingRadians),
    );
    const sunLongitude = longitudeRadians + Math.atan2(
      Math.sin(bearingRadians) * Math.sin(angularDistance) * Math.cos(latitudeRadians),
      Math.cos(angularDistance) - Math.sin(latitudeRadians) * Math.sin(sunLatitude),
    );
    const sunPoint = [sunLatitude * 180 / Math.PI, sunLongitude * 180 / Math.PI];
    const startPoint = [start.lat, start.lon];

    sunLayer.push(L.polyline([startPoint, sunPoint], {
      color: '#ffcc00',
      weight: 2,
      opacity: 0.9,
      dashArray: '5 7',
    }).addTo(map));
    sunLayer.push(L.marker(sunPoint, {
      icon: L.divIcon({
        className: 'sun-map-marker',
        html: '<span aria-hidden="true"></span>',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      }),
      zIndexOffset: 500,
    }).addTo(map).bindTooltip(`Sun direction · ${azimuth.toFixed(0)}°`, { direction: 'top', offset: [0, -12] }));
  }

  return { init, setDarkMode, drawRoute, drawSunDirection };
}
