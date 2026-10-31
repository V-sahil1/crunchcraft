import Icon from './Icon.jsx';
import SectionHeading from './SectionHeading.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { gallery } from '../data/content.js';

export default function Gallery() {
  const { t } = useTheme();

  return (
    <section id="gallery" className={`w-full py-space-xl lg:py-24 container-x ${t('bg-surface-container-lowest', 'bg-[#f4eaff]')}`}>
      <div className="flex flex-col gap-space-lg max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <SectionHeading
            eyebrow="Digital Underground"
            eyebrowClass={t('text-tertiary', 'text-tertiary font-black')}
            title="#CrunchCraft In The Wild"
          />
          <a
            href="#top"
            className={`px-space-lg py-2.5 rounded-full font-label text-label-sm uppercase tracking-wider font-bold transition-all flex items-center gap-space-xs w-fit ${t(
              'bg-surface-container-high text-on-surface hover:bg-surface-bright',
              'bg-primary text-white hover:bg-[#8e0047] shadow-md font-black',
            )}`}
          >
            <span>Join 140K+ Snack Rebels</span>
            <Icon name="arrow_outward" className="text-[16px]" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md pt-space-xs">
          {gallery.map((g) => (
            <figure
              key={g.handle}
              className={`relative group overflow-hidden aspect-square bg-surface-container shadow-md ${t(
                'rounded-[2rem]',
                'rounded-2xl border-2 border-white',
              )}`}
            >
              <img
                src={g.img}
                alt={g.alt}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <figcaption
                className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex items-end p-space-md ${t(
                  'from-surface-container-lowest',
                  'from-black/80',
                )}`}
              >
                <span className={`font-label text-label-sm font-bold ${t(g.dark, g.light)}`}>{g.handle}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
