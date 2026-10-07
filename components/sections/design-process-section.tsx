'use client';

import type { CSSProperties } from 'react';
import { Compass, Layers3, SlidersHorizontal, PackageCheck } from 'lucide-react';
import { designProcess } from '@/data/design-process';
import { useMobileProcess } from '@/hooks/use-mobile-process';

// Har stage ka icon usi order mein hai jis order mein data likha hai.
const stepIcons = [Compass, Layers3, SlidersHorizontal, PackageCheck];

export function DesignProcessSection() {
  const listRef = useMobileProcess();
  return (
    <section
      className="design-process section-pad"
      aria-labelledby="design-process-title"
    >
      <div className="design-process-heading">
        <div>
          <span className="eyebrow">HOW WE WORK TOGETHER</span>
          <h2 id="design-process-title">
            From first thought.
            <br />
            <em>To final detail.</em>
          </h2>
        </div>
        <p>
          A clear direction. A collaborative process.
          <br />
          Thoughtful design, every step of the way.
        </p>
      </div>
      <ol className="design-process-grid process-stack" ref={listRef}>
        {designProcess.map((step, index) => {
          const Icon = stepIcons[index];

          return (
            <li
              key={step.number}
              className="design-process-step"
              style={{ '--stack-index': index } as CSSProperties}
            >
              <article className="design-process-card">
                <div className="design-process-card-top">
                  <span className="design-process-number" aria-hidden="true">
                    {step.number}
                    <span>.</span>
                  </span>
                  <span className="design-process-icon">
                    <svg
                      className="process-icon-ring"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <circle cx="24" cy="24" r="22" pathLength="100" />
                    </svg>
                    <Icon size={23} strokeWidth={1.4} aria-hidden="true" />
                  </span>
                </div>
                <span className="design-process-card-line" aria-hidden="true" />
                <div className="design-process-card-copy">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
