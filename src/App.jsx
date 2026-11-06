import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Ticker from './components/Ticker.jsx';
import Arsenal from './components/Arsenal.jsx';
import FlavorLab from './components/FlavorLab.jsx';
import Manifesto from './components/Manifesto.jsx';
import Provenance from './components/Provenance.jsx';
import CampaignBanner from './components/CampaignBanner.jsx';
import Reviews from './components/Reviews.jsx';
import Gallery from './components/Gallery.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';
import SeamCrumbs, { SEAMS } from './components/SeamCrumbs.jsx';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Below-the-fold elements that fade up as they scroll into view. The Manifesto (#story) and Provenance (#ingredients) run their own scroll stories; the phone review deck (.deck-card) animates itself.
const REVEAL =
  'main section:not(#top):not(#story):not(#ingredients) :is(h2, article, figure):not(.deck-card), main section:not(#top):not(#story):not(#ingredients) [role="tabpanel"]';

export default function App() {
  const main = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(REVEAL, { opacity: 0, y: 48 });
        ScrollTrigger.batch(REVEAL, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: 'power3.out',
              // Hand transforms back to Tailwind so hover lifts keep working.
              clearProps: 'transform',
            }),
        });
      });
    },
    { scope: main },
  );

  return (
    <>
      <Header />
      {/* -mt-20 slides the page under the transparent sticky header (h-20). */}
      <main ref={main} className="w-full overflow-x-hidden -mt-20">
        <Hero />
        <Ticker />
        <Arsenal />
        <SeamCrumbs items={SEAMS.chili} />
        <FlavorLab />
        <SeamCrumbs items={SEAMS.jalapeno} />
        <Manifesto />
        <Provenance />
        <SeamCrumbs items={SEAMS.truffle} />
        <CampaignBanner />
        <Reviews />
        <SeamCrumbs items={SEAMS.mix} />
        <Gallery />
      </main>
      <Footer />
      <Toast />
    </>
  );
}
