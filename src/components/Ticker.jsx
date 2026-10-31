import { useTheme } from '../context/ThemeContext.jsx';
import { tickerItems } from '../data/content.js';

// Crossed ribbons that straddle the hero/slider seam, so the two scenes read as one.
export default function Ticker() {
  const { t } = useTheme();
  // Content is rendered twice over so the -50% marquee loop is seamless.
  const loop = [...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems];

  const row = (reverse) => (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center whitespace-nowrap animate-marquee hover:[animation-play-state:paused] font-display text-headline-sm uppercase tracking-tight ${
        reverse ? '[animation-direction:reverse]' : ''
      }`}
    >
      {loop.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-space-lg">{item}</span>
          <span>{t('•', '✦')}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative z-20 h-0" aria-label={tickerItems.join(', ')}>
      {/* Back ribbon */}
      <div
        className={`absolute left-[-5%] w-[110%] top-0 -translate-y-1/2 rotate-[2.5deg] py-space-sm overflow-hidden flex opacity-90 ${t(
          'bg-surface-container-highest text-on-surface/60',
          'bg-[#7c5de1] text-white/80',
        )}`}
      >
        {row(true)}
      </div>
      {/* Front ribbon */}
      <div
        className={`absolute left-[-5%] w-[110%] top-0 -translate-y-1/2 -rotate-2 py-space-sm overflow-hidden flex shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)] ${t(
          'bg-primary-container text-on-primary-container',
          'bg-[#ffae00] border-y-2 border-[#e69d00] text-[#3a2000]',
        )}`}
      >
        {row(false)}
      </div>
    </div>
  );
}
