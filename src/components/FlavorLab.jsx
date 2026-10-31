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

// Ingredient callouts pinned over the full-bleed photo.
const labTagPositions = ['top-[14%] left-4 lg:left-[12%]', 'top-1/2 right-4 lg:right-[10%]', 'bottom-[12%] left-6 lg:left-[16%]'];

export default function FlavorLab() {
  const { isDark, t } = useTheme();
  const { addToCart } = useCart();
  const [idx, setIdx] = useState(0);
  // Follow the slider above, so the pack that flies down from it lands on its own flavour.
  useEffect(() => {
    const onFlavour = (e) => setIdx(e.detail);
    window.addEventListener('cc:flavour', onFlavour);
    return () => window.removeEventListener('cc:flavour', onFlavour);
  }, []);
  const f = flavors[idx];
  const s = isDark ? f.dark : f.light;
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
      <div className="relative order-1 h-[min(52svh,120vw)] sm:h-[min(48svh,80vw)] lg:h-auto pt-20 lg:pt-20 flex overflow-hidden">
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
            className={`lab-pack absolute h-[86%] lg:h-[min(80%,78svh)] w-auto max-w-[80%] object-contain transition-all duration-700 ease-out ${t(
              'drop-shadow-[0_40px_60px_rgba(0,0,0,0.85)]',
              'drop-shadow-[0_36px_48px_rgba(110,10,60,0.35)]',
            )} ${i === idx ? 'opacity-100 translate-y-0 rotate-[-4deg] scale-100' : 'opacity-0 translate-y-10 rotate-6 scale-90'}`}
          />
        ))}
        {f.tags.map((tag, i) => (
          <div
            key={`${f.id}-${tag}`}
            className={`absolute z-20 px-3 sm:px-space-md py-1 sm:py-1.5 rounded-full shadow-lg font-label text-label-sm font-bold whitespace-nowrap animate-reveal ${labTagPositions[i]} ${tagColors[i]} ${t(
              'bg-surface-container-highest/90 backdrop-blur-md',
              'bg-white border font-black',
            )}`}
            style={{ animationDelay: `${0.2 + i * 0.12}s` }}
          >
            {tag}
          </div>
        ))}
        </div>
      </div>

      {/* Copy side */}
      <div className="relative order-2 flex flex-col justify-center gap-[var(--lab-gap)] container-x lg:pl-space-xl pt-space-md lg:pt-[max(84px,11vh)] pb-space-xl lg:pb-[max(20px,4vh)]">
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
            className={`self-start flex items-center gap-space-xs p-1.5 rounded-full max-w-full overflow-x-auto ${t(
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
                onClick={() => setIdx(i)}
                className={`px-3 min-[400px]:px-space-md sm:px-space-lg py-1.5 lg:py-2 rounded-full font-label text-label-sm uppercase font-bold tracking-wider whitespace-nowrap transition-all ${
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

        <div role="tabpanel" key={f.id} className="relative z-10 flex flex-col gap-[calc(var(--lab-gap)*0.7)] animate-reveal">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span
                className={`px-space-md py-1 rounded-full font-label text-label-sm font-bold uppercase ${t(
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
                <span className="lab-caption text-body-sm text-on-surface-variant">Max seasoning surface area</span>
              </Metric>
              <Metric label="Roast Technique" value={f.roast} valueClass="text-on-surface">
                <span className="lab-caption text-body-sm text-on-surface-variant">Non-GMO Avocado Oil bath</span>
              </Metric>
            </div>

            <div>
              <button
                type="button"
                onClick={() => addToCart(f.name, f.price)}
                className={`w-full sm:w-auto justify-center px-space-lg sm:px-space-xl py-[clamp(12px,1.9vh,18px)] rounded-full font-label text-label-lg uppercase font-bold tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-space-xs ${t(
                  'bg-primary-container text-on-primary-container',
                  'bg-secondary-container text-black hover:bg-[#ffbe1a] border-2 border-yellow-200 font-black',
                )}`}
              >
                <Icon name="bolt" className="text-[20px]" />
                <span>Add to Crunch Crate — {formatPrice(f.price)}</span>
              </button>
            </div>
        </div>
      </div>
    </section>
  );
}
