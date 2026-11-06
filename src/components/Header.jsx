import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import CartDrawer from './CartDrawer.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { navLinks } from '../data/content.js';

// Round translucent icon button used on the right side of the bar.
function RoundButton({ label, onClick, href, children, className = '' }) {
  const cls = `relative w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 sm:w-11 sm:h-11 rounded-full nav-glass hover:!bg-white text-white hover:text-[#1b110c] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${className}`;
  return href ? (
    <a href={href} aria-label={label} title={label} className={cls}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cls}>
      {children}
    </button>
  );
}

export default function Header() {
  const { isDark, toggle, t } = useTheme();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(navLinks[0].href);
  const [hovered, setHovered] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [pill, setPill] = useState(null);
  const navRef = useRef(null);
  const searchRef = useRef(null);

  // Track the section in view so the white pill follows the page.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    navLinks.forEach((l) => {
      const el = document.querySelector(l.href);
      if (el) observer.observe(el);
    });
    // Past the hero the page turns light, so the pill/buttons switch to dark glass (see .nav-glass).
    const hero = document.getElementById('top');
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      setPastHero(hero ? hero.getBoundingClientRect().bottom < 80 : false);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Slide the white indicator under the hovered (or active) link.
  const target = hovered ?? active;
  useLayoutEffect(() => {
    const measure = () => {
      const link = navRef.current?.querySelector(`[data-href="${target}"]`);
      if (link) setPill({ left: link.offsetLeft, width: link.offsetWidth });
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [target]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const onSearch = (e) => {
    e.preventDefault();
    document.querySelector('#arsenal')?.scrollIntoView({ behavior: 'smooth' });
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <>
      {!isDark && (
        <div className="w-full bg-[#bbf2f6] text-[#0b4850] py-2 px-space-md text-center font-body text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 border-b border-[#92e2ea]">
          <span className="bg-[#0b4850] text-white text-[11px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
            New Drop
          </span>
          <span>
            Grab 20% off your first crunch crate. Use code{' '}
            <span className="underline decoration-wavy font-extrabold">SNACKLOUD</span> at checkout! 🍿
          </span>
        </div>
      )}

      <header
        data-past-hero={pastHero || undefined}
        className="sticky top-0 left-0 w-full z-50 text-white bg-transparent"
      >
        <div
          className={`w-full container-x flex items-center justify-between gap-space-sm sm:gap-space-md transition-[height] duration-300 ${
            scrolled ? 'h-16' : 'h-20'
          }`}
        >
          {/* Wordmark: chunky italic, stickered like snack packaging */}
          <a href="#top" aria-label="Crunch Craft home" className="group shrink-0 min-w-0">
            <span className="cc-wordmark relative inline-block font-display font-extrabold uppercase italic leading-none text-[18px] min-[360px]:text-[22px] sm:text-[28px] -rotate-6 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
              {/* Two stacked copies: the thick dark outline is drawn on its own copy behind, and the clean
                  yellow/white letters sit on top. (Relying on `paint-order` to put the stroke behind the fill
                  doesn't work in many mobile browsers, which painted the stroke over the letters and turned the
                  whole logo black.) */}
              <span aria-hidden="true" className="cc-wordmark-outline absolute inset-0">
                Crunch<span className="cc-wordmark-accent">Craft</span>
              </span>
              <span className="relative">
                Crunch<span className="cc-wordmark-accent">Craft</span>
              </span>
            </span>
          </a>

          {/* Centre pill nav with sliding white indicator */}
          <nav
            ref={navRef}
            aria-label="Primary"
            onMouseLeave={() => setHovered(null)}
            className="hidden xl:flex relative items-center p-1 rounded-full nav-glass"
          >
            {pill && (
              <span
                aria-hidden="true"
                className="absolute top-1 bottom-1 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)]"
                style={{ left: pill.left, width: pill.width }}
              />
            )}
            {navLinks.map((link) => {
              const on = target === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  data-href={link.href}
                  aria-current={active === link.href ? 'true' : undefined}
                  onMouseEnter={() => setHovered(link.href)}
                  onFocus={() => setHovered(link.href)}
                  onBlur={() => setHovered(null)}
                  className={`relative z-10 px-5 py-2.5 rounded-full font-body text-[13px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors duration-300 ${
                    on ? 'text-[#1b110c]' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right icon cluster */}
          <div className="flex items-center gap-1.5 min-[360px]:gap-2 sm:gap-3 shrink-0">
            <form
              onSubmit={onSearch}
              role="search"
              className={`hidden sm:flex items-center h-11 rounded-full transition-all duration-500 overflow-hidden ${
                searchOpen ? 'w-56 bg-white text-[#1b110c] pl-4' : 'w-11'
              }`}
            >
              {searchOpen && (
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onBlur={() => !query && setSearchOpen(false)}
                  placeholder="Search flavours…"
                  aria-label="Search flavours"
                  className="flex-1 min-w-0 bg-transparent outline-none font-body text-[14px] font-semibold placeholder:text-[#1b110c]/50"
                />
              )}
              <button
                type={searchOpen ? 'submit' : 'button'}
                onClick={searchOpen ? undefined : () => setSearchOpen(true)}
                aria-label={searchOpen ? 'Submit search' : 'Open search'}
                className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${
                  searchOpen
                    ? 'text-[#1b110c]'
                    : 'nav-glass hover:!bg-white text-white hover:text-[#1b110c] hover:scale-105'
                }`}
              >
                <Icon name="search" className="text-[22px]" />
              </button>
            </form>

            <RoundButton label="Favourites" href="#arsenal" className="hidden sm:flex">
              <Icon name="favorite" className="text-[21px]" />
            </RoundButton>

            <RoundButton label={`Open cart, ${count} items`} onClick={() => setCartOpen(true)}>
              <Icon name="shopping_bag" className="text-[21px]" />
              {count > 0 ? (
                <span
                  key={count}
                  className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-white text-[#1b110c] font-body text-[11px] font-extrabold flex items-center justify-center shadow-md animate-pop"
                >
                  {count}
                </span>
              ) : (
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-white ring-2 ring-white/40" />
              )}
            </RoundButton>

            <RoundButton label={`Switch to ${isDark ? 'Pop (light)' : 'Craft (dark)'} theme`} onClick={toggle}>
              <Icon name={isDark ? 'light_mode' : 'dark_mode'} className="text-[21px]" />
            </RoundButton>

            <RoundButton
              label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((v) => !v)}
              className="xl:hidden"
            >
              <Icon name={menuOpen ? 'close' : 'menu'} className="text-[21px]" />
            </RoundButton>
          </div>
        </div>

        {menuOpen && (
          <nav aria-label="Mobile" className="xl:hidden mx-space-md mb-space-md p-2 rounded-[1.75rem] nav-glass flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-5 py-3 rounded-full font-body text-[14px] font-bold uppercase tracking-wide transition-colors ${
                  active === link.href ? 'bg-white text-[#1b110c]' : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
