import 'leaflet/dist/leaflet.css';
import './style.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
requestAnimationFrame(() => import('../js/app.js'));
