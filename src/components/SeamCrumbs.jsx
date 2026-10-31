import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const S = '/images/slides';

// Ingredient cut-outs that drift across a section boundary at different scroll speeds,
// so one chapter visibly spills into the next.
export const SEAMS = {
  chili: [
    { src: `${S}/chili/piece-6.webp`, left: '4%', size: 150, rot: -24, speed: 1.4 },
    { src: `${S}/chili/piece-3.webp`, left: '78%', size: 190, rot: 18, speed: 0.8 },
    { src: `${S}/chili/piece-8.webp`, left: '90%', size: 80, rot: -8, speed: 1.9 },
  ],
  jalapeno: [
    { src: `${S}/jalapeno/piece-13.webp`, left: '86%', size: 130, rot: 22, speed: 1.6 },
    { src: `${S}/jalapeno/piece-7.webp`, left: '6%', size: 170, rot: -16, speed: 1 },
    { src: `${S}/jalapeno/piece-9.webp`, left: '20%', size: 110, rot: 30, speed: 2 },
  ],
  truffle: [
    { src: `${S}/truffle/piece-9.webp`, left: '8%', size: 140, rot: 12, speed: 1.5 },
    { src: `${S}/truffle/piece-2.webp`, left: '82%', size: 180, rot: -20, speed: 0.9 },
    { src: `${S}/truffle/piece-13.webp`, left: '68%', size: 90, rot: 28, speed: 2.1 },
  ],
  mix: [
    { src: `${S}/jalapeno/piece-3.webp`, left: '3%', size: 160, rot: -14, speed: 1.2 },
    { src: `${S}/chili/piece-7.webp`, left: '84%', size: 150, rot: 26, speed: 1.7 },
    { src: `${S}/truffle/piece-11.webp`, left: '56%', size: 90, rot: -30, speed: 2.2 },
  ],
};

export default function SeamCrumbs({ items }) {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('.seam-crumb').forEach((el) => {
          const speed = Number(el.dataset.speed);
          const rot = Number(el.dataset.rot);
          gsap.fromTo(
            el,
            { yPercent: 90 * speed, rotation: rot - 40 * speed },
            {
              yPercent: -90 * speed,
              rotation: rot + 40 * speed,
              ease: 'none',
              scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden="true" className="relative z-30 h-0 pointer-events-none">
      {items.map((c) => (
        <img
          key={c.src}
          src={c.src}
          alt=""
          loading="lazy"
          data-speed={c.speed}
          data-rot={c.rot}
          // On phones the content column spans the screen, so only edge pieces stay (and smaller) to keep text and buttons clear.
          className={`seam-crumb absolute top-0 drop-shadow-[0_18px_24px_rgba(0,0,0,0.35)] w-[calc(var(--s)*0.45)] sm:w-[calc(var(--s)*0.7)] lg:w-[var(--s)] ${
            parseFloat(c.left) > 12 && parseFloat(c.left) < 80
              ? 'hidden md:block'
              : parseFloat(c.left) <= 12
                ? 'max-md:-ml-12'
                : 'max-md:ml-8'
          }`}
          style={{ left: c.left, marginTop: -c.size / 2, '--s': `${c.size}px`, transform: `rotate(${c.rot}deg)` }}
        />
      ))}
    </div>
  );
}
