import React, { useState } from 'react';
import {
  Download,
  Heart,
  Maximize2,
  Share2,
  Camera,
  Smartphone,
  Users,
  Aperture,
  Gauge,
  SunDim,
  Focus,
  BookOpen,
  X,
  Trash2,
  RotateCcw,
  Calendar,
  ArrowUpRight,
  Contrast
} from 'lucide-react';
import { Photo, SupportedLanguage } from '../types';
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

function mapAspectRatioToClass(
  ratio: Photo['aspectRatio'] | undefined,
  fallback: string
): string {
  switch (ratio) {
    case '16:10':
      return 'aspect-16/10';
    case '16:9':
      return 'aspect-16/9';
    case '21:9':
      return 'aspect-21/9';
    case '4:3':
      return 'aspect-4/3';
    case '3:2':
      return 'aspect-3/2';
    case '1:1':
      return 'aspect-square';
    case '4:5':
      return 'aspect-4/5';
    case '3:4':
      return 'aspect-3/4';
    case '2:3':
      return 'aspect-2/3';
    case '9:16':
      return 'aspect-9/16';
    case 'original':
      return 'aspect-auto';
    default:
      return fallback;
  }
}

function formatCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    assembly: 'Morning Assembly',
    pirith: 'Pirith Ceremony',
    elections: 'Prefect Elections',
    radio: 'Morning Radio',
    parliament: 'Student Parliament',
    athletics: 'Track & Field',
    cricket: 'Big Match Cricket',
    ceremonies: 'Prize Giving'
  };
  return map[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
}

interface EducationalExifData {
  shutterSpeed: string;
  shutterLesson: string;
  iso: string;
  isoLesson: string;
  focalLength: string;
  focalLesson: string;
  aperture: string;
  apertureLesson: string;
}

function extractEducationalExif(photo: Photo): EducationalExifData {
  const parts = (photo.settings || '1/1000s · f/4.0 · ISO 400').split('·').map((s) => s.trim());
  const shutterSpeed = parts.find((p) => p.includes('s') || p.includes('/')) || '1/1000s';
  const aperture = parts.find((p) => p.toLowerCase().includes('f/') || p.includes('ƒ/')) || 'f/4.0';
  const iso = parts.find((p) => p.toUpperCase().includes('ISO')) || 'ISO 400';

  const lensStr = photo.lens || '';
  let focalLength = '35mm';
  if (lensStr.includes('50mm')) focalLength = '50mm Prime';
  else if (lensStr.includes('13mm')) focalLength = '13mm Ultra-Wide';
  else if (lensStr.includes('26mm')) focalLength = '26mm Wide';
  else if (lensStr.toLowerCase().includes('periscope') || lensStr.includes('4x'))
    focalLength = '103mm (4x Telephoto)';
  else if (lensStr.includes('108MP')) focalLength = '24mm (108MP Wide)';
  else if (lensStr.includes('18-55mm')) {
    focalLength = photo.category === 'assembly' ? '24mm Wide Zoom' : '45mm Standard Zoom';
  }

  const denomMatch = shutterSpeed.match(/1\/(\d+)/);
  const denom = denomMatch ? parseInt(denomMatch[1], 10) : 500;
  const shutterLesson =
    denom >= 1000
      ? `Ultra-fast ${shutterSpeed} shutter freezes high-velocity action, flag ripples, and athletic movement with zero motion blur.`
      : denom >= 500
      ? `Fast ${shutterSpeed} shutter cleanly arrests candid human expressions and hand gestures while allowing balanced light intake.`
      : `Moderate ${shutterSpeed} shutter maximizes ambient light gathering indoors while preventing handheld camera shake.`;

  const isoMatch = iso.match(/(\d+)/);
  const isoVal = isoMatch ? parseInt(isoMatch[1], 10) : 400;
  const isoLesson =
    isoVal <= 200
      ? `Low ${iso} preserves peak sensor dynamic range and shadow purity with virtually zero digital grain in bright light.`
      : isoVal <= 500
      ? `Balanced ${iso} provides clean tonal gradations in mixed indoor/outdoor school lighting without introducing noise.`
      : `Elevated ${iso} amplifies sensor sensitivity for low-light ceremonial environments while retaining fine highlight detail.`;

  const focalLesson = focalLength.includes('50mm')
    ? `${focalLength} mirrors natural human vision with flattering subject compression and creamy background separation.`
    : focalLength.includes('103mm') || focalLength.includes('45mm')
    ? `${focalLength} optically isolates distant stage speakers or athletes from the crowd without intruding on the ceremony.`
    : `${focalLength} captures expansive architectural geometry and full student assembly formations in a single frame.`;

  const apMatch = aperture.match(/(\d+\.?\d*)/);
  const apVal = apMatch ? parseFloat(apMatch[1]) : 4.0;
  const apertureLesson =
    apVal <= 2.2
      ? `Wide ${aperture} opening admits maximum light and creates shallow depth-of-field bokeh that isolates the subject.`
      : `Stepped-down ${aperture} aperture expands the focal plane so multiple rows of students and architectural details remain tack-sharp.`;

  return {
    shutterSpeed,
    shutterLesson,
    iso,
    isoLesson,
    focalLength,
    focalLesson,
    aperture,
    apertureLesson
  };
}

