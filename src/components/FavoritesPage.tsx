import React from 'react';
import { Heart, Download, Maximize2, ArrowRight } from 'lucide-react';
import { Photo, SupportedLanguage } from '../types';

interface FavoritesPageProps {
  photos: Photo[];
  onSelectPhoto: (photo: Photo) => void;
  onToggleFavorite: (photoId: string) => void;
  onQuickDownload: (photo: Photo, resolution: 'original' | 'web' | 'mobile') => void;
  onNavigateToGallery: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  photos,
  onSelectPhoto,
  onToggleFavorite,
  onQuickDownload,
  onNavigateToGallery
}) => {
  const favoritePhotos = photos.filter((p) => p.isFavorited);

  return (
    <div id="favorites-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full animate-apple-fade-in">
      {/* Editorial Header */}
      <div className="max-w-3xl mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-coolvetica text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            Personal Collection
          </span>
          <span className="font-tempting italic text-stone-500 dark:text-stone-400 text-sm">
            Saved High-Resolution Captures
          </span>
        </div>

        <h1 className="font-source-serif font-normal text-3xl sm:text-5xl text-stone-900 dark:text-white tracking-tight leading-tight">
          Saved Favorites
        </h1>

        <p className="mt-2 text-stone-600 dark:text-stone-400 text-xs sm:text-sm leading-relaxed">
          {favoritePhotos.length} {favoritePhotos.length === 1 ? 'photo' : 'photos'} saved for quick access and free 1-click 4K downloads.
        </p>
      </div>

      {favoritePhotos.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-stone-900/40 p-8 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-source-serif font-medium text-xl text-stone-900 dark:text-white">
            No saved photos yet
          </h3>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-1.5 mb-6 max-w-md mx-auto">
            Click the heart icon on any photo in the Pinisara Photographers gallery to save it to your personal collection.
          </p>
          <button
            onClick={onNavigateToGallery}
            className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-stone-950 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-xs font-semibold inline-flex items-center gap-2 transition-all active:scale-95"
          >
            <span>Browse Public Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritePhotos.map((photo) => (
            <div
              key={photo.id}
              className="group rounded-3xl ultra-glass overflow-hidden shadow-lg hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-2xl transition-all duration-300 flex flex-col"
            >
              <div 
                className="relative aspect-4/3 overflow-hidden bg-stone-100 dark:bg-stone-800 cursor-pointer"
                onClick={() => onSelectPhoto(photo)}
              >
                <img
                  src={photo.webUrl}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(photo.id);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-stone-900/90 text-rose-500 hover:bg-white dark:hover:bg-stone-800 shadow-sm transition-transform active:scale-90"
                  title="Remove from favorites"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-mono border border-white/10">
                  {photo.camera}
                </div>
              </div>

              <div className="p-4.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 
                    onClick={() => onSelectPhoto(photo)}
                    className="font-source-serif font-medium text-base text-stone-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer line-clamp-1 mb-1 transition-colors"
                  >
                    {photo.title}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                    Photo by {photo.photographerName}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-100 dark:border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => onSelectPhoto(photo)}
                    className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => onQuickDownload(photo, 'original')}
                    className="px-3 py-1.5 rounded-xl bg-black dark:bg-white text-white dark:text-stone-950 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download 4K</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
