import plugin from 'tailwindcss/plugin';

// Token palettes lifted from the two Stitch designs (crunch_craft = dark, crunch_pop_dtc = light).
const palettes = {
  dark: {
    surface: '#1b110c',
    'surface-dim': '#1b110c',
    'surface-bright': '#443630',
    'surface-container-lowest': '#160c07',
    'surface-container-low': '#241914',
    'surface-container': '#291d18',
    'surface-container-high': '#342721',
    'surface-container-highest': '#3f322c',
    'on-surface': '#f4ded5',
    'on-surface-variant': '#e6beb2',
    outline: '#ad897e',
    'outline-variant': '#5c4037',
    primary: '#ffb59e',
    'on-primary': '#5e1700',
    'primary-container': '#ff571a',
    'on-primary-container': '#521300',
    'primary-fixed': '#ffdbd0',
    secondary: '#ffdb9d',
    'on-secondary': '#412d00',
    'secondary-container': '#feb700',
    'secondary-fixed': '#ffdea8',
    'on-secondary-fixed': '#271900',
    tertiary: '#abd600',
    'on-tertiary': '#283500',
    'tertiary-container': '#7c9c00',
    'tertiary-fixed': '#c3f400',
    'on-tertiary-fixed': '#161e00',
  },
  light: {
    surface: '#fef7ff',
    'surface-dim': '#e1d5f1',
    'surface-bright': '#fef7ff',
    'surface-container-lowest': '#ffffff',
    'surface-container-low': '#f9f0ff',
    'surface-container': '#f4eaff',
    'surface-container-high': '#f0e3ff',
    'surface-container-highest': '#eaddfa',
    'on-surface': '#1f182c',
    'on-surface-variant': '#594046',
    outline: '#8d6f76',
    'outline-variant': '#e0bec5',
    primary: '#b6005c',
    'on-primary': '#ffffff',
    'primary-container': '#d82a75',
    'on-primary-container': '#fffbff',
    'primary-fixed': '#ffd9e1',
    secondary: '#815600',
    'on-secondary': '#ffffff',
    'secondary-container': '#ffae00',
    'secondary-fixed': '#ffddb1',
    'on-secondary-fixed': '#291800',
    tertiary: '#6342c7',
    'on-tertiary': '#ffffff',
    'tertiary-container': '#7c5de1',
    'tertiary-fixed': '#e7deff',
    'on-tertiary-fixed': '#1f005f',
  },
};

const toRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

const cssVars = (palette) =>
  Object.fromEntries(Object.entries(palette).map(([k, v]) => [`--c-${k}`, toRgb(v)]));

const colors = Object.fromEntries(
  Object.keys(palettes.dark).map((k) => [k, `rgb(var(--c-${k}) / <alpha-value>)`]),
);

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors,
      borderRadius: {
        DEFAULT: '1rem',
        lg: '2rem',
        xl: '3rem',
        full: '9999px',
      },
      spacing: {
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.75rem',
        'space-xl': '3rem',
        gutter: '1.5rem',
        margin: '3rem',
      },
      fontFamily: {
        // Brand type system: Archivo Black for hero + promo display, Manrope for headings/body/UI,
        // Sora for small labels, prices and accents.
        display: ['var(--font-display)', 'sans-serif'],
        heading: ['Manrope', 'sans-serif'],
        label: ['var(--font-label)', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      // Sizes follow the brand type scale (desktop / mobile pairs).
      fontSize: {
        'display-hero': ['96px', { lineHeight: '92px', letterSpacing: '-0.045em' }],
        'display-xl': ['64px', { lineHeight: '63px', letterSpacing: '-0.045em' }],
        'display-mobile': ['38px', { lineHeight: '38px', letterSpacing: '-0.04em' }],
        'headline-xl': ['48px', { lineHeight: '52px', letterSpacing: '-0.03em', fontWeight: '800' }],
        'headline-xl-mobile': ['32px', { lineHeight: '36px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg': ['40px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg-light': ['40px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg-mobile': ['28px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '800' }],
        'headline-md': ['32px', { lineHeight: '36px', letterSpacing: '-0.015em', fontWeight: '800' }],
        'headline-md-mobile': ['24px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '800' }],
        'headline-sm': ['22px', { lineHeight: '26px', fontWeight: '800' }],
        price: ['36px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'price-mobile': ['28px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'body-xl': ['20px', { lineHeight: '30px', letterSpacing: '-0.01em', fontWeight: '500' }],
        'body-lg': ['17px', { lineHeight: '27px', fontWeight: '500' }],
        'body-md': ['15px', { lineHeight: '23px', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '19px', letterSpacing: '0.01em' }],
        'label-lg': ['15px', { lineHeight: '18px', letterSpacing: '0.04em', fontWeight: '800' }],
        'label-sm': ['11px', { lineHeight: '14px', letterSpacing: '0.08em', fontWeight: '700' }],
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.4)' },
          '60%': { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1)' },
        },
        ripple: {
          '0%': { transform: 'scale(0.62)', opacity: '0.7' },
          '100%': { transform: 'scale(1.18)', opacity: '0' },
        },
        reveal: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        eq: {
          '0%, 100%': { transform: 'scaleY(0.45)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        float: 'float 6s ease-in-out infinite',
        eq: 'eq 1.1s ease-in-out infinite',
        pop: 'pop 0.35s ease-out',
        reveal: 'reveal 0.5s ease-out',
        ripple: 'ripple 3.6s cubic-bezier(0.2, 0.6, 0.3, 1) infinite',
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ':root, [data-theme="dark"]': {
          ...cssVars(palettes.dark),
          '--font-display': '"Archivo Black"',
          '--font-label': 'Sora',
          'color-scheme': 'dark',
        },
        '[data-theme="light"]': {
          ...cssVars(palettes.light),
          '--font-display': '"Archivo Black"',
          '--font-label': 'Sora',
          'color-scheme': 'light',
        },
      });
    }),
  ],
};
