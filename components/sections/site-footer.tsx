import Link from 'next/link';
export function SiteFooter() {
  return (
    <footer id="contact" className="site-footer">
      <div className="footer-invitation">
        <span className="eyebrow">LET’S MAKE IT MEANINGFUL</span>
        <h2>
          Good ideas deserve
          <br />
          <em>thoughtful design.</em>
        </h2>
        <p>
          Branding, marketing, editorial, packaging and digital design, brought together
          with clarity and care.
        </p>

        <Link className="footer-contact-button" href="https://www.upwork.com/freelancers/~01102c9e555a4c0263" target="_blank" rel="noopener noreferrer">
          Get in Touch <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Zartasha Khan</span>
        <a href="#home">Back to top ↑</a>
      </div>
    </footer>
  );
}
