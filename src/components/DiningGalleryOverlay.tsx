import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { DiningSection } from './DiningSection';
import { GallerySection } from './GallerySection';

export const DiningGalleryOverlay: React.FC = React.memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 900));

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track the scroll from when Gallery enters the bottom ("start end") until its top hits the top ("start start")
  const { scrollYProgress } = useScroll({
    target: galleryRef,
    offset: ['start end', 'start start'],
  });

  // When Gallery starts rising, translate Dining down by the exact scroll delta so it STAYS PINNED on screen
  const rawDiningY = useTransform(scrollYProgress, [0, 1], [0, windowHeight]);
  const diningY = useSpring(rawDiningY, { stiffness: 100, damping: 20 });
  const rawDiningScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const diningScale = useSpring(rawDiningScale, { stiffness: 100, damping: 20 });
  const diningOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0.7, 0.35]);
  const scrimOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [0, 0.45, 0.7]);

  return (
    <div ref={containerRef} className="relative w-full overflow-visible">
      {/* 
        SECTION 1: DINING SECTION
        Stays frozen on screen at the end of Dining while Gallery slides UP over it.
      */}
      <motion.div
        style={{
          y: diningY,
          scale: diningScale,
          opacity: diningOpacity,
          transformOrigin: 'center bottom',
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
        }}
        className="relative z-10 w-full will-change-transform transform-gpu [backface-visibility:hidden] [transform:translateZ(0)]"
      >
        <DiningSection />

        {/* Cinematic dark scrim that softly darkens Dining as Gallery glides on top */}
        <motion.div
          style={{ opacity: scrimOpacity }}
          className="absolute inset-0 bg-stone-950 pointer-events-none z-30"
        />
      </motion.div>

      {/* 
        SECTION 2: GALLERY SECTION
        Rises up cleanly from the bottom with higher z-index (z-20) and deep luxury shadow.
      */}
      <div 
        ref={galleryRef}
        id="gallery-section"
        style={{
          transform: 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          overflow: 'hidden',
          contain: 'content',
        }}
        className="relative z-20 w-full rounded-t-[36px] sm:rounded-t-[60px] shadow-[0_-40px_80px_rgba(0,0,0,0.95)] border-t border-amber-500/30 bg-stone-950 overflow-hidden [contain:content] transform-gpu [backface-visibility:hidden] [transform:translateZ(0)]"
      >
        <GallerySection />
      </div>
    </div>
  );
});

DiningGalleryOverlay.displayName = 'DiningGalleryOverlay';
