import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { Room } from '../types';
import { RoomsSection } from './RoomsSection';
import { AmenitiesSection } from './AmenitiesSection';

interface RoomsFacilitiesOverlayProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
}

export const RoomsFacilitiesOverlay: React.FC<RoomsFacilitiesOverlayProps> = React.memo(({
  rooms,
  onSelectRoom,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const amenitiesRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 900));
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track the scroll from when Amenities enters the bottom ("start end") until its top hits the top ("start start")
  const { scrollYProgress } = useScroll({
    target: amenitiesRef,
    offset: ['start end', 'start start'],
  });

  // When Facilities starts rising, translate Rooms down on desktop
  const rawRoomsY = useTransform(scrollYProgress, [0, 1], [0, windowHeight]);
  const roomsY = useSpring(rawRoomsY, { stiffness: 100, damping: 20 });
  const rawRoomsScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const roomsScale = useSpring(rawRoomsScale, { stiffness: 100, damping: 20 });
  const roomsOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0.7, 0.35]);
  const scrimOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [0, 0.45, 0.7]);

  return (
    <div ref={containerRef} className="relative w-full overflow-visible">
      {/* 
        SECTION 1: ROOMS SECTION
        On mobile: natural scroll flow with 0 gesture interference.
        On desktop: cinematic sheet overlay spring.
      */}
      <motion.div
        id="rooms-section"
        style={{
          y: isMobile ? 0 : roomsY,
          scale: isMobile ? 1 : roomsScale,
          opacity: isMobile ? 1 : roomsOpacity,
          transformOrigin: 'center bottom',
          willChange: isMobile ? 'auto' : 'transform, opacity',
          transform: isMobile ? 'none' : 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
        }}
        className="relative z-10 w-full will-change-transform transform-gpu [backface-visibility:hidden]"
      >
        <RoomsSection rooms={rooms} onSelectRoom={onSelectRoom} />

        {/* Cinematic dark scrim that softly darkens Rooms as Facilities glides on top (desktop only) */}
        {!isMobile && (
          <motion.div
            style={{ opacity: scrimOpacity }}
            className="absolute inset-0 bg-stone-950 pointer-events-none z-30"
          />
        )}
      </motion.div>

      {/* 
        SECTION 2: FACILITIES / AMENITIES SECTION
        Rises up cleanly from the bottom with higher z-index (z-20) and deep luxury shadow.
      */}
      <div 
        ref={amenitiesRef}
        id="amenities-curtain-wrapper"
        style={{
          transform: 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
        }}
        className="relative z-20 w-full rounded-t-[36px] sm:rounded-t-[60px] shadow-[0_-40px_80px_rgba(0,0,0,0.95)] border-t border-amber-500/30 bg-stone-950 overflow-hidden transform-gpu [backface-visibility:hidden] [transform:translateZ(0)]"
      >
        <AmenitiesSection />
      </div>
    </div>
  );
});

RoomsFacilitiesOverlay.displayName = 'RoomsFacilitiesOverlay';
