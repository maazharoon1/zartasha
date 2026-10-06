'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import type { ShowcaseProject } from '@/data/showcase';
import { portfolioImageUrl } from '@/data/showcase-mapping';
import { useGalleryZoom } from '@/hooks/use-gallery-zoom';

// Original Arsal fullscreen composition and zoom/pan behavior, with native dialog focus trapping.
export function PortfolioLightbox({
  projects,
  initialIndex,
  onClose,
}: {
  projects: ShowcaseProject[];
  initialIndex: number;
  onClose: () => void;
}) {
  const items = projects.flatMap((project) =>
    project.images.map((src) => ({ src, project })),
  );
  const [index, setIndex] = useState(() =>
    projects.slice(0, initialIndex).reduce((sum, p) => sum + p.images.length, 0),
  );
  const [failed, setFailed] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const { viewport, zoomed, dragging, resetZoom, toggleZoom, transform, handlers } =
    useGalleryZoom();
  const current = items[index];
  useEffect(() => {
    const node = dialog.current;
    const trigger =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    node?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      node?.close();
      document.body.style.overflow = overflow;
      trigger?.focus({ preventScroll: true });
    };
  }, []);
  function change(direction: number) {
    setIndex((value) => (value + direction + items.length) % items.length);
    resetZoom();
  }
  return (
    <dialog
      ref={dialog}
      className="gallery-lightbox"
      aria-labelledby="gallery-title"
      aria-describedby="gallery-description"
      onCancel={onClose}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          change(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <header className="gallery-lightbox-header">
        <div>
          <h2 id="gallery-title">{current.project.filter}</h2>
          <p id="gallery-description">{current.project.title}</p>
        </div>
        <div className="gallery-lightbox-tools">
          <span aria-live="polite">
            {index + 1} / {items.length}
          </span>
          <button
            onClick={toggleZoom}
            aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
            aria-pressed={zoomed}
          >
            {zoomed ? <ZoomOut size={21} /> : <ZoomIn size={21} />}
          </button>
        </div>
        <button
          className="dialog-close"
          onClick={onClose}
          aria-label="Close gallery"
          autoFocus
        >
          <X size={21} />
        </button>
      </header>
      <div className="gallery-lightbox-stage">
        <button
          className="gallery-prev"
          aria-label="Previous image"
          onClick={() => change(-1)}
        >
          <ArrowLeft size={24} />
        </button>
        <div
          className={`gallery-lightbox-viewport ${zoomed ? 'is-zoomed' : ''} ${dragging ? 'is-dragging' : ''}`}
          ref={viewport}
          {...handlers}
          onDragStart={(event) => event.preventDefault()}
        >
          <div className="gallery-lightbox-art" style={{ transform: transform }}>
            {failed === current.src ? (
              <p role="alert">Image unavailable. Try the next image.</p>
            ) : (
              <img
                key={current.src}
                className="service-cloud-image"
                src={portfolioImageUrl(current.src, 1920)}
                alt={current.project.title}
                onError={() => setFailed(current.src)}
              />
            )}
          </div>
        </div>
        <button
          className="gallery-next"
          aria-label="Next image"
          onClick={() => change(1)}
        >
          <ArrowRight size={24} />
        </button>
      </div>
      <footer className="gallery-lightbox-footer">
        <span>
          {current.project.liveUrl ? (
            <a href={current.project.liveUrl} target="_blank" rel="noopener noreferrer">
              Visit website ↗
            </a>
          ) : (
            current.project.title
          )}
        </span>
        <span>
          {zoomed ? 'Drag to explore · Double-click to fit' : 'Double-click to zoom'} · ←
          → to browse · Esc to close
        </span>
      </footer>
    </dialog>
  );
}
