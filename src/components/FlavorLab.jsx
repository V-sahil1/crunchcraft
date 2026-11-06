import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import SectionHeading from './SectionHeading.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { flavors, formatPrice } from '../data/content.js';
import slideScenes from '../data/slideScenes.json';

function Metric({ label, value, valueClass, children }) {
  const { t } = useTheme();
  return (
    <div
      className={`p-[var(--lab-pad)] flex flex-col gap-1 ${t(
        'rounded bg-surface-container-high',
        'rounded-2xl bg-surface-container border border-purple-100',
      )}`}
    >
      <span className="font-label text-label-sm uppercase text-on-surface-variant">{label}</span>
      <span className={`font-label text-[length:var(--lab-value)] leading-tight font-extrabold ${valueClass}`}>{value}</span>
      {children}
    </div>
  );
}

function Bar({ pct, className }) {
  const { t } = useTheme();
  return (
    <div
      className={`w-full rounded-full overflow-hidden ${t('bg-surface-container-highest h-1.5', 'bg-purple-200 h-2')}`}
    >
      <div className={`h-full rounded-full transition-all duration-700 ${className}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// Ingredient callouts orbiting the pack; on small screens they hug it instead of the screen edges.
const labTagPositions = [
  'top-[18%] left-3 sm:left-[14%] lg:top-[14%] lg:left-[12%]',
  'top-[50%] right-3 sm:right-[14%] lg:top-1/2 lg:right-[10%]',
  'bottom-[6%] left-5 sm:left-[18%] lg:bottom-[12%] lg:left-[16%]',
];

export default function FlavorLab() {
  const { isDark, t } = useTheme();
  const { addToCart } = useCart();
  // Start on the flavour the slider is currently showing (it may have been set before this section mounted).
  const [idx, setIdx] = useState(() => (typeof window !== 'undefined' && window.__ccFlavour) || 0);
  // Follow the slider above, so the pack that flies down from it lands on its own flavour.
  useEffect(() => {
    const onFlavour = (e) => setIdx(e.detail);
    window.addEventListener('cc:flavour', onFlavour);
    return () => window.removeEventListener('cc:flavour', onFlavour);
  }, []);
  // The slider is the source of truth: scrolling into the Lab always lands on the slider's current flavour.
  const pick = (i) => setIdx(i);
  const f = flavors[idx];
  const s =isDark ? f.dark : f.light;
  const tagColors = t(
    ['text-primary', 'text-secondary', 'text-tertiary'],
    ['text-primary border-pink-100', 'text-[#b45309] border-amber-100', 'text-tertiary border-purple-100'],
  );

  return (
    <section
      id="flavor-lab"
      className={`lab relative w-full lg:min-h-[100svh] grid grid-cols-1 lg:grid-cols-2 overflow-hidden ${t(
        'bg-surface-container-lowest',
        'bg-[#f4eaff]',
      )}`}
    >
      {/* Product side: just the cut-out pack, cross-fading per flavour over a soft flavour glow */}
      {/* On desktop the bottom is feathered so the flavour glow fades out instead of ending on the column's hard edge. */}
      <div className="relative order-1 h-[min(64svh,125vw)] sm:h-[min(56svh,78vw)] lg:h-auto pt-16 lg:pt-20 flex flex-col overflow-hidden lg:[mask-image:linear-gradient(to_bottom,#000_80%,transparent)]">
        <div className="relative flex-1 flex items-center justify-center">
        <div
          aria-hidden="true"
          className="absolute w-[80%] max-w-[640px] aspect-square rounded-full blur-3xl opacity-70 transition-colors duration-700"
          style={{ backgroundColor: s.labGlow }}
        />
        {flavors.map((fl, i) => (
          <img
            key={fl.id}
            src={slideScenes[fl.id].pack}
            data-id={fl.id}
            alt={i === idx ? `${fl.name} pouch` : ''}
            aria-hidden={i === idx ? undefined : 'true'}
            className={`lab-pack absolute z-10 h-[86%] lg:h-[min(80%,78svh)] w-auto max-w-[80%] object-contain transition-all duration-700 ease-out ${t(
              'drop-shadow-[0_40px_60px_rgba(0,0,0,0.85)]',
              'drop-shadow-[0_36px_48px_rgba(110,10,60,0.35)]',
            )} ${i === idx ? 'opacity-100 translate-y-0 rotate-[-4deg] scale-100' : 'opacity-0 translate-y-10 rotate-6 scale-90'}`}
          />
        ))}
        {f.tags.map((tag, i) => (
          <div
            key={`${f.id}-${tag}`}
            // z-[35] keeps the callouts above the seam crumbs (z-30) drifting in from the neighbouring sections.
            className={`absolute z-[35] hidden sm:block px-space-md py-1.5 rounded-full shadow-lg font-label text-label-sm font-bold whitespace-nowrap animate-reveal ${labTagPositions[i]} ${tagColors[i]} ${t(
              'bg-surface-container-highest/90 backdrop-blur-md',
              'bg-white border font-black',
            )}`}
            style={{ animationDelay: `${0.2 + i * 0.12}s` }}
          >
            {tag}
          </div>
        ))}
        </div>
        {/* Phones: the callouts sit in a tidy row under the pack instead of on top of it. */}
        <ul aria-label="Key ingredients" className="sm:hidden relative z-[35] flex flex-wrap justify-center gap-1.5 px-space-md pt-1 pb-2">
          {f.tags.map((tag, i) => (
            <li
              key={`${f.id}-m-${tag}`}
              className={`px-2.5 py-1 rounded-full shadow-sm font-label text-[10px] leading-tight font-bold whitespace-nowrap animate-reveal ${tagColors[i]} ${t(
                'bg-surface-container-highest/90',
                'bg-white border font-black',
              )}`}
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>

      {/* Copy side */}
      <div className="relative order-2 flex flex-col justify-center gap-[var(--lab-gap)] container-x lg:pl-space-xl pt-space-sm lg:pt-[max(84px,11vh)] pb-20 sm:pb-24 lg:pb-[max(56px,8vh)]">
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full blur-3xl transition-colors duration-700 pointer-events-none"
          style={{ backgroundColor: s.labGlow }}
        />

        <div className="relative flex flex-col gap-[calc(var(--lab-gap)*0.7)]">
          <SectionHeading
            eyebrow="Chapter 03 · Molecular Sensory Lab"
            eyebrowClass={t('text-tertiary', 'text-primary font-black')}
            title="Flavour Anatomy"
            titleClass="text-[length:var(--lab-title)] leading-[1.02]"
          />
          <div
            role="tablist"
            aria-label="Flavour profiles"
            className={`self-stretch sm:self-start flex items-center gap-space-xs p-1.5 rounded-full max-w-full overflow-x-auto ${t(
              'bg-surface-container',
              'bg-white shadow-sm border border-purple-200',
            )}`}
          >
            {flavors.map((fl, i) => (
              <button
                key={fl.id}
                type="button"
                role="tab"
                aria-selected={i === idx}
                onClick={() => pick(i)}
                className={`flex-1 sm:flex-none px-2 min-[400px]:px-space-md sm:px-space-lg py-2.5 lg:py-2 rounded-full font-label text-label-sm uppercase font-bold tracking-wider whitespace-nowrap transition-all ${
                  i === idx
                    ? t('bg-primary-container text-on-primary-container', 'bg-primary text-white shadow-sm font-black')
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {fl.shortName}
              </button>
            ))}
          </div>
        </div>

        <div role="tabpanel" key={f.id} className="relative z-[35] flex flex-col gap-[calc(var(--lab-gap)*0.7)] animate-reveal">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span
                className={`px-3 sm:px-space-md py-1 rounded-full font-label text-label-sm font-bold uppercase ${t(
                  'bg-surface-container-high text-primary',
                  'bg-primary-fixed text-primary font-extrabold',
                )}`}
              >
                {f.profile}
              </span>
              <span
                className={`font-label text-label-sm font-bold ${t(
                  'text-tertiary',
                  'text-[#16a34a] bg-[#dcfce7] px-3 py-1 rounded-full font-black',
                )}`}
              >
                CERTIFIED VEGAN
              </span>
            </div>
            <h3
              className="font-heading font-extrabold uppercase tracking-tight leading-[1.04] text-on-surface text-[length:var(--lab-name)] text-balance"
            >
              {f.name}
            </h3>
            <p className="text-[length:var(--lab-desc)] leading-[1.55] text-on-surface-variant max-w-[60ch]">{f.desc}</p>

            <div className="grid grid-cols-2 gap-[calc(var(--lab-gap)*0.5)]">
              <Metric label="Heat Coefficient" value={f.heat.label} valueClass="text-primary">
                <Bar pct={f.heat.pct} className={s.heatBar} />
              </Metric>
              <Metric label="Decibel Rating" value={f.db.label} valueClass={t('text-tertiary', 'text-[#059669]')}>
                <Bar pct={f.db.pct} className={t('bg-tertiary', 'bg-[#10b981]')} />
              </Metric>
              <Metric label="Cut Architecture" value={f.cut} valueClass={t('text-secondary', 'text-[#b45309]')}>
                <span className="lab-caption max-sm:hidden text-body-sm text-on-surface-variant">Max seasoning surface area</span>
              </Metric>
              <Metric label="Roast Technique" value={f.roast} valueClass="text-on-surface">
                <span className="lab-caption max-sm:hidden text-body-sm text-on-surface-variant">Non-GMO Avocado Oil bath</span>
              </Metric>
            </div>

            <div>
              <button
                type="button"
                onClick={() => addToCart(f.name, f.price)}
                className={`w-full sm:w-auto justify-center whitespace-nowrap px-space-lg sm:px-space-xl py-[clamp(14px,1.9vh,18px)] rounded-full font-label text-label-lg uppercase font-bold tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-space-xs ${t(
                  'bg-primary-container text-on-primary-container',
                  'bg-secondary-container text-black hover:bg-[#ffbe1a] border-2 border-yellow-200 font-black',
                )}`}
              >
                <Icon name="bolt" className="text-[20px]" />
                <span>
                  Add to <span className="hidden min-[420px]:inline">Crunch </span>Crate — {formatPrice(f.price)}
                </span>
              </button>
            </div>
        </div>
      </div>
    </section>
  );
}
