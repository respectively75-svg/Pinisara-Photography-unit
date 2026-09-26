import React, { useState } from 'react';
import { Maximize2, ChevronLeft, ChevronRight, Camera, Smartphone, Calendar, BookOpen } from 'lucide-react';
import { Photo } from '../types';
import { INITIAL_PHOTOS } from '../data/mockData';
import { ScrollParallaxReveal } from './ParallaxAndScroll';

function formatCaptureDate(dateStr: string): string {
  if (!dateStr) return '';
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

interface SpineCarouselSectionProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
}

interface SpineVolume {
  id: string;
  volumeNumber: string;
  spineTitle: string;
  author: string;
  heightClass: string;
  spineBgClass: string;
  spineTextClass: string;
  tiltClass?: string;
  photo: Photo;
}

export const SpineCarouselSection: React.FC<SpineCarouselSectionProps> = ({
  photos,
  onSelectPhoto
}) => {
  const sourcePhotos = photos.length > 0 ? photos : INITIAL_PHOTOS;
  const [activeIndex, setActiveIndex] = useState<number>(Math.min(4, Math.max(0, sourcePhotos.length - 1)));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const spinePalette = [
    {
      bg: 'bg-[#E8B4D4] dark:bg-[#4A253B]',
      text: 'text-stone-900 dark:text-pink-100',
      h: 'h-[370px] sm:h-[420px]'
    },
    {
      bg: 'bg-[#1D7848] dark:bg-[#134E30]',
      text: 'text-white',
      h: 'h-[395px] sm:h-[440px]'
    },
    {
      bg: 'bg-[#F0EFEA] dark:bg-[#242422]',
      text: 'text-emerald-700 dark:text-emerald-400',
      h: 'h-[415px] sm:h-[465px]'
    },
    {
      bg: 'bg-[#2C448E] dark:bg-[#1E2F63]',
      text: 'text-white',
      h: 'h-[385px] sm:h-[430px]'
    },
    {
      bg: 'bg-[#F3C63B] dark:bg-[#8A6D14]',
      text: 'text-stone-950 dark:text-amber-100',
      h: 'h-[405px] sm:h-[455px]'
    },
    {
      bg: 'bg-[#364F9C] dark:bg-[#1B2B5E]',
      text: 'text-white',
      h: 'h-[420px] sm:h-[470px]'
    },
    {
      bg: 'bg-[#D93829] dark:bg-[#7D1E16]',
      text: 'text-white',
      h: 'h-[430px] sm:h-[480px]',
      tilt: '-rotate-[1.5deg]'
    },
    {
      bg: 'bg-[#DCDCDC] dark:bg-[#2D2D2B]',
      text: 'text-stone-900 dark:text-stone-100',
      h: 'h-[395px] sm:h-[445px]'
    },
    {
      bg: 'bg-[#EAEAEA] dark:bg-[#1F1F1D]',
      text: 'text-stone-900 dark:text-stone-200',
      h: 'h-[385px] sm:h-[435px]'
    },
    {
      bg: 'bg-[#F2C94C] dark:bg-[#7A6112]',
      text: 'text-stone-900 dark:text-amber-100',
      h: 'h-[415px] sm:h-[465px]'
    },
    {
      bg: 'bg-[#212936] dark:bg-[#141923]',
      text: 'text-white',
      h: 'h-[365px] sm:h-[410px]',
      tilt: '-rotate-[2deg]'
    }
  ];

  const volumes: SpineVolume[] = Array.from({
    length: Math.min(11, Math.max(sourcePhotos.length, 8))
  }).map((_, idx) => {
    const photo = sourcePhotos[idx % sourcePhotos.length];
    const style = spinePalette[idx % spinePalette.length];
    return {
      id: `vol-${idx}-${photo.id}`,
      volumeNumber: `VOL. 0${idx + 1}`,
      spineTitle: photo.title.split(':')[0].toUpperCase(),
      author: photo.photographerName.toUpperCase(),
      heightClass: style.h,
      spineBgClass: style.bg,
      spineTextClass: style.text,
      tiltClass: style.tilt,
      photo
    };
  });

  const safeActiveIndex = Math.min(activeIndex, volumes.length - 1);

  const handlePrevSpine = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : volumes.length - 1));
  };

  const handleNextSpine = () => {
    setActiveIndex((prev) => (prev < volumes.length - 1 ? prev + 1 : 0));
  };

  return (
    <section
      id="spine-carousel-section"
      className="w-full bg-[#F7F6F2] dark:bg-[#0B0C0A] text-stone-900 dark:text-stone-100 py-20 sm:py-28 px-4 sm:px-8 border-t border-b border-stone-200/80 dark:border-white/10 overflow-hidden select-none transition-colors duration-700"
    >
      <ScrollParallaxReveal speed={0.03} className="max-w-7xl mx-auto flex flex-col justify-between min-h-[680px] space-y-12">
        {/* Top Editorial Bar: ARCHIVE | MONOGRAPH BOOKSHELF | QUICK JUMP & ARROWS */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>ARCHIVE · PINISARA BOOKSHELF</span>
          </div>

          <div className="text-center space-y-2">
            <span className="font-sans text-xs sm:text-sm uppercase tracking-[0.2em] text-stone-700 dark:text-stone-300 block">
              MONOGRAPH BOOKSHELF · CHAPTER 4
            </span>
            <h2 className="font-source-serif font-light uppercase text-4xl sm:text-6xl lg:text-[4.5rem] tracking-[-0.02em] leading-[0.94] text-stone-900 dark:text-white">
              <span className="block">UPCOMING</span>
              <span className="block">RELEASES</span>
            </h2>
            <p className="text-xs font-mono text-stone-500 dark:text-stone-400 pt-1">
              Pinnawala Central College · Click or Hover any Monograph Spine on the Bookshelf to Unfold 4K Plate
            </p>
          </div>

          {/* Right Chapter / Quick Jump Index + Prev/Next Spine Controls */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={handlePrevSpine}
              className="w-7 h-7 rounded-full border border-stone-300 dark:border-white/20 flex items-center justify-center hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 active:scale-90"
              title="Previous Monograph Volume"
              aria-label="Previous volume"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {[1, 2, 3, 4, 5].map((num) => {
              const targetIdx = Math.min((num - 1) * 2 + 1, volumes.length - 1);
              const isSelected = safeActiveIndex === targetIdx;
              return (
                <button
                  type="button"
                  key={num}
                  onClick={() => setActiveIndex(targetIdx)}
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 ${
                    isSelected
                      ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 font-bold scale-105'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {num}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleNextSpine}
              className="w-7 h-7 rounded-full border border-stone-300 dark:border-white/20 flex items-center justify-center hover:bg-stone-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 active:scale-90"
              title="Next Monograph Volume"
              aria-label="Next volume"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Horizontal Spine-to-Cover Bookshelf with Silky Smooth Spring Unfolding */}
        <div className="w-full overflow-x-auto pb-3 no-scrollbar">
          <div className="min-w-[760px] flex items-end justify-center gap-2 sm:gap-3 pt-10 px-4 border-b-2 border-stone-300 dark:border-white/20">
            {volumes.map((vol, idx) => {
              const isExpanded = safeActiveIndex === idx;
              const isHovered = hoveredIndex === idx;
              const isMobileCamera =
                vol.photo.camera.includes('iPhone') || vol.photo.camera.includes('Samsung');

              return (
                <div
                  key={vol.id}
                  onClick={() => setActiveIndex(idx)}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    willChange: 'width, transform',
                    transition:
                      'width 750ms cubic-bezier(0.16, 1, 0.3, 1), height 750ms cubic-bezier(0.16, 1, 0.3, 1), transform 550ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 550ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  className={`relative cursor-pointer shrink-0 shadow-2xl overflow-hidden ${
                    isExpanded
                      ? 'w-76 sm:w-92 lg:w-[410px] h-[420px] sm:h-[470px] z-20 rotate-0 translate-y-0 rounded-t-md'
                      : `w-12 sm:w-14 lg:w-16 ${vol.heightClass} ${vol.spineBgClass} ${vol.spineTextClass} ${
                          vol.tiltClass || ''
                        } ${isHovered ? '-translate-y-3.5 scale-[1.02]' : 'translate-y-0'} rounded-t-sm z-10`
                  }`}
                >
                  {/* COLLAPSED VERTICAL BOOK SPINE VIEW */}
                  <div
                    style={{
                      transition: 'opacity 450ms cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    className={`absolute inset-0 p-2.5 flex flex-col items-center justify-between ${
                      isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    }`}
                  >
                    {/* Top Volume Code */}
                    <span className="font-mono text-[9px] tracking-tighter opacity-75">
                      0{idx + 1}
                    </span>

                    {/* Rotated Vertical Spine Title */}
                    <div
                      style={{ writingMode: 'vertical-rl' }}
                      className="my-auto font-sans font-bold text-xs sm:text-sm tracking-[0.14em] uppercase truncate max-h-[250px] rotate-180"
                    >
                      {vol.spineTitle}
                    </div>

                    {/* Bottom Author Initials */}
                    <div
                      style={{ writingMode: 'vertical-rl' }}
                      className="font-mono text-[9px] uppercase tracking-widest opacity-80 rotate-180"
                    >
                      {vol.author.split(' ')[0]}
                    </div>

                    {/* Subtle Book Spine Crease Highlights */}
                    <div className="absolute inset-y-0 left-1 w-[1px] bg-white/30 pointer-events-none" />
                    <div className="absolute inset-y-0 right-1 w-[1px] bg-black/20 pointer-events-none" />
                  </div>

                  {/* EXPANDED FULL MONOGRAPH COVER VIEW */}
                  <div
                    style={{
                      transition:
                        'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 750ms cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    className={`absolute inset-0 bg-stone-900 text-white flex flex-col justify-between ${
                      isExpanded
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-105 pointer-events-none'
                    }`}
                  >
                    {/* Full Cover High-Resolution Image */}
                    <img
                      src={vol.photo.originalUrl}
                      alt={vol.photo.title}
                      loading="lazy"
                      decoding="async"
                      style={{
                        objectFit: vol.photo.objectFit || 'cover',
                        objectPosition: vol.photo.objectPosition || '50% 50%',
                        transition: 'transform 1100ms cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                      className="absolute inset-0 w-full h-full brightness-95 hover:scale-105"
                    />

                    {/* Editorial Book Cover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/45 pointer-events-none" />

                    {/* Book Spine Left Binding Shadow */}
                    <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/70 via-white/15 to-transparent pointer-events-none" />

                    {/* Top Monograph Header */}
                    <div className="relative z-10 p-5 sm:p-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-stone-200 border-b border-white/15">
                      <span>{vol.volumeNumber} · PINISARA MONOGRAPH</span>
                      <span>f/ {vol.photo.settings || '1/1000s · f/4.0'}</span>
                    </div>

                    {/* Center / Bottom Monograph Cover Typography + Camera & Date */}
                    <div className="relative z-10 p-5 sm:p-7 space-y-3 mt-auto">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded bg-emerald-600/90 text-white font-mono text-[10px] uppercase tracking-wider">
                          {vol.photo.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] font-mono text-stone-200">
                          {isMobileCamera ? (
                            <Smartphone className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Camera className="w-3 h-3 text-emerald-400" />
                          )}
                          <span>{vol.photo.camera}</span>
                          <span className="opacity-50">·</span>
                          <Calendar className="w-3 h-3 text-emerald-400" />
                          <span>{formatCaptureDate(vol.photo.dateTaken)}</span>
                        </span>
                      </div>

                      <h3 className="font-source-serif font-normal text-2xl sm:text-3xl text-white leading-tight">
                        {vol.photo.title}
                      </h3>

                      <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                        {vol.photo.description}
                      </p>

                      <div className="pt-3 border-t border-white/20 flex items-center justify-between">
                        <div className="font-mono text-[11px] text-emerald-300 truncate pr-2">
                          {vol.photo.photographerName}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPhoto(vol.photo);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-stone-950 font-sans text-xs font-semibold hover:bg-emerald-400 transition-colors shrink-0"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Inspect 4K</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollParallaxReveal>
    </section>
  );
};
