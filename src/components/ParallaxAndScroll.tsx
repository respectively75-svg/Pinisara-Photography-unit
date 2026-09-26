import React, { useEffect, useRef, useState } from 'react';

interface SmoothScrollControllerProps {
  children?: React.ReactNode;
}

/**
 * Velocity-based inertia dampening function.
 * Uses frame-rate-independent exponential decay `v(t + dt) = v(t) * exp(-lambda(v) * dt)`
 * so 60Hz, 120Hz ProMotion, 144Hz, and 240Hz displays experience identical physical momentum decay.
 *
 * @param velocityPxPerSec Current momentum velocity in pixels/second
 * @param dtSeconds Frame delta time in seconds (`(now - lastFrameTime) / 1000`)
 * @returns Dampened velocity in pixels/second and remaining momentum displacement
 */
export function applyVelocityInertiaDampening(
  velocityPxPerSec: number,
  dtSeconds: number
): { nextVelocity: number; stepDisplacement: number; remainingMomentum: number } {
  const absVel = Math.abs(velocityPxPerSec);
  if (absVel < 1.5 || dtSeconds <= 0) {
    return { nextVelocity: 0, stepDisplacement: 0, remainingMomentum: 0 };
  }

  // Velocity-adaptive decay constant (1/s):
  // High-velocity flicks coast longer (lower lambda), while low velocities dampen crisply to rest
  const MAX_REF_VELOCITY = 2800; // px/s
  const BASE_DECAY_LAMBDA = 4.8; // 1/s at high speed
  const LOW_SPEED_DAMPING_BOOST = 4.2; // extra damping as velocity approaches rest

  const normalizedSpeed = Math.min(absVel / MAX_REF_VELOCITY, 1);
  const dynamicLambda = BASE_DECAY_LAMBDA + (1 - normalizedSpeed) * LOW_SPEED_DAMPING_BOOST;

  // Frame-rate-independent exponential decay factor
  const decayFactor = Math.exp(-dynamicLambda * dtSeconds);
  const nextVelocity = velocityPxPerSec * decayFactor;

  // Exact analytical integral of v(t) * exp(-lambda * t) over [0, dtSeconds]
  const stepDisplacement = ((velocityPxPerSec - nextVelocity) / dynamicLambda);

  // Remaining total momentum distance from current velocity to 0 (`v / lambda`)
  const remainingMomentum = nextVelocity / dynamicLambda;

  return {
    nextVelocity: Math.abs(nextVelocity) < 1.5 ? 0 : nextVelocity,
    stepDisplacement,
    remainingMomentum
  };
}

/**
 * GPU-Accelerated SmoothScrollController with Velocity-Based Inertia Dampening:
 * - Samples scroll velocity in pixels/second using high-precision frame timestamps so behavior is identical on 60Hz, 120Hz, and 144Hz+ displays.
 * - When the user stops scrolling, calculates the remaining momentum from the final scroll velocity and uses `requestAnimationFrame` to apply exponential decay via `applyVelocityInertiaDampening`.
 * - Applies `will-change: transform` and GPU-composited `translate3d` to `#smooth-scroll-container` and automatically sleeps when momentum reaches zero.
 */
