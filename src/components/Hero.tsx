import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { Star, Image as ImageIcon, Check, RotateCcw, X } from 'lucide-react';
import heroBgImage from '../assets/images/hero_luxury_sanctuary_1790267960268.jpg';

export const HERO_BG_PRESETS = [
  {
    id: 'sanctuary-dusk',
    name: 'Sanctuary Dusk Villa (Classic)',
    description: 'Modern luxury architectural villa with warm lights & pool at dusk',
    url: heroBgImage,
  },
  {
    id: 'coastal-resort',
    name: 'Grand Coastal Resort',
    description: 'Panoramic oceanside retreat with teak sundecks & palms',
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=90',
  },
  {
    id: 'infinity-horizon',
    name: 'Azure Infinity Horizon',
    description: 'Heated oceanfront infinity pool merging into the sea',
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=90',
  },
  {
    id: 'noir-penthouse',
    name: 'Presidential Noir Penthouse',
    description: 'Mood-lit luxury terrace with bespoke evening ambience',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2000&q=90',
  },
];

interface HeroProps {
  onExploreRooms?: () => void;
  onExploreAmenities?: () => void;
  onOurStory?: () => void;
  customBgImage?: string;
  isReady?: boolean;
}

export const Hero: React.FC<HeroProps> = React.memo(({
  onExploreRooms,
  onExploreAmenities,
  onOurStory,
  customBgImage,
  isReady = true,
}) => {
  const heroRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Subtle Y-axis Parallax Tracking on Background Image with lightweight spring damping
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Background translates down gently by 18% with lightweight damping (stiffness: 100, damping: 20)
  const rawBgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const bgY = useSpring(rawBgY, { stiffness: 100, damping: 20 });
  const rawBgScale = useTransform(scrollYProgress, [0, 1], [1.03, 1.10]);
  const bgScale = useSpring(rawBgScale, { stiffness: 100, damping: 20 });

  const [bgImage, setBgImage] = useState<string>(() => {
    if (customBgImage) return customBgImage;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aurelia_custom_hero_bg');
      if (saved) return saved;
    }
    return heroBgImage;
  });

  const [showBgPicker, setShowBgPicker] = useState(false);
  const [customInputUrl, setCustomInputUrl] = useState('');

  // Sync prop changes or saved state
  useEffect(() => {
    if (customBgImage) {
      setBgImage(customBgImage);
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aurelia_custom_hero_bg');
      if (saved) setBgImage(saved);
    }
  }, [customBgImage]);

  const selectPreset = (url: string) => {
    setBgImage(url);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aurelia_custom_hero_bg', url);
    }
  };

  const resetToClassic = () => {
    setBgImage(heroBgImage);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aurelia_custom_hero_bg');
    }
    setShowBgPicker(false);
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInputUrl.trim()) {
      selectPreset(customInputUrl.trim());
      setCustomInputUrl('');
      setShowBgPicker(false);
    }
  };

  const handleImageError = () => {
    // If external or custom asset fails, safely fallback to bundled classic villa
    if (bgImage !== heroBgImage && bgImage !== './hero-bg.jpg') {
      setBgImage(heroBgImage);
    }
  };

  const scrollToRooms = () => {
    if (onExploreRooms) {
      onExploreRooms();
      return;
    }
    const el = document.getElementById('rooms');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSecondaryClick = () => {
    if (onExploreAmenities) {
      onExploreAmenities();
      return;
    }
    if (onOurStory) {
      onOurStory();
      return;
    }
    const el = document.getElementById('amenities') || document.getElementById('dining');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      ref={heroRef} 
      className="relative min-h-[100dvh] w-full flex flex-col justify-end overflow-hidden bg-stone-950 m-0 p-0"
    >
      {/* Background Container with Parallax Transform */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden bg-stone-950 pointer-events-none">
        <motion.div
          style={{ 
            y: bgY, 
            scale: bgScale,
            willChange: 'transform',
            transform: 'translateZ(0)',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
          className="absolute inset-x-0 -top-[10%] w-full h-[120%] will-change-transform transform-gpu [backface-visibility:hidden] [transform:translateZ(0)]"
        >
          <motion.img
            initial={{ scale: 1.08, filter: 'brightness(0.75) contrast(1.02)' }}
            animate={
              isReady
                ? { scale: 1, filter: isMobile ? 'brightness(0.92) contrast(1.08)' : 'brightness(0.88) contrast(1.05)' }
                : { scale: 1.08, filter: 'brightness(0.75) contrast(1.02)' }
            }
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            src={bgImage}
            alt="Aurelia Luxury Sanctuary"
            referrerPolicy="no-referrer"
            loading="eager"
            decoding="async"
            onError={handleImageError}
            style={{
              objectPosition: isMobile ? '72% 38%' : 'center center',
            }}
            className="w-full h-full object-cover transform-gpu [backface-visibility:hidden] [transform:translateZ(0)]"
          />
        </motion.div>

        {/* Mobile & Desktop Tailored Luxury Vignette: Glowing Villa on top + deep rich text contrast below */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent sm:from-stone-950/90 sm:via-stone-950/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/50 via-transparent to-stone-950/20 sm:from-black/20 sm:via-transparent sm:to-transparent pointer-events-none" />
      </div>

      {/* Hero Content - Perfectly aligned with Navbar logo */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-10 lg:px-14 xl:px-16 pb-6 sm:pb-14 lg:pb-16 pt-16 sm:pt-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 lg:gap-12">
          {/* Left Text Block */}
          <div className="max-w-2xl space-y-3.5 sm:space-y-4">
            {/* Eyebrow with warm gold accent */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
              transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{
                willChange: 'transform, opacity',
                transform: 'translateZ(0)',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
              }}
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-stone-950/90 border border-amber-500/40 shadow-xl backdrop-blur-md transform-gpu [backface-visibility:hidden] [transform:translateZ(0)]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
              <p className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-amber-300 font-sans">
                WELCOME TO THE HOTEL
              </p>
            </motion.div>

            {/* Main Headline - Harmonious gold & white gradient typography with ample room for (y, g) descenders */}
            <div className="overflow-hidden pb-1 sm:pb-6 pt-0.5 sm:pt-1">
              <motion.h1
                initial={{ opacity: 0, y: 35 }}
                animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
                transition={{ duration: 0.95, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)',
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden',
                }}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-bold text-white tracking-tight leading-[1.12] sm:leading-[1.14] drop-shadow-lg break-words pb-1 sm:pb-3 transform-gpu [backface-visibility:hidden] [transform:translateZ(0)]"
              >
                <span className="block pb-0.5 sm:pb-1">
                  A place truly
                </span>
                <span className="inline-block w-full text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 relative pb-1 sm:pb-3 pr-2">
                  worth staying.
                </span>
              </motion.h1>
            </div>

            {/* Subtitle / Description */}
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
              transition={{ duration: 0.85, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
              style={{
                willChange: 'transform, opacity',
                transform: 'translateZ(0)',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
              }}
              className="text-stone-200 text-xs sm:text-base font-light leading-relaxed max-w-xl pt-0.5 sm:pt-1 drop-shadow-sm transform-gpu [backface-visibility:hidden] [transform:translateZ(0)]"
            >
              Rooms, suites, and villas designed for rest. Dining worth booking. A team that anticipates before you ask.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              animate={isReady ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 25, scale: 0.96 }}
              transition={{ duration: 0.85, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              style={{
                willChange: 'transform, opacity',
                transform: 'translateZ(0)',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
              }}
              className="flex flex-row items-center gap-2.5 sm:gap-4 pt-2 sm:pt-6 w-full sm:w-auto max-w-md sm:max-w-none transform-gpu [backface-visibility:hidden] [transform:translateZ(0)]"
            >
              <button
                type="button"
                onClick={scrollToRooms}
                className="flex-1 sm:flex-initial min-h-[46px] sm:min-h-[48px] flex items-center justify-center text-center px-4 sm:px-8 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-stone-950 font-extrabold text-xs sm:text-sm tracking-wider uppercase rounded-xl transition-all duration-300 shadow-xl shadow-amber-600/30 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:scale-95 cursor-pointer whitespace-nowrap touch-manipulation"
              >
                View Rooms
              </button>
              <button
                type="button"
                onClick={handleSecondaryClick}
                className="flex-1 sm:flex-initial min-h-[46px] sm:min-h-[48px] flex items-center justify-center text-center px-3 sm:px-8 py-3 bg-stone-950/85 hover:bg-stone-900 border border-amber-500/40 hover:border-amber-400 text-amber-200 hover:text-white font-semibold text-xs sm:text-sm tracking-wider uppercase rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-lg whitespace-nowrap backdrop-blur-md touch-manipulation"
              >
                Explore Amenities
              </button>
            </motion.div>
          </div>

          {/* Right Action Block - Rating */}
          <div className="flex flex-row items-center gap-2.5 self-start lg:self-end mt-1 lg:mt-0">
            {/* 5 Solid Radiant Gold Stars Rating */}
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.94 }}
              animate={isReady ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 30, scale: 0.94 }}
              transition={{ duration: 0.85, delay: 0.78, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center space-x-2.5 sm:space-x-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-stone-950/90 border border-amber-500/30 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center space-x-0.5 sm:space-x-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.4, delay: 0.72 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Star
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                    />
                  </motion.div>
                ))}
              </div>
              <span className="text-stone-200 text-[11px] sm:text-sm font-medium tracking-wide">
                <strong className="text-white font-bold">4.9</strong> out of 5 —{' '}
                <span className="text-amber-300 font-semibold">Booking.com</span>
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Hero Background Theme Selector Modal */}
      <AnimatePresence>
        {showBgPicker && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowBgPicker(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative text-stone-100"
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-white">
                      Hero Section Background
                    </h3>
                    <p className="text-xs text-stone-400">
                      Choose your preferred luxury hotel atmosphere
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBgPicker(false)}
                  className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800/80 hover:bg-stone-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Presets List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5">
                {HERO_BG_PRESETS.map((preset) => {
                  const isSelected = bgImage === preset.url;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => selectPreset(preset.url)}
                      className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 text-left ${
                        isSelected 
                          ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/30' 
                          : 'border-stone-800 hover:border-amber-500/60'
                      }`}
                    >
                      <div className="h-28 w-full overflow-hidden bg-stone-950 relative">
                        <img 
                          src={preset.url} 
                          alt={preset.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-stone-950">
                        <h4 className="text-xs font-bold text-white truncate">{preset.name}</h4>
                        <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">{preset.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Image URL Option */}
              <form onSubmit={handleCustomUrlSubmit} className="pt-2 border-t border-stone-800/80">
                <label className="block text-[11px] font-semibold text-stone-300 mb-1.5 uppercase tracking-wider">
                  Or Paste Custom Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customInputUrl}
                    onChange={(e) => setCustomInputUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl focus:border-amber-500 focus:outline-none text-white placeholder-stone-600"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl transition shadow-md whitespace-nowrap cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </form>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-800/80 text-xs">
                <button
                  type="button"
                  onClick={resetToClassic}
                  className="flex items-center gap-1.5 text-stone-400 hover:text-amber-300 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Classic Dusk Villa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowBgPicker(false)}
                  className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
});

Hero.displayName = 'Hero';



