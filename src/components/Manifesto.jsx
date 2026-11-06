import { lazy, Suspense, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Icon from './Icon.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { stats } from '../data/content.js';

// three.js is heavy; the chip scene loads in its own chunk.
const ManifestoChips3D = lazy(() => import('./ManifestoChips3D.jsx'));

// Icon + colour for each stat card, in the same order as `stats`.
const statStyle = [
  { icon: 'graphic_eq', wrap: 'w-12 h-12 rounded-full bg-primary text-white' },
  { icon: 'water_drop', wrap: 'w-12 h-12 rounded-full bg-secondary-container text-white' },
  { icon: 'bolt', wrap: 'w-12 h-12 text-[#7c4dff]', filled: true },
];

export default function Manifesto() {
  const { t, isDark } = useTheme();
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Scroll story, scrubbed so it plays forwards scrolling down and rewinds scrolling up:
      // chapter tag → "Boring Snacks" rises word by word → "Are Dead." stamps down → underline draws →
      // the copy and proof points follow → the quote card swings in on its blob.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const el = root.current;
        const q = gsap.utils.selector(el);
        const scene = (trigger, start = 'top 92%', end = 'top 55%') =>
          gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: { trigger, start, end, scrub: 0.8 } });

        scene(q('.story-head')[0], 'top 95%', 'top 40%')
          .from(q('.story-pill'), { x: -60, autoAlpha: 0, duration: 0.4 })
          .from(q('.story-rule'), { scaleX: 0, transformOrigin: 'left center', duration: 0.5 }, '<0.1')
          .from(
            q('.story-word'),
            { yPercent: 90, rotationX: -75, autoAlpha: 0, transformOrigin: '50% 100%', stagger: 0.15, duration: 0.5 },
            '<0.1',
          )
          .from(q('.story-stamp'), { scale: 2.3, rotation: -12, autoAlpha: 0, duration: 0.45, ease: 'back.out(2.2)' })
          .fromTo(q('.story-underline path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.inOut' });

        scene(q('.story-copy')[0]).from(q('.story-copy'), { y: 40, autoAlpha: 0 });

        scene(q('.story-stats')[0]).from(q('.manifesto-stat'), { y: 70, scale: 0.85, autoAlpha: 0, stagger: 0.18 });

        scene(q('.story-quote')[0], 'top 95%', 'top 50%')
          .from(q('.story-blob'), { scale: 0.2, rotation: -60, autoAlpha: 0, duration: 0.6, ease: 'back.out(1.4)' })
          .from(
            q('.story-card'),
            { x: 120, y: 40, rotationY: -45, autoAlpha: 0, transformPerspective: 1200, duration: 0.7 },
            '<0.15',
          );
      });

      // 3D pointer tilt: the quote card and stat cards lean towards the cursor in perspective.
      mm.add('(prefers-reduced-motion: no-preference) and (hover: hover)', () => {
        const el = root.current;
        const card = el.querySelector('.manifesto-tilt');
        const stats3d = gsap.utils.toArray('.manifesto-stat', el);
        gsap.set(card, { transformPerspective: 1000 });
        gsap.set(stats3d, { transformPerspective: 700 });
        const rx = gsap.quickTo(card, 'rotationX', { duration: 0.7, ease: 'power3.out' });
        const ry = gsap.quickTo(card, 'rotationY', { duration: 0.7, ease: 'power3.out' });
        const srx = stats3d.map((s) => gsap.quickTo(s, 'rotationX', { duration: 0.6, ease: 'power3.out' }));
        const sry = stats3d.map((s) => gsap.quickTo(s, 'rotationY', { duration: 0.6, ease: 'power3.out' }));
        const onMove = (e) => {
          const r = el.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          rx(-ny * 14);
          ry(nx * 18);
          srx.forEach((f) => f(-ny * 10));
          sry.forEach((f) => f(nx * 12));
        };
        const onLeave = () => {
          rx(0);
          ry(0);
          srx.forEach((f) => f(0));
          sry.forEach((f) => f(0));
        };
        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerleave', onLeave);
        return () => {
          el.removeEventListener('pointermove', onMove);
          el.removeEventListener('pointerleave', onLeave);
        };
      });
    },
    { scope: root },
  );

  return (
    <section
      id="story"
      ref={root}
      className={`relative w-full overflow-hidden py-space-xl lg:py-28 ${t('bg-surface', 'bg-[#fdf5e8]')}`}
    >
      {/* three.js chips: lit, curved and tumbling in 3D. Above the copy on desktop (they keep to the margins and
          one sits on the quote card's corner); behind it on narrow screens where space is tight. */}
      {/* Soft seam: the Lab's lilac melts into the Manifesto's cream instead of stopping on a hard line. */}
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-40 sm:h-56 pointer-events-none bg-gradient-to-b to-transparent ${t(
          'from-surface-container-lowest',
          'from-[#f4eaff] via-[#f8eef4]',
        )}`}
      />
      {/* …and melts into the Ingredients section below. */}
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 h-32 sm:h-44 pointer-events-none bg-gradient-to-t to-transparent ${t(
          'from-surface-container-low',
          'from-[#fdf4ec]',
        )}`}
      />

      <Suspense fallback={null}>
        <ManifestoChips3D className="z-0 lg:z-20" />
      </Suspense>

      <div className="relative z-10 container-x">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter gap-y-space-xl items-center max-w-7xl mx-auto">
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            <div className="story-head flex items-center gap-space-md">
              <span
                className={`story-pill inline-flex items-center gap-2 font-label text-label-sm font-bold w-fit ${t(
                  'text-secondary uppercase tracking-widest',
                  'text-[#9a3412] bg-[#fde9b8] px-4 py-2 rounded-full',
                )}`}
              >
                {t(null, <Icon name="eco" filled className="text-[18px] text-[#65a30d]" />)}
                Craft Manifesto // 001
              </span>
              <span className={`story-rule hidden sm:block h-px w-40 ${t('bg-outline-variant', 'bg-[#e7d3b4]')}`} />
            </div>

            <h2
              className={`story-head-title font-heading leading-[0.95] tracking-tight [perspective:900px] ${t(
                'text-headline-xl-mobile sm:text-headline-xl font-extrabold uppercase text-on-surface',
                'text-[clamp(2.75rem,6.4vw,5.5rem)] font-extrabold text-[#1c0a14]',
              )}`}
            >
              <span className="story-word inline-block">Boring</span> <span className="story-word inline-block">Snacks</span>
              <br />
              <span className="story-stamp inline-block origin-left">
                <span
                  className={`relative inline-block ${t(
                    'text-primary-container',
                    'text-[#b3123f] -rotate-3 origin-left mt-1 sm:mt-2',
                  )}`}
                  style={!isDark ? { fontFamily: '"Kaushan Script", cursive', fontWeight: 400 } : undefined}
                >
                  Are Dead.
                  {/* Hand-drawn underline (draws itself in as part of the scroll story) */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 300 16"
                    preserveAspectRatio="none"
                    className={`story-underline absolute left-[28%] -bottom-1 w-[72%] h-3 ${t('hidden', 'block')}`}
                  >
                    <path
                      d="M3 10 C60 2, 120 14, 180 7 S270 6, 297 9"
                      pathLength="1"
                      strokeDasharray="1"
                      fill="none"
                      stroke="#f5b50a"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </span>
            </h2>

            <p className={`story-copy max-w-xl text-on-surface-variant ${t('text-body-xl', 'text-[18px] leading-8')}`}>
              We spent 18 straight months inside culinary labs and underground night markets rejecting cardboard chips
              drowned in artificial powder. Crunch Craft was founded on a simple decree: taste must be unapologetic,{' '}
              <span className="text-on-surface font-semibold">crunch must be violent.</span>
            </p>

            <div className="story-stats grid grid-cols-1 min-[560px]:grid-cols-3 gap-space-sm sm:gap-space-md pt-space-md">
              {stats.map((s, i) => {
                const st = statStyle[i] ?? statStyle[0];
                return (
                  <div
                    key={s.value}
                    className={`manifesto-stat flex items-center gap-space-sm p-space-md ${t(
                      'rounded bg-surface-container-low',
                      'rounded-[1.75rem] bg-white/80 shadow-[0_14px_30px_-12px_rgba(120,70,20,0.25)] border border-white',
                    )}`}
                  >
                    <span className={`shrink-0 flex items-center justify-center ${st.wrap}`}>
                      <Icon name={st.icon} filled={st.filled} className="text-[24px]" />
                    </span>
                    <span className={`self-stretch w-px ${t('bg-outline-variant', 'bg-[#eadfce]')}`} />
                    <div className="flex flex-col min-w-0">
                      <span className="font-heading text-headline-sm font-extrabold text-on-surface leading-tight">{s.value}</span>
                      <span className="text-body-sm text-on-surface-variant leading-snug">{s.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quote card: tilted, floating over a magenta blob, with a chip stuck to its edge. */}
          <div className="story-quote lg:col-span-5 relative py-space-md">
            <div
              aria-hidden="true"
              className={`story-blob absolute -z-0 inset-x-[8%] -top-4 bottom-0 rounded-[40%_60%_45%_55%/55%_40%_60%_45%] ${t(
                'bg-primary-container/30',
                'bg-gradient-to-br from-[#c2185b] to-[#a3123f]',
              )}`}
            />
            <div className="story-card relative z-10">
            <figure
              className={`manifesto-quote manifesto-tilt relative z-10 p-space-lg sm:p-space-xl flex flex-col justify-between gap-space-lg lg:-rotate-2 [transform-style:preserve-3d] [&>*]:[transform:translateZ(36px)] ${t(
                'rounded-[2rem] lg:rounded-xl bg-gradient-to-br from-surface-container-high to-surface-container shadow-2xl ring-1 ring-inset ring-white/10',
                'rounded-[2.25rem] bg-gradient-to-br from-white to-[#fdf0ec] shadow-[0_30px_60px_-20px_rgba(120,30,60,0.45)] border border-white',
              )}`}
            >
              <Icon name="format_quote" filled className={`text-[56px] -ml-1 ${t('text-primary-container opacity-40', 'text-[#f06ba0]')}`} />
              <blockquote className="font-heading text-headline-sm text-on-surface font-extrabold leading-snug">
                “Most brands optimize for shelf life. We optimized for the primal adrenaline rush of your first mouthful.”
              </blockquote>
              <figcaption className="flex items-center gap-space-md pt-space-sm">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-label font-extrabold ${t(
                    'bg-primary-container text-on-primary-container',
                    'bg-[#b3123f] text-white shadow-md',
                  )}`}
                >
                  CC
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-label-lg text-on-surface uppercase font-bold">Dr. Hugo Vance</span>
                  <span className="text-body-sm text-on-surface-variant">Chief Acoustic Gastronomist</span>
                </div>
              </figcaption>
            </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
