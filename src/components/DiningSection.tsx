import React from 'react';
import { motion } from 'motion/react';
import { Utensils, Star, Clock, Sparkles } from 'lucide-react';

export const DiningSection: React.FC = React.memo(() => {
  return (
    <section 
      id="dining" 
      style={{ contain: 'content' }}
      className="py-24 sm:py-32 bg-stone-900 text-stone-100 relative overflow-hidden [contain:content]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Info Column */}
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-stone-950 border border-amber-600/30 text-amber-500 text-xs font-semibold tracking-wider uppercase shadow-lg">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Gastronomy Excellence</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
              The Aurelia Restaurant & Sky Bar
            </h2>

            <p className="text-stone-300 text-base leading-relaxed font-light">
              Savor exquisite culinary creations designed by Executive Chef Valerio Rossi. Combining Mediterranean coastal traditions with Asian modern fusion, every dish is an unforgettable sensory journey.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-4 p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800/80 hover:border-amber-500/30 transition shadow-md">
                <div className="p-3 bg-amber-600/15 text-amber-400 rounded-xl shrink-0"><Utensils className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-bold text-white text-sm">Le Jardin Breakfast & Brunch</h4>
                  <p className="text-xs text-stone-400">Fresh organic pastries, artisanal cheeses, and champagne breakfast daily.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-3.5 rounded-2xl bg-stone-950/70 border border-stone-800/80 hover:border-amber-500/30 transition shadow-md">
                <div className="p-3 bg-amber-600/15 text-amber-400 rounded-xl shrink-0"><Clock className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-bold text-white text-sm">Oceanfront Dining Hours</h4>
                  <p className="text-xs text-stone-400">Breakfast: 6:30 AM - 11:00 AM | Dinner: 6:00 PM - 11:30 PM</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Photos Column: Signature Staggered Reveal with Sunbeam Shutter Sweep */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5 relative">
            
            {/* Photo 1: Primary Gastronomy Card with Sweep */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative rounded-3xl overflow-hidden shadow-2xl border border-stone-800/90 hover:border-amber-500/60 bg-stone-950 select-none transform-gpu"
            >
              {/* Corner Accent Brackets */}
              <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-amber-400/40 rounded-tl-sm pointer-events-none group-hover:border-amber-400/90 transition-colors z-30" />
              <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t border-r border-amber-400/40 rounded-tr-sm pointer-events-none group-hover:border-amber-400/90 transition-colors z-30" />
              
              <div className="relative h-60 sm:h-84 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80"
                  alt="Fine dining table at Aurelia"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] select-none transform-gpu"
                />

                {/* Contrast Vignette Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/25 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" />

                {/* Cinematic Sunlight Shutter Beam: Sweeps diagonally across image on entrance */}
                <motion.div
                  initial={{ x: '-150%', opacity: 0 }}
                  whileInView={{ x: '260%', opacity: [0, 0.8, 0.8, 0] }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ 
                    duration: 1.15, 
                    delay: 0.3, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className="absolute inset-0 w-3/5 h-full -skew-x-[26deg] bg-gradient-to-r from-transparent via-amber-300/35 via-amber-400/45 to-transparent pointer-events-none z-25"
                />

                {/* Floating Badge */}
                <div className="absolute bottom-3.5 left-3.5 z-30 pointer-events-none">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-stone-950/90 text-amber-300 border border-amber-500/40 shadow-xl backdrop-blur-md flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Michelin Gastronomy</span>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Photo 2: Secondary Gourmet Dish Card (Staggered offset) */}
            <motion.div
              initial={{ opacity: 0, y: 65, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.85, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative rounded-3xl overflow-hidden shadow-2xl border border-stone-800/90 hover:border-amber-500/60 bg-stone-950 select-none sm:translate-y-8 transform-gpu"
            >
              {/* Corner Accent Brackets */}
              <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-amber-400/40 rounded-tl-sm pointer-events-none group-hover:border-amber-400/90 transition-colors z-30" />
              <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t border-r border-amber-400/40 rounded-tr-sm pointer-events-none group-hover:border-amber-400/90 transition-colors z-30" />
              
              <div className="relative h-60 sm:h-84 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
                  alt="Gourmet dish at Aurelia"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] select-none transform-gpu"
                />

                {/* Contrast Vignette Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/25 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" />

                {/* Cinematic Sunlight Shutter Beam: Sweeps diagonally across image on entrance */}
                <motion.div
                  initial={{ x: '-150%', opacity: 0 }}
                  whileInView={{ x: '260%', opacity: [0, 0.8, 0.8, 0] }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ 
                    duration: 1.15, 
                    delay: 0.42, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className="absolute inset-0 w-3/5 h-full -skew-x-[26deg] bg-gradient-to-r from-transparent via-amber-300/35 via-amber-400/45 to-transparent pointer-events-none z-25"
                />

                {/* Floating Badge */}
                <div className="absolute bottom-3.5 left-3.5 z-30 pointer-events-none">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-stone-950/90 text-amber-300 border border-amber-500/40 shadow-xl backdrop-blur-md flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Artisanal Plating</span>
                  </span>
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
});

DiningSection.displayName = 'DiningSection';
