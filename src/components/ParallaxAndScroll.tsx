import React, { useEffect, useRef, useState } from 'react';

interface SmoothScrollControllerProps {
  children?: React.ReactNode;
}

type ParallaxSubscriber = (scrollY: number, viewportH: number) => boolean;

const parallaxSubscribers = new Set<ParallaxSubscriber>();
let globalLoopRafId: number | null = null;

function notifyParallaxSubscribers() {
  if (typeof window === 'undefined') return;
  const scrollY = window.scrollY;
  const viewportH = window.innerHeight || 800;
  parallaxSubscribers.forEach((fn) => {
    fn(scrollY, viewportH);
  });
}

function subscribeParallax(fn: ParallaxSubscriber) {
  parallaxSubscribers.add(fn);
  if (typeof window !== 'undefined') {
    fn(window.scrollY, window.innerHeight || 800);
  }
  return () => {
    parallaxSubscribers.delete(fn);
  };
}

/**
 * GPU-Accelerated SmoothScrollController with On-Demand requestAnimationFrame Physics Loop & Exponential Friction Decay:
 * - Uses requestAnimationFrame loops instead of traditional event-listener-based scrolling work.
 * - Applies `will-change: transform` to the container to force GPU acceleration and eliminate stuttering during the drift phase.
 * - Implements custom friction-based physics logic so scroll movement decays exponentially rather than stopping abruptly.
 * - Drives all visible ScrollParallaxReveal & CursorParallaxImage elements in a single unified rAF pass for 120fps seamless scrolling.
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
    let velocity = 0;
    let driftOffset = 0;
    let lastAppliedDrift = 0;
    let isPointerTouching = false;
    let lastTouchY = 0;
    let touchVelocity = 0;
    let lastFrameTime = performance.now();

    // Friction constants for exponential decay during the natural drift phase
    const FRICTION = 0.91;
    const EXPONENTIAL_DECAY_RATE = 6.0;

    const startPhysicsLoop = () => {
      if (globalLoopRafId !== null) return;
      lastFrameTime = performance.now();
      lastScrollY = window.scrollY;
      globalLoopRafId = requestAnimationFrame(physicsLoop);
    };

    const physicsLoop = (now: number) => {
      const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;

      const currentScrollY = window.scrollY;
      const rawDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      if (Math.abs(rawDelta) > 0.1) {
        velocity = velocity * 0.62 + rawDelta * 0.38;
      } else {
        // Exponential friction decay when user releases mouse or touch scroll
        const expFactor = Math.exp(-EXPONENTIAL_DECAY_RATE * dt) * FRICTION;
        velocity *= expFactor;
      }

      if (Math.abs(velocity) < 0.04) {
        velocity = 0;
      }

      // Smoothly interpolate GPU-accelerated sub-pixel drift offset
      const targetDrift = Math.max(-12, Math.min(12, -velocity * 0.15));
      driftOffset += (targetDrift - driftOffset) * 0.2;

      if (Math.abs(driftOffset) < 0.03 && velocity === 0) {
        driftOffset = 0;
      }

      const roundedDrift = Math.round(driftOffset * 100) / 100;
      if (roundedDrift !== lastAppliedDrift) {
        lastAppliedDrift = roundedDrift;
        const container = getContainer();
        if (container) {
          container.style.transform = `translate3d(0, ${roundedDrift}px, 0)`;
        }
      }

      // Update all visible scroll-linked parallax elements in the same rAF tick
      let anySubscriberAnimating = false;
      const viewportH = window.innerHeight || 800;
      parallaxSubscribers.forEach((fn) => {
        if (fn(currentScrollY, viewportH)) {
          anySubscriberAnimating = true;
        }
      });

      if (velocity !== 0 || driftOffset !== 0 || isPointerTouching || anySubscriberAnimating) {
        globalLoopRafId = requestAnimationFrame(physicsLoop);
      } else {
        globalLoopRafId = null;
      }
    };

    const onScrollOrWheel = () => {
      if (globalLoopRafId === null) {
        startPhysicsLoop();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isPointerTouching = true;
        lastTouchY = e.touches[0].clientY;
        touchVelocity = 0;
        startPhysicsLoop();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isPointerTouching || e.touches.length === 0) return;
      const currentTouchY = e.touches[0].clientY;
      const deltaY = lastTouchY - currentTouchY;
      lastTouchY = currentTouchY;
      touchVelocity = deltaY * 0.32;
      startPhysicsLoop();
    };

    const onTouchEnd = () => {
      isPointerTouching = false;
      if (Math.abs(touchVelocity) > 0.5) {
        velocity += touchVelocity;
        startPhysicsLoop();
      }
    };

    window.addEventListener('scroll', onScrollOrWheel, { passive: true });
    window.addEventListener('wheel', onScrollOrWheel, { passive: true });
    window.addEventListener('resize', notifyParallaxSubscribers, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    startPhysicsLoop();

    return () => {
      if (globalLoopRafId !== null) {
        cancelAnimationFrame(globalLoopRafId);
        globalLoopRafId = null;
      }
      window.removeEventListener('scroll', onScrollOrWheel);
      window.removeEventListener('wheel', onScrollOrWheel);
      window.removeEventListener('resize', notifyParallaxSubscribers);
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
  scrollParallaxIntensity?: number;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * Interactive Cursor Parallax & Seamless Windowed Scroll Parallax Wrapper:
 * - Smoothly glides the image vertically inside its frame as you scroll down the page (like the reference video).
 * - Smoothly translates and tilts the image in 3D space on cursor hover without React state re-renders.
 */
