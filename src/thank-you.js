import './style.css'
import { initDarkVeil } from './DarkVeil.js';

// --- Dark Veil Background ---
const canvasContainer = document.getElementById('canvas-container');
initDarkVeil(canvasContainer, {
    speed: 0.3,
    hueShift: 0.2
});
