import React, { useRef } from 'react';
import { Photo } from '../types';
import { CursorParallaxImage, ScrollParallaxReveal } from './ParallaxAndScroll';

interface FeaturedStoriesSectionProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
}

interface EditorialStory {
  indexLabel: string;
  titlePrefix: string;
  titleItalic: string;
  titleSuffix?: string;
  description: string;
  category: string;
  service: string;
  year: string;
  defaultCoords: { x: number; y: number };
  mainPhoto: Photo | undefined;
  insetPhoto: Photo | undefined;
}

export const FeaturedStoriesSection: React.FC<FeaturedStoriesSectionProps> = ({
  photos,
  onSelectPhoto
}) => {
  const coordRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const stories: EditorialStory[] = [
    {
      indexLabel: '(01)',
      titlePrefix: 'Into the ',
      titleItalic: 'Assembly',
      description:
        'Early Monday mornings at Pinnawala Central College—standing near the quadrangle steps with our Canon Kiss F and phones to capture the national flag and morning speeches.',
      category: 'Morning Assembly',
      service: 'Canon Kiss F & Phone Snapshots',
      year: '2026',
      defaultCoords: { x: 4940, y: 2540 },
      mainPhoto: photos[0],
      insetPhoto: photos[1] || photos[0]
    },
    {
      indexLabel: '(02)',
      titlePrefix: 'The ',
      titleItalic: 'Pirith',
      titleSuffix: ' Night',
      description:
        'Staying late at school for the annual Pirith ceremony, taking handheld photos of the oil lamps, woven Gok Kola decorations, and friends helping out.',
      category: 'School Ceremony',
      service: 'Canon 2000D 50mm & S20 Ultra',
      year: '2026',
      defaultCoords: { x: 3540, y: 3160 },
      mainPhoto: photos[2] || photos[1],
      insetPhoto: photos[3] || photos[2] || photos[0]
    },
    {
      indexLabel: '(03)',
      titlePrefix: 'Under ',
      titleItalic: 'Parliament',
      titleSuffix: ' Skies',
      description:
        'Walking between the debating hall and prefect election booths with our cameras and phones to capture student speeches, ballot boxes, and proud new prefects.',
      category: 'Student Life',
      service: 'iPhone 13 & Samsung S20 Ultra',
      year: '2026',
      defaultCoords: { x: 2540, y: 4370 },
      mainPhoto: photos[8] || photos[4] || photos[0],
      insetPhoto: photos[4] || photos[5] || photos[1]
    },
    {
      indexLabel: '(04)',
      titlePrefix: 'Voice of ',
      titleItalic: 'Pinisara',
      description:
        'Hanging out inside the small school radio room before the 7:30 AM bell and out by the cricket ground after school—just real photos by students, for students.',
      category: 'Radio & Sports',
      service: 'Phone Camera & DSLR Handheld',
      year: '2026',
      defaultCoords: { x: 4120, y: 1980 },
      mainPhoto: photos[6] || photos[0],
      insetPhoto: photos[7] || photos[6] || photos[1]
    }
  ];

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    indexLabel: string,
    baseCoords: { x: number; y: number }
  ) => {
    const labelEl = coordRefs.current[indexLabel];
    if (!labelEl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const relX = Math.round(((e.clientX - rect.left) / rect.width) * 1200);
    const relY = Math.round(((e.clientY - rect.top) / rect.height) * 900);
    const x = baseCoords.x - 600 + relX;
    const y = baseCoords.y - 450 + relY;
    labelEl.textContent = `X:${x}  Y:${y}`;
  };

  return (
    <section
      id="featured-stories-section"
      className="w-full bg-white dark:bg-black text-stone-900 dark:text-white border-t border-stone-200 dark:border-white/15 transition-colors duration-1000"
    >
      {/* Top Bar with "Featured Stories" Pill */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 flex items-center justify-between border-b border-stone-200 dark:border-white/15">
        <span className="px-4 py-1.5 rounded-full bg-stone-100 dark:bg-white/10 backdrop-blur-xl border border-transparent dark:border-white/20 text-stone-800 dark:text-white text-xs font-sans font-medium">
          Featured Stories
        </span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-stone-400 dark:text-white/65">
          Pinisara Photography · Pinnawala Central College
        </span>
      </div>

      {/* Sequential Split-Screen Story Rows ((01), (02), (03), (04)) */}
      <div className="max-w-7xl mx-auto divide-y divide-stone-200 dark:divide-white/15">
        {stories.map((story) => {
          const coords = story.defaultCoords;
          const mainImg =
            story.mainPhoto?.originalUrl ||
            'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=2000&q=90';
          const insetImg =
            story.insetPhoto?.thumbnailUrl ||
            story.mainPhoto?.thumbnailUrl ||
            mainImg;

          return (
            <ScrollParallaxReveal key={story.indexLabel} speed={0.04}>
              <article className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                {/* LEFT COLUMN: Giant Index Number (01) + Mixed-Font Title + Honest Student Gear Table */}
                <div className="lg:col-span-4 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white dark:bg-black border-b lg:border-b-0 lg:border-r border-stone-200 dark:border-white/15">
                  <div className="font-sans font-light text-6xl sm:text-7xl lg:text-[5.25rem] text-stone-200 dark:text-white/20 tracking-tight leading-none select-none">
                    {story.indexLabel}
                  </div>

                  <div className="pt-12 lg:pt-24 space-y-6">
                    <div className="space-y-3">
                      <h3 className="font-sans font-semibold text-2xl sm:text-3xl text-stone-900 dark:text-white tracking-tight">
                        {story.titlePrefix}
                        <span className="font-tempting italic font-normal text-3xl sm:text-4xl text-stone-900 dark:text-white">
                          {story.titleItalic}
                        </span>
                        {story.titleSuffix || ''}
                      </h3>

                      <p className="text-xs sm:text-[13px] text-stone-600 dark:text-white/75 leading-relaxed max-w-xs">
                        {story.description}
                      </p>
                    </div>

                    <div className="border-t border-b border-stone-200 dark:border-white/15 divide-y divide-stone-200 dark:divide-white/15 text-xs">
                      <div className="py-3 flex items-center justify-between gap-4">
                        <span className="text-stone-400 dark:text-white/55">Moment</span>
                        <span className="font-medium text-stone-900 dark:text-white text-right">
                          {story.category}
                        </span>
                      </div>
                      <div className="py-3 flex items-start justify-between gap-4">
                        <span className="text-stone-400 dark:text-white/55">Shot With</span>
                        <span className="font-medium text-stone-900 dark:text-white text-right max-w-[190px]">
                          {story.service}
                        </span>
                      </div>
                      <div className="py-3 flex items-center justify-between gap-4">
                        <span className="text-stone-400 dark:text-white/55">Year</span>
                        <span className="font-mono font-medium text-stone-900 dark:text-white text-right">
                          {story.year}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Full-Bleed Story Canvas with Cursor Parallax + Center Framed Loupe */}
                <CursorParallaxImage
                  src={mainImg}
                  alt={`${story.titlePrefix}${story.titleItalic}`}
                  intensity={30}
                  tiltIntensity={4}
                  onMouseMove={(e) => handleMouseMove(e, story.indexLabel, story.defaultCoords)}
                  onClick={() => story.mainPhoto && onSelectPhoto(story.mainPhoto)}
                  containerClassName="lg:col-span-8 min-h-[440px] sm:min-h-[580px] lg:min-h-[680px] bg-black cursor-pointer group"
                >
                  {/* Center Framed Detail Window with Live X / Y Coordinates & Counter-Parallax */}
                  <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (story.insetPhoto) onSelectPhoto(story.insetPhoto);
                      }}
                      className="pointer-events-auto relative w-60 sm:w-80 md:w-96 aspect-4/3 transition-all duration-1200 cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-105"
                    >
                      <div
                        ref={(el) => {
                          coordRefs.current[story.indexLabel] = el;
                        }}
                        className="inline-block mb-1.5 px-2.5 py-0.5 rounded-md bg-black/75 border border-white/20 text-white font-mono text-[11px] font-semibold tracking-wider whitespace-pre"
                      >
                        {`X:${coords.x}  Y:${coords.y}`}
                      </div>

                      <div className="w-full h-full border-2 border-white shadow-[0_25px_70px_-10px_rgba(0,0,0,0.85)] overflow-hidden bg-black">
                        <img
                          src={insetImg}
                          alt="Detail Frame"
                          className="w-full h-full object-cover transition-transform duration-1200 hover:scale-110"
                        />
                      </div>
                    </div>
                  </div>
                </CursorParallaxImage>
              </article>
            </ScrollParallaxReveal>
          );
        })}
      </div>
    </section>
  );
};
