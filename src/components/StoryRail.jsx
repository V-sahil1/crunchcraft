import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CHAPTERS = [
  { id: 'top', label: 'The Drop' },
  { id: 'arsenal', label: 'The Arsenal' },
  { id: 'flavor-lab', label: 'Flavour Lab' },
  { id: 'story', label: 'Our Story' },
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'reviews', label: 'The Crew' },
  { id: 'gallery', label: 'The Feed' },
];

const pad = (n) => String(n + 1).padStart(2, '0');

// Fixed chapter rail: page progress fills the line, the current chapter lights up.
export default function StoryRail() {
  const [active, setActive] = useState(0);
  const fill = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      fill.current,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
      },
    );
  });

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(CHAPTERS.findIndex((c) => c.id === e.target.id));
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    CHAPTERS.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Story chapters"
      className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 text-white mix-blend-difference"
    >
      <div className="relative flex flex-col justify-between h-[52vh] max-h-[460px]">
        <span aria-hidden="true" className="absolute right-[5px] top-0 bottom-0 w-px bg-white/30" />
        <span
          ref={fill}
          aria-hidden="true"
          className="absolute right-[5px] top-0 bottom-0 w-px bg-white origin-top"
        />
        {CHAPTERS.map((c, i) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            aria-current={i === active ? 'step' : undefined}
            className="group relative flex items-center justify-end gap-3 font-label text-label-sm uppercase"
          >
            <span
              className={`whitespace-nowrap transition-all duration-300 ${
                i === active ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-70 group-hover:translate-x-0'
              }`}
            >
              {pad(i)} · {c.label}
            </span>
            <span
              className={`relative w-[11px] h-[11px] rounded-full border border-white transition-all duration-300 ${
                i === active ? 'bg-white scale-125' : 'bg-black group-hover:bg-white/60'
              }`}
            />
          </a>
        ))}
      </div>
    </nav>
  );
}
