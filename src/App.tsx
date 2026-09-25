import React, { useState, useMemo, useEffect } from 'react';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_PHOTOS, 
  INITIAL_EVENTS,
  CREATOR_TEAM,
  CURRENT_USER,
  INITIAL_COLLABORATIVE_SETS
} from './data/mockData';
import { 
  Photo, 
  CategoryInfo, 
  SupportedLanguage,
  UserProfile,
  CollaborativeSet
} from './types';
import { Navbar, AppPage } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { GalleryGrid } from './components/GalleryGrid';
import { LightboxModal } from './components/LightboxModal';
import { PhotographersPage } from './components/PhotographersPage';
import { AlbumsPage } from './components/AlbumsPage';
import { FavoritesPage } from './components/FavoritesPage';
import { UploadPage } from './components/UploadPage';
import { AccountModal } from './components/AccountModal';
import { CollaborationsPage } from './components/CollaborationsPage';
import { Camera, Smartphone, ArrowRight, ArrowUp, ShieldCheck, Sparkles, Coins } from 'lucide-react';

export default function App() {
  // Theme State: Dark Mode with System Preference & LocalStorage Fallback
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pinisara_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('pinisara_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('pinisara_theme', 'light');
    }
  }, [isDarkMode]);

  // Page Navigation State
  const [activePage, setActivePage] = useState<AppPage>('gallery');

  // User & Creator Account State (with credits balance)
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);

  // Application State
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPhotographer, setSelectedPhotographer] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'downloads' | 'likes'>('newest');
  const [viewMode, setViewMode] = useState<'masonry' | 'grid'>('masonry');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [onlyCollaborations, setOnlyCollaborations] = useState<boolean>(false);

  // Photos & Data
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [categories, setCategories] = useState<CategoryInfo[]>(INITIAL_CATEGORIES);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  // Non-intrusive Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Photos for Gallery View
  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = photo.title.toLowerCase().includes(q);
        const matchDesc = photo.description.toLowerCase().includes(q);
        const matchPhotographer = photo.photographerName.toLowerCase().includes(q);
        const matchCamera = photo.camera.toLowerCase().includes(q);
        const matchTags = photo.tags.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchPhotographer && !matchCamera && !matchTags) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && photo.category !== selectedCategory) {
        return false;
      }

      // Photographer filter
      if (selectedPhotographer !== 'all') {
        const creator = CREATOR_TEAM.find(c => c.id === selectedPhotographer);
        if (creator && !photo.photographerName.toLowerCase().includes(creator.name.toLowerCase())) {
          return false;
        }
      }

      // Favorites filter
      if (onlyFavorites && !photo.isFavorited) {
        return false;
      }

      // Collaborations filter (Team joint coverage)
      if (onlyCollaborations && (!photo.collaborators || photo.collaborators.length === 0)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'downloads') return b.downloadCount - a.downloadCount;
      if (sortBy === 'likes') return b.likesCount - a.likesCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [photos, searchQuery, selectedCategory, selectedPhotographer, onlyFavorites, onlyCollaborations, sortBy]);

  // Available Tags
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    photos.forEach(p => p.tags.forEach(t => set.add(t)));
    return Array.from(set);
  }, [photos]);

  // Selected Photo for Lightbox
  const selectedPhoto = useMemo(() => {
    return photos.find(p => p.id === selectedPhotoId) || null;
  }, [photos, selectedPhotoId]);

  const selectedPhotoIndex = useMemo(() => {
    if (!selectedPhotoId) return -1;
    return filteredPhotos.findIndex(p => p.id === selectedPhotoId);
  }, [filteredPhotos, selectedPhotoId]);

  // Toggle Favorite
  const handleToggleFavorite = (photoId: string) => {
    setPhotos(prev => prev.map(p => {
      if (p.id === photoId) {
        const updatedFav = !p.isFavorited;
        return {
          ...p,
          isFavorited: updatedFav,
          likesCount: updatedFav ? p.likesCount + 1 : Math.max(0, p.likesCount - 1)
        };
      }
      return p;
    }));
  };

  // 1-Click Free Download
  const handleDownload = (photo: Photo, resolution: 'original' | 'web' | 'mobile') => {
    setPhotos(prev => prev.map(p => {
      if (p.id === photo.id) {
        return { ...p, downloadCount: p.downloadCount + 1 };
      }
      return p;
    }));

    let targetUrl = photo.originalUrl;
    let filenameSuffix = '4K-RAW';
    if (resolution === 'web') {
      targetUrl = photo.webUrl;
      filenameSuffix = '1080p-web';
    } else if (resolution === 'mobile') {
      targetUrl = photo.thumbnailUrl;
      filenameSuffix = 'mobile-wallpaper';
    }

    const safeTitle = photo.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `pinisara-${safeTitle}-${filenameSuffix}.jpg`;

    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Downloading "${photo.title}" in ${resolution.toUpperCase()} from Pinisara Photographers.`);
  };

  // Add Photo from Upload Page + Reward +50 Credits
  const handleAddPhoto = (newPhoto: Photo) => {
    setPhotos(prev => [newPhoto, ...prev]);
    setCategories(prev => prev.map(cat => {
      if (cat.id === newPhoto.category || cat.id === 'all') {
        return { ...cat, photoCount: cat.photoCount + 1 };
      }
      return cat;
    }));

    // Reward creator with +50 credits
    setCurrentUser(prev => ({
      ...prev,
      credits: (prev.credits ?? 0) + 50,
      uploadedCount: (prev.uploadedCount ?? 0) + 1
    }));

    showToast(`"${newPhoto.title}" published! +50 Credits awarded to your account.`);
  };

  // Lightbox Prev & Next
  const handlePrevPhoto = () => {
    if (filteredPhotos.length === 0) return;
    if (selectedPhotoIndex > 0) {
      setSelectedPhotoId(filteredPhotos[selectedPhotoIndex - 1].id);
    } else {
      setSelectedPhotoId(filteredPhotos[filteredPhotos.length - 1].id);
    }
  };

  const handleNextPhoto = () => {
    if (filteredPhotos.length === 0) return;
    if (selectedPhotoIndex >= 0 && selectedPhotoIndex < filteredPhotos.length - 1) {
      setSelectedPhotoId(filteredPhotos[selectedPhotoIndex + 1].id);
    } else {
      setSelectedPhotoId(filteredPhotos[0].id);
    }
  };

  const favoritesCount = photos.filter(p => p.isFavorited).length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="relative min-h-screen bg-stone-50 dark:bg-[#080808] text-stone-900 dark:text-stone-100 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-stone-900 flex flex-col font-sans transition-colors duration-300">
      
      {/* Ambient Apple Glass Liquid Lighting Backdrops (Makes blur vivid in light & dark mode) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 left-[10%] w-[580px] h-[580px] bg-gradient-to-br from-emerald-400/25 via-teal-300/20 to-transparent dark:from-emerald-500/15 dark:to-transparent rounded-full blur-[130px] animate-orb-drift" />
        <div className="absolute top-[28%] -right-28 w-[540px] h-[540px] bg-gradient-to-bl from-sky-400/22 via-cyan-300/16 to-transparent dark:from-sky-500/12 dark:to-transparent rounded-full blur-[140px] animate-orb-drift-reverse" />
        <div className="absolute top-[60%] left-[-80px] w-[500px] h-[500px] bg-gradient-to-tr from-amber-300/20 via-emerald-300/16 to-transparent dark:from-emerald-800/15 dark:to-transparent rounded-full blur-[130px] animate-orb-drift" />
        <div className="absolute -bottom-32 right-[15%] w-[550px] h-[550px] bg-gradient-to-tl from-indigo-300/18 via-teal-300/16 to-transparent dark:from-teal-900/20 dark:to-transparent rounded-full blur-[140px] animate-orb-drift-reverse" />
      </div>

      {/* Non-intrusive Toast */}
      {toastMessage && (
        <div 
          id="system-toast"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-stone-950/90 dark:bg-white/95 text-white dark:text-stone-900 text-xs shadow-2xl border border-white/10 dark:border-stone-200 flex items-center gap-2.5 backdrop-blur-xl animate-apple-slide-up"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-600"></div>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Global Navigation Header with Dark Mode & Credits Indicator */}
      <Navbar
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q && activePage !== 'gallery') {
            setActivePage('gallery');
          }
        }}
        favoritesCount={favoritesCount}
        currentUser={currentUser}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
      />

      {/* MULTI-PAGE VIEW ROUTING */}
      {activePage === 'gallery' && (
        <>
          {/* Apple-grade Minimalist Editorial Hero with Ambient Glass & Zero Clutter */}
          <section id="gallery-hero-banner" className="pt-8 sm:pt-12 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full animate-apple-fade-in">
            <div className="flex flex-col gap-6 pb-6 border-b border-stone-200/80 dark:border-white/10">
              
              <div className="max-w-3xl space-y-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-coolvetica text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    Pinisara Photographers
                  </span>
                  <span className="font-tempting italic text-stone-500 dark:text-stone-400 text-sm">
                    Fine Student Sports Journalism & Milestone Archive
                  </span>
                </div>

                <h1 className="font-source-serif font-normal text-3xl sm:text-5xl lg:text-6xl text-stone-900 dark:text-white tracking-tight leading-[1.12]">
                  High-Resolution Public Archive
                </h1>

                <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                  Decisive championship plays, athletic tournaments, and school ceremonies captured in uncompressed 4K resolution. Free 1-click downloads for students, athletes, and families.
                </p>
              </div>

              {/* Creators Filter Bar - Wrapped in Ultra Glass */}
              <div className="p-4 sm:p-5 rounded-3xl ultra-glass space-y-3 shadow-md">
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
                    Filter by Photographer & Camera Body
                  </span>
                  {selectedPhotographer !== 'all' && (
                    <button
                      onClick={() => setSelectedPhotographer('all')}
                      className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 underline text-[11px] font-medium"
                    >
                      Show All Photographers
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                  <button
                    id="filter-creator-all"
                    onClick={() => setSelectedPhotographer('all')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap shrink-0 border transition-all duration-200 active:scale-95 ${
                      selectedPhotographer === 'all'
                        ? 'bg-black text-white dark:bg-white dark:text-stone-950 border-black dark:border-white shadow-xs font-semibold'
                        : 'glass-pill text-stone-700 dark:text-stone-300 hover:bg-white/90 dark:hover:bg-stone-800 font-medium'
                    }`}
                  >
                    <span>All Photographers</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                      selectedPhotographer === 'all' 
                        ? 'bg-white/20 dark:bg-black/20 text-white dark:text-stone-950' 
                        : 'bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}>
                      {photos.length}
                    </span>
                  </button>

                  {CREATOR_TEAM.map((creator) => {
                    const isSelected = selectedPhotographer === creator.id;

                    return (
                      <button
                        key={creator.id}
                        id={`filter-creator-${creator.id}`}
                        onClick={() => setSelectedPhotographer(isSelected ? 'all' : creator.id)}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap shrink-0 border transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? 'bg-black text-white dark:bg-white dark:text-stone-950 border-black dark:border-white shadow-xs font-semibold'
                            : 'glass-pill text-stone-700 dark:text-stone-300 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/80 font-medium'
                        }`}
                      >
                        {/* Minimalist Monogram - NO FACES */}
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center font-coolvetica text-[9px] font-bold ${
                          isSelected 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                        }`}>
                          {getInitials(creator.name)}
                        </div>

                        <span>{creator.name}</span>

                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                          isSelected 
                            ? 'bg-emerald-800 dark:bg-emerald-200 text-emerald-200 dark:text-emerald-900 font-bold' 
                            : 'bg-emerald-50 dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 font-semibold'
                        }`}>
                          {creator.camera}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Photographer Detail Pill */}
                {selectedPhotographer !== 'all' && (() => {
                  const activeCreator = CREATOR_TEAM.find(c => c.id === selectedPhotographer);
                  if (!activeCreator) return null;
                  return (
                    <div className="mt-2 p-3.5 rounded-2xl ultra-glass flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-700 dark:text-stone-300 animate-apple-fade-in shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <Camera className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-semibold text-stone-900 dark:text-white">
                            {activeCreator.name}
                          </span>
                          <span className="mx-1.5 text-stone-400 dark:text-stone-600">·</span>
                          <span className="font-mono text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                            {activeCreator.camera}
                          </span>
                          <span className="mx-1.5 text-stone-400 dark:text-stone-600">·</span>
                          <span className="text-stone-500 dark:text-stone-400 text-[11px]">
                            {activeCreator.role}
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                        {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'} shown
                      </div>
                    </div>
                  );
                })()}

              </div>

            </div>
          </section>

          {/* Filter Bar */}
          <FilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            creators={CREATOR_TEAM}
            selectedPhotographer={selectedPhotographer}
            onSelectPhotographer={setSelectedPhotographer}
            selectedDateRange={selectedDateRange}
            onSelectDateRange={setSelectedDateRange}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            sortBy={sortBy}
            onSelectSortBy={setSortBy}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            availableTags={availableTags}
            totalResults={filteredPhotos.length}
            currentLang={currentLang}
            onlyFavorites={onlyFavorites}
            onToggleOnlyFavorites={() => setOnlyFavorites(prev => !prev)}
            onlyCollaborations={onlyCollaborations}
            onToggleOnlyCollaborations={() => setOnlyCollaborations(prev => !prev)}
            onResetFilters={() => {
              setSelectedCategory('all');
              setSelectedPhotographer('all');
              setSelectedDateRange('all');
              setSelectedTag('');
              setSearchQuery('');
              setOnlyFavorites(false);
              setOnlyCollaborations(false);
            }}
          />

          {/* Main Gallery Grid with Progressive Blur Lazy Loading */}
          <main className="flex-1">
            <GalleryGrid
              photos={filteredPhotos}
              onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
              onToggleFavorite={handleToggleFavorite}
              onQuickDownload={handleDownload}
              onSharePhoto={(photo) => setSelectedPhotoId(photo.id)}
              viewMode={viewMode}
              currentLang={currentLang}
            />
          </main>
        </>
      )}

      {/* DEDICATED PHOTOGRAPHERS PAGE */}
      {activePage === 'team' && (
        <PhotographersPage
          creators={CREATOR_TEAM}
          photos={photos}
          onSelectPhotographer={(creatorId) => {
            setSelectedPhotographer(creatorId);
            setSelectedCategory('all');
            setActivePage('gallery');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
        />
      )}

      {/* DEDICATED ALBUMS & EVENTS PAGE */}
      {activePage === 'albums' && (
        <AlbumsPage
          events={INITIAL_EVENTS}
          onSelectEventCategory={(category) => {
            setSelectedCategory(category);
            setSelectedPhotographer('all');
            setActivePage('gallery');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* DEDICATED FAVORITES PAGE */}
      {activePage === 'favorites' && (
        <FavoritesPage
          photos={photos}
          onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
          onToggleFavorite={handleToggleFavorite}
          onQuickDownload={handleDownload}
          onNavigateToGallery={() => {
            setActivePage('gallery');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* DEDICATED UPLOAD / PUBLISH PAGE */}
      {activePage === 'upload' && (
        <UploadPage
          categories={categories}
          currentUser={currentUser}
          onAddPhoto={handleAddPhoto}
          onNavigateToGallery={() => {
            setActivePage('gallery');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAccountModal={() => setIsAccountModalOpen(true)}
        />
      )}

      {/* Lightbox Modal (Accessible on all pages) */}
      {selectedPhoto && (
        <LightboxModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhotoId(null)}
          onPrev={handlePrevPhoto}
          onNext={handleNextPhoto}
          onToggleFavorite={handleToggleFavorite}
          onDownload={handleDownload}
          currentLang={currentLang}
          allPhotosCount={filteredPhotos.length}
          currentIndex={selectedPhotoIndex >= 0 ? selectedPhotoIndex : 0}
        />
      )}

      {/* User and Creator Account & Credits Management Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentUser={currentUser}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          showToast(`Switched account to ${user.displayName} (${user.credits ?? 0} Credits)`);
        }}
        onUpdateCredits={(newTotal) => {
          setCurrentUser(prev => ({ ...prev, credits: newTotal }));
        }}
        onNavigateToUpload={() => {
          setIsAccountModalOpen(false);
          setActivePage('upload');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onCreateAccount={(newUser) => {
          setCurrentUser(newUser);
          showToast(`Welcome ${newUser.displayName}! Created ${newUser.isCreator ? 'Creator' : 'Standard'} account (+${newUser.credits} Credits).`);
        }}
      />

      {/* Minimalist Editorial Footer with Dark Mode */}
      <footer id="main-footer" className="border-t border-stone-200/80 dark:border-white/10 bg-white/70 dark:bg-stone-950/70 backdrop-blur-xl py-10 text-xs text-stone-600 dark:text-stone-400 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-9 h-9 rounded-2xl bg-black dark:bg-stone-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Camera className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="font-coolvetica font-bold text-sm text-stone-900 dark:text-white tracking-wide">
                PINISARA PHOTOGRAPHERS
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Hasaranga Jayawardhana · Dulen Induwara · Sayul Angammana · Udula Matheesha
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
            <button 
              onClick={() => {
                setActivePage('gallery');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Gallery
            </button>
            <button 
              onClick={() => {
                setActivePage('team');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Photographers
            </button>
            <button 
              onClick={() => {
                setActivePage('albums');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Albums
            </button>
            <button 
              onClick={() => {
                setActivePage('favorites');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Favorites ({favoritesCount})
            </button>
            <button 
              onClick={() => {
                setActivePage('upload');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-emerald-700 dark:text-emerald-400 font-semibold hover:text-emerald-900 dark:hover:text-emerald-300 transition-colors"
            >
              Publish (+50 cr)
            </button>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-1 hover:text-stone-900 dark:hover:text-white transition-colors ml-2"
            >
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
