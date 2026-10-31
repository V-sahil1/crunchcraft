import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Icon from './Icon.jsx';

// three.js is heavy; load the stage in its own chunk.
const ProductStage3D = lazy(() => import('./ProductStage3D.jsx'));
import { useCart } from '../context/CartContext.jsx';
import { flavors, formatPrice } from '../data/content.js';
import slideScenes from '../data/slideScenes.json';
import { PACK_FRACTION } from '../data/stage.js';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const AUTOPLAY_SECONDS = 6;
const SCENES = flavors.map((f) => slideScenes[f.id]);
// The hero pack flies down into this slide, so the slider opens on it.
const HERO_SLIDE = flavors.findIndex((fl) => fl.id === 'truffle');
const pad = (n) => String(n + 1).padStart(2, '0');
const lerp = (a, b, p) => a + (b - a) * p;

export default function Arsenal() {
  const { addToCart } = useCart();
  const [index, setIndex] = useState(HERO_SLIDE);
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [userPaused, setUserPaused] = useState(reduceMotion);
  // false while the hero pack is still in flight; the 3D stage stays empty and autoplay waits.
  const [landed, setLanded] = useState(reduceMotion);
  const root = useRef(null);
  const stageCol = useRef(null);
  const flyer = useRef(null);
  const timer = useRef(null);
  const hovering = useRef(false);
  const userPausedRef = useRef(userPaused);
  const landedRef = useRef(landed);
  // true once the current pack has flown on down into the Flavour Lab.
  const [departed, setDeparted] = useState(false);
  const departedRef = useRef(departed);
  const flyer2 = useRef(null);
  const indexRef = useRef(index);
  const f = flavors[index];

  // Which way the last change went (1 = next / right arrow, -1 = previous / left arrow); packs slide in from that side.
  const [direction, setDirection] = useState(1);
  const go = useCallback((dir) => {
    setDirection(dir);
    setIndex((i) => (i + dir + flavors.length) % flavors.length);
  }, []);
  const jump = (i) => {
    if (i === index) return;
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  // Per slide: animate the copy in and run the autoplay progress bar, which advances on completion.
  useGSAP(
    () => {
      gsap.from('.slide-copy > *', { x: 60 * direction, opacity: 0, stagger: 0.08, duration: 0.7, ease: 'power3.out' });
      timer.current = gsap.fromTo(
        '.slide-progress-active',
        { scaleX: 0 },
        { scaleX: 1, duration: AUTOPLAY_SECONDS, ease: 'none', transformOrigin: 'left center', onComplete: () => go(1) },
      );
      if (userPausedRef.current || hovering.current || !landedRef.current || departedRef.current) timer.current.pause();
    },
    { scope: root, dependencies: [index], revertOnUpdate: true },
  );

  const syncTimer = () => {
    if (!timer.current) return;
    if (hovering.current || userPausedRef.current || !landedRef.current || departedRef.current) timer.current.pause();
    else timer.current.resume();
  };

  // Keep the Flavour Lab on the same flavour as the slider, so the pack that flies down matches.
  useEffect(() => {
    indexRef.current = index;
    window.dispatchEvent(new CustomEvent('cc:flavour', { detail: index }));
  }, [index]);

  useEffect(() => {
    departedRef.current = departed;
    syncTimer();
  }, [departed]);

  useEffect(() => {
    userPausedRef.current = userPaused;
    syncTimer();
  }, [userPaused]);

  useEffect(() => {
    landedRef.current = landed;
    syncTimer();
  }, [landed]);

  // A flight runs between two fixed screen spots: where the source pack sits on screen when the flight
  // starts, and where the target pack will sit when it ends. Both are on screen, so the pack never gets
  // carried off with the section it is leaving. A smoothed proxy makes it glide after the scrollbar.
  const stagePackRect = (aspect) => {
    const box = stageCol.current.firstElementChild.getBoundingClientRect();
    const h = box.height * PACK_FRACTION;
    const w = h * aspect;
    return { left: box.left + (box.width - w) / 2, top: box.top + (box.height - h) / 2, width: w, height: h };
  };
  const placeFlyer = (plane, from, to, p, endRotation, st) => {
    const sy = window.scrollY;
    const e = gsap.parseEase('power1.inOut')(p);
    gsap.set(plane, {
      x: lerp(from.left, to.left, e),
      // Live rects → page positions → screen positions at the flight's start / end scroll.
      y: lerp(from.top + sy - st.start, to.top + sy - st.end, e),
      width: lerp(from.width, to.width, e),
      height: lerp(from.height, to.height, e),
      rotation: lerp(0, endRotation, e) + Math.sin(p * Math.PI) * -10,
      scale: 1 + Math.sin(p * Math.PI) * 0.1,
    });
  };
  const scrubFlight = (scrollTrigger, render) => {
    const proxy = { p: 0 };
    render(0);
    const tween = gsap.to(proxy, {
      p: 1,
      ease: 'none',
      scrollTrigger: { ...scrollTrigger, scrub: 0.8 },
      onUpdate: () => render(proxy.p, tween.scrollTrigger),
    });
    return tween;
  };

  // First flight: the hero pack travels from the hero down into the slider stage,
  // then hands over to the 3D scene, which bursts its ingredients out around it.
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const heroPack = document.querySelector('#top .hero-tilt');
      const plane = flyer.current;
      if (!heroPack || !plane) {
        setLanded(true);
        return undefined;
      }
      const aspect = SCENES[HERO_SLIDE].packAspect;
      const setLand = (on) => {
        if (landedRef.current === on) return;
        landedRef.current = on;
        if (!on) setIndex(HERO_SLIDE);
        setLanded(on);
      };

      scrubFlight({ trigger: '#top', start: 'top top', endTrigger: root.current, end: 'top top' }, (p, st) => {
        const flying = p > 0.001 && p < 0.999;
        heroPack.style.visibility = p > 0.001 ? 'hidden' : '';
        plane.style.visibility = flying ? 'visible' : 'hidden';
        setLand(p >= 0.999);
        if (flying) placeFlyer(plane, heroPack.getBoundingClientRect(), stagePackRect(aspect), p, 0, st);
      });

      return () => {
        heroPack.style.visibility = '';
        plane.style.visibility = 'hidden';
        setLand(true);
      };
    });
  });

  // Second flight: whichever pack the slider is showing travels on down into the Flavour Lab.
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const lab = document.getElementById('flavor-lab');
      const plane = flyer2.current;
      if (!lab || !plane) return undefined;
      const labPacks = () => lab.querySelectorAll('.lab-pack');
      const setDepart = (on) => {
        if (departedRef.current === on) return;
        departedRef.current = on;
        setDeparted(on);
      };

      // Lab pack's untransformed box: centred in its column, height from CSS, width from the pack's aspect.
      const labPackRect = (id, aspect) => {
        const target = lab.querySelector(`.lab-pack[data-id="${id}"]`);
        const col = target.parentElement.getBoundingClientRect();
        let h = target.offsetHeight;
        let w = h * aspect;
        if (w > col.width * 0.8) {
          w = col.width * 0.8;
          h = w / aspect;
        }
        return { left: col.left + (col.width - w) / 2, top: col.top + (col.height - h) / 2, width: w, height: h };
      };

      scrubFlight({ trigger: lab, start: 'top 85%', end: 'top top' }, (p, st) => {
        const flying = p > 0.001 && p < 0.999;
        setDepart(p > 0.001);
        labPacks().forEach((el) => {
          el.style.visibility = p >= 0.999 ? '' : 'hidden';
        });
        plane.style.visibility = flying ? 'visible' : 'hidden';
        if (!flying) return;

        const i = indexRef.current;
        const scene = SCENES[i];
        window.dispatchEvent(new CustomEvent('cc:flavour', { detail: i }));
        if (plane.dataset.src !== scene.pack) {
          plane.dataset.src = scene.pack;
          plane.src = scene.pack;
        }
        placeFlyer(plane, stagePackRect(scene.packAspect), labPackRect(flavors[i].id, scene.packAspect), p, -4, st);
      });

      return () => {
        labPacks().forEach((el) => (el.style.visibility = ''));
        plane.style.visibility = 'hidden';
        setDepart(false);
      };
    });
  });

  // As the slider scrolls in it grows from a rounded card into the full-bleed scene.
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        root.current,
        { clipPath: 'inset(5% 4% 0% 4% round 56px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 15%', scrub: true },
        },
      );
    });
  });

  const pauseForHover = (on) => {
    hovering.current = on;
    syncTimer();
  };

  return (
    <section id="arsenal" className="relative w-full bg-surface">
      {/* The hero pack while it is travelling down into the slider (see flight above). */}
      <img
        ref={flyer}
        src={SCENES[HERO_SLIDE].pack}
        alt=""
        aria-hidden="true"
        className="fixed top-0 left-0 z-40 pointer-events-none drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)] will-change-transform"
        style={{ visibility: 'hidden' }}
      />
      {/* The current slider pack while it travels on down into the Flavour Lab. */}
      <img
        ref={flyer2}
        src={SCENES[HERO_SLIDE].pack}
        alt=""
        aria-hidden="true"
        className="fixed top-0 left-0 z-40 pointer-events-none drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)] will-change-transform"
        style={{ visibility: 'hidden' }}
      />
      <div
        ref={root}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured flavours"
        tabIndex={0}
        onMouseEnter={() => pauseForHover(true)}
        onMouseLeave={() => pauseForHover(false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1);
          if (e.key === 'ArrowLeft') go(-1);
        }}
        className="relative w-full min-h-[100svh] flex flex-col overflow-hidden text-white outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-secondary-container"
      >
        {/* Cross-fading flavour backgrounds */}
        {flavors.map((fl, i) => (
          <div
            key={fl.id}
            aria-hidden="true"
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${fl.slide.bg} ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div aria-hidden="true" className="absolute inset-0 opacity-10 dot-grid [background-size:26px_26px]" />
        <div
          aria-hidden="true"
          className="absolute -left-40 top-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-white/10 blur-[110px]"
        />

        {/* Chapter heading lives inside the scene so the page flows straight from the hero into the slider. */}
        <div className="relative container-x pt-28 lg:pt-32 flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
          <div className="flex flex-col gap-space-xs">
            <span className="flex items-center gap-2 font-label text-label-sm uppercase text-white/80">
              <Icon name="stars" className="text-[16px]" />
              Chapter 02 · Curated Repertoire
            </span>
            <h2 className="font-heading font-extrabold uppercase tracking-tight text-headline-xl-mobile sm:text-headline-xl">
              The Arsenal
            </h2>
          </div>
          <p className="text-body-lg text-white/80 max-w-md">
            Engineered for unreasonable crunch. Small-batch kettle-popped crisp sheets dressed in wild botanical heat.
          </p>
        </div>

        <div className="relative flex-1 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] items-center gap-space-md lg:gap-space-xl container-x">
          {/* Copy */}
          <div
            key={f.id}
            aria-live="polite"
            className="slide-copy order-2 lg:order-1 flex flex-col items-start gap-space-md pb-space-md"
          >
            <span className="px-4 py-1.5 rounded-full bg-white/20 ring-1 ring-inset ring-white/30 backdrop-blur-md font-body text-[13px] font-bold uppercase tracking-wide">
              {f.slide.tag} · {f.drop.split('//')[1].trim()}
            </span>
            <h3 className="font-display uppercase leading-[0.95] tracking-tight text-[2.25rem] sm:text-[3rem] lg:text-[3.5rem] drop-shadow-[0_4px_18px_rgba(0,0,0,0.25)]">
              {f.name}
            </h3>
            <p className="max-w-md text-white/85 text-body-lg">{f.slide.blurb}</p>

            <div className="flex items-center gap-space-sm font-label text-label-sm uppercase text-white/80">
              <span>{f.meterLabel}</span>
              <div className="flex gap-1" aria-label={`${f.meterLabel} ${f.meter} of 5`} role="img">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`w-5 h-2 rounded-full ${i < f.meter ? 'bg-white' : 'bg-white/25'}`} />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-space-lg pt-space-xs">
              <button
                type="button"
                onClick={() => addToCart(f.name, f.price)}
                className="group flex items-center gap-2 pl-7 pr-6 py-3.5 rounded-full bg-white text-[#1b110c] font-body text-[15px] font-extrabold uppercase tracking-wide shadow-[0_10px_30px_-6px_rgba(0,0,0,0.45)] hover:scale-105 active:scale-95 transition-transform"
              >
                Buy Now
                <Icon name="arrow_forward" className="text-[20px] transition-transform group-hover:translate-x-1" />
              </button>
              <span className="font-label text-price-mobile sm:text-price tracking-tight">{formatPrice(f.price)}</span>
            </div>
          </div>

          {/* WebGL stage; oversized so floating pieces can drift past the column edges */}
          <div ref={stageCol} className="order-1 lg:order-2 relative flex items-center justify-center">
            <Suspense
              fallback={
                <div className="relative shrink-0 w-[118%] max-w-[min(118%,94svh)] aspect-square flex items-center justify-center">
                  <img src={SCENES[index].pack} alt={`${f.name} pouch`} style={{ height: `${PACK_FRACTION * 100}%` }} className={`w-auto object-contain drop-shadow-2xl ${landed && !departed ? '' : 'invisible'}`} />
                </div>
              }
            >
              <ProductStage3D
                scenes={SCENES}
                index={index}
                direction={direction}
                hold={!landed || departed}
                alt={`${f.name} pouch surrounded by floating ingredients`}
                className="stage-fade relative shrink-0 w-[118%] max-w-[min(118%,94svh)] -my-[6%] aspect-square"
              />
            </Suspense>
          </div>
        </div>

        {/* Controls */}
        <div className="relative flex flex-wrap items-center justify-between gap-space-md container-x pb-space-lg lg:pb-space-xl pt-space-sm">
          <div className="flex items-center gap-space-sm" role="tablist" aria-label="Choose flavour">
            {flavors.map((fl, i) => (
              <button
                key={fl.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={fl.name}
                onClick={() => jump(i)}
                className="group flex items-center gap-2 py-3 -my-3 font-label text-label-sm text-white/70 hover:text-white"
              >
                <span className={i === index ? 'text-white' : ''}>{pad(i)}</span>
                <span
                  className={`relative h-1.5 rounded-full bg-white/25 overflow-hidden transition-all duration-500 ${
                    i === index ? 'w-16 sm:w-24' : 'w-6 group-hover:w-10'
                  }`}
                >
                  {i === index && <span className="slide-progress-active absolute inset-0 bg-white rounded-full" />}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
              className="w-11 h-11 rounded-full bg-black/15 ring-1 ring-inset ring-white/30 flex items-center justify-center hover:bg-white hover:text-[#1b110c] transition-colors"
            >
              <Icon name={userPaused ? 'play_arrow' : 'pause'} className="text-[20px]" />
            </button>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous flavour"
              className="w-12 h-12 rounded-full bg-black/15 ring-1 ring-inset ring-white/30 flex items-center justify-center hover:bg-white hover:text-[#1b110c] hover:-translate-x-0.5 transition-all"
            >
              <Icon name="arrow_back" className="text-[22px]" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next flavour"
              className="w-12 h-12 rounded-full bg-white text-[#1b110c] flex items-center justify-center shadow-lg hover:scale-105 hover:translate-x-0.5 transition-all"
            >
              <Icon name="arrow_forward" className="text-[22px]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
