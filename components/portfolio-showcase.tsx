'use client';
/* Cloudinary supplies responsive, optimized images directly. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { ShowcaseProject } from '@/data/showcase';
import { portfolioImageUrl } from '@/data/showcase-mapping';
import { PortfolioLightbox } from '@/components/portfolio-lightbox';

function ShowcaseCard({
  project,
  onOpen,
}: {
  project: ShowcaseProject;
  onOpen: () => void;
}) {
  const viewport = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState(0);
  const [failed, setFailed] = useState(false);
  const website = project.filter === 'UI/UX Design';
  useEffect(() => {
    const box = viewport.current;
    const img = box?.querySelector('img');
    if (!box || !img || !website) return;
    const measure = () => setOffset(Math.max(0, img.offsetHeight - box.clientHeight));
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(img);
    img.addEventListener('load', measure);
    measure();
    return () => {
      observer.disconnect();
      img.removeEventListener('load', measure);
    };
  }, [website]);
  return (
    <button
      type="button"
      className={`showcase-card ${website ? 'showcase-website' : ''}`}
      aria-label={`Open ${project.title}`}
      aria-haspopup="dialog"
      onClick={onOpen}
    >
      <span
        className="showcase-image"
        ref={viewport}
        style={{ '--preview-offset': `${-offset}px` } as CSSProperties}
      >
        {failed ? (
          <span className="showcase-unavailable">Preview unavailable — open gallery</span>
        ) : (
          <img
            src={portfolioImageUrl(project.mainImage, 640)}
            srcSet={[320, 640, 960]
              .map((w) => `${portfolioImageUrl(project.mainImage, w)} ${w}w`)
              .join(', ')}
            sizes={
              website
                ? '(max-width: 640px) 87vw, (max-width: 1100px) 43vw, 21vw'
                : '(max-width: 700px) 42vw, 28vw'
            }
            alt={project.title}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        )}
        <span className="showcase-expand">
          <ArrowUpRight size={20} aria-hidden="true" />
        </span>
      </span>
      <span className="showcase-caption">{project.title}</span>
    </button>
  );
}

export function PortfolioShowcase({ projects }: { projects: ShowcaseProject[] }) {
  const [count, setCount] = useState(12);
  const [selected, setSelected] = useState<number | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const nextFocus = useRef<number | null>(null);
  const shown = projects.slice(0, count);
  useEffect(() => {
    if (nextFocus.current !== null) {
      grid.current
        ?.querySelectorAll<HTMLButtonElement>('.showcase-card')
        [nextFocus.current]?.focus({ preventScroll: true });
      nextFocus.current = null;
    }
  }, [count]);
  return (
    <>
      <div
        ref={grid}
        className={`showcase-grid ${projects[0]?.filter === 'UI/UX Design' ? 'showcase-web-grid' : ''}`}
      >
        {shown.map((project, index) => (
          <ShowcaseCard
            key={project.id}
            project={project}
            onOpen={() => setSelected(index)}
          />
        ))}
      </div>
      <div className="showcase-bottom">
        <p role="status">
          Showing {shown.length} of {projects.length} projects
        </p>
        {count < projects.length && (
          <button
            className="button button-dark"
            onClick={() => {
              nextFocus.current = shown.length;
              setCount((value) => value + 12);
            }}
          >
            Load more projects
          </button>
        )}
      </div>
      {selected !== null && (
        <PortfolioLightbox
          projects={projects}
          initialIndex={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
