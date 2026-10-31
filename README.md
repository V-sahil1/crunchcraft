# Crunch Craft — React site

React + Vite + Tailwind build of the Stitch designs in `../stitch_bold_snack_brand_experience`.

- **Craft (dark)** theme — `crunch_craft_ultra_modern_premium_snack_experience_1` / `crunch_craft/DESIGN.md`
- **Pop (light)** theme — `crunch_craft_ultra_modern_premium_snack_experience_2` / `crunch_pop_dtc/DESIGN.md`

Toggle themes with the sun/moon button in the header (saved in localStorage), or open `/?theme=light` / `/?theme=dark`.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Structure

```
src/
  data/content.js        all copy, flavors, per-theme accent classes
  context/ThemeContext   theme state + t(darkClasses, lightClasses) helper
  context/CartContext    cart items, quantities, add-to-cart toast
  components/            Header, Hero, Ticker, Arsenal/ProductCard, FlavorLab,
                         Manifesto, Provenance, CampaignBanner, Reviews, Gallery,
                         Footer, CartDrawer, Toast
tailwind.config.js       both design-token palettes as CSS variables
public/images/           product + gallery images from the designs
```
