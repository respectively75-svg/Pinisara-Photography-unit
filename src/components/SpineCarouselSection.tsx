import React, { useState } from 'react';
import { Maximize2, ArrowUpRight } from 'lucide-react';
import { Photo } from '../types';

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
  const [activeIndex, setActiveIndex] = useState<number>(5);

  const spinePalette = [
    {
      bg: 'bg-[#E8B4D4] dark:bg-[#4A253B]',
      text: 'text-stone-900 dark:text-pink-100',
      h: 'h-[370px] sm:h-[410px]'
    },
    {
      bg: 'bg-[#1D7848] dark:bg-[#134E30]',
      text: 'text-white',
      h: 'h-[390px] sm:h-[430px]'
    },
    {
      bg: 'bg-[#F0EFEA] dark:bg-[#242422]',
      text: 'text-emerald-700 dark:text-emerald-400',
      h: 'h-[410px] sm:h-[455px]'
    },
    {
      bg: 'bg-[#2C448E] dark:bg-[#1E2F63]',
      text: 'text-white',
      h: 'h-[380px] sm:h-[420px]'
    },
    {
      bg: 'bg-[#F3C63B] dark:bg-[#8A6D14]',
      text: 'text-stone-950 dark:text-amber-100',
      h: 'h-[405px] sm:h-[445px]'
    },
    {
      bg: 'bg-[#364F9C] dark:bg-[#1B2B5E]',
      text: 'text-white',
      h: 'h-[415px] sm:h-[460px]'
    },
    {
      bg: 'bg-[#D93829] dark:bg-[#7D1E16]',
      text: 'text-white',
      h: 'h-[425px] sm:h-[470px]',
      tilt: '-rotate-[1.5deg]'
    },
    {
      bg: 'bg-[#DCDCDC] dark:bg-[#2D2D2B]',
      text: 'text-stone-900 dark:text-stone-100',
      h: 'h-[395px] sm:h-[435px]'
    },
    {
      bg: 'bg-[#EAEAEA] dark:bg-[#1F1F1D]',
      text: 'text-stone-900 dark:text-stone-200',
      h: 'h-[385px] sm:h-[425px]'
    },
    {
      bg: 'bg-[#F2C94C] dark:bg-[#7A6112]',
      text: 'text-stone-900 dark:text-amber-100',
      h: 'h-[415px] sm:h-[460px]'
    },
    {
      bg: 'bg-[#212936] dark:bg-[#141923]',
      text: 'text-white',
      h: 'h-[360px] sm:h-[395px]',
      tilt: '-rotate-[2deg]'
    },
    {
      bg: 'bg-[#3A3A3A] dark:bg-[#181818]',
      text: 'text-stone-200',
      h: 'h-[390px] sm:h-[430px]'
    }
  ];

  // Build 11 volumes from our photos array
  const volumes: SpineVolume[] = Array.from({ length: Math.min(11, Math.max(photos.length, 8)) }).map(
    (_, idx) => {
      const photo = photos[idx % photos.length];
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
    }
  );

  const activeVolume = volumes[activeIndex] || volumes[0];

  return (
    <section
      id="spine-carousel-section"
      className="w-full bg-[#F7F6F2] dark:bg-[#0B0C0A] text-stone-900 dark:text-stone-100 py-14 sm:py-24 px-4 sm:px-8 border-t border-stone-200/80 dark:border-white/10 overflow-hidden select-none transition-colors duration-500"
    >
      <div className="max-w-7xl mx-auto flex flex-col justify-between min-h-[560px] sm:min-h-[680px] space-y-8 sm:space-y-12">
        
        {/* Top Editorial Bar: Responsive on Mobile, 3-Column on Tablet/Desktop */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left">
          <div className="text-[11px] font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400">
            ARCHIVE · PINISARA
          </div>

          <div className="text-center space-y-2">
            <span className="font-sans text-xs sm:text-sm uppercase tracking-[0.2em] text-stone-700 dark:text-stone-300 block">
              CHAPTER 4
            </span>
            <h2 className="font-source-serif font-light uppercase text-4xl sm:text-6xl lg:text-[4.5rem] tracking-[-0.02em] leading-[0.94] text-stone-900 dark:text-white">
              <span className="block">UPCOMING</span>
              <span className="block">RELEASES</span>
            </h2>
            <p className="text-xs font-mono text-stone-500 dark:text-stone-400 pt-1">
              Pinnawala Central College · Tap any Monograph Spine to Unfold 4K Plate
            </p>
          </div>

          {/* Right Chapter / Quick Jump Index (1 2 3 4 5) */}
          <div className="flex items-center gap-2 font-mono text-xs">
            {[1, 2, 3, 4, 5].map((num) => {
              const targetIdx = Math.min((num - 1) * 2 + 1, volumes.length - 1);
              const isSelected = activeIndex === targetIdx;
              return (
                <button
                  key={num}
                  onClick={() => setActiveIndex(targetIdx)}
                  className={`w-7 h-7 sm:w-6 sm:h-6 rounded-md sm:rounded-none flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 font-bold'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* MOBILE VIEW (< md): Full-Width Unclipped Monograph Cover Card + Compact Unclipped Spine Shelf */}
        <div className="md:hidden space-y-5">
          {/* Compact Horizontal Spine Shelf (No left/right clipping) */}
          <div className="w-full overflow-x-auto pb-2 no-scrollbar">
            <div className="flex items-end justify-start gap-1.5 px-1 border-b border-stone-300 dark:border-white/15">
              {volumes.map((vol, idx) => {
                const isSelected = activeIndex === idx;
                return (
                  <button
                    key={vol.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`relative shrink-0 w-10 h-44 p-2 flex flex-col items-center justify-between transition-transform duration-300 overflow-hidden shadow-md ${
                      vol.spineBgClass
                    } ${vol.spineTextClass} ${
                      isSelected
                        ? '-translate-y-2 ring-2 ring-emerald-500 dark:ring-white z-20'
                        : 'opacity-80 hover:opacity-100 z-10'
                    }`}
                  >
                    <span className="font-mono text-[9px] tracking-tighter opacity-80">
                      0{idx + 1}
                    </span>
                    <div
                      style={{ writingMode: 'vertical-rl' }}
                      className="my-auto font-sans font-bold text-[10px] tracking-[0.12em] uppercase truncate max-h-[115px] rotate-180"
                    >
                      {vol.spineTitle}
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full-Width Unclipped Active Monograph Card on Phone */}
          {activeVolume && (
            <div
              onClick={() => onSelectPhoto(activeVolume.photo)}
              className="relative w-full min-h-[390px] rounded-2xl overflow-hidden bg-stone-900 text-white flex flex-col justify-between shadow-2xl border border-stone-300/30 dark:border-white/15 cursor-pointer"
            >
              <img
                src={activeVolume.photo.originalUrl}
                alt={activeVolume.photo.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/45" />

              {/* Top Monograph Header */}
              <div className="relative z-10 p-4 flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-wider text-stone-200 border-b border-white/15">
                <span className="truncate">{activeVolume.volumeNumber} · PINISARA MONOGRAPH</span>
                <span className="shrink-0">f/ {activeVolume.photo.settings}</span>
              </div>

              {/* Bottom Monograph Cover Typography (Zero Clipping) */}
              <div className="relative z-10 p-5 space-y-3 mt-auto">
                <span className="inline-block px-2.5 py-0.5 bg-emerald-600/90 text-white font-mono text-[10px] uppercase tracking-wider rounded-xs">
                  {activeVolume.photo.category} · Pinnawala Central College
                </span>

                <h3 className="font-source-serif font-normal text-2xl text-white leading-snug">
                  {activeVolume.photo.title}
                </h3>

                <p className="text-xs text-stone-200 line-clamp-2 leading-relaxed">
                  {activeVolume.photo.description}
                </p>

                <div className="pt-3 border-t border-white/20 flex items-center justify-between gap-3">
                  <div className="font-mono text-[11px] text-emerald-300 truncate">
                    {activeVolume.photo.photographerName} · {activeVolume.photo.camera}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPhoto(activeVolume.photo);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-stone-950 font-sans text-xs font-semibold shrink-0"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Inspect 4K</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DESKTOP / TABLET VIEW (md+): Interactive Horizontal Spine-to-Cover Shelf */}
        <div className="hidden md:block w-full overflow-x-auto pb-2 no-scrollbar">
          <div className="min-w-[760px] flex items-end justify-start xl:justify-center gap-2 sm:gap-3 pt-8 px-4 border-b border-stone-300 dark:border-white/15">
            {volumes.map((vol, idx) => {
              const isExpanded = activeIndex === idx;

              return (
                <div
                  key={vol.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative cursor-pointer transition-all duration-500 cubic-bezier(0.22, 1, 0.36, 1) shrink-0 shadow-xl overflow-hidden ${
                    isExpanded
                      ? 'w-80 lg:w-[390px] h-[455px] z-20 rotate-0'
                      : `w-13 lg:w-16 ${vol.heightClass} ${vol.spineBgClass} ${vol.spineTextClass} ${
                          vol.tiltClass || ''
                        } hover:-translate-y-2 z-10`
                  }`}
                >
                  {/* COLLAPSED VERTICAL BOOK SPINE VIEW */}
                  <div
                    className={`absolute inset-0 p-2.5 flex flex-col items-center justify-between transition-opacity duration-300 ${
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
                      className="my-auto font-sans font-bold text-xs sm:text-sm tracking-[0.14em] uppercase truncate max-h-[240px] rotate-180"
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

                    {/* Subtle Book Spine Crease Highlight */}
                    <div className="absolute inset-y-0 left-1 w-[1px] bg-white/25 pointer-events-none" />
                    <div className="absolute inset-y-0 right-1 w-[1px] bg-black/15 pointer-events-none" />
                  </div>

                  {/* EXPANDED FULL MONOGRAPH COVER VIEW */}
                  <div
                    className={`absolute inset-0 bg-stone-900 text-white flex flex-col justify-between transition-opacity duration-500 ${
                      isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    {/* Full Cover High-Resolution Image */}
                    <img
                      src={vol.photo.originalUrl}
                      alt={vol.photo.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover brightness-90 transition-transform duration-700 hover:scale-105"
                    />

                    {/* Editorial Book Cover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" />

                    {/* Book Spine Left Binding Shadow */}
                    <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/60 via-white/15 to-transparent pointer-events-none" />

                    {/* Top Monograph Header */}
                    <div className="relative z-10 p-5 sm:p-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-stone-200 border-b border-white/15">
                      <span>{vol.volumeNumber} · PINISARA MONOGRAPH</span>
                      <span>f/ {vol.photo.settings}</span>
                    </div>

                    {/* Center / Bottom Monograph Cover Typography */}
                    <div className="relative z-10 p-5 sm:p-7 space-y-3 mt-auto">
                      <span className="px-2.5 py-0.5 bg-emerald-600/90 text-white font-mono text-[10px] uppercase tracking-wider">
                        {vol.photo.category} · Pinnawala Central College
                      </span>

                      <h3 className="font-source-serif font-normal text-2xl sm:text-3xl text-white leading-tight">
                        {vol.photo.title}
                      </h3>

                      <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                        {vol.photo.description}
                      </p>

                      <div className="pt-3 border-t border-white/20 flex items-center justify-between">
                        <div className="font-mono text-[11px] text-emerald-300">
                          {vol.photo.photographerName} · {vol.photo.camera}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPhoto(vol.photo);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-stone-950 font-sans text-xs font-semibold hover:bg-emerald-400 transition-colors"
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

      </div>
    </section>
  );
};
