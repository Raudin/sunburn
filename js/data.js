export const PRESET_LOCATIONS = {
  'Nairobi CBD': { lat: -1.2864, lon: 36.8172 },
  Kangemi: { lat: -1.2533, lon: 36.7611 },
  Westlands: { lat: -1.2606, lon: 36.8047 },
  Karen: { lat: -1.3095, lon: 36.6786 },
  Thika: { lat: -1.0331, lon: 37.0737 },
  Ruiru: { lat: -1.1431, lon: 36.9583 },
  Kiambu: { lat: -1.1714, lon: 36.8616 },
  Mombasa: { lat: -4.0435, lon: 39.6682 },
  Kisumu: { lat: -0.0917, lon: 34.768 },
  Nakuru: { lat: -0.3031, lon: 36.08 },
  Eldoret: { lat: 0.5143, lon: 35.2698 },
};

export const NAIROBI = PRESET_LOCATIONS['Nairobi CBD'];

export function populateLocationList(list) {
  Object.keys(PRESET_LOCATIONS).forEach((location) => {
    const option = document.createElement('option');
    option.value = location;
    list.appendChild(option);
  });
}
