import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Icon from './Icon.jsx';
import SectionHeading from './SectionHeading.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { reviews } from '../data/content.js';

// Poses for the phone "hand of cards": the front card square-on, the ones behind fanned out to alternate sides
// and peeking over its top. Each pose pivots on the card's bottom edge, like cards held in a hand.
const SLOTS = [
  { x: 0, y: 0, xPercent: 0, rotation: 0, scale: 1 },
  { x: 10, y: -16, xPercent: 0, rotation: 4, scale: 0.95 },
  { x: -10, y: -16, xPercent: 0, rotation: -4, scale: 0.95 },
  { x: 0, y: -30, xPercent: 0, rotation: 0, scale: 0.9 },
];
const slot = (k) => SLOTS[Math.min(k, SLOTS.length - 1)];
const SHUFFLE_EVERY = 3800; // ms between automatic shuffles

export default function Reviews() {
  const { isDark, t } = useTheme();
  const root = useRef(null);
  const [front, setFront] = useState(0);

  // Phone only: the deck shuffles itself. The front card flicks off to the side, the cards behind step forward,
  // and it slides back in at the rear of the hand. Tap or swipe the front card to shuffle yourself.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ mobile: '(max-width: 767px)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
        if (!ctx.conditions.mobile) return undefined;
        const { reduce } = ctx.conditions;
        const deck = root.current.querySelector('.deck');
        const cards = gsap.utils.toArray('.deck-card', deck);
        const n = cards.length;
        let order = cards.map((_, i) => i); // order[0] is the card in front
        let busy = false;

        const stack = () => order.forEach((ci, k) => gsap.set(cards[ci], { zIndex: n - k }));
        gsap.set(cards, { transformOrigin: '50% 100%' });
        order.forEach((ci, k) => gsap.set(cards[ci], slot(k)));
        stack();

        const shuffle = (dir = -1) => {
          if (busy) return;
          busy = true;
          const top = cards[order[0]];
          const rest = order.slice(1);
          const tl = gsap.timeline({ onComplete: () => (busy = false) });
          if (reduce) {
            // No flying around: just bring the next card to the front.
            order = [...rest, order[0]];
            stack();
            order.forEach((ci, k) => gsap.set(cards[ci], slot(k)));
            setFront(order[0]);
            busy = false;
            return;
          }
          tl.to(top, { xPercent: dir * 118, y: 24, rotation: dir * 22, duration: 0.45, ease: 'power2.in' })
            // The cards behind step forward while the top one is leaving.
            .add(
              rest.map((ci, k) => gsap.to(cards[ci], { ...slot(k), duration: 0.55, ease: 'back.out(1.5)' })),
              0.15,
            )
            .add(() => {
              order = [...rest, order[0]];
              stack(); // it's off to the side now, so dropping it to the back of the pile is invisible
              setFront(order[0]);
            })
            .to(top, { ...slot(n - 1), duration: 0.6, ease: 'power3.out' });
        };

        // Autoplay, paused while the deck is off screen, the tab is hidden, or just after the reader touched it.
        let visible = false;
        let holdUntil = 0;
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.4 });
        io.observe(deck);
        const timer = reduce
          ? null
          : setInterval(() => {
              if (visible && !document.hidden && Date.now() > holdUntil) shuffle(-1);
            }, SHUFFLE_EVERY);

        // Tap the deck to shuffle; swipe left or right to flick the top card that way.
        let startX = null;
        const onDown = (e) => {
          startX = e.clientX;
          holdUntil = Date.now() + 6000;
        };
        const onUp = (e) => {
          if (startX === null) return;
          const dx = e.clientX - startX;
          startX = null;
          shuffle(dx > 30 ? 1 : -1);
        };
        deck.addEventListener('pointerdown', onDown);
        deck.addEventListener('pointerup', onUp);

        return () => {
          clearInterval(timer);
          io.disconnect();
          deck.removeEventListener('pointerdown', onDown);
          deck.removeEventListener('pointerup', onUp);
          gsap.killTweensOf(cards);
          gsap.set(cards, { clearProps: 'all' });
        };
      });
    },
    { scope: root },
  );

  const card = (r, extra = '') => {
    const s = isDark ? r.dark : r.light;
    return (
      <figure
        key={r.name}
        className={`p-space-lg flex flex-col justify-between gap-space-md relative overflow-hidden ${extra} ${t(
          'rounded-[2rem] bg-surface-container-high shadow-lg ring-1 ring-inset ring-white/10',
          `rounded-2xl bg-white shadow-lg border-2 ${s.border}`,
        )}`}
      >
        <div className="flex items-center justify-between">
          <div className={`flex ${t('text-secondary', 'text-[#f59e0b]')}`} aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }, (_, i) => (
              <Icon key={i} name="star" filled className="text-[20px]" />
            ))}
          </div>
          <span className={`px-space-sm py-0.5 rounded-full font-label text-label-sm font-bold uppercase ${s.badge}`}>
            {r.badge}
          </span>
        </div>
        <blockquote className={`text-on-surface italic ${t('text-body-lg', 'text-body-md leading-relaxed')}`}>
          “{r.quote}”
        </blockquote>
        <figcaption className="flex items-center justify-between pt-space-xs">
          <div className="flex flex-col">
            <span className="font-label text-label-lg font-bold text-on-surface uppercase">{r.name}</span>
            <span className="text-body-sm text-on-surface-variant">{r.meta}</span>
          </div>
          <Icon name="verified" className={t('text-primary-container', s.icon)} />
        </figcaption>
      </figure>
    );
  };

  return (
    <section id="reviews" ref={root} className="w-full overflow-hidden bg-surface py-space-xl lg:py-24 container-x">
      <div className="flex flex-col gap-space-lg max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <SectionHeading
            eyebrow="Verified Sensory Testimony"
            eyebrowClass={t('text-primary', 'text-primary font-black')}
            title="Crunch Verdicts"
          />
          <div
            className={`font-label text-label-sm sm:text-label-lg font-bold w-fit ${t(
              'text-secondary',
              'text-[#b45309] bg-amber-50 px-4 py-2 rounded-full border border-amber-200 font-black',
            )}`}
          >
            ★★★★★ 4.98 / 5.0 RATING OVER 12,400+ VERIFIED SNACKERS
          </div>
        </div>

        {/* Phone: a fanned hand of cards that shuffles itself (see above). The top padding leaves room for the
            cards behind to peek over the front one. */}
        <div className="md:hidden flex flex-col items-center gap-space-md">
          <div
            className="deck grid w-full pt-10 px-5 touch-pan-y select-none cursor-pointer"
            role="group"
            aria-roledescription="card stack"
            aria-label="Customer reviews — tap or swipe to shuffle"
          >
            {reviews.map((r) => card(r, 'deck-card [grid-area:1/1] will-change-transform'))}
          </div>
          <div className="flex items-center gap-2" aria-hidden="true">
            {reviews.map((r, i) => (
              <span
                key={r.name}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === front ? `w-6 ${t('bg-primary-container', 'bg-primary')}` : `w-1.5 ${t('bg-white/25', 'bg-black/15')}`
                }`}
              />
            ))}
          </div>
          <p className="font-label text-label-sm uppercase text-on-surface-variant/70">Tap or swipe to shuffle</p>
        </div>

        {/* Tablet and desktop: the grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-gutter pt-space-sm">
          {reviews.map((r) => card(r, 'md:last:col-span-2 lg:last:col-span-1 transition-transform hover:-translate-y-1'))}
        </div>
      </div>
    </section>
  );
}
