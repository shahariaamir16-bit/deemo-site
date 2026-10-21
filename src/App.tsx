import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';
import { Room, Booking, DEFAULT_ROOMS } from './types';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RoomsFacilitiesOverlay } from './components/RoomsFacilitiesOverlay';
import { DiningGalleryOverlay } from './components/DiningGalleryOverlay';
import { MapTestimonialsOverlay } from './components/MapTestimonialsOverlay';
import { Footer } from './components/Footer';
import { RoomLandingModal } from './components/RoomLandingModal';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { AureliaLoader } from './components/AureliaLoader';

export default function App() {
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS);
  const [loading, setLoading] = useState(false);
  const [isPageRevealed, setIsPageRevealed] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  // Safety fallback: ensure page is always revealed after 7.5s if an unexpected environment stall occurs
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageRevealed(true);
    }, 7500);
    return () => clearTimeout(timer);
  }, []);

  // 1. Initialize buttery-smooth Lenis inertial scrolling with instant response and zero lag
  useEffect(() => {
    let lenis: Lenis | null = null;
    let rafId: number | null = null;

    try {
      lenis = new Lenis({
        duration: 0.85,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
        syncTouch: false,
        autoResize: true,
        prevent: (node) => {
          return (
            node.hasAttribute('data-lenis-prevent') ||
            Boolean(node.closest?.('[data-lenis-prevent]'))
          );
        },
      });

      lenisRef.current = lenis;
      if (typeof window !== 'undefined') {
        (window as any).__lenis = lenis;
      }

      function raf(time: number) {
        if (lenis) {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        }
      }

      rafId = requestAnimationFrame(raf);
    } catch (err) {
      console.warn("Lenis scroll notice:", err);
    }

    // Smoothly intercept standard anchor link clicks to route through Lenis
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const targetId = href.substring(1);
        const element = document.getElementById(targetId);
        if (element && lenis) {
          e.preventDefault();
          lenis.scrollTo(element, {
            offset: -60,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    const onModalOpen = () => { try { lenis?.stop(); } catch {} };
    const onModalClose = () => { try { lenis?.start(); } catch {} };
    window.addEventListener('aurelia:modal-open', onModalOpen);
    window.addEventListener('aurelia:modal-close', onModalClose);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('aurelia:modal-open', onModalOpen);
      window.removeEventListener('aurelia:modal-close', onModalClose);
      if (typeof window !== 'undefined') {
        (window as any).__lenis = null;
      }
      try {
        lenis?.destroy();
      } catch {}
      lenis = null;
      lenisRef.current = null;
    };
  }, []);

  // Pause Lenis when modal is open to prevent background scroll interference
  const isAnyModalOpen = Boolean(selectedRoom || confirmedBooking || showMyBookings);
  useEffect(() => {
    if (lenisRef.current) {
      if (isAnyModalOpen) {
        lenisRef.current.stop();
      } else {
        lenisRef.current.start();
      }
    }
  }, [isAnyModalOpen]);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms?t=${Date.now()}`);
      if (!res.ok) return;
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setRooms(data);
      }
    } catch {
      // Fallback safely to Firestore snapshot listener
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();

    // Real-time Firestore onSnapshot listener (Single source of truth, 0 duplicate re-renders)
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      unsubscribeFirestore = onSnapshot(collection(db, 'rooms'), (snapshot) => {
        const liveRooms: Room[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Room;
          liveRooms.push({
            ...data,
            id: data.id || doc.id
          });
        });
        setRooms(liveRooms);
        setLoading(false);
      }, (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, 'rooms');
        } catch (err) {
          console.warn("Firestore rooms onSnapshot notice:", err);
        }
      });
    } catch (e) {
      console.warn("Firestore rooms listener init:", e);
    }

    // BroadcastChannel for instant cross-tab sync without network chatter
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('aurelia_realtime_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'ROOM_CHANGED') {
          fetchRooms();
        }
      };
    }

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      if (bc) bc.close();
    };
  }, [fetchRooms]);

  const scrollToSection = useCallback((targetId: string) => {
    const resolvedId = targetId === 'rooms' ? (document.getElementById('rooms-section') ? 'rooms-section' : 'rooms') : targetId;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(`#${resolvedId}`, {
        offset: -60,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      const el = document.getElementById(resolvedId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleBookingSuccess = useCallback((booking: Booking) => {
    setSelectedRoom(null);
    setConfirmedBooking(booking);
    fetchRooms();
  }, [fetchRooms]);

  const handleSelectRoom = useCallback((room: Room) => {
    setSelectedRoom(room);
  }, []);

  const handleOpenMyBookings = useCallback(() => {
    setShowMyBookings(true);
  }, []);

  const handleCloseSelectedRoom = useCallback(() => {
    setSelectedRoom(null);
  }, []);

  const handleCloseConfirmedBooking = useCallback(() => {
    setConfirmedBooking(null);
  }, []);

  const handleCloseMyBookings = useCallback(() => {
    setShowMyBookings(false);
  }, []);

  return (
    <>
      {/* Aurelia Signature Brand Entrance Loading Animation */}
      <AureliaLoader 
        onComplete={() => setIsPageRevealed(true)} 
      />

      <div 
        className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 relative"
      >
        {/* Navigation */}
        <Navbar
          isReady={isPageRevealed}
          onOpenMyBookings={handleOpenMyBookings}
          onExploreRooms={() => scrollToSection('rooms')}
          onNavigate={scrollToSection}
        />

        {/* Hero Section */}
        <Hero
          isReady={isPageRevealed}
          onExploreRooms={() => scrollToSection('rooms')}
          onExploreAmenities={() => scrollToSection('amenities')}
        />

      {/* Rooms Section + Facilities Smooth Sheet Overlay Transition */}
      <RoomsFacilitiesOverlay
        rooms={rooms}
        onSelectRoom={handleSelectRoom}
      />

      {/* Fine Dining + Gallery Smooth Sheet Overlay Transition */}
      <DiningGalleryOverlay />

      {/* Map & Location + Testimonials Smooth Sheet Overlay Transition */}
      <MapTestimonialsOverlay />

      {/* Footer */}
      <Footer 
        onNavigate={scrollToSection}
        onScrollToTop={scrollToTop}
      />

      {/* Modals Portaled directly to document.body (Guaranteed 100% viewport-fixed at any scroll position) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedRoom && (
            <RoomLandingModal
              key={selectedRoom.id}
              room={selectedRoom}
              onClose={handleCloseSelectedRoom}
              onBookingSuccess={handleBookingSuccess}
            />
          )}

          {confirmedBooking && (
            <BookingConfirmationModal
              key={confirmedBooking.id}
              booking={confirmedBooking}
              onClose={handleCloseConfirmedBooking}
            />
          )}

          {showMyBookings && (
            <MyBookingsModal
              key="my-bookings-modal"
              onClose={handleCloseMyBookings}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
    </>
  );
}