export const SmoothScrollController: React.FC<SmoothScrollControllerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getContainer = () =>
      containerRef.current ||
      (document.getElementById('smooth-scroll-container') as HTMLDivElement | null);

    const initialContainer = getContainer();
    if (initialContainer) {
      initialContainer.style.willChange = 'transform';
      initialContainer.style.transform = 'translate3d(0, 0px, 0)';
    }

    let lastScrollY = window.scrollY;
    let velocityPxPerSec = 0;
    let finalReleaseVelocity = 0;
    let remainingMomentumPx = 0;
    let driftOffset = 0;
    let lastAppliedDrift = 0;
    let isScrollingActively = false;
    let isPointerTouching = false;
    let lastTouchY = 0;
    let lastInputTimestamp = 0;
    let lastFrameTime = performance.now();
    let rafId: number | null = null;

    // Time window (ms) without scroll events before entering the post-scroll inertia decay phase
    const SCROLL_STOP_THRESHOLD_MS = 42;
    // Maximum visual GPU cushion displacement (px)
    const MAX_DRIFT_PX = 16;

    const startPhysicsLoop = () => {
      if (rafId !== null) return;
      lastFrameTime = performance.now();
      lastScrollY = window.scrollY;
      rafId = requestAnimationFrame(physicsLoop);
    };

    const physicsLoop = (now: number) => {
      // Clamp dt to [0.001s, 0.05s] for consistent behavior across 60Hz–240Hz and background tab resume
      const dt = Math.min(Math.max((now - lastFrameTime) / 1000, 0.001), 0.05);
      lastFrameTime = now;

      const currentScrollY = window.scrollY;
      const scrollDeltaPx = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      const timeSinceLastInput = now - lastInputTimestamp;

      if (Math.abs(scrollDeltaPx) > 0.05) {
        // Active scrolling phase: compute instantaneous velocity in px/s
        const instantVelocity = scrollDeltaPx / dt;
        // Frame-rate-independent exponential smoothing (tau = 28ms)
        const smoothingAlpha = Math.exp(-dt / 0.028);
        velocityPxPerSec =
          velocityPxPerSec * smoothingAlpha + instantVelocity * (1 - smoothingAlpha);

        isScrollingActively = true;
        finalReleaseVelocity = velocityPxPerSec;

        // Calculate live remaining momentum preview from current velocity
        const { remainingMomentum } = applyVelocityInertiaDampening(velocityPxPerSec, dt);
        remainingMomentumPx = remainingMomentum;
      } else if (isScrollingActively && timeSinceLastInput >= SCROLL_STOP_THRESHOLD_MS && !isPointerTouching) {
        // User just stopped scrolling: lock in final scroll velocity and initial remaining momentum
        isScrollingActively = false;
        const { nextVelocity, remainingMomentum } = applyVelocityInertiaDampening(
          finalReleaseVelocity,
          dt
        );
        velocityPxPerSec = nextVelocity;
        remainingMomentumPx = remainingMomentum;
      } else if (!isScrollingActively) {
        // Post-scroll inertia coast phase: apply exponential decay on every rAF tick
        const { nextVelocity, remainingMomentum } = applyVelocityInertiaDampening(
          velocityPxPerSec,
          dt
        );
        velocityPxPerSec = nextVelocity;
        remainingMomentumPx = remainingMomentum;
      }

      // Convert remaining momentum into a bounded, spring-smoothed GPU translate3d offset
      const rawTargetDrift = Math.max(
        -MAX_DRIFT_PX,
        Math.min(MAX_DRIFT_PX, -remainingMomentumPx * 0.045)
      );

      // Frame-rate-independent spring interpolation toward target drift
      const springAlpha = 1 - Math.exp(-18 * dt);
      driftOffset += (rawTargetDrift - driftOffset) * springAlpha;

      if (Math.abs(driftOffset) < 0.03 && Math.abs(velocityPxPerSec) === 0) {
        driftOffset = 0;
        remainingMomentumPx = 0;
      }

      const roundedDrift = Math.round(driftOffset * 100) / 100;
      if (roundedDrift !== lastAppliedDrift) {
        lastAppliedDrift = roundedDrift;
        const container = getContainer();
        if (container) {
          container.style.transform = `translate3d(0, ${roundedDrift}px, 0)`;
        }
      }

      if (velocityPxPerSec !== 0 || driftOffset !== 0 || isPointerTouching) {
        rafId = requestAnimationFrame(physicsLoop);
      } else {
        rafId = null;
      }
    };

    const onScrollOrWheel = () => {
      lastInputTimestamp = performance.now();
      if (rafId === null) {
        startPhysicsLoop();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isPointerTouching = true;
        lastTouchY = e.touches[0].clientY;
        lastInputTimestamp = performance.now();
        startPhysicsLoop();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isPointerTouching || e.touches.length === 0) return;
      const now = performance.now();
      const dtTouch = Math.max((now - lastInputTimestamp) / 1000, 0.004);
      const currentTouchY = e.touches[0].clientY;
      const deltaY = lastTouchY - currentTouchY;
      lastTouchY = currentTouchY;
      lastInputTimestamp = now;

      const touchInstantVel = deltaY / dtTouch;
      velocityPxPerSec = velocityPxPerSec * 0.55 + touchInstantVel * 0.45;
      finalReleaseVelocity = velocityPxPerSec;
      startPhysicsLoop();
    };

    const onTouchEnd = () => {
      isPointerTouching = false;
      isScrollingActively = false;
      lastInputTimestamp = performance.now();
      if (Math.abs(finalReleaseVelocity) > 10) {
        velocityPxPerSec = finalReleaseVelocity;
        startPhysicsLoop();
      }
    };

    window.addEventListener('scroll', onScrollOrWheel, { passive: true });
    window.addEventListener('wheel', onScrollOrWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScrollOrWheel);
      window.removeEventListener('wheel', onScrollOrWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      const container = getContainer();
      if (container) {
        container.style.transform = 'translate3d(0, 0px, 0)';
      }
    };
  }, []);

  if (!children) return null;

  return (
    <div
      id="smooth-scroll-container"
      ref={containerRef}
      style={{ willChange: 'transform' }}
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </div>
  );
};

