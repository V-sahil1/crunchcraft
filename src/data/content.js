// All copy and per-flavor styling for the Crunch Craft site.
// Each flavor carries a `dark` and `light` style set mirroring the two Stitch designs.

export const flavors = [
  {
    id: 'chili',
    name: 'Fiery Chili & Smoked Cheddar',
    shortName: '01 Chili',
    drop: 'DROP 01 // PICANTE',
    price: 4.99,
    img: '/images/pack-chili.jpg',
    notes: 'Smoked Spanish Paprika • 24-Mo Aged Cave Cheddar • Ghost Pepper Micro-Dust.',
    meterLabel: 'Heat Level',
    meter: 4,
    badge: 'SPICE: 8.5/10 HIGH HEAT',
    profile: 'PROFILE 01 // VOLCANIC HEAT',
    desc: 'A volcanic clash of Spanish smoked pimentón, dehydrated aged Wisconsin cheddar solids, and a hyper-fine dust of ghost peppers that blooms on the back of the palate after 4 seconds.',
    heat: { label: '8.5 / 10', pct: 85 },
    db: { label: '110 dB', pct: 92 },
    cut: 'Deep V-Ridge',
    roast: 'Triple Kettle',
    tags: ['⚡ Ghost Pepper Dust', '🧀 24-Mo Cave Cheddar', '🔥 Oakwood Smoked Salt'],
    slide: {
      tag: 'Try the Heat',
      blurb: 'Smoked pimentón, cave-aged cheddar and a ghost-pepper finish that blooms four seconds in. Loud, cheesy, dangerously hot.',
      bg: 'bg-gradient-to-br from-[#ffb03a] via-[#ff7a00] to-[#ff4d00]',
      glow: '#ffd166',
    },
    dark: {
      glow: 'bg-primary-container/20 group-hover:bg-primary-container/30',
      chip: 'bg-surface-container-highest text-primary',
      meterOn: 'bg-primary-container',
      button: 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary',
      heatBar: 'bg-primary-container',
      labGlow: 'rgba(255, 87, 26, 0.25)',
    },
    light: {
      card: 'from-[#fff2e0] via-[#ffe3c7] to-[#ffd2ad] border-[#ffba82]',
      glow: 'bg-[#ff6b35]/20',
      chip: 'bg-[#ff5722] text-white',
      price: 'text-[#9a3412]',
      meterOn: 'bg-[#ea580c]',
      button: 'bg-[#ff5722] text-white hover:bg-[#e64a19]',
      shadow: 'drop-shadow-[0_20px_25px_rgba(154,52,18,0.35)]',
      heatBar: 'bg-primary',
      labGlow: 'rgba(236, 59, 131, 0.2)',
    },
  },
  {
    id: 'jalapeno',
    name: 'Smoky Jalapeño & Lime Crunch',
    shortName: '02 Jalapeño',
    drop: 'DROP 02 // CITRIC ACID',
    price: 4.99,
    img: '/images/pack-jalapeno.jpg',
    notes: 'Charred Green Jalapeño • Cold-Pressed Persian Lime • Sun-Evaporated Baja Flake Salt.',
    meterLabel: 'Tang / Acidity',
    meter: 5,
    badge: 'ZING: 9.0/10 PERSIAN CITRUS',
    profile: 'PROFILE 02 // ACIDIC VOLTAGE',
    desc: 'Hand-charred green jalapeños blended with cold-pressed Persian lime essential oils and unrefined Baja sea salt flakes for an electrifying, crisp, high-acidity crunch wave.',
    heat: { label: '6.2 / 10', pct: 62 },
    db: { label: '108 dB', pct: 88 },
    cut: 'Cracked Kettle Cut',
    roast: 'Slow Batch Kettle',
    tags: ['🍋 Cold-Pressed Lime', '🌶️ Charred Jalapeño', '🌊 Baja Flake Salt'],
    slide: {
      tag: 'Try the Zing',
      blurb: 'Charred green jalapeño meets cold-pressed Persian lime and Baja flake salt. A sharp citrus shock with a smoky, slow-building kick.',
      bg: 'bg-zesty-lime',
      glow: '#d9f99d',
    },
    dark: {
      glow: 'bg-tertiary/20 group-hover:bg-tertiary/30',
      chip: 'bg-surface-container-highest text-tertiary',
      meterOn: 'bg-tertiary',
      button: 'bg-tertiary text-on-tertiary hover:bg-tertiary-fixed hover:text-on-tertiary-fixed',
      heatBar: 'bg-tertiary',
      labGlow: 'rgba(171, 214, 0, 0.25)',
    },
    light: {
      card: 'from-[#f3fee8] via-[#e2fdc5] to-[#cbf79e] border-[#a3e635]',
      glow: 'bg-[#84cc16]/25',
      chip: 'bg-[#4d7c0f] text-white',
      price: 'text-[#365314]',
      meterOn: 'bg-[#65a30d]',
      button: 'bg-[#65a30d] text-white hover:bg-[#4d7c0f]',
      shadow: 'drop-shadow-[0_20px_25px_rgba(77,124,15,0.35)]',
      heatBar: 'bg-[#65a30d]',
      labGlow: 'rgba(101, 163, 13, 0.2)',
    },
  },
  {
    id: 'truffle',
    name: 'Dark Truffle & Roasted Garlic',
    shortName: '03 Truffle',
    drop: 'DROP 03 // RESERVE',
    price: 5.49,
    img: '/images/pack-truffle.jpg',
    notes: 'Umbrian Winter Truffle • Wood-Roasted Confit Garlic • Rosemary Fleur de Sel.',
    meterLabel: 'Umami Depth',
    meter: 5,
    badge: 'UMAMI: 9.8/10 RESERVE BATCH',
    profile: 'PROFILE 03 // LUXURY UMAMI',
    desc: 'Rare Umbrian winter truffles foraged in Norcia, folded with slow confit wood-roasted garlic and crushed rosemary blossoms. A deep, savory sonic experience for hedonists.',
    heat: { label: '2.0 / 10', pct: 20 },
    db: { label: '112 dB', pct: 96 },
    cut: 'Artisan Ripple Cut',
    roast: 'Woodfire Infused',
    tags: ['🍄 Umbrian Truffle', '🧄 Slow-Roasted Confit', '🌿 Rosemary Fleur de Sel'],
    slide: {
      tag: 'Try the Reserve',
      blurb: 'Umbrian winter truffle folded with wood-roasted confit garlic and rosemary fleur de sel. Deep, savoury, unapologetically luxe.',
      bg: 'bg-truffle-bokeh',
      glow: '#ffcf70',
    },
    dark: {
      glow: 'bg-secondary/20 group-hover:bg-secondary/30',
      chip: 'bg-surface-container-highest text-secondary',
      meterOn: 'bg-secondary',
      button: 'bg-secondary text-on-secondary hover:bg-secondary-fixed hover:text-on-secondary-fixed',
      heatBar: 'bg-secondary',
      labGlow: 'rgba(255, 219, 157, 0.2)',
    },
    light: {
      card: 'from-[#f5f0ff] via-[#e9ddff] to-[#d8c4ff] border-[#c4a6ff]',
      glow: 'bg-[#7c5de1]/20',
      chip: 'bg-tertiary text-white',
      price: 'text-tertiary',
      meterOn: 'bg-tertiary',
      button: 'bg-tertiary text-white hover:bg-[#5233b3]',
      shadow: 'drop-shadow-[0_20px_25px_rgba(99,66,199,0.35)]',
      heatBar: 'bg-tertiary',
      labGlow: 'rgba(99, 66, 199, 0.2)',
    },
  },
];

