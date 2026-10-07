export function PortfolioLoader({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`portfolio-loader${compact ? ' portfolio-loader-compact' : ''}`}
      role="status"
    >
      <span className="portfolio-loader-ring" aria-hidden="true" />
      <span className={compact ? 'portfolio-visually-hidden' : 'portfolio-loader-label'}>
        Loading image
      </span>
    </span>
  );
}
