# CLAUDE.md

This file provides guidance to Claude Code when working on this project.

## Project overview

A browser-based reading tool: renders PDFs (via pdf.js) and, later, web
articles, with a draggable/resizable "focus rectangle" overlay that dims
everything outside it — a digital version of a physical typoscope reading
guide. Built for accessibility (fuzz around text from a visual disability).

Sibling project `../read-block/` is a Tkinter full-screen horizontal strip
overlay that inspired the interaction model here, but works over any
application rather than rendering content itself.

## Run

No build step. Serve the folder and open in a browser — pdf.js's worker
doesn't load reliably over a bare `file://` URL:

```bash
python3 -m http.server
# then open http://localhost:8000
```

## Architecture

Static site, no framework, no bundler. Native ES modules (`<script
type="module">`) for file separation; pdf.js loaded directly from a CDN
`.mjs` build (pinned version 6.2.108) rather than via npm.

- `index.html` — file picker, scroll container (`#viewer`), overlay layer
  (`#focusOverlay`)
- `js/app.js` — entry point, wires the file input to `pdfRenderer` and
  initializes `focusWindow`
- `js/pdfRenderer.js` — owns: given a PDF `File`, render its pages as
  `<canvas>` elements into `#viewer`
- `js/focusWindow.js` — owns: the dimmed rectangle overlay, its drag/resize/
  keyboard interaction, and its settings

The focus rectangle is fixed in *viewport* space (like `read-block`'s strip);
the user scrolls the rendered PDF underneath it rather than the rectangle
moving through document space.

## Milestones

1. PDF rendering + free-floating focus rectangle (current)
2. Web article support (paste a URL) — will need a small local server to
   fetch pages and run Readability.js, since client-side fetch hits CORS
3. Snap the rectangle to actual text lines using pdf.js's text-layer data