export const CursorParallaxImage: React.FC<CursorParallaxImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  intensity = 16,
  tiltIntensity = 3,
  scrollParallaxIntensity = 26,
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
  const stateRef = useRef({
    cursorX: 0,
    cursorY: 0,
    scrollYOffset: 0,
    currentScrollYOffset: 0,
    scale: 1.07
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || scrollParallaxIntensity === 0) return;

    let isIntersecting = false;

    const applyTransform = () => {
      if (!imgRef.current) return;
      const st = stateRef.current;
      const totalY = st.cursorY + st.currentScrollYOffset;
      imgRef.current.style.transform = `translate3d(${st.cursorX.toFixed(1)}px, ${totalY.toFixed(1)}px, 0) scale(${st.scale})`;
    };

    const updateScrollParallax = (_scrollY: number, viewportH: number): boolean => {
      if (!isIntersecting || !el) return false;
      const rect = el.getBoundingClientRect();
      const elementCenter = rect.top + rect.height * 0.5;
      const viewportCenter = viewportH * 0.5;
      // Normalized -1 to 1 from top to bottom of viewport
      const norm = Math.max(-1.2, Math.min(1.2, (elementCenter - viewportCenter) / (viewportH * 0.65)));
      const targetOffset = -norm * scrollParallaxIntensity;
      const st = stateRef.current;
      st.scrollYOffset = targetOffset;
      const diff = st.scrollYOffset - st.currentScrollYOffset;
      if (Math.abs(diff) > 0.08) {
        st.currentScrollYOffset += diff * 0.22;
        applyTransform();
        return true;
      }
      return false;
    };

    let unsubscribe: (() => void) | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          if (!unsubscribe) {
            unsubscribe = subscribeParallax(updateScrollParallax);
          }
        } else if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
      },
      { rootMargin: '150px 0px 150px 0px' }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (unsubscribe) unsubscribe();
    };
  }, [scrollParallaxIntensity]);

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

      const x = -nx * intensity;
      const y = -ny * intensity;
      const rx = (-ny * tiltIntensity).toFixed(2);
      const ry = (nx * tiltIntensity).toFixed(2);

      stateRef.current.cursorX = x;
      stateRef.current.cursorY = y;
      stateRef.current.scale = 1.09;

      if (tiltRef.current) {
        tiltRef.current.style.transition = 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)';
        tiltRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
      if (imgRef.current) {
        const totalY = y + stateRef.current.currentScrollYOffset;
        imgRef.current.style.transition = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)';
        imgRef.current.style.transform = `translate3d(${x.toFixed(1)}px, ${totalY.toFixed(1)}px, 0) scale(1.09)`;
      }
    });
  };

  const handleLeave = () => {
    if (onMouseLeave) onMouseLeave();
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    stateRef.current.cursorX = 0;
    stateRef.current.cursorY = 0;
    stateRef.current.scale = 1.07;

    if (tiltRef.current) {
      tiltRef.current.style.transition = 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)';
      tiltRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }
    if (imgRef.current) {
      const totalY = stateRef.current.currentScrollYOffset;
      imgRef.current.style.transition = 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)';
      imgRef.current.style.transform = `translate3d(0px, ${totalY.toFixed(1)}px, 0) scale(1.07)`;
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
            transform: 'translate3d(0px, 0px, 0) scale(1.07)'
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
 * Seamless Scroll-Linked Differential Parallax & Reveal Wrapper:
 * - Smoothly reveals items as they enter the viewport.
 * - Continuously translates items at their assigned `speed` relative to viewport scroll so staggered pairs glide past each other seamlessly like the reference video.
 */
export const ScrollParallaxReveal: React.FC<ScrollParallaxRevealProps> = ({
  children,
  speed = 0.05,
  className = ''
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const el = outerRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;

    let isIntersecting = false;
    let currentY = 0;

    const updateDifferentialGlide = (_scrollY: number, viewportH: number): boolean => {
      if (!isIntersecting || !el || !inner) return false;
      const rect = el.getBoundingClientRect();
      const elementCenter = rect.top + rect.height * 0.5;
      const viewportCenter = viewportH * 0.5;
      const targetY = Math.max(-55, Math.min(55, (elementCenter - viewportCenter) * speed));
      const diff = targetY - currentY;
      if (Math.abs(diff) > 0.08) {
        currentY += diff * 0.2;
        inner.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
        return true;
      }
      return false;
    };

    let unsubscribe: (() => void) | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (!unsubscribe && speed !== 0) {
            unsubscribe = subscribeParallax(updateDifferentialGlide);
          }
        } else if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
      },
      { threshold: 0.04, rootMargin: '120px 0px -10px 0px' }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (unsubscribe) unsubscribe();
    };
  }, [speed]);

  return (
    <div
      ref={outerRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(0, 32px, 0) scale(0.98)',
        transition:
          'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 700ms cubic-bezier(0.22, 1, 0.36, 1)'
      }}
      className={className}
    >
      <div ref={innerRef} style={{ willChange: 'transform' }} className="w-full h-full">
        {children}
      </div>
    </div>
  );
};
