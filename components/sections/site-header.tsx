'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import logo from '@/public/images/logo.png';
// Mobile menu aur selected navigation link ka state sirf yahan rehta hai.
export function SiteHeader({ homeLinks = false }: { homeLinks?: boolean }) {
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  return (
    <header className="site-header">
      <Link
        className="wordmark"
        href={homeLinks ? '/' : '#home'}
        aria-label="Zartasha home"
      >
        <Image src={logo} alt="Zartasha Khan" width={120} height={120} sizes="120px" />
      </Link>
      <nav
        className={menu ? 'navigation menu-open' : 'navigation'}
        aria-label="Main navigation"
        id="main-navigation"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setMenu(false);
            document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus();
          }
        }}
      >
        {[
          ['About', 'about'],
          ['Projects', 'projects'],
          ['Contact', 'contact'],
        ].map(([name, id]) => (
          <Link
            className={name === 'About' && pathname === '/about' ? 'active' : ''}
            aria-current={name === 'About' && pathname === '/about' ? 'page' : undefined}
            key={id}
            href={name === 'About' ? '/about' : homeLinks ? `/#${id}` : `#${id}`}
            onClick={() => {
              setMenu(false);
            }}
          >
            {name}
          </Link>
        ))}
      </nav>
      <button
        className="menu-toggle"
        aria-label={menu ? 'Close menu' : 'Open menu'}
        aria-expanded={menu}
        aria-controls="main-navigation"
        onClick={() => setMenu(!menu)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setMenu(false);
        }}
      >
        {menu ? <X /> : <Menu />}
      </button>
    </header>
  );
}