export const crate = { name: 'Ultimate 12-Pack Variety Crate', price: 49 };

export const navLinks = [
  { label: 'Shop All', href: '#arsenal' },
  { label: 'Flavours', href: '#flavor-lab' },
  { label: 'Our Story', href: '#story' },
  { label: 'Ingredients', href: '#ingredients' },
  { label: "What's New", href: '#reviews' },
];

export const tickerItems = [
  '100% Heirloom Oaxacan Corn',
  'Zero Industrial Seed Oils',
  'Solar Kettle Roasted',
  'Ultra-Loud Decibel Snap',
  'Foraged Spice Crust',
];

export const stats = [
  { value: '110 dB', label: 'Audible acoustic fracture threshold', dark: 'text-tertiary', light: 'text-primary' },
  { value: '0%', label: 'Seed oils or synthetic additives', dark: 'text-primary-container', light: 'text-secondary-container' },
  { value: '3X', label: 'Slower kettle immersion roast', dark: 'text-secondary', light: 'text-tertiary' },
];

export const ingredients = [
  {
    icon: 'local_fire_department',
    origin: 'Estremadura, Spain',
    name: 'Oak-Smoked Pimentón',
    desc: 'Slow-smoked for two continuous weeks over fallen encina oak logs before stone grinding into velvet crimson dust.',
    cert: '100% Unadulterated',
    dark: { iconWrap: 'bg-primary-container/20 text-primary-container', origin: 'text-primary', cert: 'text-tertiary' },
    light: { iconWrap: 'bg-pink-100 text-primary', origin: 'text-primary', cert: 'text-primary', border: 'border-pink-100' },
  },
  {
    icon: 'spa',
    origin: 'Veracruz, Mexico',
    name: 'Cold-Pressed Persian Lime',
    desc: 'Harvested exclusively before dawn to capture essential rind oils, flash-crystallized for electric citrus bite.',
    cert: 'Non-Irradiated',
    dark: { iconWrap: 'bg-tertiary/20 text-tertiary', origin: 'text-tertiary', cert: 'text-tertiary' },
    light: { iconWrap: 'bg-lime-100 text-[#4d7c0f]', origin: 'text-[#4d7c0f]', cert: 'text-[#4d7c0f]', border: 'border-lime-100' },
  },
  {
    icon: 'diamond',
    origin: 'Norcia, Italy',
    name: 'Umbrian Winter Truffle',
    desc: 'Foraged by heritage Lagotto Romagnolo canines in deep limestone oak woodlands. Never synthesized aromas.',
    cert: 'Certified Apennine Origin',
    dark: { iconWrap: 'bg-secondary/20 text-secondary', origin: 'text-secondary', cert: 'text-secondary' },
    light: { iconWrap: 'bg-purple-100 text-tertiary', origin: 'text-tertiary', cert: 'text-tertiary', border: 'border-purple-100' },
  },
  {
    icon: 'agriculture',
    origin: 'Oaxacan Highlands',
    name: 'Heirloom Chalqueño Corn',
    desc: 'Regeneratively farmed non-GMO maize nixtamalized in volcanic spring mineral water for rich kernel structure.',
    cert: '100% Regenerative Ag',
    dark: { iconWrap: 'bg-primary/20 text-primary', origin: 'text-primary', cert: 'text-tertiary' },
    light: { iconWrap: 'bg-amber-100 text-secondary-container', origin: 'text-[#b45309]', cert: 'text-[#b45309]', border: 'border-amber-100' },
  },
];