interface CursorParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  intensity?: number;
  tiltIntensity?: number;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * Interactive Cursor Parallax & Optical Depth Wrapper:
 * Uses direct DOM ref transforms inside requestAnimationFrame (zero React re-renders on mousemove).
 */
export const CursorParallaxImage: React.FC<CursorParallaxImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  intensity = 16,
  tiltIntensity = 3,
  children,
  onClick,
  onMouseMove,
  onMouseEnter,
  onMouseLeave
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onMouseMove) onMouseMove(e);
    const el = containerRef.current;
    if (!el) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = (clientX - rect.left) / rect.width - 0.5;
      const ny = (clientY - rect.top) / rect.height - 0.5;

      const x = (-nx * intensity).toFixed(1);
      const y = (-ny * intensity).toFixed(1);
      const rx = (-ny * tiltIntensity).toFixed(2);
      const ry = (nx * tiltIntensity).toFixed(2);

      if (tiltRef.current) {
        tiltRef.current.style.transition = 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)';
        tiltRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
      if (imgRef.current) {
        imgRef.current.style.transition = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)';
        imgRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.04)`;
      }
    });
  };

  const handleLeave = () => {
    if (onMouseLeave) onMouseLeave();
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    if (tiltRef.current) {
      tiltRef.current.style.transition = 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)';
      tiltRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
    if (imgRef.current) {
      imgRef.current.style.transition = 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)';
      imgRef.current.style.transform = 'translate3d(0px, 0px, 0) scale(1.01)';
    }
  };

  const handleEnter = () => {
    if (onMouseEnter) onMouseEnter();
  };

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ perspective: '1200px' }}
      className={`relative overflow-hidden ${containerClassName}`}
    >
      <div
        ref={tiltRef}
        style={{
          willChange: 'transform',
          transform: 'rotateX(0deg) rotateY(0deg)'
        }}
        className="w-full h-full relative"
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{
            willChange: 'transform',
            transform: 'translate3d(0px, 0px, 0) scale(1.01)'
          }}
          className={`w-full h-full object-cover ${className}`}
        />
        {children}
      </div>
    </div>
  );
};

interface ScrollParallaxRevealProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

/**
 * GPU-Composited Scroll Reveal Wrapper
 * Uses IntersectionObserver + pure opacity & translate3d (no per-frame blur filters) for 120fps scrolling.
 */
export const ScrollParallaxReveal: React.FC<ScrollParallaxRevealProps> = ({
  children,
  className = ''
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -10px 0px' }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        willChange: isVisible ? 'auto' : 'transform, opacity',
        transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, 18px, 0)',
        opacity: isVisible ? 1 : 0,
        transition:
          'opacity 600ms cubic-bezier(0.22, 1, 0.36, 1), transform 600ms cubic-bezier(0.22, 1, 0.36, 1)'
      }}
      className={className}
    >
      {children}
    </div>
  );
};
