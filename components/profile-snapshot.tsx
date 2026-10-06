import { about } from '@/data/about';
import Link from 'next/link';
export function ProfileSnapshot() {
  return (
    <aside className="profile-snapshot" aria-labelledby="profile-snapshot-title">
      <span className="eyebrow">AT A GLANCE</span>
      <h3 id="profile-snapshot-title">Design with intention.</h3>
      <p>
        From the first idea to the final detail, a considered approach across every
        format.
      </p>
      <ul>
        {about.specialties.map((specialty) => (
          <li key={specialty}>{specialty}</li>
        ))}
      </ul>
      <Link className="text-link" href="/#projects">
        Explore design services <span aria-hidden="true">↗</span>
      </Link>
    </aside>
  );
}
