import React, { useEffect, useRef, useState } from 'react';

interface AureliaLoaderProps {
  onComplete?: () => void;
}

export const AureliaLoader: React.FC<AureliaLoaderProps> = ({ onComplete }) => {
  const [isDone, setIsDone] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isShine, setIsShine] = useState(false);
  const [isOut, setIsOut] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const restRef = useRef<HTMLSpanElement>(null);
  const bandRef = useRef<SVGPathElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);
  const waveSvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsDone(true);
      if (onComplete) onComplete();
      return;
    }

    /* ---------- Optimized luxury timings (ms) ---------- */
    const T = {
      logoHold: 650,  // only the "A" shows in center (colours shift)
      expand: 750,    // URELIA grows out of the A
      wordHold: 450,  // full AURELIA stays with radiant gold shimmer
      logoFade: 250,  // AURELIA fades out
      cover: 550,     // wave sweeps down and directly reveals the hero section
    };

    const logoColors = [
      ['#ff808f', '#3fb48a', '#3fb48a'],
      ['#3fb48a', '#3fb48a', '#4f73c8'],
      ['#4f73c8', '#7f93d6', '#4f73c8'],
    ];

    let isDestroyed = false;
    let animRafId: number | null = null;
    let colorCycleInterval: number | null = null;
    let timer1: number | null = null;
    let timer2: number | null = null;
    let timer3: number | null = null;
    let timer4: number | null = null;

    // Viewport dimensions & precomputed wave coordinates
    let W = window.innerWidth;
    let H = window.innerHeight;
    let AMP = H * 0.28;

    const NUM_PTS = 28;
    let xCoords = new Float64Array(NUM_PTS);
    let waveOffsets = new Float64Array(NUM_PTS);

    const recomputePoints = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      AMP = H * 0.28;

      if (waveSvgRef.current) {
        waveSvgRef.current.setAttribute('viewBox', `0 0 ${W} ${H}`);
      }

      xCoords = new Float64Array(NUM_PTS);
      waveOffsets = new Float64Array(NUM_PTS);

      const seed = 1.8;
      for (let i = 0; i < NUM_PTS; i++) {
        const u = i / (NUM_PTS - 1);
        xCoords[i] = u * W;
        waveOffsets[i] =
          Math.sin(u * 5.2 + seed) * 0.55 +
          Math.sin(u * 9.5 - seed * 1.7) * 0.25 +
          Math.sin(u * 2.1 + seed * 0.6) * 0.45;
      }
    };

    recomputePoints();
    window.addEventListener('resize', recomputePoints, { passive: true });

    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    /* Construct smooth SVG curve with single setAttribute call & zero garbage collection */
    const updateWaveCurtain = (p: number) => {
      if (!bandRef.current || isDestroyed) return;
      if (p >= 1) {
        bandRef.current.setAttribute('d', '');
        return;
      }

      const base = -AMP + p * (H + 2 * AMP);
      const ampEnv = AMP * Math.sin(Math.PI * p);

      const y0 = base + ampEnv * waveOffsets[0];
      let d = `M0,${y0.toFixed(1)}`;

      for (let i = 0; i < NUM_PTS - 1; i++) {
        const currentX = xCoords[i];
        const currentY = base + ampEnv * waveOffsets[i];
        const nextX = xCoords[i + 1];
        const nextY = base + ampEnv * waveOffsets[i + 1];
        const midX = (currentX + nextX) * 0.5;
        const midY = (currentY + nextY) * 0.5;
        d += ` Q${currentX.toFixed(1)},${currentY.toFixed(1)} ${midX.toFixed(1)},${midY.toFixed(1)}`;
      }

      const lastY = base + ampEnv * waveOffsets[NUM_PTS - 1];
      d += ` L${W},${lastY.toFixed(1)} L${W},${H + 40} L0,${H + 40} Z`;

      bandRef.current.setAttribute('d', d);
    };

    const runWaveCurtainAnimation = (durationMs: number, onDone: () => void) => {
      let startTimestamp: number | null = null;

      const step = (now: DOMHighResTimeStamp) => {
        if (isDestroyed) return;
        if (startTimestamp === null) startTimestamp = now;
        const elapsed = now - startTimestamp;
        const progress = Math.min(1, elapsed / durationMs);

        updateWaveCurtain(ease(progress));

        if (progress < 1) {
          animRafId = requestAnimationFrame(step);
        } else {
          onDone();
        }
      };

      animRafId = requestAnimationFrame(step);
    };

    const finish = () => {
      if (isDestroyed) return;
      setIsDone(true);
      if (onComplete) onComplete();
    };

    const startSequence = () => {
      if (isDestroyed) return;

      updateWaveCurtain(0);

      const rects = logoRef.current ? logoRef.current.querySelectorAll<SVGElement>('[data-c]') : [];
      let ci = 0;
      colorCycleInterval = window.setInterval(() => {
        ci = Math.min(ci + 1, logoColors.length - 1);
        rects.forEach((r, i) => {
          r.style.fill = logoColors[ci][i % logoColors[ci].length];
        });
      }, Math.max(120, Math.floor(T.logoHold / 3)));

      // 1. A -> AURELIA unfolds (starts from center, expands out)
      timer1 = window.setTimeout(() => {
        if (isDestroyed) return;
        if (colorCycleInterval) clearInterval(colorCycleInterval);
        rects.forEach((r) => {
          r.style.fill = '#d4af37';
        });
        if (restRef.current) {
          restRef.current.style.maxWidth = restRef.current.scrollWidth + 'px';
        }
        setIsOpen(true);
      }, T.logoHold);

      // 2. Exact Original Gold Shimmer Sweep across the letters + glow on logo
      timer2 = window.setTimeout(() => {
        if (isDestroyed) return;
        setIsShine(true);
      }, T.logoHold + T.expand + 50);

      // 3. Letters slide up and fade out
      timer3 = window.setTimeout(() => {
        if (isDestroyed) return;
        setIsOut(true);
      }, T.logoHold + T.expand + T.wordHold);

      // 4. Exact wave sweeps down smoothly with high-precision timestamp
      timer4 = window.setTimeout(() => {
        if (isDestroyed) return;
        if (containerRef.current) {
          containerRef.current.style.backgroundColor = 'transparent';
        }
        updateWaveCurtain(0);

        runWaveCurtainAnimation(T.cover, () => {
          // Wait for wave to completely exit the bottom before revealing hero content
          window.setTimeout(() => {
            finish();
          }, 100);
        });
      }, T.logoHold + T.expand + T.wordHold + T.logoFade);
    };

    let started = false;
    const triggerStart = () => {
      if (started || isDestroyed) return;
      started = true;
      requestAnimationFrame(() => {
        startSequence();
      });
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(triggerStart).catch(triggerStart);
      setTimeout(triggerStart, 200);
    } else {
      triggerStart();
    }

    const fallbackTimer = window.setTimeout(() => {
      finish();
    }, 6000);

    return () => {
      isDestroyed = true;
      clearTimeout(fallbackTimer);
      window.removeEventListener('resize', recomputePoints);
      if (colorCycleInterval) clearInterval(colorCycleInterval);
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      if (timer3) clearTimeout(timer3);
      if (timer4) clearTimeout(timer4);
      if (animRafId !== null) cancelAnimationFrame(animRafId);
    };
  }, [onComplete]);

  if (isDone) return null;

  return (
    <>
      <style>{`
        .aurelia-loader-root {
          --cream: #000;
          --gold: #d4af37;
        }

        /* Brand container: perfectly centered on screen */
        .aurelia-brand {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          font-weight: 700;
          font-size: clamp(36px, 9vw, 96px);
          line-height: 1;
          color: var(--gold);
          user-select: none;
          z-index: 10;
          /* Center origin shift so initial 'A' starts centered in the screen */
          transform: translate3d(var(--center-shift, 0px), 0, 0);
          transition: transform 1s cubic-bezier(.65, 0, .25, 1), opacity .45s ease, filter .45s ease;
        }

        /* 
           When opening: the logo shifts smoothly so the full word "AURELIA" 
           settles right in the absolute center of the viewport
        */
        .aurelia-brand-wrapper {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .aurelia-logo-box {
          display: flex;
          align-items: center;
          flex: none;
        }

        .aurelia-logo {
          transition: fill .6s ease;
          height: .72em;
          width: auto;
          display: block;
          flex: none;
          overflow: visible;
          will-change: transform, opacity;
          transform: translateZ(0);
        }

        .aurelia-logo [data-c] {
          fill: #ff808f;
          transition: fill .6s ease;
        }

        /* "URELIA" expands smoothly from the 'A' */
        .aurelia-rest {
          display: block;
          overflow: hidden;
          max-width: 0;
          white-space: nowrap;
          transition: max-width .7s cubic-bezier(.65, 0, .25, 1);
          padding: .5em 0;
          margin: -.5em 0;
          will-change: max-width;
        }

        .aurelia-rest span {
          display: inline-block;
          opacity: 0;
          transform: translateX(-.9em);
          letter-spacing: .06em;
          transition: transform .65s cubic-bezier(.2, .8, .2, 1), opacity .45s ease;
          transition-delay: calc(var(--i) * 50ms + 90ms);
          will-change: transform, opacity;
        }

        .aurelia-rest span:first-child {
          margin-left: .06em;
        }

        .aurelia-brand.open .aurelia-rest span {
          opacity: 1;
          transform: none;
        }

        /* 
           EXACT ORIGINAL GOLD SHIMMER: 
           Sweeping across each letter sequentially with the genuine Aurelia gold gradient
        */
        .aurelia-brand.shine .aurelia-rest span {
          color: transparent;
          background: linear-gradient(105deg, #b8921f 0%, #d4af37 38%, #fff3b8 50%, #d4af37 62%, #b8921f 100%) 100% 0/280% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          animation: aurelia-sweep .75s ease-in-out forwards;
          animation-delay: calc(var(--i) * 45ms);
        }

        .aurelia-brand.shine .aurelia-logo {
          animation: aurelia-glow .75s ease-in-out forwards;
        }

        @keyframes aurelia-sweep {
          from { background-position: 100% 0; }
          to { background-position: 0 0; }
        }

        @keyframes aurelia-glow {
          50% { filter: brightness(1.7) drop-shadow(0 0 10px rgba(255, 220, 120, .7)); }
        }

        /* Exit: letters slide up and vanish one after another */
        .aurelia-brand.out .aurelia-rest span {
          opacity: 0;
          transform: translateY(-1.15em);
          transition: transform .45s cubic-bezier(.6, 0, .9, .4), opacity .35s ease .05s;
          transition-delay: calc(var(--i) * 40ms + 40ms), calc(var(--i) * 40ms + 90ms);
        }

        .aurelia-brand.out .aurelia-logo {
          opacity: 0;
          transform: translateY(-.6em) scale(.8);
          filter: blur(4px);
          transition: transform .45s cubic-bezier(.6, 0, .9, .4), opacity .35s ease, filter .35s ease;
        }

        /* Wave SVG container */
        .aurelia-wavy-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          pointer-events: none;
          shape-rendering: geometricPrecision;
          transform: translateZ(0);
          will-change: transform;
        }

        .aurelia-band {
          fill: #000;
        }
      `}</style>

      <div
        ref={containerRef}
        id="loader"
        className="aurelia-loader-root fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="aurelia-brand-wrapper">
          <div
            id="brand"
            className={`aurelia-brand ${isOpen ? 'open' : ''} ${isShine ? 'shine' : ''} ${isOut ? 'out' : ''}`}
          >
            {/* Logo 'A' - Initial state stands exactly in the middle */}
            <div className="aurelia-logo-box">
              <svg
                ref={logoRef}
                id="logo"
                className="aurelia-logo"
                viewBox="2 6 52 46"
              >
                <polygon data-c points="3,52 15,52 33,6 23,6" />
                <polygon data-c points="53,52 41,52 23,6 33,6" />
                <rect data-c x="16" y="33" width="24" height="9" rx="2" />
              </svg>
            </div>

            {/* Letters: URELIA - expands out naturally */}
            <span ref={restRef} id="rest" className="aurelia-rest">
              <span style={{ ['--i' as string]: 0 }}>U</span>
              <span style={{ ['--i' as string]: 1 }}>R</span>
              <span style={{ ['--i' as string]: 2 }}>E</span>
              <span style={{ ['--i' as string]: 3 }}>L</span>
              <span style={{ ['--i' as string]: 4 }}>I</span>
              <span style={{ ['--i' as string]: 5 }}>A</span>
            </span>
          </div>
        </div>

        {/* Optimized SVG Wave with precomputed coordinate tables & smooth quadratic beziers */}
        <svg
          ref={waveSvgRef}
          id="wave"
          className="aurelia-wavy-svg"
          preserveAspectRatio="none"
        >
          <path ref={bandRef} id="band" className="aurelia-band" />
        </svg>
      </div>
    </>
  );
};
