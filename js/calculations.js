import SunCalc from 'suncalc';

export function getUV(altitude) {
  if (altitude < 0) return 'Night';
  if (altitude < 10) return 'Low';
  if (altitude < 30) return 'Moderate';
  if (altitude < 50) return 'High';
  if (altitude < 70) return 'Very High';
  return 'Extreme';
}

export function sunPosition(date, coords) {
  const position = SunCalc.getPosition(date, coords.lat, coords.lon);
  return {
    azimuth: (position.azimuth * 180 / Math.PI + 180) % 360,
    altitude: position.altitude * 180 / Math.PI,
  };
}

export function bearing(lat1, lon1, lat2, lon2) {
  const toRad = (degrees) => degrees * Math.PI / 180;
  const toDeg = (radians) => radians * 180 / Math.PI;
  const deltaLon = toRad(lon2 - lon1);
  const y = Math.sin(deltaLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(deltaLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function haversine(lat1, lon1, lat2, lon2) {
  const radius = 6371e3;
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function angleDiff(a, b) {
  const difference = Math.abs(a - b) % 360;
  return difference > 180 ? 360 - difference : difference;
}

export function directionName(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(degrees / 22.5) % 16];
}

export function routeHeading(routeCoordinates) {
  let sine = 0;
  let cosine = 0;
  for (let i = 0; i < routeCoordinates.length - 1; i += 1) {
    const [lon1, lat1] = routeCoordinates[i];
    const [lon2, lat2] = routeCoordinates[i + 1];
    const direction = bearing(lat1, lon1, lat2, lon2);
    const distance = haversine(lat1, lon1, lat2, lon2);
    const radians = direction * Math.PI / 180;
    sine += Math.sin(radians) * distance;
    cosine += Math.cos(radians) * distance;
  }
  return (Math.atan2(sine, cosine) * 180 / Math.PI + 360) % 360;
}
