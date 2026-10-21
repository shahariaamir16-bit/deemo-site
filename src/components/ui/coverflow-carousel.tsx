"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ZoomIn, Maximize2 } from "lucide-react";

import { cn } from "@/lib/utils";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  meta?: { label: string; value: string }[];
}

export interface CoverflowCarouselProps {
  slides?: CoverflowSlide[];
  itemCount?: number;
  renderCard?: (slide: CoverflowSlide | undefined, index: number, isActive: boolean) => React.ReactNode;
  cardHeight?: string;
  /** Degrees the first neighbour tilts. */
  rotate?: number;
  /** How far the first neighbour recedes, as a fraction of card width. */
  depth?: number;
  /** Viewer distance as a multiple of card width — smaller is a wider lens. */
  perspective?: number;
  /** Exponent on distance. Below 1 the rake eases off as cards travel out. */
  falloff?: number;
  /** Opacity lost per step from the centre. */
  fade?: number;
  /** Any CSS length. Everything else is derived from it, so the rake scales. */
  cardWidth?: string;
  /** Space between cards, as a fraction of card width. */
  gap?: number;
  loop?: boolean;
  showCaption?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  /** Names the carousel for assistive tech. */
  label?: string;
  className?: string;
  cardClassName?: string;
  onSlideClick?: (slide: CoverflowSlide | undefined, index: number) => void;
  onIndexChange?: (index: number) => void;
}

