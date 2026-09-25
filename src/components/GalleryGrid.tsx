import React, { useState } from 'react';
import { 
  Download, 
  Heart, 
  Maximize2, 
  Share2, 
  Camera, 
  Smartphone,
  Sparkles,
  Check,
  Users
} from 'lucide-react';
import { Photo, SupportedLanguage } from '../types';

interface GalleryGridProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
  onToggleFavorite: (photoId: string) => void;
  onQuickDownload: (photo: Photo, resolution: 'original' | 'web' | 'mobile') => void;
  onSharePhoto: (photo: Photo) => void;
  viewMode: 'masonry' | 'grid';
  currentLang: SupportedLanguage;
}

/**
 * Apple-grade Progressive Blur Lazy Image
 * Slow, silky smooth, pleasing reveal easing from soft frosted blur into 4K clarity.
 */
interface LazyGalleryImageProps {
  src: string;
  alt: string;
  aspectRatio?: string;
  className?: string;
}

const LazyGalleryImage: React.FC<LazyGalleryImageProps> = ({
  src,
  alt,
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden bg-stone-100 dark:bg-stone-900">
      {/* Apple-style Frosted Placeholder Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 z-0 bg-stone-200/70 dark:bg-stone-800/80 skeleton-shimmer backdrop-blur-md" />
      )}

      {hasError ? (
        <div className="w-full min-h-[220px] flex flex-col items-center justify-center p-6 text-stone-400 dark:text-stone-600 bg-stone-100 dark:bg-stone-900 text-center">
          <Camera className="w-8 h-8 mb-2 opacity-50 text-emerald-600" />
          <span className="text-xs font-mono font-medium text-stone-600 dark:text-stone-300">
            {alt}
          </span>
          <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono mt-0.5">
            4K Capture Archive
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
            isLoaded 
              ? 'opacity-100 filter-none scale-100' 
              : 'opacity-0 blur-2xl scale-106'
          } ${className}`}
        />
      )}
    </div>
  );
};

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  photos,
  onSelectPhoto,
  onToggleFavorite,
  onQuickDownload,
  onSharePhoto,
  viewMode
}) => {
  const [downloadMenuPhotoId, setDownloadMenuPhotoId] = useState<string | null>(null);

  if (photos.length === 0) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4 animate-apple-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200/80 dark:border-white/10 flex items-center justify-center mx-auto mb-4 text-stone-400 dark:text-stone-500">
          <Camera className="w-6 h-6" />
        </div>
        <h3 className="font-source-serif font-medium text-xl text-stone-900 dark:text-white">
          No Photographs Found
        </h3>
        <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
          No captures match the selected filters. Try choosing a different category or photographer.
        </p>
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

  return (
    <div id="gallery-grid-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className={viewMode === 'masonry' ? 'gallery-columns' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'}>
        {photos.map((photo, index) => {
          const isDownloadOpen = downloadMenuPhotoId === photo.id;
          const isMobileCamera = photo.camera.includes('iPhone') || photo.camera.includes('Samsung');
          const hasCollaborators = photo.collaborators && photo.collaborators.length > 0;

          return (
            <div
              key={photo.id}
              id={`photo-card-${photo.id}`}
              style={{ animationDelay: `${Math.min(index * 45, 450)}ms` }}
              className={`group relative rounded-3xl overflow-hidden ultra-glass glass-card-hover hover:border-emerald-500/80 dark:hover:border-emerald-400/80 animate-apple-fade-in ${
                viewMode === 'masonry' ? 'gallery-item' : 'flex flex-col'
              }`}
            >
              {/* Photo Image Canvas with Silky Smooth Lazy Loading */}
              <div 
                className="relative overflow-hidden cursor-pointer"
                onClick={() => onSelectPhoto(photo)}
              >
                <LazyGalleryImage
                  src={photo.webUrl}
                  alt={photo.title}
                  className="transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-[1.03]"
                />

                {/* Top Badges: 4K RAW Uncompressed & Collaborative Badge */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10 pointer-events-none">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 dark:bg-black/70 backdrop-blur-md text-white font-mono text-[9px] font-semibold tracking-wider uppercase border border-white/10">
                    4K RAW
                  </span>

                  {hasCollaborators && (
                    <span 
                      className="px-2.5 py-0.5 rounded-full bg-emerald-600/90 dark:bg-emerald-500/90 backdrop-blur-md text-white font-mono text-[9px] font-semibold flex items-center gap-1 border border-white/10 shadow-xs"
                      title={photo.collaborationNotes || `Collaborative shoot with ${photo.collaborators?.join(', ')}`}
                    >
                      <Users className="w-2.5 h-2.5" />
                      <span>Joint Shoot</span>
                    </span>
                  )}
                </div>

                {/* Top Right: Favorite button */}
                <div className="absolute top-3.5 right-3.5 z-10">
                  <button
                    id={`photo-favorite-btn-${photo.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(photo.id);
                    }}
                    className={`p-2 rounded-full backdrop-blur-xl transition-all duration-300 active:scale-90 border ${
                      photo.isFavorited
                        ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                        : 'bg-black/35 hover:bg-black/55 text-white border-white/15'
                    }`}
                    title={photo.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    aria-label="Favorite photo"
                  >
                    <Heart className={`w-3.5 h-3.5 ${photo.isFavorited ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Apple-grade Frosted Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out flex flex-col justify-end p-4 sm:p-5 text-white pointer-events-none group-hover:pointer-events-auto">
                  
                  {/* Photo Title */}
                  <h4 className="font-source-serif font-medium text-sm sm:text-base tracking-tight line-clamp-1 mb-1">
                    {photo.title}
                  </h4>

                  {/* Photographer credit with monogram & collaborators */}
                  <div className="flex flex-col gap-1 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-coolvetica text-[10px] font-bold">
                        {getInitials(photo.photographerName)}
                      </div>
                      <span className="text-xs text-stone-200 truncate font-medium">
                        {photo.photographerName}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono">
                        · {photo.camera}
                      </span>
                    </div>

                    {hasCollaborators && (
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-mono pl-7">
                        <Users className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">Co-Shooters: {photo.collaborators?.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Hover Quick Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/20">
                    
                    {/* View Fullscreen / Inspect */}
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

                    <div className="flex items-center gap-2">
                      {/* Social Share */}
                      <button
                        id={`photo-share-btn-${photo.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSharePhoto(photo);
                        }}
                        className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors backdrop-blur-md"
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
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-stone-200 text-stone-900 hover:bg-emerald-50 dark:hover:bg-white text-xs font-semibold shadow-md active:scale-95 transition-all"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Download</span>
                        </button>

                        {/* Download Resolution Menu */}
                        {isDownloadOpen && (
                          <div 
                            id={`download-resolution-dropdown-${photo.id}`}
                            className="absolute right-0 bottom-full mb-2 w-56 bg-stone-950/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 p-2 z-30 animate-apple-scale-in"
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
                              <span className="text-[10px] font-mono text-emerald-400 font-semibold">~12 MB</span>
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

              {/* Bottom Clean Card Content - Frosted Blur & Zero Clutter */}
              <div className="p-4 sm:p-4.5 flex flex-col gap-2.5 backdrop-blur-md bg-white/40 dark:bg-black/30 border-t border-white/40 dark:border-white/5">
                <div className="flex items-start justify-between gap-2">
                  <h4 
                    onClick={() => onSelectPhoto(photo)}
                    className="font-source-serif font-medium text-sm sm:text-base text-stone-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors line-clamp-1 cursor-pointer"
                  >
                    {photo.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
                  <div className="flex items-center gap-2 truncate">
                    {/* Minimalist Monogram Badge - NO FACES */}
                    <div className="w-4.5 h-4.5 rounded-full bg-stone-900 dark:bg-stone-700 text-white text-[9px] font-coolvetica font-bold flex items-center justify-center shrink-0">
                      {getInitials(photo.photographerName)}
                    </div>
                    <span className="font-medium text-stone-900 dark:text-stone-200 truncate">
                      {photo.photographerName}
                    </span>
                    {hasCollaborators && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                        +{photo.collaborators?.length}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 font-mono text-[11px] text-stone-500 dark:text-stone-400">
                    <span title="Downloads">
                      ⬇ {photo.downloadCount}
                    </span>
                    <span title="Favorites">
                      ♥ {photo.likesCount}
                    </span>
                  </div>
                </div>

                {/* Camera Body Badge with subtle divider */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-200/50 dark:border-white/10 text-[11px]">
                  <div className="flex items-center gap-1.5 font-mono text-stone-600 dark:text-stone-400">
                    {isMobileCamera ? (
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <span className="font-medium">{photo.camera}</span>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    {photo.category}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
