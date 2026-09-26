import React, { useState } from 'react';
import { Maximize2, Plus, ArrowDown, Camera, Smartphone } from 'lucide-react';
import { Photo } from '../types';
import { CursorParallaxImage, ScrollParallaxReveal } from './ParallaxAndScroll';

interface SeamlessPortalSectionProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
  onTransitionToNextSection?: () => void;
}

export const SeamlessPortalSection: React.FC<SeamlessPortalSectionProps> = ({
  photos,
  onSelectPhoto,
  onTransitionToNextSection
}) => {
  const [activeStudioTab, setActiveStudioTab] = useState<'ceremonial' | 'athletics' | 'broadcast'>('ceremonial');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isPortalExpanding, setIsPortalExpanding] = useState<boolean>(false);

  const studioModes = {
    ceremonial: {
      watermark: 'Assemblies',
      subtitle: 'Pinnawala Central College · Morning Assembly & Pirith',
      description:
        'No movie-set rigs here—just Hasaranga and Udula standing near the quadrangle steps with a Canon DSLR and a phone, trying to get clear shots of our friends and teachers.',
      photo: photos[0] || photos[1],
      leftPreview: photos[1]?.thumbnailUrl,
      rightPreview: photos[2]?.thumbnailUrl,
      specs: 'Shot on Canon Kiss F & Samsung S20 Ultra'
    },
    athletics: {
      watermark: 'Sports',
      subtitle: 'Pinnawala Central College · Big Match & Sports Meet',
      description:
        'Standing out in the sun by the boundary rope with our entry-level Canon 2000D and phones to catch wickets, races, and team celebrations.',
      photo: photos[8] || photos[0],
      leftPreview: photos[0]?.thumbnailUrl,
      rightPreview: photos[6]?.thumbnailUrl,
      specs: 'Shot on Canon 2000D · Handheld'
    },
    broadcast: {
      watermark: 'Campus Life',
      subtitle: 'Pinisara Photography · Morning Radio & Prefect Polls',
      description:
        'Quick candid photos taken on Sayul’s iPhone 13 inside the school radio room and during student voting—simple, real school memories.',
      photo: photos[6] || photos[4] || photos[0],
      leftPreview: photos[4]?.thumbnailUrl,
      rightPreview: photos[0]?.thumbnailUrl,
      specs: 'Shot on iPhone 13 · Natural Light'
    }
  };

  const currentStudio = studioModes[activeStudioTab];

  const handlePortalJump = () => {
    setIsPortalExpanding(true);
    setTimeout(() => {
      if (onTransitionToNextSection) {
        onTransitionToNextSection();
      } else {
        const nextEl = document.getElementById('creative-output-section');
        if (nextEl) nextEl.scrollIntoView({ behavior: 'smooth' });
      }
      setTimeout(() => setIsPortalExpanding(false), 1100);
    }, 850);
  };

  return (
    <section
      id="seamless-portal-section"
      className="relative w-full bg-stone-950 dark:bg-black text-white overflow-hidden py-24 sm:py-32 select-none transition-all duration-1200"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-28 sm:space-y-36">
        
        {/* STAGE 1: UNCLIPPED FULL-FRAME VIEWFINDER SHOWCASE (Replaced Audi rings & removed all clipping) */}
        <ScrollParallaxReveal speed={0.05} className="flex flex-col items-center text-center space-y-12">
          <div className="space-y-4 max-w-2xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70 block">
              Pinisara Photography · Pinnawala Central College
            </span>
            <h2 className="font-sans font-normal text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.06]">
              Real school moments,
              <br />
              shot on cameras & phones.
            </h2>
          </div>

          {/* Unclipped Panoramic Frame with Frosted Glass Viewfinder Emblem & Cursor Parallax */}
          <div
            onClick={handlePortalJump}
            className={`relative w-full max-w-5xl aspect-21/9 rounded-3xl overflow-hidden border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,0.85)] cursor-pointer group transition-all duration-1500 cubic-bezier(0.16, 1, 0.3, 1) ${
              isPortalExpanding ? 'scale-[1.18] blur-xl opacity-0' : 'scale-100 blur-0 opacity-100'
            }`}
            title="Click to glide smoothly to Our Creative Output"
          >
            <CursorParallaxImage
              src={
                photos[1]?.originalUrl ||
                'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=2000&q=85'
              }
              alt="Pinisara Photography — Pinnawala Central College"
              intensity={28}
              tiltIntensity={5}
              containerClassName="w-full h-full"
            >
              {/* Subtle Vignette & Frosted Viewfinder HUD Overlay (Zero SVG Clipping) */}
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors duration-1200 pointer-events-none" />

              {/* Viewfinder Corner Brackets */}
              <div className="absolute inset-6 sm:inset-10 pointer-events-none flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-white/70" />
                  <div className="px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-[10px] font-mono uppercase tracking-widest text-white">
                    PINISARA VIEWFINDER · NO FANCY STUDIO GEAR
                  </div>
                  <div className="w-6 h-6 border-t-2 border-r-2 border-white/70" />
                </div>

                {/* Center Custom Pinisara Camera & Phone Emblem */}
                <div className="my-auto mx-auto px-6 py-4 rounded-3xl bg-black/55 backdrop-blur-2xl border border-white/25 flex items-center gap-4 shadow-2xl transition-transform duration-1200 group-hover:scale-105">
                  <div className="w-11 h-11 rounded-2xl bg-white text-black flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="font-sans font-bold text-sm sm:text-base text-white block tracking-tight">
                      Pinisara Photography Society
                    </span>
                    <span className="font-mono text-[11px] text-white/75 block">
                      2 Entry-Level DSLRs · 2 Smartphones · Pure Passion
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 text-white flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-white/70" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/80 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full">
                    Move cursor for parallax · Click to enter Works
                  </span>
                  <div className="w-6 h-6 border-b-2 border-r-2 border-white/70" />
                </div>
              </div>
            </CursorParallaxImage>
          </div>

          <button
            onClick={handlePortalJump}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/10 hover:bg-white hover:text-black backdrop-blur-xl border border-white/20 text-xs font-mono uppercase tracking-widest text-white transition-all duration-1000"
          >
            <span>Continue to Our Creative Output</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </button>
        </ScrollParallaxReveal>

        {/* STAGE 2: HONEST STUDENT COLLECTIVE STATEMENT + 3-COLUMN REALITY GRID */}
        <ScrollParallaxReveal speed={0.04} className="space-y-14 max-w-5xl mx-auto">
          <p className="text-center font-sans text-base sm:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed font-normal">
            We aren’t a Hollywood film crew—we’re four students at{' '}
            <span className="text-white font-semibold">Pinnawala Central College</span> walking around school events
            with our Canon cameras and phones so everyone can keep their favorite school memories.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 border border-white/20 bg-white/[0.03] backdrop-blur-2xl divide-y md:divide-y-0 md:divide-x divide-white/20">
            <div className="p-8 sm:p-10 flex flex-col justify-between min-h-[190px]">
              <span className="text-xs sm:text-sm text-white/70 font-medium">
                What We Actually Use
              </span>
              <div className="pt-8">
                <div className="font-sans font-light text-3xl sm:text-4xl text-white tracking-tight">
                  2 Cameras & 2 Phones
                </div>
                <span className="text-[11px] font-mono text-white/60 mt-1 block">
                  Canon Kiss F · 2000D · iPhone 13 · S20 Ultra
                </span>
              </div>
            </div>

            <div className="p-8 sm:p-10 flex flex-col justify-between min-h-[190px]">
              <span className="text-xs sm:text-sm text-white/70 font-medium">
                How We Edit
              </span>
              <div className="pt-8">
                <div className="font-sans font-light text-3xl sm:text-4xl text-white tracking-tight">
                  Phone & Laptop
                </div>
                <span className="text-[11px] font-mono text-white/60 mt-1 block">
                  Quick cleanups after school & homework
                </span>
              </div>
            </div>

            <div className="p-8 sm:p-10 flex flex-col justify-between min-h-[190px]">
              <span className="text-xs sm:text-sm text-white/70 font-medium">
                For Friends & Teachers
              </span>
              <div className="pt-8">
                <div className="font-sans font-light text-3xl sm:text-4xl text-white tracking-tight">
                  100% Free
                </div>
                <span className="text-[11px] font-mono text-white/60 mt-1 block">
                  Download any photo in one tap
                </span>
              </div>
            </div>
          </div>
        </ScrollParallaxReveal>

        {/* STAGE 3: INTERACTIVE STUDIO STAGE WITH CURSOR PARALLAX & SLOWER BLUR TRANSITIONS */}
        <ScrollParallaxReveal speed={0.03}>
          <div className="relative rounded-3xl border border-white/20 bg-black/80 backdrop-blur-2xl overflow-hidden min-h-[540px] sm:min-h-[640px] flex flex-col justify-between p-6 sm:p-12">
            
            <div className="relative z-20 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h3 className="font-sans font-light text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-none transition-all duration-1200">
                  {currentStudio.watermark}
                </h3>
                <p className="mt-2 font-mono text-xs text-white/70 uppercase tracking-widest">
                  {currentStudio.subtitle}
                </p>
              </div>

              <span className="font-mono text-[11px] text-white bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/20 self-start">
                {currentStudio.specs}
              </span>
            </div>

            <div className="relative my-6 sm:my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end z-20">
              <div className="lg:col-span-8 relative aspect-16/10 rounded-2xl overflow-hidden cursor-pointer border border-white/20 shadow-2xl">
                {currentStudio.photo && (
                  <CursorParallaxImage
                    src={currentStudio.photo.originalUrl}
                    alt={currentStudio.photo.title}
                    intensity={26}
                    tiltIntensity={5}
                    containerClassName="w-full h-full"
                    onClick={() => currentStudio.photo && onSelectPhoto(currentStudio.photo)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white font-mono pointer-events-none">
                      <span>{currentStudio.photo.title}</span>
                      <span className="underline">View Full Photo →</span>
                    </div>
                  </CursorParallaxImage>
                )}
              </div>

              <div className="lg:col-span-4 space-y-4">
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-medium">
                  {currentStudio.description}
                </p>

                <div className="flex items-center gap-2 pt-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`h-[2px] transition-all duration-1000 ${
                        activeSlideIndex === idx ? 'w-12 bg-white' : 'w-6 bg-white/25 hover:bg-white/50'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-20 pt-4 border-t border-white/15 flex items-center justify-between gap-4">
              <button
                onClick={() => currentStudio.photo && onSelectPhoto(currentStudio.photo)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-black backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-all duration-700"
                title="Inspect Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <div className="flex items-center rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 p-1">
                <button
                  onClick={() => setActiveStudioTab('ceremonial')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-900 ${
                    activeStudioTab === 'ceremonial'
                      ? 'bg-white text-black font-semibold'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  {activeStudioTab !== 'ceremonial' && currentStudio.leftPreview && (
                    <img src={currentStudio.leftPreview} alt="" className="w-5 h-4 rounded-sm object-cover hidden sm:block" />
                  )}
                  <span>Assemblies</span>
                </button>

                <button
                  onClick={() => setActiveStudioTab('athletics')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-900 ${
                    activeStudioTab === 'athletics'
                      ? 'bg-white text-black font-semibold'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  <span>Sports</span>
                </button>

                <button
                  onClick={() => setActiveStudioTab('broadcast')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-900 ${
                    activeStudioTab === 'broadcast'
                      ? 'bg-white text-black font-semibold'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  <span>Campus Life</span>
                  {activeStudioTab !== 'broadcast' && currentStudio.rightPreview && (
                    <img src={currentStudio.rightPreview} alt="" className="w-5 h-4 rounded-sm object-cover hidden sm:block" />
                  )}
                </button>
              </div>

              <button
                onClick={() => {
                  const keys: ('ceremonial' | 'athletics' | 'broadcast')[] = ['ceremonial', 'athletics', 'broadcast'];
                  const nextIdx = (keys.indexOf(activeStudioTab) + 1) % keys.length;
                  setActiveStudioTab(keys[nextIdx]);
                }}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-black backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-all duration-700"
                title="Cycle Category"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </ScrollParallaxReveal>

      </div>
    </section>
  );
};
