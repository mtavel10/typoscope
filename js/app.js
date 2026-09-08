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

initFocusWindow(overlay);
