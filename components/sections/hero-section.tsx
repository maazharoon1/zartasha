import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import portrait from '@/public/images/zartasha-hero.webp';

export function HeroSection() {
  return (
    <section className="hero " aria-labelledby="hero-heading">
      <div className="hero-shape hero-section-mobile shape-one" aria-hidden="true" />
      <div className="hero-shape shape-two" aria-hidden="true" />
      <div className="hero-name" aria-hidden="true">
        <span className="hero-name-text ">ZARTASHA</span>
      </div>
      <svg className="hero-lines" viewBox="0 0 1400 650" fill="none" aria-hidden="true">
        {Array.from({ length: 19 }, (_, index) => (
          <path
            key={index}
            d={`M 180 ${720 + index * 9} C 500 ${260 + index * 14}, 700 ${570 - index * 12}, 980 ${270 - index * 10} S 1370 ${100 - index * 9}, 1520 ${30 - index * 12}`}
            stroke="currentColor"
            strokeWidth="1"
          />
        ))}
      </svg>
      <div className="hero-copy" id="side-content">
        <h1 id="hero-heading">
          <span>Think.</span>
          <span>Create.</span>
          <span>Inspire.</span>
        </h1>
        <span className="short-rule" />
        <p>
          Thoughtful design for brands
          <br />
          with a story.
        </p>
        <Link className="button button-dark" href="/#projects">
          View My Work <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <div className="portrait-wrap">
        <Image
          src={portrait}
          alt="Zartasha Khan"
          preload
          className="hero-portrait"
          sizes="(max-width: 700px) 320px, (max-width: 1100px) 320px, (min-width: 1500px) 443px, 368px"
        />
      </div>
      <p className="hero-signature">
        Design
        <br />
        for a brighter
        <br />
        tomorrow.
        <span aria-hidden="true" />
      </p>
    </section>
  );
}
