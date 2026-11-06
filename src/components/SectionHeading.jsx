import Icon from './Icon.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

// Eyebrow label + big uppercase title, sized per theme.
export default function SectionHeading({ eyebrow, eyebrowClass = '', icon, title, center = false, size = 'xl', titleClass, className = '' }) {
  const { t } = useTheme();
  const titleSize =
    titleClass ??
    (size === 'xl'
      ? t(
          'text-headline-xl-mobile sm:text-headline-xl font-extrabold',
          'text-headline-lg-mobile sm:text-headline-lg-light font-black',
        )
      : t(
          'text-headline-lg-mobile sm:text-headline-lg font-extrabold',
          'text-headline-lg-mobile sm:text-headline-lg-light font-black',
        ));

  return (
    <div className={`flex flex-col gap-space-xs ${center ? 'items-center text-center' : ''} ${className}`}>
      <span
        className={`inline-flex items-center gap-space-xs font-label text-label-sm uppercase tracking-widest font-bold ${eyebrowClass}`}
      >
        {icon && <Icon name={icon} className="text-[16px]" />}
        {eyebrow}
      </span>
      <h2 className={`font-heading font-extrabold uppercase text-on-surface tracking-tight ${titleSize}`}>{title}</h2>
    </div>
  );
}
