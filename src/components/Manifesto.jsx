import Icon from './Icon.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { stats } from '../data/content.js';

export default function Manifesto() {
  const { t } = useTheme();

  return (
    <section id="story" className="w-full container-x py-space-xl lg:py-24 bg-surface">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter gap-y-space-xl items-center max-w-7xl mx-auto">
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          <span
            className={`font-label text-label-sm uppercase tracking-widest font-bold w-fit ${t(
              'text-secondary',
              'text-secondary-container bg-amber-50 px-3 py-1 rounded-full border border-amber-200 font-black',
            )}`}
          >
            Craft Manifesto // 001
          </span>
          <h2
            className={`font-display uppercase text-on-surface tracking-tight leading-none ${t(
              'text-headline-xl-mobile sm:text-headline-xl font-extrabold',
              'text-display-mobile lg:text-display-xl font-black',
            )}`}
          >
            Boring Snacks
            <br />
            <span className={t('text-primary-container', 'text-primary')}>Are Dead.</span>
          </h2>
          <p className={`max-w-xl text-on-surface-variant ${t('text-body-xl', 'text-[18px] leading-7')}`}>
            We spent 18 straight months inside culinary labs and underground night markets rejecting cardboard chips
            drowned in artificial powder. Crunch Craft was founded on a simple decree: taste must be unapologetic, crunch
            must be violent.
          </p>

          <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-space-sm sm:gap-space-md pt-space-md">
            {stats.map((s) => (
              <div
                key={s.value}
                className={`flex items-center gap-space-md min-[480px]:flex-col min-[480px]:items-start min-[480px]:gap-1 p-space-md ${t(
                  'rounded bg-surface-container-low',
                  'rounded-2xl bg-white shadow-md border border-purple-100',
                )}`}
              >
                <span
                  className={`font-display whitespace-nowrap shrink-0 min-w-[4.5ch] text-headline-lg-mobile md:text-headline-lg lg:text-headline-md xl:text-headline-lg font-extrabold ${t(s.dark, s.light)}`}
                >
                  {s.value}
                </span>
                <span className="text-body-sm text-on-surface-variant">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <figure
          className={`lg:col-span-5 relative p-space-lg sm:p-space-xl flex flex-col justify-between gap-space-lg ${t(
            'rounded-[2rem] lg:rounded-xl bg-gradient-to-br from-surface-container-high to-surface-container shadow-2xl ring-1 ring-inset ring-white/10',
            'rounded-2xl bg-gradient-to-br from-[#ffd8e4] to-[#f4eaff] shadow-xl border-2 border-pink-200',
          )}`}
        >
          <Icon name="format_quote" className={`text-[64px] opacity-40 ${t('text-primary-container', 'text-primary')}`} />
          <blockquote className="font-heading text-headline-sm text-on-surface font-extrabold leading-snug">
            “Most brands optimize for shelf life. We optimized for the primal adrenaline rush of your first mouthful.”
          </blockquote>
          <figcaption className="flex items-center gap-space-md pt-space-sm">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-label font-extrabold ${t(
                'bg-primary-container text-on-primary-container',
                'bg-primary text-white shadow-md',
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
    </section>
  );
}
