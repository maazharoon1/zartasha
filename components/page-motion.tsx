'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Original Arsal reveal groups; initial viewport content is never hidden.
const targets = [
  '.about-intro',
  '.about-home-details',
  '.profile-snapshot',
  '.services-heading',
  '.showcase-card',
  '.design-process-heading',
  '.design-process-step',
  '.footer-invitation',
  '.about-page-heading',
  '.about-page-portrait',
  '.about-page-story',
  '.about-page-expertise',
].join(',');

export function PageMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observed = new Set<HTMLElement>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target as HTMLElement);
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -24px 0px' },
    );
    function show(element: HTMLElement) {
      element.classList.add('is-visible');
      element.classList.remove('reveal-pending');
      observer.unobserve(element);
    }
    function observe(element: HTMLElement) {
      if (observed.has(element)) return;
      observed.add(element);
      element.classList.add('reveal');
      if (
        preference.matches ||
        element.getBoundingClientRect().top < window.innerHeight ||
        element.closest('.process-stack')
      ) {
        show(element);
        return;
      }
      element.classList.add('reveal-pending');
      observer.observe(element);
    }
    function scan(root: Element) {
      if (root instanceof HTMLElement && root.matches(targets)) observe(root);
      root.querySelectorAll<HTMLElement>(targets).forEach(observe);
    }
    scan(document.body);
    const additions = new MutationObserver((records) => {
      if (records.some((record) => record.removedNodes.length > 0)) {
        observed.forEach((element) => {
          if (element.isConnected) return;
          observer.unobserve(element);
          observed.delete(element);
        });
      }
      records.forEach((record) =>
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) scan(node);
        }),
      );
    });
    additions.observe(document.body, { childList: true, subtree: true });
    function updatePreference() {
      if (preference.matches) observed.forEach(show);
    }
    function showFocused(event: FocusEvent) {
      if (event.target instanceof Element) {
        const element = event.target.closest<HTMLElement>('.reveal-pending');
        if (element) show(element);
      }
    }
    preference.addEventListener('change', updatePreference);
    document.addEventListener('focusin', showFocused);
    return () => {
      observer.disconnect();
      additions.disconnect();
      preference.removeEventListener('change', updatePreference);
      document.removeEventListener('focusin', showFocused);
      observed.forEach((element) =>
        element.classList.remove('reveal', 'reveal-pending', 'is-visible'),
      );
    };
  }, [pathname]);
  return null;
}
