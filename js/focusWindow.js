const EDGE_MARGIN = 10;
const MIN_SIZE = 60;

const CURSORS = {
  move: 'move',
  n: 'ns-resize', s: 'ns-resize',
  e: 'ew-resize', w: 'ew-resize',
  ne: 'nesw-resize', sw: 'nesw-resize',
  nw: 'nwse-resize', se: 'nwse-resize',
};

export function init(overlayElement) {
  const rect = { top: 200, left: 200, width: 500, height: 150 };

  const panels = {
    top: document.createElement('div'),
    bottom: document.createElement('div'),
    left: document.createElement('div'),
    right: document.createElement('div'),
  };
  for (const panel of Object.values(panels)) {
    panel.className = 'dim-panel';
    overlayElement.appendChild(panel);
  }

  const frame = document.createElement('div');
  frame.className = 'frame';
  overlayElement.appendChild(frame);

  let dragMode = null;
  let lastX = 0;
  let lastY = 0;

  function render() {
    const bottomEdge = rect.top + rect.height;
    const rightEdge = rect.left + rect.width;

    Object.assign(panels.top.style, {
      top: '0', left: '0', width: '100%', height: `${rect.top}px`,
    });
    Object.assign(panels.bottom.style, {
      top: `${bottomEdge}px`, left: '0', width: '100%', height: `calc(100% - ${bottomEdge}px)`,
    });
    Object.assign(panels.left.style, {
      top: `${rect.top}px`, left: '0', width: `${rect.left}px`, height: `${rect.height}px`,
    });
    Object.assign(panels.right.style, {
      top: `${rect.top}px`, left: `${rightEdge}px`, width: `calc(100% - ${rightEdge}px)`, height: `${rect.height}px`,
    });
    Object.assign(frame.style, {
      top: `${rect.top}px`, left: `${rect.left}px`, width: `${rect.width}px`, height: `${rect.height}px`,
    });
  }

  function getMode(localX, localY, width, height) {
    const nearLeft = localX <= EDGE_MARGIN;
    const nearRight = localX >= width - EDGE_MARGIN;
    const nearTop = localY <= EDGE_MARGIN;
    const nearBottom = localY >= height - EDGE_MARGIN;

    if (nearTop && nearLeft) return 'nw';
    if (nearTop && nearRight) return 'ne';
    if (nearBottom && nearLeft) return 'sw';
    if (nearBottom && nearRight) return 'se';
    if (nearTop) return 'n';
    if (nearBottom) return 's';
    if (nearLeft) return 'w';
    if (nearRight) return 'e';
    return 'move';
  }

  // Dragging the start edge shrinks size and shifts the start point together;
  // once size would drop below MIN_SIZE, pin the start so the opposite edge
  // stays put instead of size going negative and the box inverting.
  function shrinkFromStart(start, size, delta) {
    let newSize = size - delta;
    let newStart = start + delta;
    if (newSize < MIN_SIZE) {
      newStart = start + (size - MIN_SIZE);
      newSize = MIN_SIZE;
    }
    return { start: newStart, size: newSize };
  }

  function growFromEnd(size, delta) {
    return Math.max(MIN_SIZE, size + delta);
  }

  function applyDelta(mode, deltaX, deltaY) {
    if (mode === 'move') {
      rect.left += deltaX;
      rect.top += deltaY;
      return;
    }

    const hasWest = mode === 'w' || mode === 'nw' || mode === 'sw';
    const hasEast = mode === 'e' || mode === 'ne' || mode === 'se';
    const hasNorth = mode === 'n' || mode === 'nw' || mode === 'ne';
    const hasSouth = mode === 's' || mode === 'sw' || mode === 'se';

    if (hasWest) {
      const { start, size } = shrinkFromStart(rect.left, rect.width, deltaX);
      rect.left = start;
      rect.width = size;
    }
    if (hasEast) {
      rect.width = growFromEnd(rect.width, deltaX);
    }
    if (hasNorth) {
      const { start, size } = shrinkFromStart(rect.top, rect.height, deltaY);
      rect.top = start;
      rect.height = size;
    }
    if (hasSouth) {
      rect.height = growFromEnd(rect.height, deltaY);
    }
  }

  function onMouseMove(event) {
    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    applyDelta(dragMode, deltaX, deltaY);
    render();
  }

  function onMouseUp() {
    dragMode = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  frame.addEventListener('mousedown', (event) => {
    const frameRect = frame.getBoundingClientRect();
    const localX = event.clientX - frameRect.left;
    const localY = event.clientY - frameRect.top;
    dragMode = getMode(localX, localY, frameRect.width, frameRect.height);
    lastX = event.clientX;
    lastY = event.clientY;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    event.preventDefault();
  });

  frame.addEventListener('mousemove', (event) => {
    if (dragMode) return;
    const frameRect = frame.getBoundingClientRect();
    const localX = event.clientX - frameRect.left;
    const localY = event.clientY - frameRect.top;
    frame.style.cursor = CURSORS[getMode(localX, localY, frameRect.width, frameRect.height)];
  });

  render();
}
