'use client';

import { useRef, useState, type PointerEvent } from 'react';

// Zoom CSS transform se hota hai; drag image ko move karta hai, scrollbars nahi.
export function useGalleryZoom() {
  const viewport = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null>(null);
  const lastTap = useRef({ time: 0, x: 0, y: 0 });
  const lastTouch = useRef(-Infinity);

  function resetZoom() {
    setZoomed(false);
    setPan({ x: 0, y: 0 });
    setDragging(false);
    drag.current = null;
    lastTap.current.time = 0;
  }

  function toggleZoom() {
    setZoomed((value) => !value);
    setPan({ x: 0, y: 0 });
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    if (zoomed) setDragging(true);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    const box = viewport.current;
    if (!zoomed || !start || start.id !== event.pointerId || !box) return;
    // 2x zoom ke edges se aage drag nahi ja sakta.
    const limitX = box.clientWidth / 2;
    const limitY = box.clientHeight / 2;
    setPan({
      x: Math.max(-limitX, Math.min(limitX, start.panX + event.clientX - start.x)),
      y: Math.max(-limitY, Math.min(limitY, start.panY + event.clientY - start.y)),
    });
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8;
    // Mobile double-tap bhi desktop double-click jaisa zoom karta hai.
    if (event.pointerType === 'touch' && !moved) {
      const now = performance.now();
      lastTouch.current = now;
      const previous = lastTap.current;
      if (
        now - previous.time < 320 &&
        Math.hypot(event.clientX - previous.x, event.clientY - previous.y) < 30
      ) {
        toggleZoom();
        lastTap.current.time = 0;
      } else lastTap.current = { time: now, x: event.clientX, y: event.clientY };
    }
    drag.current = null;
    setDragging(false);
  }

  return {
    viewport,
    zoomed,
    dragging,
    resetZoom,
    toggleZoom,
    transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomed ? 2 : 1})`,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: () => {
        drag.current = null;
        setDragging(false);
      },
      onLostPointerCapture: () => {
        drag.current = null;
        setDragging(false);
      },
      onDoubleClick: () => {
        // Touch double-tap upar handle hota hai; compatibility dblclick ignore karein.
        if (performance.now() - lastTouch.current > 600) toggleZoom();
      },
    },
  };
}
