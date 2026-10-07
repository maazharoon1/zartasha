'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import type { ShowcaseProject } from '@/data/showcase';
import { portfolioImageUrl } from '@/data/showcase-mapping';
import { useGalleryZoom } from '@/hooks/use-gallery-zoom';
import { PortfolioLoader } from '@/components/portfolio-loader';

function GalleryImage({
  src,
  alt,
  direction,
  fullResolution,
}: {
  src: string;
  alt: string;
  direction: number;
  fullResolution: boolean;
}) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [original, setOriginal] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (status !== 'loading') return;
    const img = imageRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setStatus('ready');
      return;
    }
    const timeout = setTimeout(() => {
      if (img?.complete && img.naturalWidth > 0) setStatus('ready');
      else if (!original) setOriginal(true);
      else setStatus('error');
    }, 10000);
    return () => clearTimeout(timeout);
  }, [status, original, attempt]);
  return (
    <div
      className={`gallery-image-frame is-${status}`}
      aria-busy={status === 'loading'}
      style={{ '--gallery-direction': direction } as CSSProperties}
    >
      {status === 'loading' && <PortfolioLoader />}
      {status === 'error' ? (
        <div className="gallery-image-error" role="alert">
          <p>This image couldn’t load.</p>
          <button
            onPointerDown={(event) => event.stopPropagation()}
            onDoubleClick={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              event.currentTarget
                .closest('dialog')
                ?.querySelector<HTMLButtonElement>('.dialog-close')
                ?.focus({ preventScroll: true });
              setStatus('loading');
              setAttempt((value) => value + 1);
            }}
          >
            Try again
          </button>
        </div>
      ) : (
        <img
          ref={imageRef}
          key={attempt}
          className="service-cloud-image"
          src={portfolioImageUrl(src, original || fullResolution ? 0 : 1920)}
          alt={alt}
          decoding="async"
          onLoad={() => setStatus('ready')}
          onError={() => (original ? setStatus('error') : setOriginal(true))}
        />
      )}
    </div>
  );
}

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
  const [direction, setDirection] = useState(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const {
    viewport,
    zoomed,
    scale,
    dragging,
    resetZoom,
    zoomIn,
    zoomOut,
    fitWidth,
    transform,
    handlers,
  } = useGalleryZoom();
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
    setDirection(direction);
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
      <div
        className="gallery-zoom-controls"
        role="group"
        aria-label="Image zoom controls"
      >
        <button onClick={zoomOut} disabled={!zoomed} aria-label="Zoom out">
          <ZoomOut size={19} />
        </button>
        <span aria-live="polite">{Math.round(scale * 100)}%</span>
        <button onClick={zoomIn} aria-label="Zoom in">
          <ZoomIn size={19} />
        </button>
        <button onClick={fitWidth}>Fit width</button>
        <button onClick={resetZoom}>Fit image</button>
      </div>
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
            <GalleryImage
              key={index}
              src={current.src}
              alt={current.project.title || `${current.project.filter} project preview`}
              direction={direction}
              fullResolution={zoomed}
            />
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
          Scroll or pinch to zoom · Drag to explore · Double-click to fit · ← → to browse
          · Esc to close
        </span>
      </footer>
    </dialog>
  );
}
