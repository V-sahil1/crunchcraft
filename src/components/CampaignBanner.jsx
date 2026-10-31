import Icon from './Icon.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { crate, flavors, formatPrice } from '../data/content.js';

export default function CampaignBanner() {
  const { t } = useTheme();
  const { addToCart } = useCart();
  const [chili, jalapeno, truffle] = flavors;

  return (
    <section className="w-full container-x py-space-xl lg:py-24">
      <div
        className={`relative w-full p-space-lg lg:p-space-xl overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-space-xl ${t(
          'rounded-[2rem] lg:rounded-xl bg-gradient-to-r from-primary-container via-surface-container-high to-surface-container-lowest',
          'rounded-3xl bg-gradient-to-r from-[#ff8800] via-[#ffae00] to-[#ffd233] border-4 border-[#ff7700]',
        )}`}
      >
        {t(
          <div className="absolute -top-24 left-1/4 w-80 h-80 bg-secondary-container/30 rounded-full blur-3xl pointer-events-none" />,
          <div className="absolute inset-0 opacity-15 pointer-events-none dot-grid [background-size:24px_24px]" />,
        )}

        <div className={`relative z-10 flex flex-col gap-space-md max-w-xl ${t('', 'text-black')}`}>
          <span
            className={`px-space-md py-1.5 rounded-full w-fit font-label text-label-sm font-bold uppercase ${t(
              'bg-surface-container-lowest/80 text-secondary',
              'bg-white text-[#9a3412] font-black shadow-sm',
            )}`}
          >
            The Complete Assortment
          </span>
          <h2
            className={`font-display uppercase tracking-tight leading-none ${t(
              'text-headline-xl-mobile sm:text-headline-xl font-extrabold text-on-surface',
              'text-display-mobile lg:text-display-xl font-black text-black',
            )}`}
          >
            Make Every
            <br />
            Bite Count.
          </h2>
          <p className={`text-body-lg ${t('text-on-surface-variant', 'text-black/90 font-medium')}`}>
            Build your custom 12-pack crate. Mix all three high-voltage flavors. Includes carbon-neutral priority shipping
            and limited edition laboratory sticker sheet.
          </p>
          <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
            <button
              type="button"
              onClick={() => addToCart(crate.name, crate.price)}
              className={`px-space-lg sm:px-space-xl py-space-md rounded-full font-body text-label-lg uppercase font-extrabold tracking-wider transition-all shadow-xl flex items-center gap-space-xs hover:scale-105 active:scale-95 ${t(
                'bg-on-surface text-surface hover:bg-primary-container hover:text-on-primary-container',
                'bg-black text-white hover:bg-white hover:text-black',
              )}`}
            >
              <span>Build Your Crate — {formatPrice(crate.price)}</span>
              <Icon name="package_2" className="text-[20px]" />
            </button>
            <span
              className={`font-label text-label-sm font-bold uppercase ${t(
                'text-tertiary',
                'text-black font-extrabold bg-white/60 px-3 py-1.5 rounded-full',
              )}`}
            >
              Free Priority Shipping Included
            </span>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center -space-x-12 lg:-space-x-16 max-w-md w-full">
          <img
            src={jalapeno.img}
            alt={`${jalapeno.name} pouch`}
            loading="lazy"
            className="w-32 sm:w-40 lg:w-48 h-auto object-contain rounded-3xl -rotate-12 drop-shadow-2xl relative hover:z-30 hover:scale-110 transition-transform"
          />
          <img
            src={chili.img}
            alt={`${chili.name} pouch`}
            loading="lazy"
            className="w-40 sm:w-48 lg:w-56 h-auto object-contain rounded-3xl z-20 relative drop-shadow-2xl hover:scale-110 transition-transform"
          />
          <img
            src={truffle.img}
            alt={`${truffle.name} pouch`}
            loading="lazy"
            className="w-32 sm:w-40 lg:w-48 h-auto object-contain rounded-3xl rotate-12 drop-shadow-2xl relative hover:z-30 hover:scale-110 transition-transform"
          />
        </div>
      </div>
    </section>
  );
}
