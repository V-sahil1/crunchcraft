import Icon from './Icon.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Toast() {
  const { toast } = useCart();
  const { t } = useTheme();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 left-6 sm:left-auto z-[60] transition-all duration-300 pointer-events-none px-space-lg py-space-md rounded-full font-label text-label-sm font-bold shadow-2xl flex items-center gap-space-sm uppercase ${
        toast ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'
      } ${t('bg-tertiary text-on-tertiary', 'bg-primary text-white border-2 border-pink-200')}`}
    >
      <Icon name="check_circle" className="text-[20px]" />
      <span>{toast?.message ?? 'Added to box'}</span>
    </div>
  );
}
