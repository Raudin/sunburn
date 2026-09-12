import React, { useEffect } from 'react';
import { CalendarDays, Clock3, Compass, Crosshair, LocateFixed, MapPin, Navigation, Route, Satellite, Sun, Target, TimerReset } from 'lucide-react';
import gsap from 'gsap';
import { Badge, Button, Card, Input, SectionLabel } from './components/ui.jsx';

const icons = { strokeWidth: 1.8 };

function CompassDiagram() {
  return (
    <svg className="sun-compass-svg" id="sunCompassSvg" viewBox="0 0 280 280" aria-label="Sun position and matatu heading">
      <circle className="compass-ring" cx="140" cy="140" r="120" />
      <circle className="compass-ring" cx="140" cy="140" r="88" />
      <circle className="compass-ring" cx="140" cy="140" r="56" opacity="0.4" />
      <g id="compassTicks" />
      <text className="compass-label" id="clN" x="140" y="14" textAnchor="middle">N</text>
      <text className="compass-label" id="clE" x="266" y="144" textAnchor="middle">E</text>
      <text className="compass-label" id="clS" x="140" y="276" textAnchor="middle">S</text>
      <text className="compass-label" id="clW" x="14" y="144" textAnchor="middle">W</text>
      <rect className="matatu-shape" id="matatuShape" x="110" y="62" width="60" height="156" rx="12" ry="12" />
      {[82, 178].flatMap((y) => [118, 130, 142, 154].map((x) => <rect key={`${x}-${y}`} className="matatu-window-shape" x={x} y={y} width="8" height="20" rx="2" />))}
      <text className="matatu-label" id="leftLabelSvg" x="104" y="140" textAnchor="end">← LEFT</text>
      <text className="matatu-label" id="rightLabelSvg" x="176" y="140" textAnchor="start">RIGHT →</text>
      <g className="sun-svg-icon" id="sunIconSvg"><circle cx="0" cy="0" r="16" fill="#0066FF" opacity="0.9" /><circle cx="0" cy="0" r="8" fill="#fff" opacity="0.9" /></g>
      <text className="heading-arrow-svg" id="headingArrowSvg" x="140" y="50">↑ N</text>
    </svg>
  );
}

export default function App() {
  useEffect(() => {
    gsap.from('.ui-card', { opacity: 0, y: 18, duration: 0.65, stagger: 0.08, ease: 'power2.out' });
    gsap.from('.advisor-panel', { opacity: 0, scale: 0.985, duration: 0.8, delay: 0.15, ease: 'power3.out' });
  }, []);

  return (
    <>
      <div className="starfield" id="starfield" />
      <div className="toast-container" id="toastContainer" />
      <div className="sr-only" id="accessibilitySummary" aria-live="polite">Awaiting route calculation.</div>

      <main className="app-container">
        <Card className="card-left controls-card">
          <div className="eyebrow"><Route size={14} /> ROUTE COMFORT TOOL</div>
          <h1>Matatu Sun Advisor</h1>
          <p className="subtitle">Make the ride cooler, one route at a time.</p>

          <div className="info-grid">
            <div className="info-pill"><Clock3 className="metric-icon" /><span id="checkTimeDisplay">--</span></div>
            <div className="info-pill"><Sun className="metric-icon" /> Az <span className="value" id="azimuth">--</span></div>
            <div className="info-pill"><Compass className="metric-icon" /> Alt <span className="value" id="altitude">--</span></div>
            <div className="info-pill"><Satellite className="metric-icon" /> UV <span className="value" id="uvLevel">--</span></div>
          </div>

          <SectionLabel icon={CalendarDays}>Date & time</SectionLabel>
          <div className="time-row"><label className="sr-only" htmlFor="checkDate">Date</label><Input type="date" id="checkDate" aria-label="Date" /><label className="sr-only" htmlFor="checkTime">Time</label><Input type="time" id="checkTime" aria-label="Time" /><Button id="resetTimeBtn" variant="outline"><TimerReset size={16} />Now</Button></div>
          <div className="slider-wrap"><div className="slider-header"><span id="sunriseLabel">Sunrise</span><span id="noonLabel">Noon</span><span id="sunsetLabel">Sunset</span></div><input type="range" className="time-slider" id="timeSlider" min="300" max="1140" step="10" value="720" readOnly={false} /></div>

          <SectionLabel icon={MapPin} htmlFor="startLoc">Starting point</SectionLabel>
          <div className="input-group"><Input type="text" id="startLoc" list="loc-list" placeholder="Enter any place..." defaultValue="Nairobi CBD" autoComplete="off" /><Button className="gps-btn" id="gpsBtn" variant="outline"><LocateFixed size={16} />GPS</Button></div>
          <SectionLabel icon={Target} htmlFor="destLoc">Destination</SectionLabel>
          <div className="input-group"><Input type="text" id="destLoc" list="loc-list" placeholder="Enter any place..." defaultValue="Kangemi" autoComplete="off" /></div>
          <datalist id="loc-list" />
          <Button className="calc-btn" id="calcBtn" variant="primary"><span className="spinner" /><Navigation size={17} />Calculate sun side</Button>
        </Card>

        <Card className="card-right workspace-card">
          <div className="card-inner advisor-panel">
            <div className="advisor-copy"><div className="advisor-kicker"><Crosshair size={15} /> ROUTE INTELLIGENCE</div><h2>Sun position vs. matatu heading</h2><p>Use route direction and sun angle to choose the cooler side of the ride.</p></div>
            <div className="diagram-container"><CompassDiagram /></div>
          </div>

          <div className="output-grid">
            <div className="card-inner output-card"><SectionLabel icon={Satellite}>Sun altitude throughout the day</SectionLabel><div className="timeline-container" id="timelineContainer"><svg className="timeline-svg" id="timelineSvg" viewBox="0 0 600 70" preserveAspectRatio="none"><rect className="timeline-bar" id="timelineBar" x="0" y="10" width="600" height="50" rx="6" /><path id="timelineCurve" d="" fill="none" stroke="#0066FF" strokeWidth="2.5" strokeLinecap="round" /><line className="timeline-marker" id="timelineMarker" x1="300" y1="5" x2="300" y2="65" /><circle id="timelineSunDot" cx="300" cy="35" r="8" fill="#0066FF" stroke="#fff" strokeWidth="2" /></svg></div></div>
            <div className="card-inner output-card map-card"><SectionLabel icon={MapPin}>Live route map</SectionLabel><div className="map-container" id="mapContainer"><div id="map" /></div><div className="route-summary" id="routeSummary"><span id="routeDist">--</span><span id="routeHeading">--</span><Badge variant="muted" id="routeBadgeMap">--</Badge></div></div>
            <div className="card-inner verdict-card"><div className="verdict-box" id="verdictBox" style={{ display: 'none' }}><h3 id="verdictTitle">Avoid left</h3><p id="verdictAdvice">Sit on the right side.</p></div></div>
          </div>
        </Card>
      </main>
    </>
  );
}