interface GalleryGridProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
  onToggleFavorite: (photoId: string) => void;
  onQuickDownload: (photo: Photo, resolution: 'original' | 'web' | 'mobile') => void;
  onSharePhoto: (photo: Photo) => void;
  onDeletePhoto?: (photoId: string) => void;
  onDeleteAllExamplePhotos?: () => void;
  onRestoreExamplePhotos?: () => void;
  viewMode: 'masonry' | 'grid';
  currentLang: SupportedLanguage;
  highContrastMode?: boolean;
  onToggleHighContrast?: () => void;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  photos,
  onSelectPhoto,
  onToggleFavorite,
  onQuickDownload,
  onSharePhoto,
  onDeletePhoto,
  onDeleteAllExamplePhotos,
  onRestoreExamplePhotos,
  viewMode,
  highContrastMode = false,
  onToggleHighContrast
}) => {
  const [downloadMenuPhotoId, setDownloadMenuPhotoId] = useState<string | null>(null);
  const [quickViewPhoto, setQuickViewPhoto] = useState<Photo | null>(null);
  const [inlineHudPhotoIds, setInlineHudPhotoIds] = useState<string[]>([]);
  const [showSeriouslyTooltip, setShowSeriouslyTooltip] = useState<boolean>(false);

  const toggleInlineHud = (photoId: string) => {
    setInlineHudPhotoIds((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
    );
  };

  if (photos.length === 0) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4 animate-apple-fade-in">
        <div className="w-14 h-14 rounded-2xl liquid-glass flex items-center justify-center mx-auto mb-4 text-stone-500 dark:text-white/70">
          <Camera className="w-6 h-6" />
        </div>
        <h3 className="font-source-serif font-medium text-xl text-stone-900 dark:text-white">
          No Photographs Found
        </h3>
        <p className="text-stone-500 dark:text-white/70 text-xs sm:text-sm mt-1.5 leading-relaxed">
          All example images have been removed or no photos match your filter. Upload your own school photos or restore the example set below.
        </p>
        {onRestoreExamplePhotos && (
          <button
            onClick={onRestoreExamplePhotos}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold shadow-md hover:opacity-85 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Example Images</span>
          </button>
        )}
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  const renderSeamlessLibraryCard = (
    photo: Photo,
    aspectClass: string = 'aspect-16/10',
    titleSizeClass: string = 'text-2xl sm:text-3xl',
    parallaxSpeed: number = 0.05
  ) => {
    const isDownloadOpen = downloadMenuPhotoId === photo.id;
    const isMobileCamera = photo.camera.includes('iPhone') || photo.camera.includes('Samsung');
    const hasCollaborators = Boolean(photo.collaborators && photo.collaborators.length > 0);
    const exif = extractEducationalExif(photo);
    const isInlineHudOpen = inlineHudPhotoIds.includes(photo.id);
    const extraCount = (photo.collaborators?.length || 0) + 1;
    const resolvedAspectClass = photo.objectFit
      ? mapAspectRatioToClass(photo.aspectRatio, aspectClass)
      : aspectClass;

    return (
      <ScrollParallaxReveal key={photo.id} speed={parallaxSpeed}>
        <article id={`photo-card-${photo.id}`} className="group w-full space-y-4">
          {/* Image Canvas with Seamless Windowed Scroll Parallax & 3D Cursor Parallax */}
          <div className="relative">
            <CursorParallaxImage
              src={photo.webUrl}
              alt={photo.title}
              intensity={20}
              tiltIntensity={3}
              scrollParallaxIntensity={28}
              objectFit={photo.objectFit || 'cover'}
              objectPosition={photo.objectPosition || '50% 50%'}
              onClick={() => onSelectPhoto(photo)}
              className={
                highContrastMode
                  ? 'contrast-135 brightness-115 saturate-115 transition-[filter] duration-300'
                  : 'transition-[filter] duration-300'
              }
              containerClassName={`w-full ${resolvedAspectClass} bg-stone-200 dark:bg-stone-900 cursor-pointer select-none shadow-lg ${
                highContrastMode
                  ? 'ring-2 ring-black dark:ring-white shadow-2xl'
                  : ''
              }`}
            >
              {/* Subtle Top-Left Editorial Indicator */}
              {hasCollaborators && (
                <div
                  className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10 pointer-events-none text-[10px] font-mono tracking-wider uppercase text-white/90 drop-shadow-sm"
                  title={
                    photo.collaborationNotes ||
                    `Collaborative shoot with ${photo.collaborators?.join(', ')}`
                  }
                >
                  <Users className="w-3 h-3 text-emerald-400" />
                  <span>Joint Shoot</span>
                </div>
              )}

              {/* Top Right: Quick View + Favorite + Delete Button */}
              <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  id={`photo-quick-view-btn-${photo.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuickViewPhoto(photo);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/65 hover:bg-emerald-600 text-white font-mono text-[10px] font-semibold border border-white/20 shadow-xs transition-all duration-300 active:scale-95"
                  title="Quick View: Educational Technical Shooting Data (Shutter Speed, ISO, Focal Length)"
                  aria-label="Quick View technical shooting data"
                >
                  <Aperture className="w-3 h-3 text-emerald-400" />
                  <span>Quick View</span>
                </button>

                <button
                  id={`photo-favorite-btn-${photo.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(photo.id);
                  }}
                  className={`p-2 rounded-full transition-all duration-300 active:scale-90 border ${
                    photo.isFavorited
                      ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                      : 'bg-black/55 hover:bg-black/75 text-white border-white/20'
                  }`}
                  title={photo.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  aria-label="Favorite photo"
                >
                  <Heart className={`w-3.5 h-3.5 ${photo.isFavorited ? 'fill-current' : ''}`} />
                </button>

                {onDeletePhoto && (
                  <button
                    id={`photo-delete-btn-${photo.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePhoto(photo.id);
                    }}
                    className="p-2 rounded-full bg-black/65 hover:bg-rose-600 text-white border border-white/20 transition-all duration-300 active:scale-90"
                    title="Delete this image"
                    aria-label="Delete photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Optional Pinned In-Thumbnail Technical Shooting Data Overlay */}
              {isInlineHudOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-0 z-20 bg-stone-950/90 p-4 sm:p-5 flex flex-col justify-between text-white animate-apple-fade-in"
                >
                  <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Aperture className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-emerald-300">
                        Technical Shooting Data
                      </span>
                    </div>
                    <button
                      onClick={() => toggleInlineHud(photo.id)}
                      className="p-1 rounded-full hover:bg-white/15 text-stone-300 hover:text-white transition-colors"
                      title="Close HUD"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 my-auto py-2">
                    <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block">
                        Shutter Speed
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-white">
                        {exif.shutterSpeed}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block">
                        ISO Sensitivity
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-white">
                        {exif.iso}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block">
                        Focal Length
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-emerald-400">
                        {exif.focalLength}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block">
                        Aperture
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-bold text-white">
                        {exif.aperture}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[11px]">
                    <span className="font-mono text-stone-300 truncate">{photo.camera}</span>
                    <button
                      onClick={() => setQuickViewPhoto(photo)}
                      className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Full Lesson</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Subtle, Animated Hover Overlay with Camera Model & Date Taken */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-end p-4 sm:p-5 text-white pointer-events-none group-hover:pointer-events-auto">
                <div className="transform translate-y-2.5 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  {/* Animated Camera Model & Date Taken Eyebrow */}
                  <div className="flex items-center gap-2 text-[11px] font-mono tracking-wide text-stone-200/95 mb-1.5">
                    {isMobileCamera ? (
                      <Smartphone className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <Camera className="w-3 h-3 text-emerald-400 shrink-0" />
                    )}
                    <span className="font-medium text-white truncate">{photo.camera}</span>
                    <span aria-hidden="true" className="text-white/45">
                      ·
                    </span>
                    <Calendar className="w-3 h-3 text-emerald-400/90 shrink-0" />
                    <time dateTime={photo.dateTaken} className="text-stone-200 shrink-0">
                      {formatCaptureDate(photo.dateTaken)}
                    </time>
                  </div>

                  {/* Photographer credit with monogram & collaborators */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-coolvetica text-[10px] font-bold">
                      {getInitials(photo.photographerName)}
                    </div>
                    <span className="text-xs text-stone-200 truncate font-medium">
                      {photo.photographerName}
                    </span>
                    <span aria-hidden="true" className="text-white/40 text-xs">
                      ·
                    </span>
                    <span className="text-[11px] text-emerald-300/90 font-mono truncate">
                      {exif.shutterSpeed} · {exif.aperture}
                    </span>
                  </div>

                  {/* Hover Quick Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/15">
                    <div className="flex items-center gap-3">
                      <button
                        id={`photo-view-lightbox-${photo.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPhoto(photo);
                        }}
                        className="flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-white transition-colors"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewPhoto(photo);
                        }}
                        className="flex items-center gap-1 text-xs font-medium text-emerald-300 hover:text-emerald-200 transition-colors"
                      >
                        <Aperture className="w-3.5 h-3.5" />
                        <span>EXIF Study</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id={`photo-share-btn-${photo.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSharePhoto(photo);
                        }}
                        className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                        title="Share photo"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Download Menu Trigger */}
                      <div className="relative">
                        <button
                          id={`photo-download-trigger-${photo.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDownloadMenuPhotoId(isDownloadOpen ? null : photo.id);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-stone-900 hover:bg-emerald-50 text-xs font-semibold shadow-md active:scale-95 transition-all"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Download</span>
                        </button>

                        {isDownloadOpen && (
                          <div
                            id={`download-resolution-dropdown-${photo.id}`}
                            className="absolute right-0 bottom-full mb-2 w-56 bg-stone-950/95 rounded-2xl shadow-2xl border border-white/20 p-2 z-30 animate-apple-scale-in"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                              Free 1-Click Downloads
                            </div>
                            <button
                              id={`dl-original-${photo.id}`}
                              onClick={() => {
                                onQuickDownload(photo, 'original');
                                setDownloadMenuPhotoId(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white text-xs flex items-center justify-between transition-colors"
                            >
                              <span className="font-medium">Original 4K RAW</span>
                              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                                ~12 MB
                              </span>
                            </button>
                            <button
                              id={`dl-web-${photo.id}`}
                              onClick={() => {
                                onQuickDownload(photo, 'web');
                                setDownloadMenuPhotoId(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white text-xs flex items-center justify-between transition-colors"
                            >
                              <span className="font-medium">Web Quality (1080p)</span>
                              <span className="text-[10px] font-mono text-stone-400">~1.2 MB</span>
                            </button>
                            <button
                              id={`dl-mobile-${photo.id}`}
                              onClick={() => {
                                onQuickDownload(photo, 'mobile');
                                setDownloadMenuPhotoId(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white text-xs flex items-center justify-between transition-colors"
                            >
                              <span className="font-medium">Mobile Wallpaper</span>
                              <span className="text-[10px] font-mono text-stone-400">~450 KB</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CursorParallaxImage>
          </div>

          {/* Editorial Below-Image Metadata Tags + Title + Circular ↗ Button (Matches Reference Video) */}
          <div className="flex items-end justify-between gap-4 pt-1">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-1 rounded-md text-[11px] font-sans ${
                    highContrastMode
                      ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                      : 'bg-stone-200/75 dark:bg-white/10 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {formatCategoryLabel(photo.category)}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-md text-[11px] font-sans ${
                    highContrastMode
                      ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                      : 'bg-stone-200/75 dark:bg-white/10 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {photo.camera}
                </span>
                <span
                  className={`px-2 py-1 rounded-md text-[11px] font-mono ${
                    highContrastMode
                      ? 'bg-amber-400 text-black font-bold'
                      : 'bg-stone-200/75 dark:bg-white/10 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {extraCount}+
                </span>
                {highContrastMode && (
                  <span className="px-2 py-1 rounded-md bg-emerald-500 text-black text-[10px] font-mono font-bold uppercase tracking-wider">
                    Low-Light Boost
                  </span>
                )}
              </div>

              <h4
                onClick={() => onSelectPhoto(photo)}
                className={`font-sans ${
                  highContrastMode ? 'font-semibold' : 'font-normal'
                } ${titleSizeClass} text-stone-900 dark:text-white tracking-tight cursor-pointer hover:opacity-75 transition-opacity duration-300 truncate`}
              >
                {photo.title.split(':')[0]} - {photo.photographerName.split(' ')[0]}
              </h4>
            </div>

            <button
              onClick={() => onSelectPhoto(photo)}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0 active:scale-95 ${
                highContrastMode
                  ? 'border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black'
                  : 'border-stone-300 dark:border-white/25 text-stone-900 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
              }`}
              aria-label={`Inspect ${photo.title}`}
            >
              <ArrowUpRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>
        </article>
      </ScrollParallaxReveal>
    );
  };

  // Group photos into 5-item editorial scroll blocks matching the reference video (1 Hero -> 2 Staggered Pair A -> 2 Staggered Pair B)
  const editorialBlocks: Photo[][] = [];
  for (let i = 0; i < photos.length; i += 5) {
    editorialBlocks.push(photos.slice(i, i + 5));
  }

  return (
    <div id="gallery-grid-container" className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 pb-24 pt-6">
      {highContrastMode && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black border-2 border-amber-400 text-xs shadow-lg animate-apple-fade-in">
          <div className="flex items-center gap-2.5">
            <Contrast className="w-4 h-4 text-amber-400 dark:text-black shrink-0" />
            <span className="font-semibold">
              High Contrast Mode Active — Low-light school event photos (Pirith Night, indoor assemblies, stage captures) have enhanced shadow detail (+15% brightness, +35% contrast).
            </span>
          </div>
          {onToggleHighContrast && (
            <button
              type="button"
              onClick={onToggleHighContrast}
              className="px-3 py-1 rounded-full bg-amber-400 text-black font-mono text-[11px] font-bold hover:opacity-90 transition-opacity shrink-0"
            >
              Disable High Contrast
            </button>
          )}
        </div>
      )}
      {onDeleteAllExamplePhotos && (
        <div className="mb-14 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl liquid-glass text-xs">
          <span className="text-stone-600 dark:text-white/75 font-medium">
            Showing {photos.length} {photos.length === 1 ? 'photo' : 'photos'} in the seamless scroll archive. You can delete any example image or clear all example images at once.
          </span>
          <div className="flex items-center gap-2">
            {onRestoreExamplePhotos && (
              <button
                type="button"
                onClick={onRestoreExamplePhotos}
                className="px-3.5 py-1.5 rounded-full glass-pill text-stone-800 dark:text-white font-mono text-[11px] font-semibold flex items-center gap-1.5 hover:opacity-80 transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore Defaults</span>
              </button>
            )}
            <button
              type="button"
              id="delete-all-example-photos-btn"
              onClick={onDeleteAllExamplePhotos}
              className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-mono text-[11px] font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete Example Images</span>
            </button>
          </div>
        </div>
      )}

      {viewMode === 'masonry' ? (
        /* SEAMLESS EDITORIAL SCROLL SHOWCASE (Matches 00:00 - 00:18 Reference Video) */
        <div className="space-y-24 sm:space-y-36">
          {editorialBlocks.map((block, blockIdx) => {
            const heroPhoto = block[0];
            const pair1Left = block[1];
            const pair1Right = block[2];
            const pair2Left = block[3];
            const pair2Right = block[4];

            return (
              <div key={`editorial-block-${blockIdx}`} className="space-y-24 sm:space-y-36">
                {/* 1. Centered Wide Feature Card (00:00 - 00:01 & 00:06 - 00:15) */}
                {heroPhoto && (
                  <div className="max-w-4xl mx-auto">
                    {renderSeamlessLibraryCard(
                      heroPhoto,
                      'aspect-16/10',
                      'text-2xl sm:text-4xl',
                      0.04
                    )}
                  </div>
                )}

                {/* 2. Staggered Asymmetric 2-Column Pair A (00:02 - 00:04) */}
                {(pair1Left || pair1Right) && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
                    {pair1Left && (
                      <div className="lg:col-span-6">
                        {renderSeamlessLibraryCard(
                          pair1Left,
                          'aspect-4/3',
                          'text-xl sm:text-3xl',
                          -0.05
                        )}
                      </div>
                    )}
                    {pair1Right && (
                      <div className="lg:col-span-6 lg:mt-28">
                        {renderSeamlessLibraryCard(
                          pair1Right,
                          'aspect-16/10',
                          'text-xl sm:text-3xl',
                          0.11
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Staggered Asymmetric 2-Column Pair B (00:04 - 00:06) */}
                {(pair2Left || pair2Right) && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
                    {pair2Left && (
                      <div className="lg:col-span-5">
                        {renderSeamlessLibraryCard(
                          pair2Left,
                          'aspect-4/3',
                          'text-xl sm:text-2xl',
                          0.09
                        )}
                      </div>
                    )}
                    {pair2Right && (
                      <div className="lg:col-span-7">
                        {renderSeamlessLibraryCard(
                          pair2Right,
                          'aspect-16/10',
                          'text-xl sm:text-3xl',
                          -0.05
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Staggered 3-Column Parallax Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 items-start">
          {photos.map((photo, index) => {
            const colIndex = index % 3;
            const colSpeed = colIndex === 1 ? 0.08 : colIndex === 0 ? -0.04 : -0.02;
            const colOffsetClass = colIndex === 1 ? 'lg:mt-16' : colIndex === 2 ? 'lg:mt-8' : '';
            return (
              <div key={photo.id} className={colOffsetClass}>
                {renderSeamlessLibraryCard(photo, 'aspect-4/3', 'text-lg sm:text-xl', colSpeed)}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Micro-Interaction (Matches 00:16 - 00:18 of Video) */}
      <div className="pt-20 pb-4 flex flex-col items-center justify-center relative">
        <div className="text-xs sm:text-sm text-stone-600 dark:text-white/75 flex items-center gap-1.5 relative">
          <span>Of course not just that.</span>
          <button
            onMouseEnter={() => setShowSeriouslyTooltip(true)}
            onMouseLeave={() => setShowSeriouslyTooltip(false)}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-semibold text-stone-900 dark:text-white underline underline-offset-4 hover:opacity-75 transition-opacity relative"
          >
            View more
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

      {/* EDUCATIONAL TECHNICAL SHOOTING DATA 'QUICK VIEW' OVERLAY MODAL */}
      {quickViewPhoto && (() => {
        const eduExif = extractEducationalExif(quickViewPhoto);
        const isHudPinned = inlineHudPhotoIds.includes(quickViewPhoto.id);

        return (
          <div
            id="quick-view-technical-overlay"
            onClick={() => setQuickViewPhoto(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 select-none animate-apple-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl rounded-3xl ultra-glass border border-stone-200/90 dark:border-white/15 p-6 sm:p-8 shadow-2xl animate-apple-scale-in max-h-[92vh] overflow-y-auto space-y-6"
            >
              {/* Top Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Pinisara Photography · Educational Exposure Breakdown</span>
                    </span>
                  </div>
                  <h3 className="font-source-serif font-medium text-xl sm:text-2xl text-stone-900 dark:text-white">
                    {quickViewPhoto.title}
                  </h3>
                  <p className="text-xs font-mono text-stone-500 dark:text-stone-400">
                    Captured by <strong className="text-stone-900 dark:text-white">{quickViewPhoto.photographerName}</strong> at Pinnawala Central College · {quickViewPhoto.dateTaken}
                  </p>
                </div>

                <button
                  id="quick-view-close-btn"
                  onClick={() => setQuickViewPhoto(null)}
                  className="p-2 rounded-full glass-pill text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors"
                  aria-label="Close Quick View"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Thumbnail Preview + Optical Hardware Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                <div
                  onClick={() => {
                    const target = quickViewPhoto;
                    setQuickViewPhoto(null);
                    onSelectPhoto(target);
                  }}
                  className="sm:col-span-5 relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-900 cursor-pointer border border-stone-200/80 dark:border-white/15 group/qv"
                >
                  <img
                    src={quickViewPhoto.webUrl}
                    alt={quickViewPhoto.title}
                    className="w-full h-full object-cover group-hover/qv:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/75 text-[10px] font-mono text-white border border-white/15">
                    f/ {quickViewPhoto.settings}
                  </div>
                </div>

                <div className="sm:col-span-7 space-y-3">
                  <div className="p-4 rounded-2xl bg-stone-100/80 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 block font-semibold">
                      Camera & Optical Hardware
                    </span>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-mono">
                          Camera Body
                        </span>
                        <span className="font-mono font-semibold text-stone-900 dark:text-white">
                          {quickViewPhoto.camera}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-mono">
                          Lens / Sensor
                        </span>
                        <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                          {quickViewPhoto.lens || 'Standard Optical Zoom'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {quickViewPhoto.description}
                  </p>
                </div>
              </div>

              {/* Educational Exposure Triangle & Optical Parameters Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-stone-900 dark:text-white">
                  Technical Shooting Parameters & Student Learning Guide
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/70 border border-stone-200/80 dark:border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Shutter Speed</span>
                      </span>
                      <span className="font-mono text-sm font-bold text-stone-900 dark:text-white px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                        {eduExif.shutterSpeed}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {eduExif.shutterLesson}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/70 border border-stone-200/80 dark:border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                        <SunDim className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>ISO Sensitivity</span>
                      </span>
                      <span className="font-mono text-sm font-bold text-stone-900 dark:text-white px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                        {eduExif.iso}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {eduExif.isoLesson}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/70 border border-stone-200/80 dark:border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                        <Focus className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span>Focal Length</span>
                      </span>
                      <span className="font-mono text-sm font-bold text-stone-900 dark:text-white px-2.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300">
                        {eduExif.focalLength}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {eduExif.focalLesson}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/80 dark:bg-stone-900/70 border border-stone-200/80 dark:border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                        <Aperture className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Aperture (f-Stop)</span>
                      </span>
                      <span className="font-mono text-sm font-bold text-stone-900 dark:text-white px-2.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300">
                        {eduExif.aperture}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {eduExif.apertureLesson}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-stone-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => toggleInlineHud(quickViewPhoto.id)}
                  className="px-4 py-2 rounded-full glass-pill text-xs font-medium text-stone-700 dark:text-stone-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                >
                  {isHudPinned ? 'Unpin EXIF HUD from Thumbnail' : 'Pin EXIF HUD onto Thumbnail'}
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      const target = quickViewPhoto;
                      setQuickViewPhoto(null);
                      onSelectPhoto(target);
                    }}
                    className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Open 4K Lightbox</span>
                  </button>

                  <button
                    onClick={() => setQuickViewPhoto(null)}
                    className="px-5 py-2 rounded-full bg-black dark:bg-white text-white dark:text-stone-950 text-xs font-semibold shadow-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
