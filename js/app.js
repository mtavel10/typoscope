import { loadPdf } from './pdfRenderer.js';
import { init as initFocusWindow } from './focusWindow.js';

const fileInput = document.getElementById('fileInput');
const zoomInput = document.getElementById('zoomInput');
const viewer = document.getElementById('viewer');
const overlay = document.getElementById('focusOverlay');

let currentFile = null;

function renderCurrentFile() {
  if (currentFile) {
    loadPdf(currentFile, viewer, Number(zoomInput.value));
  }
}

fileInput.addEventListener('change', () => {
  currentFile = fileInput.files[0];
  renderCurrentFile();
});

zoomInput.addEventListener('change', renderCurrentFile);

const zoomStep = Number(zoomInput.step);
const zoomMin = Number(zoomInput.min);
const zoomMax = Number(zoomInput.max);

let renderTimeout = null;

function scheduleRender() {
  clearTimeout(renderTimeout);
  renderTimeout = setTimeout(renderCurrentFile, 100);
}

function setZoom(value) {
  zoomInput.value = Math.min(zoomMax, Math.max(zoomMin, value));
  scheduleRender();
}

document.addEventListener('keydown', (event) => {
  if (!event.shiftKey) return;
  const direction = event.key === '+' ? 1 : event.key === '_' ? -1 : 0;
  if (direction === 0) return;

  event.preventDefault();
  setZoom(Number(zoomInput.value) + direction * zoomStep);
});

document.addEventListener('wheel', (event) => {
  if (!event.ctrlKey) return;
  event.preventDefault();
  setZoom(Number(zoomInput.value) - event.deltaY * 0.01);
}, { passive: false });

initFocusWindow(overlay);