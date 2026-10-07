'use client';
/* Cloudinary supplies responsive, optimized images directly. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { ShowcaseProject } from '@/data/showcase';
import { portfolioImageUrl } from '@/data/showcase-mapping';
import { PortfolioLoader } from '@/components/portfolio-loader';
const PortfolioLightbox = dynamic(() =>
  import('@/components/portfolio-lightbox').then((module) => module.PortfolioLightbox),
);

function ShowcaseCard({
  project,
  onOpen,
  eager,
}: {
  project: ShowcaseProject;
  onOpen: () => void;
  eager: boolean;
}) {
  const viewport = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [original, setOriginal] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = imageRef.current;
    const box = viewport.current;
    if (!img || !box || loaded || failed) return;
    // Cached images can finish before React attaches the load handler.
    if (img.complete && img.naturalWidth > 0) {
      setLoaded(true);
      return;
    }
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timeout = setTimeout(() => {
          if (img.complete && img.naturalWidth > 0) setLoaded(true);
          else if (!original) setOriginal(true);
          else setFailed(true);
        }, 10000);
      },
      { rootMargin: '300px' },
    );
    observer.observe(box);
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [loaded, failed, original]);
  const website = project.filter === 'UI/UX Design';
  const title =
    project.title || `${project.filter} project ${project.id.replace(/\D/g, '')}`;
  useEffect(() => {
    const box = viewport.current;
    const img = box?.querySelector('img');
    if (!box || !img || !website) return;
    const measure = () =>
      setOffset(Math.max(0, img.offsetTop + img.offsetHeight - box.clientHeight));
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(img);
    img.addEventListener('load', measure);
    measure();
    return () => {
      observer.disconnect();
      img.removeEventListener('load', measure);
    };
  }, [website, failed]);
  const content = (
    <>
      <span
        className="showcase-image"
        ref={viewport}
        style={{ '--preview-offset': `${-offset}px` } as CSSProperties}
      >
        {!loaded && !failed && <PortfolioLoader compact />}
        {failed ? (
          <span className="showcase-unavailable">
            Preview unavailable — {project.liveUrl ? 'visit website' : 'open gallery'}
          </span>
        ) : (
          <img
            ref={imageRef}
            src={
              original
                ? portfolioImageUrl(project.mainImage, 0)
                : portfolioImageUrl(project.mainImage, 640)
            }
            srcSet={
              original
                ? undefined
                : [320, 480, 640]
                    .map((w) => `${portfolioImageUrl(project.mainImage, w)} ${w}w`)
                    .join(', ')
            }
            sizes={
              website
                ? '(max-width: 700px) 42vw, (max-width: 1100px) 43vw, 22vw'
                : '(max-width: 700px) 42vw, 28vw'
            }
            alt={title}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
            decoding="async"
            className={loaded ? 'is-loaded' : 'is-loading'}
            onLoad={() => setLoaded(true)}
            onError={() => (original ? setFailed(true) : setOriginal(true))}
          />
        )}
        <span className="showcase-expand">
          <ArrowUpRight size={20} aria-hidden="true" />
        </span>
      </span>
      {project.title && <span className="showcase-caption">{project.title}</span>}
    </>
  );
  const className = `showcase-card ${website ? 'showcase-website' : ''}`;
  return project.liveUrl ? (
    <a
      className={className}
      href={project.liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${title} website (opens in a new tab)`}
    >
      {content}
    </a>
  ) : (
    <button
      type="button"
      className={className}
      aria-label={`Open ${title}`}
      aria-haspopup="dialog"
      onClick={onOpen}
    >
      {content}
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
        ?.querySelectorAll<HTMLElement>('.showcase-card')
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
            eager={index < 4}
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
