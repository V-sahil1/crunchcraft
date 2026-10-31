export default function Icon({ name, className = '', filled = false }) {
  return (
    <span aria-hidden="true" className={`material-symbols-outlined ${filled ? 'icon-fill' : ''} ${className}`}>
      {name}
    </span>
  );
}
