import Icon from './Icon.jsx';
import SectionHeading from './SectionHeading.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { reviews } from '../data/content.js';

export default function Reviews() {
  const { isDark, t } = useTheme();

  return (
    <section id="reviews" className="w-full bg-surface py-space-xl lg:py-24 container-x">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter pt-space-sm">
          {reviews.map((r) => {
            const s = isDark ? r.dark : r.light;
            return (
              <figure
                key={r.name}
                className={`p-space-lg flex flex-col justify-between gap-space-md relative overflow-hidden md:last:col-span-2 lg:last:col-span-1 transition-transform hover:-translate-y-1 ${t(
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
          })}
        </div>
      </div>
    </section>
  );
}
