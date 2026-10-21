import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Compass, Navigation } from 'lucide-react';

export const MapSection: React.FC = React.memo(() => {
  const [isMapActive, setIsMapActive] = useState(false);

  return (
    <section 
      id="location" 
      style={{ contain: 'content' }}
      className="py-24 sm:py-32 bg-stone-950 text-stone-100 relative overflow-hidden [contain:content]"
    >
      <div id="contact" className="absolute top-0 left-0 pointer-events-none" />

      {/* LUXURY ARCHITECTURAL SECTION BORDERS */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent z-20 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 sm:w-[500px] h-[2px] bg-amber-400/80 blur-[2px]" />
        
        {/* Center Diamond Ornament Crest */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center">
          <div className="w-5 h-5 rotate-45 bg-stone-950 border border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.6)] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_6px_#fbbf24]" />
          </div>
        </div>

        {/* Flanking Micro Architectural Accent Ticks */}
        <div className="hidden sm:block absolute top-0 left-[calc(50%-70px)] -translate-y-1/2 w-4 h-[1px] bg-amber-400/70" />
        <div className="hidden sm:block absolute top-0 left-[calc(50%+54px)] -translate-y-1/2 w-4 h-[1px] bg-amber-400/70" />
      </div>

      {/* Subtle Vertical Side Hairlines */}
      <div className="hidden xl:block absolute left-8 lg:left-12 top-16 bottom-16 w-[1px] bg-gradient-to-b from-transparent via-amber-500/15 to-transparent pointer-events-none" />
      <div className="hidden xl:block absolute right-8 lg:right-12 top-16 bottom-16 w-[1px] bg-gradient-to-b from-transparent via-amber-500/15 to-transparent pointer-events-none" />

      {/* Ambient Lighting (Hardware-accelerated radial gradient) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.06)_0%,transparent_70%)] pointer-events-none transform-gpu [transform:translateZ(0)]" />

      {/* Single Animated Parent Container to eliminate individual scroll-recalculation overhead */}
      <motion.div 
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
        }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transform-gpu [backface-visibility:hidden] [transform:translateZ(0)]"
      >
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14 space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-stone-900/95 border border-amber-600/40 text-amber-400 text-xs font-semibold tracking-widest uppercase shadow-xl">
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span>Resort Location</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15]">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600">Location</span>
          </h2>

          <p className="text-stone-400 text-base font-light leading-relaxed max-w-2xl mx-auto">
            One Aurelia Boulevard — Oceanfront Sanctuary, California
          </p>
        </div>

        {/* MAP VIEW: Static GPU background with Interactive Iframe Activation */}
        <div className="bg-stone-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.85)] relative">
          <div 
            className="relative h-[480px] sm:h-[580px] w-full bg-stone-950 cursor-pointer group"
            onMouseEnter={() => setIsMapActive(true)}
            onClick={() => setIsMapActive(true)}
          >
            {isMapActive ? (
              <iframe
                title="Aurelia Hotel Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0195551842885!2d-122.41941542345598!3d37.77492977197177!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c6c8f4459%3A0xb1ded36d31548e67!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(125%)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full opacity-90 animate-fadeIn"
              />
            ) : (
              /* Lightweight static architectural graphic fallback */
              <div className="relative w-full h-full bg-stone-950 flex items-center justify-center select-none overflow-hidden">
                {/* Stylized vector map grid background */}
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]" />
                <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900/60 to-stone-950" />

                {/* Central Pin & Call to Action */}
                <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-stone-900/90 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.25)] group-hover:scale-110 transition-transform duration-300">
                    <Navigation className="w-8 h-8 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xl text-white">One Aurelia Boulevard</h3>
                    <p className="text-xs text-stone-400 mt-1">Oceanfront Sanctuary, California • Coastline Coordinates</p>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMapActive(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-amber-500/30 transition transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    Click to Explore Live Map
                  </button>
                </div>
              </div>
            )}

            {/* Floating Location Card Overlay (Address Only) */}
            <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-md bg-stone-950/95 border border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl text-stone-100 flex items-center space-x-3.5 pointer-events-none z-20">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center shrink-0 font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-serif font-bold text-white text-base truncate">Aurelia Resort & Spa</h4>
                <p className="text-xs text-stone-300 font-light truncate">One Aurelia Boulevard, California</p>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </section>
  );
});

MapSection.displayName = 'MapSection';

MapSection.displayName = 'MapSection';

