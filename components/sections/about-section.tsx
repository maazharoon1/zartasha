import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { about } from '@/data/about';
import { ProfileSnapshot } from '@/components/profile-snapshot';
import portrait from '@/public/images/zartasha-about.webp';

export function AboutSection() {
  return (
    <section
      id="about"
      className="about-section home-about section-pad"
      aria-labelledby="about-title"
    >
      <div className="about-layout">
        <div className="about-intro">
          <figure className="about-photo">
            <Image
              src={portrait}
              alt="Portrait of Zartasha Khan"
              sizes="(max-width: 700px) 104px, (max-width: 1100px) 150px, 240px"
            />
          </figure>
          <div className="about-introduction">
            <span className="eyebrow">{about.label}</span>
            <h2 id="about-title">
              A little about me.
              <br />
              <em>A lot of intention.</em>
            </h2>
            <span className="short-rule" />
            <p>{about.summary}</p>
            <Link href="/about" className="about-story-link">
              More about my approach <ArrowUpRight size={20} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <ProfileSnapshot />
        <div className="about-home-details">
          <span className="eyebrow">THOUGHTFUL DESIGN, ACROSS EVERY FORMAT</span>
          <p>{about.paragraphs[0]}</p>
          <div className="about-specialties" aria-label="Design specialties">
            {about.specialties.map((specialty) => (
              <span key={specialty}>{specialty}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