export function CoverflowCarousel({
  slides,
  itemCount,
  renderCard,
  cardHeight,
  rotate = 26,
  depth = 0.35,
  perspective = 3,
  falloff = 0.65,
  fade = 0.08,
  cardWidth = "clamp(180px, 25vw, 300px)",
  gap = 0.1,
  loop = true,
  showCaption = true,
  showPagination = true,
  showNavigation = true,
  label = "Cover carousel",
  className,
  cardClassName,
  onSlideClick,
  onIndexChange,
}: CoverflowCarouselProps) {
  const count = slides?.length ?? itemCount ?? 0;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  /** Fractional card index at the centre. The single source of truth. */
  const posRef = React.useRef(0);
  /** Where the current settle is headed. Stepping off `pos` instead would
      swallow a keypress that lands mid-flight, before the round-off moves. */
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
    hasMoved: boolean;
  } | null>(null);

  const [selected, setSelected] = React.useState(0);

  /** Nearest whole card, folded back into 0..count-1. */
  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count],
  );

  // Paint straight to the DOM. Sixty state updates a second would re-render
  // every card for numbers React never needs to see.
  const paint = React.useCallback(() => {
    let width = widthRef.current;
    if (!width) {
      const foundCard = cardRefs.current.find((c) => c && c.offsetWidth > 0);
      if (foundCard) {
        width = foundCard.offsetWidth;
        widthRef.current = width;
      } else if (frameRef.current && frameRef.current.clientWidth > 0) {
        width = Math.min(340, Math.max(220, frameRef.current.clientWidth * 0.28));
        widthRef.current = width;
      }
    }
    if (!width) return;

    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      // Fold the distance into the shorter way round the ring. This is the
      // whole looping mechanism — no cloned nodes, no shuffling the DOM.
      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      // Both the tilt and the recession ease off as cards travel out —
      // doubling the distance adds only about half again as much of each.
      // A linear ramp folds the second card shut; this keeps it readable.
      const ramp = Math.pow(distance, falloff);
      // Capped comfortably so neighbor cards remain fully readable and never turn edge-on
      const tilt = Math.min(rotate * ramp, 36) * Math.sign(offset);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

      // A card is teleported across the ring at exactly half a turn out, so it
      // has to be gone by then or the jump is visible.
      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      const computedOpacity = Math.max(0.35, 1 - fade * distance);
      card.style.opacity = String(computedOpacity * edge);
      card.style.zIndex = String(100 - Math.round(distance));
      card.style.display = edge === 0 && loop && distance > count / 2 ? 'none' : 'block';
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      const nextIdx = indexAt(target);
      setSelected(nextIdx);
      if (onIndexChange) {
        onIndexChange(nextIdx);
      }

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        // ponytail: exponential ease-out, not a spring. Swap in a spring only
        // if the settle needs overshoot.
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint],
  );

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop],
  );

  const goTo = React.useCallback(
    (index: number) => {
      // Take the shorter way round rather than unwinding the whole ring.
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
      hasMoved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const diffX = event.clientX - drag.x;
    if (!drag.hasMoved) {
      if (Math.abs(diffX) > 6) {
        drag.hasMoved = true;
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {}
      } else {
        return;
      }
    }

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - diffX / pitch);
    // Cards per second, for the throw.
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const didMove = drag.hasMoved;
    dragRef.current = null;

    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {}

    if (didMove) {
      // Let a flick carry, but never more than two cards.
      const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
      settle(clamp(Math.round(posRef.current + carried)));
    } else {
      settle(clamp(Math.round(posRef.current)));
    }
  };

  // Card width drives pitch, depth and perspective, so it is the only thing
  // worth measuring — and only when the box actually changes.
  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const card = cardRefs.current.find((c) => c && c.offsetWidth > 0) || cardRefs.current[0];
      if (card && card.offsetWidth > 0) {
        widthRef.current = card.offsetWidth;
      } else if (frame && frame.clientWidth > 0) {
        widthRef.current = Math.min(340, Math.max(220, frame.clientWidth * 0.28));
      }
      paint();
    };

    measure();
    const rafId = requestAnimationFrame(measure);
    const t1 = setTimeout(measure, 50);
    const t2 = setTimeout(measure, 250);

    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const active = slides ? slides[selected] : undefined;

  const items = slides ?? Array.from({ length: count }, () => ({} as CoverflowSlide));

  return (
    <div
      className={cn("w-full pb-16 mb-8", className)}
      style={{ ["--cf-card" as string]: cardWidth }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              nudge(1);
            }
          }}
          onWheel={(event) => {
            if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 15) {
              if (event.deltaX > 0) nudge(1);
              else nudge(-1);
            }
          }}
          // Vertical padding keeps the drop shadows and tilted perspective clear.
          className="cursor-grab overflow-hidden pt-10 pb-16 outline-none ring-ring focus-visible:ring-2 active:cursor-grabbing"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            // Horizontal drag is ours; the page keeps vertical scrolling.
            touchAction: "pan-y",
          }}
        >
          <div
            className="relative select-none"
            style={{
              height: cardHeight ?? "calc(var(--cf-card) * 1.28)",
              transformStyle: "preserve-3d",
            }}
          >
            {items.map((slide, index) => (
              <div
                key={index}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
                onClick={() => {
                  if (dragRef.current?.hasMoved) return;
                  goTo(index);
                  if (onSlideClick) {
                    onSlideClick(slide, index);
                  }
                }}
                className={cn(
                  "absolute left-1/2 top-0 overflow-hidden rounded-3xl will-change-transform cursor-pointer group select-none",
                  renderCard ? "h-full border-0" : "aspect-[4/5] border border-amber-600/35 shadow-2xl hover:border-amber-500 transition-colors",
                  cardClassName,
                )}
                style={{
                  width: "var(--cf-card)",
                  WebkitBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden",
                  transformStyle: "flat",
                  contain: "layout paint",
                  transform: "translateZ(0)",
                }}
              >
                {renderCard ? (
                  renderCard(slide, index, index === selected)
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      draggable={false}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full select-none object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
                      style={{
                        WebkitBackfaceVisibility: "hidden",
                        backfaceVisibility: "hidden",
                        transform: "translateZ(0)",
                      }}
                    />
                    {/* Elegant subtle vignette overlay that preserves vibrant colors */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-black/10 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />
                    
                    {/* Visual hover badge with solid backdrop (no backdrop-filter that breaks 3D in WebKit) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-stone-950/60 pointer-events-none">
                      <div className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-bold shadow-xl flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>View Dedicated Space</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {showNavigation && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => nudge(-1)}
              className="absolute left-4 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-stone-950/95 border border-amber-600/30 p-3 text-amber-400 transition hover:bg-stone-900 shadow-xl cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => nudge(1)}
              className="absolute right-4 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-stone-950/95 border border-amber-600/30 p-3 text-amber-400 transition hover:bg-stone-900 shadow-xl cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {showCaption && active?.title && (
        <div
          key={selected}
          className="mt-6 flex flex-col items-center px-6 text-center duration-300 animate-in fade-in"
        >
          <p className="text-xl font-serif font-bold text-white tracking-tight">
            {active.title}
          </p>

          {onSlideClick && (
            <button
              type="button"
              onClick={() => onSlideClick(active, selected)}
              className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs tracking-wider uppercase transition shadow-xl shadow-amber-600/20 cursor-pointer group"
            >
              <ZoomIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>View in Dedicated Space</span>
            </button>
          )}
        </div>
      )}

      {showPagination && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selected}
              onClick={() => goTo(index)}
              className={cn(
                "h-2 rounded-full transition-all cursor-pointer",
                index === selected ? "w-8 bg-amber-500 shadow-[0_0_10px_#fbbf24]" : "w-2 bg-stone-700 opacity-50 hover:bg-stone-600",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
