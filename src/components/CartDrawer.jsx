import { useEffect } from 'react';
import Icon from './Icon.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { formatPrice } from '../data/content.js';

export default function CartDrawer({ open, onClose }) {
  const { items, total, count, updateQty } = useCart();
  const { t } = useTheme();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-[70] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your crunch crate"
        className={`absolute top-0 right-0 h-full w-full max-w-md flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        } ${t('bg-surface-container-low', 'bg-white')}`}
      >
        <div className="flex items-center justify-between p-space-lg border-b border-on-surface/10">
          <div>
            <p className="font-label text-label-sm uppercase tracking-widest text-primary">Your Crunch Crate</p>
            <h2 className="font-heading text-headline-md-mobile sm:text-headline-md uppercase font-extrabold">{count} Bags Loaded</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="p-2.5 rounded-full bg-surface-container hover:bg-surface-container-high"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-space-lg flex flex-col gap-space-md">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center gap-space-sm h-full text-on-surface-variant">
              <Icon name="shopping_bag" className="text-[48px] opacity-50" />
              <p className="font-heading text-headline-sm uppercase font-extrabold text-on-surface">Dead silent in here.</p>
              <p className="text-body-sm">Add a bag and make some noise.</p>
              <a
                href="#arsenal"
                onClick={onClose}
                className={`mt-space-sm px-space-lg py-3 rounded-full font-label text-label-lg uppercase font-bold ${t(
                  'bg-primary-container text-on-primary-container',
                  'bg-secondary-container text-black',
                )}`}
              >
                Browse the Arsenal
              </a>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.name} className="flex items-center gap-space-md p-space-md rounded-2xl bg-surface-container">
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-extrabold uppercase text-[15px] leading-tight">{item.name}</p>
                  <p className="font-label text-label-sm text-on-surface-variant mt-1">
                    {formatPrice(item.price)} each
                  </p>
                </div>
                <div className="flex items-center rounded-full bg-surface-container-highest">
                  <button
                    type="button"
                    aria-label={`Remove one ${item.name}`}
                    onClick={() => updateQty(item.name, -1)}
                    className="w-9 h-9 rounded-full hover:bg-surface-bright flex items-center justify-center"
                  >
                    <Icon name="remove" className="text-[18px]" />
                  </button>
                  <span className="w-6 text-center font-label text-label-lg">{item.qty}</span>
                  <button
                    type="button"
                    aria-label={`Add one ${item.name}`}
                    onClick={() => updateQty(item.name, 1)}
                    className="w-9 h-9 rounded-full hover:bg-surface-bright flex items-center justify-center"
                  >
                    <Icon name="add" className="text-[18px]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-space-lg border-t border-on-surface/10 flex flex-col gap-space-md">
            <div className="flex items-center justify-between font-label text-label-lg uppercase">
              <span className="text-on-surface-variant">Subtotal</span>
              <span className="text-headline-sm font-label font-extrabold">{formatPrice(total)}</span>
            </div>
            <button
              type="button"
              className={`w-full py-space-md rounded-full font-body text-label-lg uppercase font-extrabold tracking-wider flex items-center justify-center gap-space-xs hover:scale-[1.02] transition-transform ${t(
                'bg-primary-container text-on-primary-container shadow-[0_0_24px_rgba(255,87,26,0.4)]',
                'bg-secondary-container text-black shadow-md',
              )}`}
            >
              Checkout <Icon name="bolt" />
            </button>
            <p className="text-center font-label text-label-sm text-on-surface-variant uppercase">
              Free priority shipping over $40
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
