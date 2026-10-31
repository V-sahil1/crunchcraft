// Brand mark: a chip triangle with a "crunch" spark — stands in for the logo image missing from the design export.
export default function Logo({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Crunch Craft logo">
      <circle cx="32" cy="32" r="32" className="fill-primary-container" />
      <path d="M15 42 L32 13 L49 42 Z" className="fill-surface" />
      <path d="M24 37 L32 23 L40 37 Z" className="fill-secondary-container" />
      <circle cx="32" cy="33" r="3.5" className="fill-tertiary" />
    </svg>
  );
}
