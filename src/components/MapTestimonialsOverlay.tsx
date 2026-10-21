import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { MapSection } from './MapSection';
import { TestimonialsSection } from './TestimonialsSection';

export const MapTestimonialsOverlay: React.FC = React.memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 900));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lazy render using IntersectionObserver (800px margin so it mounts well before entering screen)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '800px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Track the scroll from when Testimonials enters the bottom ("start end") until its top hits the top ("start start")
  const { scrollYProgress } = useScroll({
    target: testimonialsRef,
    offset: ['start end', 'start start'],
  });

  // When Testimonials starts rising, translate Map down by the exact scroll delta so it STAYS PINNED on screen
  const rawMapY = useTransform(scrollYProgress, [0, 1], [0, windowHeight]);
  const mapY = useSpring(rawMapY, { stiffness: 100, damping: 20 });
  const rawMapScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const mapScale = useSpring(rawMapScale, { stiffness: 100, damping: 20 });
  const mapOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0.7, 0.35]);
  const scrimOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [0, 0.45, 0.7]);

  // Testimonials rises up dynamically from below with lightweight damping (stiffness: 100, damping: 20)
  const rawTestimonialsY = useTransform(scrollYProgress, [0, 1], [160, 0]);
  const testimonialsY = useSpring(rawTestimonialsY, { stiffness: 100, damping: 20 });
  const rawTestimonialsScale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);
  const testimonialsScale = useSpring(rawTestimonialsScale, { stiffness: 100, damping: 20 });

  return (
    <div 
      ref={containerRef} 
      style={{ contain: 'content' }}
      className="relative w-full overflow-visible [contain:content]"
    >
      {/* 
        SECTION 1: MAP & LOCATION SECTION
        Stays frozen on screen at the end of Map while Testimonials slides UP over it.
      */}
      <motion.div
        style={{
          y: mapY,
          scale: mapScale,
          opacity: mapOpacity,
          transformOrigin: 'center bottom',
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          contain: 'content',
        }}
        className="relative z-10 w-full will-change-transform transform-gpu [backface-visibility:hidden] [transform:translateZ(0)] [contain:content]"
      >
        {isVisible ? <MapSection /> : <div className="min-h-[550px] w-full bg-stone-950" />}

        {/* Cinematic dark scrim that softly darkens Map as Testimonials glides on top */}
        <motion.div
          style={{ opacity: scrimOpacity }}
          className="absolute inset-0 bg-stone-950 pointer-events-none z-30"
        />
      </motion.div>

      {/* 
        SECTION 2: TESTIMONIALS SECTION
        Rises up cleanly from the bottom with higher z-index (z-20), upward parallax lift, and deep luxury shadow.
      */}
      <motion.div 
        ref={testimonialsRef}
        id="testimonials-curtain-wrapper"
        style={{
          y: testimonialsY,
          scale: testimonialsScale,
          transformOrigin: 'center top',
          willChange: 'transform',
          transform: 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          contain: 'content',
        }}
        className="relative z-20 w-full rounded-t-[36px] sm:rounded-t-[60px] shadow-[0_-40px_80px_rgba(0,0,0,0.95)] border-t border-amber-500/40 bg-stone-950 overflow-hidden will-change-transform transform-gpu [backface-visibility:hidden] [transform:translateZ(0)] [contain:content]"
      >
        {/* Glowing architectural crest & flare that glides up with the sheet */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent z-30 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex items-center justify-center pointer-events-none">
          <div className="w-5 h-5 rotate-45 bg-stone-950 border border-amber-400/90 shadow-[0_0_12px_rgba(245,158,11,0.6)] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_6px_#fbbf24]" />
          </div>
        </div>

        {isVisible ? <TestimonialsSection /> : <div className="min-h-[600px] w-full bg-stone-950" />}
      </motion.div>
    </div>
  );
});

MapTestimonialsOverlay.displayName = 'MapTestimonialsOverlay';
