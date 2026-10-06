'use client';

import { useEffect, useRef } from 'react';

export function useMobileProcess() {
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const media = window.matchMedia(
      '(max-width: 700px) and (min-height: 501px) and (prefers-reduced-motion: no-preference)',
    );
    const steps = Array.from(list.querySelectorAll<HTMLElement>('.design-process-step'));
    const cards = steps.map((step) =>
      step.querySelector<HTMLElement>('.design-process-card')!,
    );
    let frame = 0;
    let enabled = false;
    let listening = false;
    let inView = false;
    function paint() {
      frame = 0;
      if (!enabled || !inView) return;
      const start = window.innerHeight * 0.85;
      // Original Arsal progress curve; read all positions before writing styles.
      const progress = steps.map((step) => {
        const top = step.getBoundingClientRect().top;
        const stop = Number.parseFloat(getComputedStyle(step).top) || 0;
        return Math.max(0, Math.min(1, (start - top) / Math.max(1, start - stop)));
      });
      steps.forEach((step, index) =>
        step.style.setProperty('--icon-progress', progress[index].toFixed(3)),
      );
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(paint);
    }
    function configure() {
      enabled =
        media.matches &&
        cards.every((card) => card.offsetHeight + 100 < window.innerHeight);
      list!.classList.toggle('process-stack', enabled);
      if (enabled && inView && !listening) {
        window.addEventListener('scroll', schedule, { passive: true });
        listening = true;
      }
      if ((!enabled || !inView) && listening) {
        window.removeEventListener('scroll', schedule);
        listening = false;
      }
      if (!enabled)
        steps.forEach((step) => {
          step.style.removeProperty('--icon-progress');
        });
      schedule();
    }
    const intersection = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        configure();
      },
      { rootMargin: '150px' },
    );
    intersection.observe(list);
    const resize = new ResizeObserver(configure);
    cards.forEach((card) => resize.observe(card));
    media.addEventListener('change', configure);
    window.addEventListener('resize', configure);
    configure();
    return () => {
      intersection.disconnect();
      resize.disconnect();
      cancelAnimationFrame(frame);
      media.removeEventListener('change', configure);
      window.removeEventListener('resize', configure);
      window.removeEventListener('scroll', schedule);
      list.classList.remove('process-stack');
      steps.forEach((step) => {
        step.style.removeProperty('--icon-progress');
      });
    };
  }, []);
  return listRef;
}
