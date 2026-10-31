import Icon from './Icon.jsx';
import SectionHeading from './SectionHeading.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { ingredients } from '../data/content.js';

export default function Provenance() {
  const { isDark, t } = useTheme();

  return (
    <section id="ingredients" className={`w-full py-space-xl lg:py-24 container-x ${t('bg-surface-container-low', 'bg-[#f9f0ff]')}`}>
      <div className="flex flex-col gap-space-lg max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-space-sm">
          <SectionHeading
            center
            eyebrow="Radical Transparency"
            eyebrowClass={t('text-tertiary', 'text-tertiary font-black')}
            title="Pure Botanical Provenance"
          />
          <p className="text-body-lg text-on-surface-variant max-w-2xl text-center">
            Zero mysteries. Zero lab-created flavoring chemicals. Only pure raw elements sourced from hyper-specific
            geographic microclimates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter pt-space-md">
          {ingredients.map((ing) => {
            const s = isDark ? ing.dark : ing.light;
            return (
              <article
                key={ing.name}
                className={`p-space-lg flex flex-col gap-space-md transition-all hover:-translate-y-1 ${t(
                  'rounded-[2rem] bg-surface-container shadow-md hover:bg-surface-container-high ring-1 ring-inset ring-white/5',
                  `rounded-2xl bg-white shadow-md hover:shadow-xl border-2 ${s.border}`,
                )}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${s.iconWrap}`}>
                  <Icon name={ing.icon} className="text-[28px]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`font-label text-label-sm uppercase font-bold ${s.origin}`}>{ing.origin}</span>
                  <h3 className="font-heading text-headline-sm text-on-surface font-extrabold uppercase">{ing.name}</h3>
                </div>
                <p className="text-body-sm text-on-surface-variant">{ing.desc}</p>
                <span className={`mt-auto font-label text-label-sm uppercase font-bold ${s.cert}`}>{ing.cert}</span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
