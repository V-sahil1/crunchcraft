import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Icon from './Icon.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { flavors, formatPrice } from '../data/content.js';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Background-free pack cut-outs from public/images, in the same order as the flavour tabs.
const heroPacks = [
  { id: 'chili', src: '/images/row-1-column-1__2_-removebg-preview.png', alt: 'Fiery Chili & Smoked Cheddar pouch' },
  { id: 'jalapeno', src: '/images/slides/jalapeno/pack.webp', alt: 'Smoky Jalapeño & Lime Crunch pouch' },
  { id: 'truffle', src: '/images/slides/truffle/pack-noble.webp', alt: 'Dark Truffle & Roasted Garlic crisps pouch' },
];

const eqBars = [
  { h: 'h-3', dark: 'bg-primary-container', light: 'bg-primary', delay: 0 },
  { h: 'h-5', dark: 'bg-primary-container', light: 'bg-primary', delay: 120 },
  { h: 'h-7', dark: 'bg-secondary-container', light: 'bg-secondary-container', delay: 240 },
  { h: 'h-4', dark: 'bg-secondary-container', light: 'bg-secondary-container', delay: 80 },
  { h: 'h-6', dark: 'bg-tertiary', light: 'bg-[#84cc16]', delay: 180 },
  { h: 'h-7', dark: 'bg-tertiary', light: 'bg-[#84cc16]', delay: 300 },
  { h: 'h-5', dark: 'bg-tertiary', light: 'bg-tertiary', delay: 160 },
  { h: 'h-3', dark: 'bg-primary-container', light: 'bg-primary', delay: 210 },
];

// One "SNACK LOUD. LIVE BOLD. ✦" phrase; `outline` renders it as stroked type for the middle row.
function Phrase({ outline }) {
  const { t } = useTheme();
  const solid = t('text-on-surface', 'text-white');
  const loud = outline ? '' : t('text-primary-container', 'text-[#ffe066]');
  const bold = outline
    ? ''
    : t(
        'text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary-container',
        'text-white underline decoration-wavy decoration-[#ffd166] decoration-[0.06em] underline-offset-[0.12em]',
      );
  return (
    <span className={`flex items-center shrink-0 ${outline ? 'hero-outline' : solid}`}>
      <span className="pr-[0.25em]">Snack</span>
      <span className={`pr-[0.25em] ${loud}`}>Loud.</span>
      <span className="pr-[0.25em]">Live</span>
      <span className={`pr-[0.35em] ${bold}`}>Bold.</span>
      <span className={`pr-[0.35em] text-[0.45em] ${outline ? '' : t('text-tertiary', 'text-[#ffe066]')}`}>✦</span>
    </span>
  );
}

function MarqueeRow({ outline = false }) {
  // Two identical halves so animating xPercent to -50 loops seamlessly.
  return (
    <div className="hero-row flex w-max whitespace-nowrap will-change-transform" aria-hidden="true">
      {[0, 1].map((half) => (
        <span key={half} className="flex">
          <Phrase outline={outline} />
          <Phrase outline={outline} />
        </span>
      ))}
    </div>
  );
}

function SpinBadge() {
  const { t } = useTheme();
  return (
    <div
      className={`hero-pop absolute z-30 top-[6%] right-[4%] sm:right-[14%] lg:right-[24%] w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-2xl ${t(
        'bg-secondary-container text-on-secondary-fixed',
        'bg-[#ffe066] text-[#3a2000] border-2 border-white',
      )}`}
    >
      <svg viewBox="0 0 100 100" className="hero-spin absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-current font-label font-bold uppercase" style={{ fontSize: '9.5px', letterSpacing: '2px' }}>
          <textPath href="#badge-circle">Reserve Batch • Small Batch • Premium •</textPath>
        </text>
      </svg>
      <Icon name="diamond" filled className="text-[28px] sm:text-[36px]" />
    </div>
  );
}

