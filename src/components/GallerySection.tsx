import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { CoverflowCarousel, CoverflowSlide } from './ui/coverflow-carousel';

const GALLERY_SLIDES: CoverflowSlide[] = [
  {
    src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=90",
    alt: "Grand Resort Exterior at Dusk",
    title: "Grand Exterior & Architecture",
    subtitle: "Coffee-Noir Coastal Masterpiece",
    meta: [
      { label: "Category", value: "Exterior" },
      { label: "Rating", value: "5 Star Luxury" },
    ],
  },
  {
    src: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1600&q=90",
    alt: "Presidential Coffee & Noir Suite",
    title: "Presidential Suite",
    subtitle: "Absolute Privacy & Elegance",
    meta: [
      { label: "Size", value: "180 m²" },
      { label: "View", value: "Oceanfront" },
    ],
  },
  {
    src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=90",
    alt: "Temperature-Controlled Infinity Pool",
    title: "Infinity Pool",
    subtitle: "Seamless Horizon View",
    meta: [
      { label: "Temperature", value: "Controlled" },
      { label: "Service", value: "Butler Bar" },
    ],
  },
  {
    src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=90",
    alt: "Aurelia Sanctuary Spa Lounge",
    title: "Sanctuary Spa",
    subtitle: "Holistic Wellness & Rituals",
    meta: [
      { label: "Treatments", value: "Organic" },
      { label: "Access", value: "24/7" },
    ],
  },
  {
    src: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1600&q=90",
    alt: "Michelin-Star Restaurant Dining",
    title: "Le Jardin Restaurant",
    subtitle: "Michelin-Star Gastronomy",
    meta: [
      { label: "Chef", value: "Valerio Rossi" },
      { label: "Cuisine", value: "Modern Fusion" },
    ],
  },
  {
    src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=90",
    alt: "Private Waterfront Luxury Villa",
    title: "Private Villa",
    subtitle: "Secluded Coastal Haven",
    meta: [
      { label: "Capacity", value: "6 Guests" },
      { label: "Pool", value: "Private" },
    ],
  },
  {
    src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=90",
    alt: "Grand Lobby & Espresso Lounge",
    title: "Grand Lobby & Lounge",
    subtitle: "Espresso & Noir Aesthetic",
    meta: [
      { label: "Atmosphere", value: "Sophisticated" },
      { label: "Service", value: "Valet & Concierge" },
    ],
  },
  {
    src: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=90",
    alt: "Exquisite Chef's Tasting Menu",
    title: "Culinary Masterpieces",
    subtitle: "Fresh Coastal Seafood",
    meta: [
      { label: "Source", value: "Local Organic" },
      { label: "Pairing", value: "Vintage Cellar" },
    ],
  },
];