export const reviews = [
  {
    quote:
      'These chips should be illegal in open-plan offices. My co-workers complained about how loud they are, then stole the whole bag. 10/10.',
    name: 'Kai T.',
    meta: 'Austin, TX • Fiery Chili Addict',
    badge: 'Verified Rebel',
    dark: { badge: 'bg-tertiary/20 text-tertiary' },
    light: { badge: 'bg-pink-100 text-primary', border: 'border-pink-100', icon: 'text-primary' },
  },
  {
    quote:
      'The Jalapeño & Lime has this sharp cold-pressed citrus shock that wakes up your brain instantly. The texture snap is unlike anything from a supermarket.',
    name: 'Elena R.',
    meta: 'Brooklyn, NY • 4x Monthly Subscriber',
    badge: 'Verified Rebel',
    dark: { badge: 'bg-tertiary/20 text-tertiary' },
    light: { badge: 'bg-lime-100 text-[#4d7c0f]', border: 'border-lime-100', icon: 'text-[#4d7c0f]' },
  },
  {
    quote:
      'The Dark Truffle & Roasted Garlic is genuinely Michelin level. We served it as a palate amuse-bouche with champagne at our wine popup.',
    name: 'Marcus Chen',
    meta: 'San Francisco, CA • Executive Chef',
    badge: 'Chef Verified',
    dark: { badge: 'bg-secondary/20 text-secondary' },
    light: { badge: 'bg-purple-100 text-tertiary', border: 'border-purple-100', icon: 'text-tertiary' },
  },
];

export const gallery = [
  {
    img: '/images/ugc-1.jpg',
    handle: '@rebel_snack_co',
    alt: 'Snacker in a neon street jacket eating fiery corn chips under warm orange neon light',
    dark: 'text-on-surface',
    light: 'text-white',
  },
  {
    img: '/images/ugc-2.jpg',
    handle: '@gastronomy_raw',
    alt: 'Overhead flatlay of an open chip bag with lime wedges, sea salt and charred jalapeños on slate',
    dark: 'text-tertiary',
    light: 'text-[#d9f99d]',
  },
  {
    img: '/images/ugc-3.jpg',
    handle: '@synth_beats_official',
    alt: 'Backstage table with chip bags, DJ headphones and synth cables in purple and ember light',
    dark: 'text-secondary',
    light: 'text-[#fde047]',
  },
  {
    img: '/images/ugc-4.jpg',
    handle: '@crunch_acoustics',
    alt: 'A ridge-cut chip shattering mid-air among paprika flakes on an obsidian background',
    dark: 'text-primary',
    light: 'text-[#f472b6]',
  },
];

export const footerColumns = [
  {
    title: 'Index',
    dark: 'text-tertiary',
    light: 'text-[#ffd166]',
    links: ['All Drops', 'Extreme Heat', 'Tangy Umami', 'Variety Bundles', 'Subscription Box'],
  },
  {
    title: 'Craft Lab',
    dark: 'text-secondary',
    light: 'text-[#ff80bf]',
    links: ['Manifesto', 'Zero Junk Creed', 'Heirloom Maize', 'Micro-Batches', 'Sustainability'],
  },
  {
    title: 'Intel & Help',
    dark: 'text-primary',
    light: 'text-[#80ffdb]',
    links: ['Track Package', 'Wholesale & Stockists', 'FAQ / Support', 'Press Contact'],
  },
];

export const footerBadges = [
  { label: '100% Non-GMO Heirloom', dark: 'text-tertiary', light: 'text-[#ffd166]' },
  { label: 'Regenerative Ag Certi-Craft', dark: 'text-secondary', light: 'text-[#80ffdb]' },
  { label: 'Solar Kiln Roasted', dark: 'text-primary', light: 'text-[#ff80bf]' },
];

export const formatPrice = (n) => `$${n.toFixed(2)}`;
