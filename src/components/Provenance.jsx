import { lazy, Suspense, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Icon from './Icon.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { ingredients } from '../data/content.js';

// The same three.js chip scene the Manifesto uses, with this section's own layout (lazy: three.js is heavy).
const FloatingChips3D = lazy(() => import('./ManifestoChips3D.jsx'));

const S = '/images/slides';

// Chips, crumbs and leaves drifting around the section's edges (fractions of the section; see ManifestoChips3D).
const PROV_CHIPS = [
  { src: `${S}/truffle/piece-3.webp`, x: 0.035, y: 0.1, size: 210, z: 1.6, curl: 0.2, rot: [0.3, -0.3, -0.6] },
  { leaf: true, x: 0.14, y: 0.07, size: 80, z: 1.0, curl: 0.25, rot: [0.4, 0.3, -0.5] },
  { src: `${S}/truffle/piece-7.webp`, x: 0.975, y: 0.06, size: 200, z: 1.9, curl: 0.22, rot: [0.2, 0.4, 0.9] },
  { leaf: true, x: 0.8, y: 0.2, size: 80, z: 0.8, curl: 0.25, rot: [-0.3, 0.2, 2.6], desktopOnly: true },
  { src: `${S}/chili/piece-12.webp`, x: 0.87, y: 0.09, size: 46, z: 0.5, curl: 0.1, rot: [0, 0, 0.4], desktopOnly: true },
  { src: `${S}/jalapeno/piece-9.webp`, x: 0.995, y: 0.46, size: 170, z: 1.3, curl: 0.2, rot: [0.3, -0.4, 1.9] },
  { leaf: true, x: 0.965, y: 0.7, size: 70, z: 1.5, curl: 0.25, rot: [0.2, -0.3, 0.4] },
  { src: `${S}/truffle/piece-5.webp`, x: 0.94, y: 0.95, size: 220, z: 2.1, curl: 0.22, rot: [-0.2, 0.3, 2.4] },
  { src: `${S}/truffle/piece-2.webp`, x: 0.03, y: 0.95, size: 190, z: 1.7, curl: 0.2, rot: [0.3, 0.2, -2.2] },
  { leaf: true, x: 0.02, y: 0.72, size: 64, z: 1.2, curl: 0.25, rot: [-0.3, 0.2, 3.6] },
  { src: `${S}/chili/piece-12.webp`, x: 0.035, y: 0.4, size: 40, z: 0.4, curl: 0.1, rot: [0, 0, 1], desktopOnly: true },
];
const PROV_DELAYS = [0, 0.05, 0.08, 0.14, 0.12, 0.2, 0.28, 0.36, 0.32, 0.26, 0.18];

// Per-card look, in the same order as `ingredients`: the ingredient that pops out of the card, the colour
// blob behind it, and the light-theme accents.
const CARD = [
  {
    img: `${S}/chili/piece-7.webp`,
    blob: 'rgba(255, 182, 206, 0.75)',
    darkBlob: 'rgba(236, 59, 131, 0.28)',
    icon: 'bg-pink-100 text-[#c2185b]',
    origin: 'text-[#c2185b]',
    pill: 'bg-pink-50 text-[#c2185b]',
  },
  {
    img: `${S}/jalapeno/piece-5.webp`,
    blob: 'rgba(214, 240, 168, 0.85)',
    darkBlob: 'rgba(171, 214, 0, 0.22)',
    icon: 'bg-lime-100 text-[#4d7c0f]',
    origin: 'text-[#4d7c0f]',
    pill: 'bg-lime-50 text-[#4d7c0f]',
  },
  {
    img: `${S}/truffle/piece-9.webp`,
    blob: 'rgba(221, 208, 255, 0.85)',
    darkBlob: 'rgba(124, 77, 255, 0.25)',
    icon: 'bg-violet-100 text-[#6d4fd8]',
    origin: 'text-[#5b3fc4]',
    pill: 'bg-violet-50 text-[#5b3fc4]',
  },
  {
    img: `${S}/chili/piece-4.webp`,
    blob: 'rgba(255, 222, 160, 0.85)',
    darkBlob: 'rgba(255, 176, 58, 0.25)',
    icon: 'bg-amber-100 text-[#c2410c]',
    origin: 'text-[#b45309]',
    pill: 'bg-amber-50 text-[#b45309]',
  },
];

export default function Provenance() {
  const { isDark, t } = useTheme();
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);

      // Scroll story (scrubbed, so it rewinds scrolling back up): the eyebrow rules draw out, "Pure Botanical"
      // rises word by word, "Provenance" stamps down with its underline, then each card flips up out of the page
      // and its ingredient bursts out of the top of it.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({
            defaults: { ease: 'power3.out' },
            scrollTrigger: { trigger: q('.prov-head')[0], start: 'top 92%', end: 'top 45%', scrub: 0.8 },
          })
          .from(q('.prov-line'), { scaleX: 0, duration: 0.5 })
          .from(q('.prov-pill'), { y: 20, scale: 0.8, autoAlpha: 0, duration: 0.4 }, '<')
          .from(
            q('.prov-word'),
            { yPercent: 90, rotationX: -75, autoAlpha: 0, transformOrigin: '50% 100%', stagger: 0.15, duration: 0.5 },
            '<0.1',
          )
          .from(q('.prov-stamp'), { scale: 2.2, rotation: -10, autoAlpha: 0, duration: 0.45, ease: 'back.out(2.2)' })
          .fromTo(q('.prov-underline path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.inOut' })
          .from(q('.prov-copy'), { y: 30, autoAlpha: 0, duration: 0.4 }, '<');

        // With all four cards in one row they start a beat apart, so the row deals out left to right.
        const oneRow = window.matchMedia('(min-width: 1280px)').matches;
        q('.prov-card').forEach((card, i) => {
          const lag = oneRow ? (i % 4) * 3 : 0;
          gsap
            .timeline({
              defaults: { ease: 'power3.out' },
              // Triggered by the card's wrapper (never moved by this animation), and finished while the card is
              // still in the lower part of the screen, so it's fully formed by the time it's read.
              scrollTrigger: { trigger: card.parentElement, start: `top ${100 - lag}%`, end: `top ${74 - lag}%`, scrub: 0.8 },
            })
            .from(card, { y: 90, rotationX: -22, autoAlpha: 0, transformPerspective: 1200, transformOrigin: '50% 100%' })
            .from(card.querySelector('.prov-blob'), { scale: 0, autoAlpha: 0, ease: 'back.out(1.6)' }, '-=0.25')
            .from(
              card.querySelector('.prov-ing'),
              { y: 110, scale: 0.3, rotation: i % 2 ? 45 : -45, autoAlpha: 0, ease: 'back.out(1.8)' },
              '<',
            )
            .from(card.querySelectorAll('.prov-reveal'), { y: 18, autoAlpha: 0, stagger: 0.08 }, '-=0.3');
        });

        // Each ingredient bobs gently on its own rhythm once it's out.
        q('.prov-float').forEach((el, i) => {
          gsap.to(el, {
            y: -10,
            rotation: i % 2 ? 4 : -4,
            duration: 2.2 + i * 0.35,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
        });
      });

      // Pointer play: the card tilts toward the cursor in 3D, its ingredient lifts out further and follows the
      // pointer, the colour blob swells and the icon gives a spin.
      mm.add('(prefers-reduced-motion: no-preference) and (hover: hover)', () => {
        const cleanups = q('.prov-tilt').map((wrap, i) => {
          const pop = wrap.querySelector('.prov-pop');
          const blob = wrap.querySelector('.prov-blob-hover');
          const icon = wrap.querySelector('.prov-icon');
          gsap.set(wrap, { transformPerspective: 900 });
          const rx = gsap.quickTo(wrap, 'rotationX', { duration: 0.6, ease: 'power3.out' });
          const ry = gsap.quickTo(wrap, 'rotationY', { duration: 0.6, ease: 'power3.out' });
          const px = gsap.quickTo(pop, 'x', { duration: 0.6, ease: 'power3.out' });
          const onMove = (e) => {
            const r = wrap.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            rx(-ny * 14);
            ry(nx * 16);
            px(nx * 26);
          };
          const onEnter = () => {
            gsap.to(pop, { y: -16, scale: 1.06, rotation: i % 2 ? -8 : 8, duration: 0.6, ease: 'back.out(2)' });
            gsap.to(blob, { scale: 1.25, duration: 0.6, ease: 'power3.out' });
            gsap.fromTo(icon, { rotation: 0 }, { rotation: 360, duration: 0.8, ease: 'back.out(1.6)' });
          };
          const onLeave = () => {
            rx(0);
            ry(0);
            px(0);
            gsap.to(pop, { y: 0, scale: 1, rotation: 0, duration: 0.7, ease: 'power3.out' });
            gsap.to(blob, { scale: 1, duration: 0.7, ease: 'power3.out' });
          };
          wrap.addEventListener('pointermove', onMove);
          wrap.addEventListener('pointerenter', onEnter);
          wrap.addEventListener('pointerleave', onLeave);
          return () => {
            wrap.removeEventListener('pointermove', onMove);
            wrap.removeEventListener('pointerenter', onEnter);
            wrap.removeEventListener('pointerleave', onLeave);
          };
        });
        return () => cleanups.forEach((c) => c());
      });
    },
    { scope: root },
  );

  return (
    <section
      id="ingredients"
      ref={root}
      // From xl (four cards in a row) the section is exactly one screen tall and everything inside is sized off the
      // screen height as well as its width (clamp + vh), so the heading and all four cards fit in view at once.
      className={`relative w-full overflow-hidden py-space-xl xl:min-h-[100svh] xl:flex xl:flex-col xl:justify-center xl:pt-[max(84px,11vh)] xl:pb-[max(28px,4.5vh)] ${t('bg-surface-container-low', 'bg-[#fdf4ec]')}`}
    >
      {/* Soft warm glows behind everything */}
      {t(
        null,
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          {/* Kept clear of the top edge, which would slice the glow into a visible line at the seam. */}
          <div className="absolute top-24 left-[12%] w-[520px] h-[420px] rounded-full bg-[#ffe1ea]/60 blur-[110px]" />
          <div className="absolute top-1/3 right-[8%] w-[460px] h-[420px] rounded-full bg-[#fff1c9]/60 blur-[110px]" />
        </div>,
      )}

      <Suspense fallback={null}>
        <FloatingChips3D chips={PROV_CHIPS} delays={PROV_DELAYS} className="z-0" />
      </Suspense>

      <div className="relative z-10 container-x">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          {/* Heading */}
          <div className="prov-head flex flex-col items-center text-center gap-space-md xl:gap-[clamp(8px,1.7vh,20px)]">
            <div className="flex items-center gap-space-md">
              <span className={`prov-line origin-right h-px w-12 sm:w-28 ${t('bg-outline-variant', 'bg-[#e7d3c4]')}`} />
              <span
                className={`prov-pill inline-flex items-center gap-2 font-label text-label-sm font-bold px-4 py-2 xl:py-[clamp(4px,0.9vh,8px)] rounded-full ${t(
                  'bg-surface-container text-tertiary uppercase tracking-widest',
                  'bg-[#fdefc9] text-[#3f2a1e]',
                )}`}
              >
                <Icon name="eco" filled className="text-[18px] text-[#65a30d]" />
                Radical Transparency
              </span>
              <span className={`prov-line origin-left h-px w-12 sm:w-28 ${t('bg-outline-variant', 'bg-[#e7d3c4]')}`} />
            </div>

            <h2
              className={`font-heading font-extrabold uppercase leading-[0.95] tracking-tight [perspective:900px] text-[clamp(2.25rem,5.6vw,4.75rem)] xl:text-[clamp(2.25rem,min(5vw,7vh),4.75rem)] ${t(
                'text-on-surface',
                'text-[#1c0a14]',
              )}`}
            >
              <span className="prov-word inline-block">Pure</span>{' '}
              <span className="prov-word inline-block">Botanical</span>
              <br />
              <span className="prov-stamp inline-block">
                <span
                  className={`relative inline-block ${t(
                    'text-primary-container',
                    'text-[#c2185b] normal-case -rotate-2 text-[1.12em] leading-[1.05] pr-2',
                  )}`}
                  style={!isDark ? { fontFamily: '"Kaushan Script", cursive', fontWeight: 400 } : undefined}
                >
                  Provenance
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 300 16"
                    preserveAspectRatio="none"
                    className={`prov-underline absolute left-[18%] -bottom-1 w-[76%] h-3 ${t('hidden', 'block')}`}
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

            <p className="prov-copy text-body-lg xl:text-[clamp(14px,2.2vh,18px)] xl:leading-[1.5] text-on-surface-variant max-w-2xl">
              Zero mysteries. Zero lab-created flavoring chemicals. Only pure raw elements sourced from hyper-specific
              geographic microclimates.
            </p>
          </div>

          {/* Cards: each ingredient bursts out of the top of its card (pt leaves room for it) */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-gutter gap-y-24 pt-24 lg:pt-28 xl:pt-[clamp(52px,10.5vh,112px)]">
            {ingredients.map((ing, i) => {
              const c = CARD[i] ?? CARD[0];
              return (
                <div key={ing.name} className="prov-tilt relative h-full max-w-sm sm:max-w-none mx-auto w-full">
                  <article
                    className={`prov-card relative h-full flex flex-col gap-space-sm pt-20 px-space-lg pb-space-lg xl:gap-[clamp(5px,1.1vh,12px)] xl:px-[clamp(18px,1.8vw,32px)] xl:pt-[clamp(46px,9vh,80px)] xl:pb-[clamp(16px,3vh,32px)] ${t(
                      'rounded-[2rem] bg-surface-container ring-1 ring-inset ring-white/5 shadow-lg',
                      'rounded-[2rem] bg-white/75 backdrop-blur-md border border-white shadow-[0_24px_50px_-24px_rgba(120,60,30,0.35)]',
                    )}`}
                  >
                    {/* Ingredient popping out of the card, over its colour blob */}
                    <div aria-hidden="true" className="absolute left-1/2 -top-16 -translate-x-1/2 w-40 h-32 xl:w-[clamp(104px,20vh,160px)] xl:h-[clamp(84px,16vh,128px)] xl:top-[calc(-1*clamp(42px,8vh,64px))] pointer-events-none">
                      <div className="prov-blob-hover absolute inset-0">
                        <div
                          className="prov-blob absolute inset-[6%] rounded-full blur-2xl"
                          style={{ background: isDark ? c.darkBlob : c.blob }}
                        />
                      </div>
                      <div className="prov-pop relative w-full h-full">
                        <div className="prov-float w-full h-full">
                          <img
                            src={c.img}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            // The cut-outs are small (≈130–250px), so the box is sized to show them at about their natural
                            // resolution, and a touch of contrast/saturation keeps them crisp.
                            className="prov-ing w-full h-full object-contain [filter:saturate(1.08)_contrast(1.05)_drop-shadow(0_14px_16px_rgba(80,30,10,0.28))]"
                          />
                        </div>
                      </div>
                    </div>

                    <span
                      className={`prov-icon prov-reveal w-11 h-11 xl:w-[clamp(32px,5.4vh,44px)] xl:h-[clamp(32px,5.4vh,44px)] rounded-full flex items-center justify-center ${t(
                        isDark ? ing.dark.iconWrap : '',
                        c.icon,
                      )}`}
                    >
                      <Icon name={ing.icon} className="text-[24px] xl:text-[clamp(18px,3vh,24px)]" />
                    </span>
                    <div className="prov-reveal flex flex-col gap-1">
                      <span className={`font-label text-label-sm uppercase font-bold ${t(ing.dark.origin, c.origin)}`}>
                        {ing.origin}
                      </span>
                      <h3 className="font-heading text-headline-sm xl:text-[clamp(17px,2.9vh,24px)] text-on-surface font-extrabold uppercase leading-tight">
                        {ing.name}
                      </h3>
                    </div>
                    <p className="prov-reveal text-body-sm xl:text-[clamp(12.5px,1.8vh,14px)] xl:leading-snug text-on-surface-variant">{ing.desc}</p>
                    <span
                      className={`prov-reveal mt-auto w-fit whitespace-nowrap px-4 xl:px-3 py-1.5 xl:py-[clamp(3px,0.7vh,6px)] rounded-full font-label text-label-sm uppercase font-bold ${t(
                        `bg-white/5 ${ing.dark.cert}`,
                        c.pill,
                      )}`}
                    >
                      {ing.cert}
                    </span>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
