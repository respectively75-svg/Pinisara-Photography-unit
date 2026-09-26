import React, { useState, useEffect } from 'react';

interface BootLoaderProps {
  onComplete: () => void;
}

export const BootLoader: React.FC<BootLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  useEffect(() => {
    let rafId: number;
    const duration = 2200; // Slower, seamless 2.2s boot sequence
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const rawRatio = Math.min(elapsed / duration, 1);
      const eased =
        rawRatio < 0.5
          ? 4 * rawRatio * rawRatio * rawRatio
          : 1 - Math.pow(-2 * rawRatio + 2, 3) / 2;

      const currentPct = Math.round(eased * 100);
      setProgress(currentPct);

      if (rawRatio < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            onComplete();
          }, 950);
        }, 220);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [onComplete]);

  return (
    <div
      id="boot-up-loader"
      className={`fixed inset-0 z-[100] bg-[#FAF9F5] dark:bg-black text-stone-900 dark:text-white flex flex-col justify-between select-none transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
        isExiting
          ? 'opacity-0 scale-[1.04] blur-2xl pointer-events-none'
          : 'opacity-100 scale-100 blur-0'
      }`}
    >
      {/* Top Center Brand Mark */}
      <div className="pt-8 sm:pt-10 px-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <span className="text-[11px] font-mono uppercase tracking-widest text-stone-400 dark:text-white/60">
          Pinnawala Central College
        </span>
        <span className="font-sans font-bold text-sm sm:text-base tracking-tight text-stone-900 dark:text-white">
          Pinisara Photography<sup className="text-[9px] ml-0.5">®</sup>
        </span>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(onComplete, 450);
          }}
          className="text-[11px] font-mono uppercase tracking-widest text-stone-400 dark:text-white/60 hover:text-stone-900 dark:hover:text-white transition-colors"
        >
          Skip →
        </button>
      </div>

      {/* Center Giant Percentage Counter + Full-Bleed 1px Horizontal Progress Line */}
      <div className="w-full my-auto flex flex-col items-center">
        <div className="pb-6 sm:pb-8 flex items-baseline justify-center">
          <span className="font-sans font-light text-7xl sm:text-8xl md:text-[7.5rem] tracking-[-0.04em] text-stone-900 dark:text-white tabular-nums leading-none">
            {progress}
          </span>
          <span className="font-sans font-light text-3xl sm:text-5xl text-stone-400 dark:text-white/60 ml-1 -translate-y-6 sm:-translate-y-8">
            %
          </span>
        </div>

        {/* Full-Width 1px Hairline Progress Bar */}
        <div className="w-full h-[1.5px] bg-stone-200 dark:bg-white/15 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 bottom-0 bg-stone-900 dark:bg-white transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Humble Student Club Readout Below Line */}
        <div className="mt-4 flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-stone-400 dark:text-white/65">
          <span>Student Photography Archive</span>
          <span>·</span>
          <span>
            {progress < 40
              ? 'Loading DSLR & Phone Shots'
              : progress < 80
              ? 'Pinnawala Central College Albums'
              : 'Ready'}
          </span>
        </div>
      </div>

      {/* Bottom Subtle Footer */}
      <div className="pb-8 px-6 text-center text-[11px] font-mono text-stone-400 dark:text-white/60 uppercase tracking-widest">
        Hasaranga Jayawardhana · Dulen Induwara · Sayul Angammana · Udula Matheesha
      </div>
    </div>
  );
};
