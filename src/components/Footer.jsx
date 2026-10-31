import { useState } from 'react';
import Icon from './Icon.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { footerBadges, footerColumns } from '../data/content.js';

export default function Footer() {
  const { t } = useTheme();
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  // Footer stays dark in both designs, so text colours are explicit rather than theme tokens.
  const muted = t('text-on-surface-variant', 'text-purple-200');
  const heading = t('text-on-surface', 'text-white');

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setJoined(true);
    setEmail('');
  };

  return (
    <footer
      className={`w-full relative ${t(
        'bg-surface-container-lowest text-on-surface',
        'bg-[#201033] text-white border-t-4 border-[#ffae00]',
      )}`}
    >
      <div className="w-full container-x pt-space-xl pb-space-lg">
        <div className="py-space-xl">
          <p
            className={`font-label text-label-sm uppercase tracking-widest mb-space-sm font-bold ${t(
              'text-tertiary',
              'text-[#ffd166]',
            )}`}
          >
            Unapologetic Velocity // 100% Artisanal Heat
          </p>
          <h2
            className={`font-display uppercase leading-none ${heading} ${t(
              'text-display-mobile sm:text-headline-xl lg:text-display-hero font-extrabold tracking-tighter',
              'text-display-mobile lg:text-display-xl font-black tracking-tight',
            )}`}
          >
            Loud Taste.
            <br />
            <span className={t('text-primary-container', 'text-[#ff6699]')}>Unholy Crunch.</span>
          </h2>
        </div>

        <div
          className={`grid grid-cols-1 xl:grid-cols-12 gap-gutter gap-y-space-xl py-space-xl ${t(
            '',
            'border-t border-white/10',
          )}`}
        >
          <div className="xl:col-span-5 flex flex-col gap-space-md">
            <span className={`font-heading text-headline-sm uppercase font-extrabold ${heading}`}>The Crunch Bulletin</span>
            <p className={`text-body-md max-w-md ${muted}`}>
              Join the hyper-caffeinated cult. Secret flavor drops, backstage lab batches, and zero-compromise pantry
              artillery delivered weekly.
            </p>
            {joined ? (
              <p
                role="status"
                className={`flex items-center gap-space-xs font-label text-label-lg uppercase font-bold ${t(
                  'text-tertiary',
                  'text-[#80ffdb]',
                )}`}
              >
                <Icon name="check_circle" /> You're plugged in. Watch your inbox.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-xs max-w-md">
                <label htmlFor="bulletin-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="bulletin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER YOUR EMAIL"
                  className={`w-full h-14 px-space-lg rounded-full font-label text-label-sm focus:outline-none focus:ring-2 transition-all ${t(
                    'bg-surface-container-high text-on-surface placeholder:text-outline focus:ring-primary-container focus:shadow-[0_0_16px_rgba(255,77,0,0.35)]',
                    'bg-white/10 text-white placeholder:text-purple-300 focus:ring-[#ff6699] border border-white/20',
                  )}`}
                />
                <button
                  type="submit"
                  className={`w-full sm:w-auto h-14 px-space-xl rounded-full font-label text-label-lg uppercase font-bold tracking-wider shrink-0 transition-colors ${t(
                    'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary shadow-[0_0_20px_rgba(255,87,26,0.3)]',
                    'bg-secondary-container text-black hover:bg-white shadow-lg font-black',
                  )}`}
                >
                  Get Plugged
                </button>
              </form>
            )}
          </div>

          <div className="xl:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-gutter">
            {footerColumns.map((col) => (
              <div key={col.title} className="flex flex-col gap-0.5 lg:gap-space-sm">
                <span className={`font-label text-label-lg uppercase font-bold mb-1 lg:mb-0 ${t(col.dark, col.light)}`}>{col.title}</span>
                {col.links.map((link) => (
                  <a
                    key={link}
                    href="#top"
                    // Taller rows on touch screens so each link is an easy tap target.
                    className={`py-2 lg:py-0 text-body-md transition-colors ${muted} ${t('hover:text-primary', 'hover:text-white')}`}
                  >
                    {link}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          className={`pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md ${t(
            '',
            'border-t border-white/10',
          )}`}
        >
          <div className="flex flex-wrap items-center justify-center gap-space-sm">
            {footerBadges.map((b) => (
              <span
                key={b.label}
                className={`px-space-md py-space-xs rounded-full font-label text-label-sm uppercase font-bold ${t(
                  `bg-surface-container ${b.dark}`,
                  `bg-white/10 ${b.light}`,
                )}`}
              >
                {b.label}
              </span>
            ))}
          </div>
          <div className={`flex items-center gap-space-md font-label text-label-sm ${t('text-on-surface-variant', 'text-purple-300')}`}>
            <span>© {new Date().getFullYear()} CRUNCH CRAFT INC.</span>
            <a href="#top" className={t('hover:text-on-surface', 'hover:text-white')}>
              PRIVACY
            </a>
            <a href="#top" className={t('hover:text-on-surface', 'hover:text-white')}>
              TERMS
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