export default function Hero() {
  const { t } = useTheme();
  const { addToCart } = useCart();
  const root = useRef(null);

  // The hero pack rotates through the flavours on its own while you are at the top of the page. It holds still
  // once you scroll, so the pack that flies down into the slider is the one that was showing.
  const [active, setActive] = useState(heroPacks.findIndex((p) => p.id === 'truffle'));
  const flavourIndex = flavors.findIndex((f) => f.id === heroPacks[active].id);
  window.__ccHero = flavourIndex; // the Arsenal flight reads this
  // The copy, price and badges follow whichever flavour is showing.
  const truffle = flavors[flavourIndex];
  const shortFlavour = truffle.shortName.replace(/^\d+\s*/, '');
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => {
      if (window.scrollY < 8) setActive((a) => (a + 1) % heroPacks.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Endless rolling text rows, alternating direction.
        const rows = gsap.utils.toArray('.hero-row');
        const loops = rows.map((row, i) =>
          i % 2 === 0
            ? gsap.fromTo(row, { xPercent: 0 }, { xPercent: -50, duration: 26 + i * 4, ease: 'none', repeat: -1 })
            : gsap.fromTo(row, { xPercent: -50 }, { xPercent: 0, duration: 30, ease: 'none', repeat: -1 }),
        );

        // Scroll velocity briefly speeds the rows up, then eases back to cruising speed.
        let settle;
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          onUpdate: (self) => {
            const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 6);
            gsap.to(loops, { timeScale: boost, duration: 0.2, overwrite: true });
            settle?.kill();
            settle = gsap.to(loops, { timeScale: 1, duration: 1.2, delay: 0.25, ease: 'power2.out' });
          },
        });

        // Intro: rows sweep in, pack drops and spins into place, stickers pop.
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro
          .from('.hero-row-wrap', { opacity: 0, y: 60, stagger: 0.12, duration: 1 })
          .from(
            '.hero-pack',
            { y: -260, rotation: -28, scale: 0.55, opacity: 0, duration: 1.3, ease: 'back.out(1.6)' },
            0.15,
          )
          .from(
            '.hero-pop',
            { scale: 0, rotation: -30, opacity: 0, stagger: 0.12, duration: 0.6, ease: 'back.out(2.2)' },
            0.9,
          )
          .from('.hero-copy > *', { y: 30, opacity: 0, stagger: 0.08, duration: 0.7 }, 0.7)
          .from('.hero-meter', { y: 40, opacity: 0, duration: 0.8 }, 1);

        // Idle float, breathing glow, spinning stamp, bobbing stickers.
        gsap.to('.hero-float', { y: -18, rotation: 2, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        gsap.to('.hero-glow', { scale: 1.12, opacity: 0.85, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        gsap.to('.hero-spin', { rotation: 360, transformOrigin: '50% 50%', duration: 12, ease: 'none', repeat: -1 });
        gsap.to('.hero-bob', { y: -10, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.4 });

        // Scrolling away: pack lifts and tilts.
        gsap.to('.hero-pack-scroll', {
          yPercent: -18,
          rotation: 6,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        });

        // Mouse parallax tilt on the pack.
        const el = root.current;
        const pack = el.querySelector('.hero-tilt');
        gsap.set(pack, { transformPerspective: 900 });
        const rotY = gsap.quickTo(pack, 'rotationY', { duration: 0.6, ease: 'power3.out' });
        const rotX = gsap.quickTo(pack, 'rotationX', { duration: 0.6, ease: 'power3.out' });
        const moveX = gsap.quickTo(pack, 'x', { duration: 0.8, ease: 'power3.out' });
        const onMove = (e) => {
          const r = el.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          rotY(nx * 24);
          rotX(-ny * 14);
          moveX(nx * 30);
        };
        const onLeave = () => {
          rotY(0);
          rotX(0);
          moveX(0);
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

  // The hero is exactly one screen tall and sizes its contents off the screen height (see .hero-fit in
  // index.css). The top padding clears the transparent header <main> slides under (see App.jsx); the
  // bottom padding leaves room for the ticker ribbons that straddle the seam.
  return (
    <section
      id="top"
      ref={root}
      className={`hero-fit relative flex flex-col h-[100svh] min-h-[560px] overflow-hidden pt-[var(--hero-top)] pb-[var(--hero-bottom)] ${t(
        '',
        'bg-gradient-to-br from-[#ff6699] via-[#ec3b83] to-[#d82a75] text-white',
      )}`}
    >
      <h1 className="sr-only">Snack Loud. Live Bold. — Crunch Craft</h1>

      {/* Atmospheric glows */}
      {t(
        <>
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[580px] bg-primary-container/25 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/3 -right-24 w-[480px] h-[480px] bg-secondary-container/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-[360px] h-[360px] bg-tertiary/10 rounded-full blur-[100px] pointer-events-none" />
        </>,
        <>
          <div className="absolute inset-0 opacity-15 pointer-events-none dot-grid [background-size:28px_28px]" />
          <div className="absolute -top-24 right-10 w-[520px] h-[520px] bg-[#ffd633]/30 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-[420px] h-[420px] bg-[#6342c7]/25 rounded-full blur-[110px] pointer-events-none" />
        </>,
      )}

      {/* Top meta row */}
      <div className="absolute z-20 inset-x-0 top-[calc(var(--hero-top)-8px)] container-x flex flex-wrap items-center justify-end gap-space-sm pointer-events-none">
        <div
          className={`hero-rating hidden sm:inline-flex pointer-events-auto items-center gap-space-sm px-space-md py-1.5 rounded-full font-label text-label-sm ${t(
            'bg-surface-container-low text-on-surface-variant',
            'bg-white/95 shadow-md text-on-surface border border-pink-200',
          )}`}
        >
          <span className={`font-black ${t('text-secondary', 'text-[#f59e0b]')}`}>★ 4.98 RATING</span>
          <span className="opacity-30">|</span>
          <span className={t('', 'font-bold text-gray-700')}>14,200+ BAGS CRUNCHED THIS WEEK</span>
        </div>
      </div>

      {/* Stage: rolling type behind, pack in front */}
      <div className="relative flex-1 min-h-0 flex flex-col justify-center [perspective:1200px]">
        <div
          className={`absolute inset-0 flex flex-col justify-center gap-[1vw] font-display uppercase leading-[0.86] select-none pointer-events-none text-[length:var(--hero-type)] ${t(
            'font-extrabold tracking-[-0.04em]',
            'font-black tracking-[-0.02em]',
          )}`}
        >
          <div className="hero-row-wrap -rotate-3">
            <MarqueeRow />
          </div>
          <div className="hero-row-wrap -rotate-3 opacity-80">
            <MarqueeRow outline />
          </div>
          <div className="hero-row-wrap -rotate-3">
            <MarqueeRow />
          </div>
        </div>

        {/* Stamp sticker */}
        <div className="hero-pop hero-bob absolute z-30 left-space-md sm:left-[8%] lg:left-[18%] top-[8%]">
          <div
            className={`-rotate-6 px-space-md py-1.5 rounded-full font-label text-label-sm sm:text-label-lg uppercase font-black shadow-lg ${t(
              'bg-tertiary text-on-tertiary',
              'bg-[#fef08a] text-[#854d0e] border-2 border-[#facc15]',
            )}`}
          >
            ⚡ {truffle.db.label.replace(/\s+/g, '')} Audible Crunch
          </div>
        </div>

        <SpinBadge />

        {/* The pack */}
        <div className="hero-pack relative z-20 mx-auto">
          <div className="hero-pack-scroll">
            <div className="hero-float relative">
              <div
                className={`hero-glow absolute inset-[8%] rounded-full blur-3xl opacity-60 ${t(
                  'bg-gradient-to-tr from-primary-container/60 to-secondary-container/50',
                  'bg-white/70',
                )}`}
              />
              {/* The three packs stacked in one spot; the active one cross-fades in (see the rotation above). */}
              <div className="hero-tilt relative grid place-items-center">
                {heroPacks.map((p, i) => (
                  <img
                    key={p.id}
                    src={p.src}
                    alt={i === active ? p.alt : ''}
                    aria-hidden={i === active ? undefined : 'true'}
                    data-active={i === active ? 'true' : 'false'}
                    fetchpriority={i === active ? 'high' : undefined}
                    // Only opacity/transform animate: a transition on everything would also delay `visibility`,
                    // so when the scroll flight hides this pack it lingered for a moment beside the flying copy.
                    className={`[grid-area:1/1] h-[var(--hero-pack)] w-auto max-w-[72vw] object-contain transition-[opacity,transform] duration-700 ease-out ${t(
                      'drop-shadow-[0_40px_60px_rgba(0,0,0,0.85)]',
                      'drop-shadow-[0_32px_44px_rgba(110,10,50,0.5)]',
                    )} ${i === active ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="hero-pop hero-bob absolute z-30 bottom-[10%] left-space-md sm:left-[12%] lg:left-[24%]">
          <div
            className={`flex items-center gap-space-xs px-space-md py-space-xs rounded-full shadow-xl -rotate-[8deg] ${t(
              'bg-surface-container-highest/95 backdrop-blur-md text-secondary',
              'bg-white text-primary font-black border-2 border-pink-100',
            )}`}
          >
            <Icon name="local_fire_department" className={`text-[18px] ${t('', 'text-[#ff5722]')}`} />
            <span className="font-label text-label-sm font-bold uppercase">{truffle.badge}</span>
          </div>
        </div>

        <div className="hero-pop hero-bob absolute z-30 bottom-[18%] right-space-md sm:right-[10%] lg:right-[22%]">
          <div
            className={`rotate-6 px-space-md py-space-xs rounded-full font-label text-label-sm font-black shadow-2xl ${t(
              'bg-primary-container text-on-primary-container',
              'bg-secondary-container text-black border-2 border-yellow-100',
            )}`}
          >
            {formatPrice(truffle.price)} // Ultra Resealable
          </div>
        </div>
      </div>

      {/* Copy + CTAs */}
      <div className="hero-copy relative z-20 container-x flex flex-col items-center text-center gap-[var(--hero-gap)] pb-[var(--hero-gap)]">
        <p className={`hero-lede max-w-2xl text-[length:var(--hero-lede)] leading-[1.5] ${t('text-on-surface-variant', 'font-medium text-white/90')}`}>
          Triple-kettle roasted heirloom masa infused with artisanal fire. Engineered at atomic precision for{' '}
          {t('ungodly crispness.', 'ungodly, feel-good crispness.')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-space-md">
          <button
            type="button"
            onClick={() => addToCart(truffle.name, truffle.price)}
            className={`group px-space-lg sm:px-space-xl py-[var(--hero-btn-y)] rounded-full font-body text-label-lg uppercase tracking-wider font-extrabold flex items-center gap-space-xs transition-all duration-300 ${t(
              'bg-primary-container text-on-primary-container shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_32px_rgba(255,87,26,0.45)] hover:bg-primary hover:text-on-primary hover:scale-[1.03]',
              'bg-secondary-container text-black shadow-2xl border-2 border-yellow-200 hover:bg-white hover:scale-105',
            )}`}
          >
            <span>Grab the {shortFlavour} — {formatPrice(truffle.price)}</span>
            <Icon name="bolt" className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <a
            href="#arsenal"
            className={`px-space-lg py-[var(--hero-btn-y)] rounded-full font-body text-label-lg uppercase tracking-wider font-extrabold flex items-center gap-space-xs transition-all ${t(
              'bg-surface-container-highest text-on-surface hover:bg-on-surface hover:text-surface',
              'bg-white/20 backdrop-blur-md text-white border border-white/40 hover:bg-white hover:text-primary',
            )}`}
          >
            <span>Shop All Flavours</span>
            <Icon name="arrow_forward" className="text-[18px]" />
          </a>
        </div>
      </div>

      {/* Crunch meter */}
      <div className="container-x relative z-20">
        <div
          className={`hero-meter w-full py-[calc(var(--hero-gap)*0.6)] flex flex-col md:flex-row items-center justify-between gap-x-space-md gap-y-1 px-space-lg ${t(
            'bg-surface-container-low/70 backdrop-blur-xl rounded-[2rem] shadow-md',
            'bg-white/95 text-on-surface rounded-2xl shadow-xl border border-pink-200',
          )}`}
        >
          <div className="flex items-center gap-space-sm">
            <Icon name="graphic_eq" className={`text-[26px] ${t('text-primary-container', 'text-primary')}`} />
            <div className="flex flex-col">
              <span className="font-label text-label-sm uppercase text-on-surface font-extrabold tracking-wide">
                Acoustic Crunch Frequency
              </span>
              <span className="hero-meter-note text-body-sm text-on-surface-variant">Measured via dual condenser mic lab tests at 24°C</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 h-8" aria-hidden="true">
            {eqBars.map((b, i) => (
              <div
                key={i}
                className={`w-2 ${b.h} rounded-full origin-bottom animate-eq ${t(b.dark, b.light)}`}
                style={{ animationDelay: `${b.delay}ms` }}
              />
            ))}
            <span
              className={`ml-space-sm font-bold ${t(
                'font-label text-label-lg text-tertiary',
                'font-label text-headline-sm font-extrabold text-primary',
              )}`}
            >
              110.4 dB
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