export const GallerySection: React.FC = React.memo(() => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const slides = GALLERY_SLIDES;

  const selectedImage = selectedIndex !== null ? slides[selectedIndex] : null;

  // Single lightweight IntersectionObserver with rootMargin: '0px 0px -5% 0px'
  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '0px 0px -5% 0px',
        threshold: 0.05,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Keyboard controls & Lenis synchronization for single space preview
  useEffect(() => {
    if (selectedIndex === null) return;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aurelia:modal-open'));
      if ((window as any).__lenis) {
        (window as any).__lenis.stop();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev !== null ? (prev - 1 + slides.length) % slides.length : null));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev !== null ? (prev + 1) % slides.length : null));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aurelia:modal-close'));
        if ((window as any).__lenis) {
          (window as any).__lenis.start();
        }
      }
    };
  }, [selectedIndex, slides.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + slides.length) % slides.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % slides.length);
    }
  };

  return (
    <section 
      ref={sectionRef}
      id="gallery" 
      data-section-id="gallery-section"
      style={{ 
        contain: 'content',
        overflow: 'hidden',
      }}
      className="py-24 sm:py-32 bg-stone-950 text-stone-100 relative overflow-hidden [contain:content]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header: Compositor-only upward glide */}
        <div 
          style={{
            transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 25px, 0)',
            opacity: isVisible ? 1 : 0,
            transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: isVisible ? 'auto' : 'transform, opacity',
            contain: 'layout paint',
          }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4 transform-gpu [backface-visibility:hidden] [transform:translateZ(0)]"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-stone-900 border border-amber-600/30 text-amber-500 text-xs font-semibold tracking-widest uppercase shadow-lg">
            <Camera className="w-3.5 h-3.5" />
            <span>Immersive Visual Tour</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
            The Aurelia Gallery
          </h2>
          <p className="text-stone-300 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Step into a world of coffee-hued elegance and serene coastal horizons. Click any frame to experience our sanctuary in full cinematic view.
          </p>
        </div>

        {/* Coverflow Carousel with compositor glide & paint containment */}
        <div
          style={{
            transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 30px, 0)',
            opacity: isVisible ? 1 : 0,
            transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.12s, opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.12s',
            willChange: isVisible ? 'auto' : 'transform, opacity',
            contain: 'layout paint',
          }}
          className="py-6 sm:py-10 transform-gpu [backface-visibility:hidden] [transform:translateZ(0)]"
        >
          <CoverflowCarousel
            slides={slides}
            cardWidth="clamp(220px, 30vw, 340px)"
            showCaption={true}
            showPagination
            showNavigation
            label="Aurelia Hotel Gallery Carousel"
            onSlideClick={(_, index) => setSelectedIndex(index)}
          />
        </div>

        {/* Dedicated Single Space Fullscreen Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && selectedIndex !== null && (
            <div 
              data-lenis-prevent="true"
              data-lenis-prevent-wheel="true"
              data-lenis-prevent-touch="true"
              onWheel={(e) => e.stopPropagation()}
              onClick={() => setSelectedIndex(null)}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-[rgba(12,10,9,0.96)] overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                className="bg-stone-900/95 border border-amber-600/40 rounded-3xl max-w-6xl w-full p-4 sm:p-8 md:p-10 shadow-2xl relative text-stone-100 flex flex-col my-auto max-h-[96vh]"
              >
                {/* Top Header Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-800/80 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-stone-400 text-xs font-mono">
                      {selectedIndex + 1} / {slides.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedIndex(null)}
                      className="text-stone-300 hover:text-white p-2.5 rounded-xl bg-stone-800 hover:bg-amber-600 hover:text-stone-950 transition shadow-lg border border-stone-700 cursor-pointer flex items-center gap-1 text-xs font-semibold"
                      aria-label="Close dedicated space"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">Close</span>
                    </button>
                  </div>
                </div>

                {/* Main Hero Image in Single Screen */}
                <div className="relative flex-1 min-h-[40vh] sm:min-h-[55vh] md:min-h-[60vh] rounded-2xl overflow-hidden mb-5 bg-stone-950 border border-stone-800/80 flex items-center justify-center group shadow-inner">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedIndex}
                      src={selectedImage.src}
                      alt={selectedImage.alt}
                      loading="lazy"
                      decoding="async"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25 }}
                      className="max-h-[58vh] w-full object-contain select-none"
                    />
                  </AnimatePresence>

                  {/* Navigation Arrows inside lightbox */}
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 bg-stone-900/95 hover:bg-amber-600 hover:text-stone-950 text-stone-200 p-3 sm:p-3.5 rounded-full border border-stone-700 hover:border-amber-500 transition shadow-2xl cursor-pointer"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 bg-stone-900/95 hover:bg-amber-600 hover:text-stone-950 text-stone-200 p-3 sm:p-3.5 rounded-full border border-stone-700 hover:border-amber-500 transition shadow-2xl cursor-pointer"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Thumbnails row for rapid navigation inside single space */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-600/30">
                  {slides.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition cursor-pointer ${
                        idx === selectedIndex ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/20' : 'border-stone-800 opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img src={s.src} alt={s.alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
});

GallerySection.displayName = 'GallerySection';
