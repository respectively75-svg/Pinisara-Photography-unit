import React, { useState } from 'react';
import { ArrowUpRight, Trash2, Camera, Smartphone, Calendar } from 'lucide-react';
import { Photo } from '../types';
import { CursorParallaxImage, ScrollParallaxReveal } from './ParallaxAndScroll';

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

interface CreativeOutputSectionProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
  onDeletePhoto?: (photoId: string) => void;
  onExploreMore?: () => void;
}

export const CreativeOutputSection: React.FC<CreativeOutputSectionProps> = ({
  photos,
  onSelectPhoto,
  onDeletePhoto,
  onExploreMore
}) => {
  const [showSeriouslyTooltip, setShowSeriouslyTooltip] = useState<boolean>(false);
  const [showExpandedWorks, setShowExpandedWorks] = useState<boolean>(false);

  if (photos.length === 0) return null;

  const heroCard1 = photos[0];
  const pair1Left = photos[1];
  const pair1Right = photos[4] || photos[2];
  const pair2Left = photos[6] || photos[3];
  const pair2Right = photos[8] || photos[5];
  const heroCard2 = photos[9] || photos[7] || photos[1];

  const renderShowcaseCard = (
    photo: Photo | undefined,
    cardKey: string,
    tags: string[],
    aspectClass: string = 'aspect-16/10',
    titleSizeClass: string = 'text-2xl sm:text-4xl',
    parallaxSpeed: number = 0.06
  ) => {
    if (!photo) return null;

    const isMobileCamera = photo.camera.includes('iPhone') || photo.camera.includes('Samsung');
    const extraCount = (photo.collaborators?.length || 0) + 1;

    return (
      <ScrollParallaxReveal key={`${cardKey}-${photo.id}`} speed={parallaxSpeed}>
        <article className="group w-full space-y-4">
          {/* Image Frame with Windowed Scroll Parallax, Cursor Parallax & Subtle Animated Hover Overlay */}
          <CursorParallaxImage
            src={photo.originalUrl}
            alt={photo.title}
            intensity={22}
            tiltIntensity={3.5}
            scrollParallaxIntensity={28}
            onClick={() => onSelectPhoto(photo)}
            containerClassName={`w-full ${aspectClass} bg-stone-200 dark:bg-stone-900 cursor-pointer select-none shadow-lg`}
          >
            {/* Subtle Animated Hover Overlay with Camera Model & Date Taken */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-end p-5 sm:p-6 pointer-events-none">
              <div className="transform translate-y-2.5 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-2 text-xs font-mono tracking-wide text-stone-100">
                  {isMobileCamera ? (
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span className="font-medium text-white">{photo.camera}</span>
                  <span aria-hidden="true" className="text-white/45">·</span>
                  <Calendar className="w-3.5 h-3.5 text-emerald-400/90 shrink-0" />
                  <time dateTime={photo.dateTaken} className="text-stone-200">
                    {formatCaptureDate(photo.dateTaken)}
                  </time>
                </div>

                <span className="hidden sm:inline-block text-[11px] font-mono text-stone-300/90">
                  {photo.settings}
                </span>
              </div>
            </div>

            {/* Delete Photo Button in Top-Right */}
            {onDeletePhoto && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePhoto(photo.id);
                }}
                className="absolute top-4 right-4 z-20 flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-white border border-white/20 text-[10px] font-mono font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md"
                title="Delete this image"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            )}
          </CursorParallaxImage>

          {/* Clean Metadata Tags + Editorial Title + Circular ↗ Button (Matches Reference Video) */}
          <div className="flex items-end justify-between gap-4 pt-1">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-stone-200/75 dark:bg-white/10 text-[11px] font-sans text-stone-700 dark:text-stone-300"
                  >
                    {tag}
                  </span>
                ))}
                <span className="px-2 py-1 rounded-md bg-stone-200/75 dark:bg-white/10 text-[11px] font-mono text-stone-600 dark:text-stone-300">
                  {extraCount}+
                </span>
              </div>

              <h3
                onClick={() => onSelectPhoto(photo)}
                className={`font-sans font-normal ${titleSizeClass} text-stone-900 dark:text-white tracking-tight cursor-pointer hover:opacity-75 transition-opacity duration-300`}
              >
                {photo.title.split(':')[0]} - {photo.photographerName.split(' ')[0]}
              </h3>
            </div>

            <button
              onClick={() => onSelectPhoto(photo)}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-stone-300 dark:border-white/25 flex items-center justify-center text-stone-900 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 shrink-0 active:scale-95"
              aria-label={`Inspect ${photo.title}`}
            >
              <ArrowUpRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>
        </article>
      </ScrollParallaxReveal>
    );
  };

  return (
    <section
      id="creative-output-section"
      className="w-full bg-[#F4F4F2] dark:bg-black py-24 sm:py-32 px-4 sm:px-8 lg:px-14 transition-colors duration-700"
    >
      <div className="max-w-6xl mx-auto space-y-24 sm:space-y-36">
        {/* Section Title (Matches 00:00 of Video) */}
        <ScrollParallaxReveal speed={0.02} className="text-center space-y-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-stone-500 dark:text-white/65 block">
            Pinisara Photography · Pinnawala Central College
          </span>
          <h2 className="font-sans font-normal text-4xl sm:text-6xl lg:text-[4.25rem] text-stone-900 dark:text-white tracking-tight">
            Our Creative Output
          </h2>
        </ScrollParallaxReveal>

        {/* 1. Full-Width Centered Feature Card (Matches 00:00 - 00:01) */}
        {heroCard1 && (
          <div className="max-w-4xl mx-auto">
            {renderShowcaseCard(
              heroCard1,
              'output-hero-1',
              ['Morning Assembly', heroCard1?.camera || 'Canon Kiss F'],
              'aspect-16/10',
              'text-2xl sm:text-4xl',
              0.04
            )}
          </div>
        )}

        {/* 2. Staggered Asymmetric 2-Column Pair #1 (Matches 00:02 - 00:04) */}
        {(pair1Left || pair1Right) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-6">
              {renderShowcaseCard(
                pair1Left,
                'output-pair1-left',
                ['Pirith Night', pair1Left?.camera || 'Samsung S20 Ultra'],
                'aspect-4/3',
                'text-xl sm:text-3xl',
                -0.05
              )}
            </div>
            <div className="lg:col-span-6 lg:mt-28">
              {renderShowcaseCard(
                pair1Right,
                'output-pair1-right',
                ['Prefect Voting', pair1Right?.camera || 'iPhone 13'],
                'aspect-16/10',
                'text-xl sm:text-3xl',
                0.11
              )}
            </div>
          </div>
        )}

        {/* 3. Staggered Asymmetric 2-Column Pair #2 (Matches 00:04 - 00:06) */}
        {(pair2Left || pair2Right) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
            <div className="lg:col-span-5">
              {renderShowcaseCard(
                pair2Left,
                'output-pair2-left',
                ['Morning Radio', pair2Left?.camera || 'iPhone 13'],
                'aspect-4/3',
                'text-xl sm:text-2xl',
                0.09
              )}
            </div>
            <div className="lg:col-span-7">
              {renderShowcaseCard(
                pair2Right,
                'output-pair2-right',
                ['Student Parliament', pair2Right?.camera || 'Samsung S20 Ultra'],
                'aspect-16/10',
                'text-xl sm:text-3xl',
                -0.05
              )}
            </div>
          </div>
        )}

        {/* 4. Full-Width Centered Feature Card #2 (Matches 00:06 - 00:15) */}
        {heroCard2 && (
          <div className="max-w-4xl mx-auto">
            {renderShowcaseCard(
              heroCard2,
              'output-hero-2',
              ['Big Match & Sports', heroCard2?.camera || 'Canon 2000D'],
              'aspect-16/9',
              'text-2xl sm:text-4xl',
              0.04
            )}
          </div>
        )}

        {/* Optional Expanded Works when clicking "View more" */}
        {showExpandedWorks && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6 animate-apple-fade-in">
            {photos.slice(2, 6).map((p, idx) => (
              <div key={p.id} className={idx % 2 === 1 ? 'md:mt-20' : ''}>
                {renderShowcaseCard(
                  p,
                  `output-extra-${idx}`,
                  [p.category.toUpperCase(), p.camera],
                  'aspect-4/3',
                  'text-xl sm:text-2xl',
                  idx % 2 === 0 ? -0.04 : 0.09
                )}
              </div>
            ))}
          </div>
        )}

        {/* 5. Bottom Micro-Interaction (Matches 00:16 - 00:18) */}
        <div className="pt-8 pb-4 flex flex-col items-center justify-center relative">
          <div className="text-xs sm:text-sm text-stone-600 dark:text-white/75 flex items-center gap-1.5 relative">
            <span>Of course not just that.</span>
            <button
              onMouseEnter={() => setShowSeriouslyTooltip(true)}
              onMouseLeave={() => setShowSeriouslyTooltip(false)}
              onClick={() => {
                setShowExpandedWorks((prev) => !prev);
                if (onExploreMore && showExpandedWorks) onExploreMore();
              }}
              className="font-semibold text-stone-900 dark:text-white underline underline-offset-4 hover:opacity-75 transition-opacity relative"
            >
              {showExpandedWorks ? 'Show fewer works' : 'View more'}
            </button>

            <div
              className={`absolute left-full ml-3 -bottom-2 px-2.5 py-1 rounded-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/20 shadow-sm text-stone-900 dark:text-white font-mono text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 pointer-events-none ${
                showSeriouslyTooltip
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-1 scale-95'
              }`}
            >
              SERIOUSLY?
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
