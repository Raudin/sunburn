export function getElements() {
  const ids = [
    'checkTimeDisplay', 'checkDate', 'checkTime', 'resetTimeBtn', 'timeSlider',
    'azimuth', 'altitude', 'uvLevel', 'startLoc', 'destLoc', 'gpsBtn', 'calcBtn',
    'routeDist', 'routeHeading', 'routeBadgeMap', 'verdictBox', 'verdictTitle',
    'verdictAdvice', 'themeToggle', 'toastContainer', 'accessibilitySummary', 'sunIconSvg', 'leftLabelSvg',
    'rightLabelSvg', 'headingArrowSvg', 'matatuShape', 'clN', 'clE', 'clS', 'clW',
    'timelineCurve', 'timelineMarker', 'timelineSunDot', 'timelineBar', 'starfield',
  ];
  return Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
}

export function createStars(container, count = 80) {
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 3}s`;
    star.style.animationDuration = `${Math.random() * 3 + 2}s`;
    container.appendChild(star);
  }
}

export function createToastManager(container) {
  let timeout;
  const remove = (toast) => {
    if (!toast || toast.classList.contains('removing')) return;
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 250);
  };
  return (message, type = 'info', duration = type === 'error' ? 0 : 3200) => {
    const icons = {
      error: 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/49b6f4-target/dynamic/200/color.webp',
      success: 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/8bbd16-location/dynamic/200/color.webp',
      info: 'https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/4a4275-chart/dynamic/200/color.webp',
    };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<img class="ui-icon" src="${icons[type] || icons.info}" alt=""><span>${message}</span><button class="toast-dismiss" type="button" aria-label="Dismiss message">×</button>`;
    toast.querySelector('.toast-dismiss').onclick = (event) => { event.stopPropagation(); remove(toast); };
    toast.onclick = () => remove(toast);
    container.appendChild(toast);
    if (timeout) clearTimeout(timeout);
    if (duration > 0) timeout = setTimeout(() => remove(toast), duration);
  };
}

export function setLoading(button, loading) {
  const spinner = button.querySelector('.spinner');
  button.disabled = loading;
  button.classList.toggle('loading', loading);
  if (spinner) spinner.style.display = loading ? 'inline-block' : 'none';
}
