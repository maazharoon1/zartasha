'use client';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type MouseEvent,
} from 'react';
type Point = { x: number; y: number };
type View = Point & { scale: number };

export function useGalleryZoom() {
  const viewport = useRef<HTMLDivElement>(null);
  const current = useRef<View>({ scale: 1, x: 0, y: 0 });
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{ distance: number; midpoint: Point; view: View } | null>(null);
  const tap = useRef({ time: 0, x: 0, y: 0 });
  const lastTouch = useRef(-Infinity);
  const moved = useRef(false);
  const dimensions = useCallback(() => {
    const box = viewport.current;
    const img = box?.querySelector('img');
    if (!box || !img?.naturalWidth) return null;
    const fit = Math.min(
      img.clientWidth / img.naturalWidth,
      img.clientHeight / img.naturalHeight,
    );
    return {
      width: img.naturalWidth * fit,
      height: img.naturalHeight * fit,
      boxWidth: box.clientWidth,
      boxHeight: box.clientHeight,
    };
  }, []);
  const apply = useCallback(
    (next: View) => {
      const size = dimensions();
      const max = size ? Math.max(8, Math.min(64, (size.boxWidth / size.width) * 2)) : 8;
      const scale = Math.max(1, Math.min(max, next.scale));
      const limitX = size ? Math.max(0, (size.width * scale - size.boxWidth) / 2) : 0;
      const limitY = size ? Math.max(0, (size.height * scale - size.boxHeight) / 2) : 0;
      current.current = {
        scale,
        x: Math.max(-limitX, Math.min(limitX, next.x)),
        y: Math.max(-limitY, Math.min(limitY, next.y)),
      };
      setView(current.current);
    },
    [dimensions],
  );
  const point = useCallback((clientX: number, clientY: number) => {
    const rect = viewport.current!.getBoundingClientRect();
    return {
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
    };
  }, []);
  const zoomTo = useCallback(
    (scale: number, anchor: Point = { x: 0, y: 0 }) => {
      const previous = current.current;
      const ratio = scale / previous.scale;
      apply({
        scale,
        x: anchor.x - (anchor.x - previous.x) * ratio,
        y: anchor.y - (anchor.y - previous.y) * ratio,
      });
    },
    [apply],
  );
  function resetZoom() {
    current.current = { scale: 1, x: 0, y: 0 };
    setView(current.current);
    setDragging(false);
    pointers.current.clear();
    gesture.current = null;
    tap.current.time = 0;
  }
  function fitWidth() {
    const size = dimensions();
    if (!size) return;
    const scale = Math.max(1, (size.boxWidth - 24) / size.width);
    apply({ scale, x: 0, y: Math.max(0, (size.height * scale - size.boxHeight) / 2) });
  }
  function startGesture() {
    const values = [...pointers.current.values()];
    if (values.length < 2) {
      gesture.current = null;
      return;
    }
    gesture.current = {
      distance: Math.max(
        1,
        Math.hypot(values[1].x - values[0].x, values[1].y - values[0].y),
      ),
      midpoint: point((values[0].x + values[1].x) / 2, (values[0].y + values[1].y) / 2),
      view: { ...current.current },
    };
    moved.current = true;
  }
  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (!pointers.current.size) moved.current = false;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    startGesture();
    setDragging(current.current.scale > 1 || pointers.current.size > 1);
  }
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    if (Math.hypot(event.clientX - previous.x, event.clientY - previous.y) > 2)
      moved.current = true;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pinch = gesture.current;
    const values = [...pointers.current.values()];
    if (pinch && values.length >= 2) {
      const distance = Math.hypot(values[1].x - values[0].x, values[1].y - values[0].y);
      const midpoint = point(
        (values[0].x + values[1].x) / 2,
        (values[0].y + values[1].y) / 2,
      );
      const ratio = distance / pinch.distance;
      apply({
        scale: pinch.view.scale * ratio,
        x: midpoint.x - (pinch.midpoint.x - pinch.view.x) * ratio,
        y: midpoint.y - (pinch.midpoint.y - pinch.view.y) * ratio,
      });
    } else if (current.current.scale > 1)
      apply({
        ...current.current,
        x: current.current.x + event.clientX - previous.x,
        y: current.current.y + event.clientY - previous.y,
      });
  }
  function endPointer(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    if (!pointers.current.has(event.pointerId)) return;
    if (
      event.pointerType === 'touch' &&
      !cancelled &&
      !moved.current &&
      pointers.current.size === 1
    ) {
      const now = performance.now();
      lastTouch.current = now;
      if (
        now - tap.current.time < 320 &&
        Math.hypot(event.clientX - tap.current.x, event.clientY - tap.current.y) < 30
      ) {
        if (current.current.scale > 1) resetZoom();
        else zoomTo(3, point(event.clientX, event.clientY));
        tap.current.time = 0;
      } else tap.current = { time: now, x: event.clientX, y: event.clientY };
    }
    pointers.current.delete(event.pointerId);
    startGesture();
    setDragging(pointers.current.size > 0 && current.current.scale > 1);
  }
  useEffect(() => {
    const box = viewport.current;
    if (!box) return;
    function wheel(event: WheelEvent) {
      event.preventDefault();
      zoomTo(
        current.current.scale *
          Math.exp(-Math.max(-100, Math.min(100, event.deltaY)) * 0.003),
        point(event.clientX, event.clientY),
      );
    }
    box.addEventListener('wheel', wheel, { passive: false });
    const resize = new ResizeObserver(() => apply(current.current));
    resize.observe(box);
    return () => {
      box.removeEventListener('wheel', wheel);
      resize.disconnect();
    };
  }, [apply, zoomTo, point]);
  return {
    viewport,
    zoomed: view.scale > 1.01,
    scale: view.scale,
    dragging,
    resetZoom,
    fitWidth,
    zoomIn: () => zoomTo(current.current.scale * 1.5),
    zoomOut: () => zoomTo(current.current.scale / 1.5),
    transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event: PointerEvent<HTMLDivElement>) => endPointer(event),
      onPointerCancel: (event: PointerEvent<HTMLDivElement>) => endPointer(event, true),
      onLostPointerCapture: (event: PointerEvent<HTMLDivElement>) =>
        endPointer(event, true),
      onDoubleClick: (event: MouseEvent<HTMLDivElement>) => {
        if (performance.now() - lastTouch.current < 600) return;
        if (current.current.scale > 1) resetZoom();
        else zoomTo(3, point(event.clientX, event.clientY));
      },
    },
  };
}
