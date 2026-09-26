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
  CreatorProfile,
  CollaborativeSet,
  EventItem
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
import {
  SettingsModal,
  DEFAULT_VISUAL_SETTINGS,
  AppVisualSettings
} from './components/SettingsModal';
import {
  db,
  collection,
  onSnapshot,
  savePhotoToFirestore,
  deletePhotoFromFirestore,
  saveUserProfileToFirestore,
  deleteDoc,
  doc
} from './firebase';
import { CollaborationsPage } from './components/CollaborationsPage';
import { ActivityFeed } from './components/ActivityFeed';
import { BootLoader } from './components/BootLoader';
import { SeamlessPortalSection } from './components/SeamlessPortalSection';
import { CreativeOutputSection } from './components/CreativeOutputSection';
import { FeaturedStoriesSection } from './components/FeaturedStoriesSection';
import { SpineCarouselSection } from './components/SpineCarouselSection';
import { FloatingBottomDock } from './components/FloatingBottomDock';
import { SmoothScrollController, CursorParallaxImage } from './components/ParallaxAndScroll';
import {
  ScopePage,
  BehindTheScenesPage,
  ExhibitionsPage,
  ChroniclePage,
  LetsTalkPage
} from './components/ExtraProfessionalPages';
import { Camera, Smartphone, ArrowRight, ArrowUp, ShieldCheck, Sparkles, Coins, Layers, Activity as ActivityIcon, Trash2, RotateCcw } from 'lucide-react';

export default function App() {
  // Boot-Up Animation State (Video 3: 0% -> 63% -> 100% with hairline progress bar)
  const [isBooting, setIsBooting] = useState<boolean>(true);
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

  // Interactive First-Page Hero Fan-Out State (matches 00:00 -> 00:04 reference video choreography)
  const [isHeroShowcaseActive, setIsHeroShowcaseActive] = useState<boolean>(false);

  // User & Creator Account State (no hardcoded accounts; only real registered accounts)
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [registeredAccounts, setRegisteredAccounts] = useState<UserProfile[]>([]);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [visualSettings, setVisualSettings] = useState<AppVisualSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pinisara_visual_settings');
        if (saved) return { ...DEFAULT_VISUAL_SETTINGS, ...JSON.parse(saved) };
      } catch {
        // Ignore parse error
      }
    }
    return { ...DEFAULT_VISUAL_SETTINGS, isDarkMode };
  });

  // Apply customizable Blur, Liquid Glass, Theme Surface, and Accent CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--app-blur', `${visualSettings.blurIntensity}px`);
    root.style.setProperty(
      '--app-glass-opacity',
      (visualSettings.liquidGlassIntensity / 100).toFixed(2)
    );
    root.style.setProperty(
      '--app-glass-dark-opacity',
      Math.min(0.98, visualSettings.liquidGlassIntensity / 100 + 0.02).toFixed(2)
    );
    root.style.setProperty(
      '--app-glass-border',
      (visualSettings.glassSpecularBorder / 100).toFixed(2)
    );
    root.style.setProperty('--app-accent', visualSettings.accentColor);
    root.style.setProperty('--app-accent-soft', `${visualSettings.accentColor}2e`);
    root.style.setProperty('--app-bg-light', visualSettings.lightSurfaceColor);
    root.style.setProperty('--app-bg-dark', visualSettings.darkSurfaceColor);
    root.style.setProperty('--app-anim-speed', visualSettings.enhancedAnimations ? '1' : '0.05');
    try {
      localStorage.setItem('pinisara_visual_settings', JSON.stringify(visualSettings));
    } catch {
      // Ignore storage error
    }
  }, [visualSettings]);

  const handleUpdateVisualSettings = (updates: Partial<AppVisualSettings>) => {
    setVisualSettings((prev) => {
      const next = { ...prev, ...updates };
      if (typeof updates.isDarkMode === 'boolean' && updates.isDarkMode !== isDarkMode) {
        setIsDarkMode(updates.isDarkMode);
      }
      return next;
    });
  };

  // Sync registered users from Firestore /users collection
  useEffect(() => {
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const loaded: UserProfile[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          loaded.push({
            userId: d.userId || docSnap.id,
            displayName: d.displayName || 'Google User',
            email: d.email || 'verified@gmail.com',
            role: d.role || 'student',
            avatarUrl: d.avatarUrl,
            bio: d.bio || '',
            affiliation: d.affiliation || 'Pinisara Photography',
            camera: d.camera,
            lens: d.lens,
            isCreator: Boolean(d.isCreator || d.role === 'photographer' || d.role === 'admin'),
            credits: typeof d.credits === 'number' ? d.credits : 300,
            favorites: [],
            gmailVerified: true,
            moderationStatus: d.moderationStatus || 'approved',
            createdAt: d.createdAt
          });
        });
        if (loaded.length > 0) {
          setRegisteredAccounts((prev) => {
            const map = new Map<string, UserProfile>();
            prev.forEach((u) => map.set(u.userId, u));
            loaded.forEach((u) => map.set(u.userId, u));
            return Array.from(map.values());
          });
        }
      },
      () => {}
    );
    return () => unsubUsers();
  }, []);

  // Creators list is empty until creators register as creators
  const activeCreators = useMemo<CreatorProfile[]>(() => {
    return registeredAccounts
      .filter((u) => u.isCreator && u.moderationStatus !== 'suspended')
      .map((u) => ({
        id: u.userId,
        name: u.displayName,
        camera: u.camera || 'Canon DSLR',
        lens: u.lens || '18-55mm IS',
        role: u.role === 'admin' ? 'Admin & Lead Photographer' : 'Registered Creator',
        avatar:
          u.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        handle: `@${u.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        bio: u.bio || `Verified Creator shooting with ${u.camera || 'Canon DSLR'}`,
        photoCount: u.uploadedCount || 1
      }));
  }, [registeredAccounts]);

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

  // Photos, Events & Categories Data
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [categories, setCategories] = useState<CategoryInfo[]>(INITIAL_CATEGORIES);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qPhoto = params.get('photo');
      if (qPhoto) return qPhoto;
    }
    return null;
  });

  // Sync ?photo=<id> query param in URL bar for shareable mobile QR codes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (selectedPhotoId) {
      url.searchParams.set('photo', selectedPhotoId);
      if (isBooting) setIsBooting(false);
    } else {
      url.searchParams.delete('photo');
    }
    window.history.replaceState({}, '', url.toString());
  }, [selectedPhotoId]);

  // Non-intrusive Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Update the cover thumbnail of an event
  const handleUpdateEventThumbnail = (eventId: string, newCoverUrl: string) => {
    setEvents(prev =>
      prev.map(evt => (evt.id === eventId ? { ...evt, coverPhotoUrl: newCoverUrl } : evt))
    );
    showToast('Event cover thumbnail updated.');
  };

  // Add many images to one event (and optionally set a new cover thumbnail)
  const handleAddMultiplePhotosToEvent = (
    eventId: string,
    newPhotos: Photo[],
    newCoverUrl?: string
  ) => {
    if (newPhotos.length === 0) return;

    setPhotos(prev => [...newPhotos, ...prev]);

    setEvents(prev =>
      prev.map(evt => {
        if (evt.id === eventId) {
          return {
            ...evt,
            photoCount: evt.photoCount + newPhotos.length,
            coverPhotoUrl: newCoverUrl || evt.coverPhotoUrl
          };
        }
        return evt;
      })
    );

    const targetCat = newPhotos[0]?.category;
    setCategories(prev =>
      prev.map(cat => {
        if (cat.id === targetCat || cat.id === 'all') {
          return { ...cat, photoCount: cat.photoCount + newPhotos.length };
        }
        return cat;
      })
    );

    // Reward creator credits
    const creditBonus = newPhotos.length * 25;
    setCurrentUser(prev => ({
      ...prev,
      credits: (prev.credits ?? 0) + creditBonus,
      uploadedCount: (prev.uploadedCount ?? 0) + newPhotos.length
    }));

    showToast(
      `Added ${newPhotos.length} ${newPhotos.length === 1 ? 'photo' : 'photos'} to event album! (+${creditBonus} Credits)`
    );
  };

  // Create a brand new school event album with multiple initial photos
  const handleCreateNewEvent = (newEvent: EventItem, initialPhotos: Photo[]) => {
    setEvents(prev => [newEvent, ...prev]);
    if (initialPhotos.length > 0) {
      setPhotos(prev => [...initialPhotos, ...prev]);
    }
    showToast(`Created event "${newEvent.title}" with ${initialPhotos.length} photos!`);
  };

  // Update aspect ratio of a photo from LightboxModal and persist to Firestore
  const handleUpdatePhotoAspectRatio = (
    photoId: string,
    aspectRatio: Photo['aspectRatio'],
    objectFit: 'cover' | 'contain' = 'cover'
  ) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId) {
          const updated = { ...p, aspectRatio, objectFit };
          savePhotoToFirestore(updated).catch(() => {});
          return updated;
        }
        return p;
      })
    );
  };

  // Admin Moderation for Users
  const handleModerateUser = async (
    userId: string,
    updates: Partial<UserProfile> | 'delete'
  ) => {
    if (updates === 'delete') {
      setRegisteredAccounts((prev) => prev.filter((u) => u.userId !== userId));
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch {}
      showToast('Removed user account.');
      return;
    }
    setRegisteredAccounts((prev) =>
      prev.map((u) => {
        if (u.userId === userId) {
          const next = { ...u, ...updates };
          saveUserProfileToFirestore(next).catch(() => {});
          return next;
        }
        return u;
      })
    );
    showToast('Updated user account role / moderation status.');
  };

  // Admin Moderation for Photos
  const handleModeratePhoto = async (
    photoId: string,
    status: 'approved' | 'pending' | 'rejected' | 'delete'
  ) => {
    if (status === 'delete') {
      handleDeletePhoto(photoId);
      deletePhotoFromFirestore(photoId).catch(() => {});
      return;
    }
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId) {
          const updated = { ...p, moderationStatus: status };
          savePhotoToFirestore(updated).catch(() => {});
          return updated;
        }
        return p;
      })
    );
    showToast(`Photo moderation set to ${status}.`);
  };

  // Delete a single photo (including any default example image)
  const handleDeletePhoto = (photoId: string) => {
    const target = photos.find(p => p.id === photoId);
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    if (selectedPhotoId === photoId) {
      setSelectedPhotoId(null);
    }
    showToast(target ? `Deleted "${target.title}" from the gallery.` : 'Deleted photo from the gallery.');
  };

  // Delete all default example images at once
  const handleDeleteAllExamplePhotos = () => {
    const exampleIds = new Set(INITIAL_PHOTOS.map(p => p.id));
    setPhotos(prev => prev.filter(p => !exampleIds.has(p.id)));
    setSelectedPhotoId(null);
    showToast('All example images deleted! You can now upload your own photos.');
  };

  // Restore example images if desired
  const handleRestoreExamplePhotos = () => {
    setPhotos(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const missingExamples = INITIAL_PHOTOS.filter(p => !existingIds.has(p.id));
      return [...prev, ...missingExamples];
    });
    showToast('Restored example images.');
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
        const creator = activeCreators.find(c => c.id === selectedPhotographer);
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
    <div className="relative min-h-screen bg-stone-50 dark:bg-black text-stone-900 dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black flex flex-col font-sans transition-colors duration-700">
      {/* Smooth Inertial Scroll Controller (Decelerates smoothly when stopping wheel/touch scroll) */}
      {visualSettings.smoothScrollEnabled && <SmoothScrollController />}

      {/* Non-intrusive Toast */}
      {toastMessage && (
        <div 
          id="system-toast"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-stone-950/90 dark:bg-white/95 text-white dark:text-black text-xs shadow-2xl border border-white/10 dark:border-white/30 flex items-center gap-2.5 backdrop-blur-2xl animate-apple-slide-up"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-black"></div>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Boot-Up Animation (Video 3: 0% -> 63% -> 100% with 1px hairline progress bar) */}
      {isBooting && <BootLoader onComplete={() => setIsBooting(false)} />}

      {/* Global Navigation Header with Liquid Glass, Pure Dark Mode & Credits Indicator */}
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
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => {
          setIsDarkMode((prev) => {
            const next = !prev;
            setVisualSettings((s) => ({ ...s, isDarkMode: next }));
            return next;
          });
        }}
      />

      {/* GPU-Accelerated Smooth Scroll Container with Exponential Friction Drift */}
      <div
        id="smooth-scroll-container"
        className="w-full flex-1 flex flex-col overflow-x-clip overflow-y-visible"
      >

      {/* MULTI-PAGE VIEW ROUTING */}
      {activePage === 'gallery' && (
        <>
          {/* FULL-VIEWPORT FIRST PAGE — Unclipped Layout, Slow Blur & Interactive Cursor Parallax */}
          <section 
            id="gallery-hero-banner" 
            className="relative min-h-[calc(100vh-5rem)] w-full overflow-visible flex flex-col justify-between px-4 sm:px-8 lg:px-12 py-6 sm:py-10 transition-colors duration-1000"
          >
            {/* Dimmed Frosted Blur Backdrop Layer that smoothly activates during Hero Showcase Expansion */}
            <div 
              className={`absolute inset-0 z-20 pointer-events-none transition-all duration-1400 cubic-bezier(0.16, 1, 0.3, 1) ${
                isHeroShowcaseActive 
                  ? 'bg-stone-950/75 dark:bg-black/85 backdrop-blur-md opacity-100' 
                  : 'opacity-0 backdrop-blur-none'
              }`}
            />

            {/* Main First-Page Split Grid (Left Column: Stacked Display + Bottom Bio | Right Column: Interactive Hero Stage) */}
            <div className="relative max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              
              {/* LEFT COLUMN: Stacked 4-Line Headline (Top) + About Pinisara Photography / Pinnawala Central College (Bottom) */}
              <div 
                className={`lg:col-span-5 flex flex-col justify-between py-2 sm:py-4 z-10 transition-all duration-1400 cubic-bezier(0.16, 1, 0.3, 1) ${
                  isHeroShowcaseActive ? 'opacity-30 blur-[2px] scale-[0.98]' : 'opacity-100 blur-0 scale-100'
                }`}
              >
                {/* Top-Left Stacked Display Typography */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-coolvetica text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 dark:bg-white/10 text-emerald-800 dark:text-white border border-emerald-200 dark:border-white/20 backdrop-blur-xl">
                      Pinisara Photography
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-stone-500 dark:text-white/70">
                      Pinnawala Central College
                    </span>
                  </div>

                  {/* 4-Line Stacked Display Headline matching reference font design & placement */}
                  <h1 className="font-coolvetica font-bold uppercase text-5xl sm:text-6xl lg:text-[4.35rem] xl:text-[4.9rem] text-stone-900 dark:text-white tracking-[-0.03em] leading-[0.93] select-none">
                    <span className="block">CAPTURING</span>
                    <span className="block">MOMENTS</span>
                    <span className="block">
                      THAT{' '}
                      <span className="font-tempting italic font-normal capitalize tracking-normal text-[0.94em] text-emerald-700 dark:text-white">
                        More
                      </span>
                    </span>
                    <span className="block">MOVE YOU.</span>
                  </h1>

                  <p className="font-source-serif text-base sm:text-lg text-stone-700 dark:text-white/85 tracking-tight pt-1">
                    School Photo Archive ·{' '}
                    <span className="font-tempting italic text-stone-500 dark:text-white/65">
                      Shot on Our Cameras & Phones
                    </span>
                  </p>
                </div>

                {/* Bottom-Left Bio / Society Identity Block */}
                <div className="pt-8 lg:pt-12 max-w-md space-y-2.5">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-stone-400 dark:text-white/60 block">
                    About Us · Pinnawala Central College
                  </span>
                  <p className="text-stone-700 dark:text-white/80 text-xs sm:text-sm leading-relaxed font-medium">
                    We are <strong className="font-semibold text-stone-900 dark:text-white">Pinisara Photography</strong>, the student photography club of{' '}
                    <strong className="font-semibold text-stone-900 dark:text-white">Pinnawala Central College</strong>. No Hollywood movie rigs—just four friends with two Canon DSLRs and two phones capturing assemblies, Pirith ceremonies, elections, and sports for everyone to download for free.
                  </p>

                  <div className="pt-2 flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => setIsHeroShowcaseActive(prev => !prev)}
                      className="px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold tracking-wide hover:opacity-85 transition-all duration-700 shadow-xs"
                    >
                      {isHeroShowcaseActive ? 'Reset Stage View' : 'Preview Recent Work Stage'}
                    </button>
                    <button
                      onClick={() => {
                        setActivePage('albums');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 rounded-full glass-pill text-stone-700 dark:text-white text-xs font-medium transition-all duration-700"
                    >
                      Manage Event Albums
                    </button>
                    <a
                      href="#archive-controls-anchor"
                      className="px-4 py-2 rounded-full glass-pill text-stone-700 dark:text-white text-xs font-medium transition-all duration-700"
                    >
                      Explore Archive ↓
                    </a>
                    {photos.length > 0 && (
                      <button
                        onClick={handleDeleteAllExamplePhotos}
                        className="px-4 py-2 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-medium flex items-center gap-1.5 transition-all duration-500 shadow-xs"
                        title="Delete all default example images"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Example Images</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Full-Height Hero Portrait with Cursor Parallax & Slow Blur Satellite Fan-Out Stage */}
              <div 
                className="lg:col-span-7 relative flex items-center justify-end min-h-[440px] sm:min-h-[540px] lg:min-h-[calc(100vh-8.5rem)] z-30"
                onMouseEnter={() => setIsHeroShowcaseActive(true)}
                onMouseLeave={() => setIsHeroShowcaseActive(false)}
              >
                {/* Central Hero Photograph Container — Shifts smoothly to center on hover/click + Cursor Parallax */}
                <div 
                  onClick={() => setIsHeroShowcaseActive(prev => !prev)}
                  className={`relative w-full lg:w-[92%] h-[440px] sm:h-[540px] lg:h-[calc(100vh-8.5rem)] overflow-hidden cursor-pointer transition-all duration-1500 cubic-bezier(0.16, 1, 0.3, 1) ${
                    isHeroShowcaseActive 
                      ? 'lg:-translate-x-[24%] scale-[0.94] rounded-none shadow-[0_35px_90px_-15px_rgba(0,0,0,0.85)]' 
                      : 'translate-x-0 scale-100 rounded-none shadow-2xl'
                  }`}
                >
                  <CursorParallaxImage
                    src={photos[0]?.originalUrl || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=2560&q=95'}
                    alt={photos[0]?.title || 'Pinisara Photography — Pinnawala Central College'}
                    intensity={28}
                    tiltIntensity={5}
                    containerClassName="w-full h-full"
                  >
                    {/* Subtle bottom gradient for RECENT WORK typography */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent transition-opacity duration-1200 pointer-events-none ${
                        isHeroShowcaseActive ? 'opacity-100' : 'opacity-40'
                      }`}
                    />

                    {/* "RECENT WORK" Editorial Overlay Title at Bottom-Left */}
                    <div 
                      className={`absolute bottom-5 left-6 sm:bottom-7 sm:left-8 z-20 transition-all duration-1200 cubic-bezier(0.16, 1, 0.3, 1) pointer-events-none ${
                        isHeroShowcaseActive 
                          ? 'opacity-100 blur-0 translate-y-0' 
                          : 'opacity-0 blur-sm translate-y-4'
                      }`}
                    >
                      <span className="font-sans font-light uppercase tracking-[0.06em] text-2xl sm:text-4xl lg:text-[2.75rem] text-white/95 drop-shadow-md">
                        RECENT WORK
                      </span>
                    </div>

                    {/* Interactive Hint Badge when idle */}
                    <div 
                      className={`absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl text-white font-mono text-[10px] uppercase tracking-wider border border-white/20 transition-all duration-1000 pointer-events-none ${
                        isHeroShowcaseActive ? 'opacity-0 blur-xs' : 'opacity-100 blur-0'
                      }`}
                    >
                      Move Cursor for Parallax · Hover to Expand
                    </div>
                  </CursorParallaxImage>
                </div>

                {/* FLOATING SATELLITE CARD 1 (Top-Left of Central Hero — Slow Blur Reveal) */}
                {photos[1] && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhotoId(photos[1].id);
                    }}
                    className={`hidden sm:block absolute z-40 cursor-pointer transition-all duration-1500 cubic-bezier(0.16, 1, 0.3, 1) ${
                      isHeroShowcaseActive
                        ? 'opacity-100 blur-0 top-[6%] left-[2%] lg:left-[-16%] scale-100 translate-y-0'
                        : 'opacity-0 blur-md top-[25%] left-[15%] scale-75 translate-y-6 pointer-events-none'
                    }`}
                  >
                    <div className="inline-block mb-1 px-2 py-0.5 bg-white/95 dark:bg-black/90 backdrop-blur-xl text-stone-900 dark:text-white font-mono text-[9px] tracking-wider border border-white/20 shadow-xs">
                      f/ {photos[1].settings || '1/800s · f/4.0 · ISO 400'}
                    </div>
                    <div className="w-44 lg:w-56 aspect-4/3 border-2 border-white/95 shadow-2xl overflow-hidden bg-black group/sat">
                      <img
                        src={photos[1].thumbnailUrl}
                        alt={photos[1].title}
                        className="w-full h-full object-cover group-hover/sat:scale-105 transition-transform duration-1000"
                      />
                    </div>
                  </div>
                )}

                {/* FLOATING SATELLITE CARD 2 (Bottom-Left over Headline — Slow Blur Reveal) */}
                {photos[2] && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhotoId(photos[2].id);
                    }}
                    className={`hidden sm:block absolute z-40 cursor-pointer transition-all duration-1500 delay-100 cubic-bezier(0.16, 1, 0.3, 1) ${
                      isHeroShowcaseActive
                        ? 'opacity-100 blur-0 bottom-[16%] left-[4%] lg:left-[-32%] scale-100 translate-x-0'
                        : 'opacity-0 blur-md bottom-[25%] left-[10%] scale-75 translate-x-12 pointer-events-none'
                    }`}
                  >
                    <div className="inline-block mb-1 px-2 py-0.5 bg-white/95 dark:bg-black/90 backdrop-blur-xl text-stone-900 dark:text-white font-mono text-[9px] tracking-wider border border-white/20 shadow-xs">
                      f/ {photos[2].settings || '1/250s · f/1.8 · ISO 800'}
                    </div>
                    <div className="w-52 lg:w-68 aspect-4/3 border-2 border-white/95 shadow-2xl overflow-hidden bg-black group/sat">
                      <img
                        src={photos[2].thumbnailUrl}
                        alt={photos[2].title}
                        className="w-full h-full object-cover group-hover/sat:scale-105 transition-transform duration-1000"
                      />
                    </div>
                  </div>
                )}

                {/* FLOATING SATELLITE CARD 3 (Bottom-Right overlapping Central Hero — Slow Blur Reveal) */}
                {photos[4] && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhotoId(photos[4].id);
                    }}
                    className={`hidden sm:block absolute z-40 cursor-pointer transition-all duration-1500 delay-150 cubic-bezier(0.16, 1, 0.3, 1) ${
                      isHeroShowcaseActive
                        ? 'opacity-100 blur-0 bottom-[8%] right-[12%] lg:right-[20%] scale-100 translate-y-0'
                        : 'opacity-0 blur-md bottom-[20%] right-[30%] scale-75 translate-y-8 pointer-events-none'
                    }`}
                  >
                    <div className="inline-block mb-1 px-2 py-0.5 bg-white/95 dark:bg-black/90 backdrop-blur-xl text-stone-900 dark:text-white font-mono text-[9px] tracking-wider border border-white/20 shadow-xs">
                      f/ {photos[4].settings || '1/640s · f/1.6 · ISO 64'}
                    </div>
                    <div className="w-48 lg:w-60 aspect-4/3 border-2 border-white/95 shadow-2xl overflow-hidden bg-black group/sat">
                      <img
                        src={photos[4].thumbnailUrl}
                        alt={photos[4].title}
                        className="w-full h-full object-cover group-hover/sat:scale-105 transition-transform duration-1000"
                      />
                    </div>
                  </div>
                )}

                {/* FLOATING SATELLITE CARD 4 (Top-Right inside Central Hero — Slow Blur Reveal, Zero Edge Clipping) */}
                {photos[6] && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhotoId(photos[6].id);
                    }}
                    className={`hidden sm:block absolute z-40 cursor-pointer transition-all duration-1500 delay-200 cubic-bezier(0.16, 1, 0.3, 1) ${
                      isHeroShowcaseActive
                        ? 'opacity-100 blur-0 top-[22%] right-[2%] lg:right-[4%] scale-100 translate-x-0'
                        : 'opacity-0 blur-md top-[30%] right-[20%] scale-75 -translate-x-8 pointer-events-none'
                    }`}
                  >
                    <div className="inline-block mb-1 px-2 py-0.5 bg-white/95 dark:bg-black/90 backdrop-blur-xl text-stone-900 dark:text-white font-mono text-[9px] tracking-wider border border-white/20 shadow-xs">
                      f/ {photos[6].settings || '1/400s · f/2.4 · ISO 100'}
                    </div>
                    <div className="w-44 lg:w-56 aspect-4/3 border-2 border-white/95 shadow-2xl overflow-hidden bg-black group/sat">
                      <img
                        src={photos[6].thumbnailUrl}
                        alt={photos[6].title}
                        className="w-full h-full object-cover group-hover/sat:scale-105 transition-transform duration-1000"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* SEAMLESS ANIMATION BETWEEN PAGE 1 & PAGE 2 (Unclipped Viewfinder Showcase + Student Gear Breakdown) */}
          <SeamlessPortalSection
            photos={photos}
            onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
          />

          {/* PAGE 2 SCROLLING DESIGN: "Our Creative Output" Asymmetric Showcase */}
          <CreativeOutputSection
            photos={photos}
            onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
            onDeletePhoto={handleDeletePhoto}
          />

          {/* PAGE 3 SCROLLING DESIGN: "Featured Stories" (01)-(04) Split Screen + Center X/Y Coordinate Loupe */}
          <FeaturedStoriesSection
            photos={photos}
            onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
          />

          {/* PAGE 4 PHOTO CAROUSEL: "CHAPTER 4 · UPCOMING RELEASES" Spine-to-Cover Monograph Carousel */}
          <SpineCarouselSection
            photos={photos}
            onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
          />

          {/* Creators Filter Bar Section Below Curated Chapters */}
          <section id="archive-controls-anchor" className="pt-12 pb-2 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <div className="p-4 sm:p-5 rounded-3xl ultra-glass space-y-3 shadow-md">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-white/70">
                <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
                  Pinisara Photography Crew · Filter by Student Photographer & Camera/Phone
                </span>
                {selectedPhotographer !== 'all' && (
                  <button
                    onClick={() => setSelectedPhotographer('all')}
                    className="text-stone-900 dark:text-white underline text-[11px] font-medium"
                  >
                    Show All Photographers
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                <button
                  id="filter-creator-all"
                  onClick={() => setSelectedPhotographer('all')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap shrink-0 border transition-all duration-500 active:scale-95 ${
                    selectedPhotographer === 'all'
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs font-semibold'
                      : 'glass-pill text-stone-700 dark:text-white/80 hover:bg-white/90 dark:hover:bg-white/15 font-medium'
                  }`}
                >
                  <span>All Photographers</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                    selectedPhotographer === 'all' 
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black' 
                      : 'bg-stone-200/60 dark:bg-white/10 text-stone-600 dark:text-white/70'
                  }`}>
                    {photos.length}
                  </span>
                </button>

                {activeCreators.map((creator) => {
                  const isSelected = selectedPhotographer === creator.id;

                  return (
                    <button
                      key={creator.id}
                      id={`filter-creator-${creator.id}`}
                      onClick={() => setSelectedPhotographer(isSelected ? 'all' : creator.id)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap shrink-0 border transition-all duration-500 active:scale-95 ${
                        isSelected
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs font-semibold'
                          : 'glass-pill text-stone-700 dark:text-white/80 hover:bg-white/90 dark:hover:bg-white/15 font-medium'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center font-coolvetica text-[9px] font-bold ${
                        isSelected 
                          ? 'bg-white/25 dark:bg-black/25 text-white dark:text-black' 
                          : 'bg-stone-200 dark:bg-white/15 text-stone-700 dark:text-white'
                      }`}>
                        {getInitials(creator.name)}
                      </div>

                      <span>{creator.name}</span>

                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        isSelected 
                          ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black font-bold' 
                          : 'bg-stone-100 dark:bg-white/10 text-stone-700 dark:text-white/80 font-semibold'
                      }`}>
                        {creator.camera}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedPhotographer !== 'all' && (() => {
                const activeCreator = activeCreators.find(c => c.id === selectedPhotographer);
                if (!activeCreator) return null;
                return (
                  <div className="mt-2 p-3.5 rounded-2xl ultra-glass flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-700 dark:text-white/85 animate-apple-fade-in shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <Camera className="w-4 h-4 text-stone-900 dark:text-white shrink-0" />
                      <div>
                        <span className="font-semibold text-stone-900 dark:text-white">
                          {activeCreator.name}
                        </span>
                        <span className="mx-1.5 text-stone-400 dark:text-white/40">·</span>
                        <span className="font-mono text-stone-800 dark:text-white font-semibold text-[11px]">
                          {activeCreator.camera}
                        </span>
                        <span className="mx-1.5 text-stone-400 dark:text-white/40">·</span>
                        <span className="text-stone-500 dark:text-white/70 text-[11px]">
                          {activeCreator.role}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-white/70 font-mono">
                      {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'} shown
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>

          {/* Filter Bar */}
          <FilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            creators={activeCreators}
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
              onDeletePhoto={handleDeletePhoto}
              onDeleteAllExamplePhotos={handleDeleteAllExamplePhotos}
              onRestoreExamplePhotos={handleRestoreExamplePhotos}
              viewMode={viewMode}
              currentLang={currentLang}
            />
          </main>

          {/* Real-Time Activity Feed Section (New Photo Uploads & Upcoming Pinnawala Central College Events) */}
          <ActivityFeed
            photos={photos}
            events={events}
            onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              const el = document.getElementById('gallery-filter-toolbar');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onNavigateToCollaborations={() => {
              setActivePage('collaborations');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            compact={true}
          />
        </>
      )}

      {/* DEDICATED CREATIVE OUTPUT PAGE (Video 1) */}
      {activePage === 'output' && (
        <CreativeOutputSection
          photos={photos}
          onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
          onDeletePhoto={handleDeletePhoto}
          onExploreMore={() => {
            setActivePage('stories');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* DEDICATED SCOPE & GEAR PAGE */}
      {activePage === 'scope' && (
        <ScopePage
          photos={photos}
          onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
          onNavigate={(page) => {
            setActivePage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* DEDICATED FEATURED STORIES PAGE (Video 2) */}
      {activePage === 'stories' && (
        <FeaturedStoriesSection
          photos={photos}
          onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
        />
      )}

      {/* DEDICATED SPINE CAROUSEL PAGE (Video 4) */}
      {activePage === 'carousel' && (
        <SpineCarouselSection
          photos={photos}
          onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
        />
      )}

      {/* DEDICATED BEHIND THE LENS (BTS) PAGE */}
      {activePage === 'bts' && (
        <BehindTheScenesPage
          photos={photos}
          onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
        />
      )}

      {/* DEDICATED EXHIBITIONS & HALL OF FAME PAGE */}
      {activePage === 'exhibitions' && (
        <ExhibitionsPage
          photos={photos}
          onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
        />
      )}

      {/* DEDICATED COLLEGE TIMELINE / CHRONICLE PAGE */}
      {activePage === 'chronicle' && (
        <ChroniclePage
          photos={photos}
          onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
        />
      )}

      {/* DEDICATED OPTICAL VIEWFINDER & GEAR PAGE (Video 5) */}
      {activePage === 'optical' && (
        <SeamlessPortalSection
          photos={photos}
          onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
          onTransitionToNextSection={() => {
            setActivePage('output');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* DEDICATED COLLABORATIONS DASHBOARD PAGE */}
      {activePage === 'collaborations' && (
        <CollaborationsPage
          collaborativeSets={INITIAL_COLLABORATIVE_SETS}
          photos={photos}
          creators={activeCreators}
          onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
          onQuickDownload={handleDownload}
          onNavigateToUpload={() => {
            setActivePage('upload');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* DEDICATED REAL-TIME ACTIVITY FEED PAGE */}
      {activePage === 'activity' && (
        <ActivityFeed
          photos={photos}
          events={events}
          onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setActivePage('gallery');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateToCollaborations={() => {
            setActivePage('collaborations');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* DEDICATED PHOTOGRAPHERS PAGE */}
      {activePage === 'team' && (
        <PhotographersPage
          creators={activeCreators}
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

      {/* DEDICATED ALBUMS & EVENTS PAGE (With Change Event Thumbnail + Add Many Images to One Event) */}
      {activePage === 'albums' && (
        <AlbumsPage
          events={events}
          photos={photos}
          onSelectEventCategory={(category) => {
            setSelectedCategory(category);
            setSelectedPhotographer('all');
            setActivePage('gallery');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectPhoto={(photo) => setSelectedPhotoId(photo.id)}
          onUpdateEventThumbnail={handleUpdateEventThumbnail}
          onAddMultiplePhotosToEvent={handleAddMultiplePhotosToEvent}
          onCreateNewEvent={handleCreateNewEvent}
          onDeletePhoto={handleDeletePhoto}
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

      {/* DEDICATED LET'S TALK / REQUEST COVERAGE PAGE */}
      {activePage === 'contact' && <LetsTalkPage />}

      </div>

      {/* Lightbox Modal (Accessible on all pages, with Keyboard Navigation & Aspect Ratio Controls) */}
      {selectedPhoto && (
        <LightboxModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhotoId(null)}
          onPrev={handlePrevPhoto}
          onNext={handleNextPhoto}
          onToggleFavorite={handleToggleFavorite}
          onDownload={handleDownload}
          onDeletePhoto={handleDeletePhoto}
          onUpdateAspectRatio={handleUpdatePhotoAspectRatio}
          currentLang={currentLang}
          allPhotosCount={filteredPhotos.length}
          currentIndex={selectedPhotoIndex >= 0 ? selectedPhotoIndex : 0}
        />
      )}

      {/* User & Creator Account Panel (Real Google Sign-In, 4-Digit Gmail Verification Code, Admin Moderation) */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentUser={currentUser}
        registeredAccounts={registeredAccounts}
        photos={photos}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          showToast(`Switched account to ${user.displayName} (${user.credits ?? 0} Credits)`);
        }}
        onUpdateCredits={(newTotal) => {
          setCurrentUser((prev) => ({ ...prev, credits: newTotal }));
        }}
        onNavigateToUpload={() => {
          setIsAccountModalOpen(false);
          setActivePage('upload');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onCreateAccount={(newUser) => {
          setCurrentUser(newUser);
          setRegisteredAccounts((prev) => {
            const filtered = prev.filter((u) => u.userId !== newUser.userId);
            return [newUser, ...filtered];
          });
          showToast(
            `Welcome ${newUser.displayName}! Gmail-verified ${
              newUser.isCreator ? 'Creator' : 'Viewer'
            } account activated (+${newUser.credits} Credits).`
          );
        }}
        onModerateUser={handleModerateUser}
        onModeratePhoto={handleModeratePhoto}
      />

      {/* Visual & Performance Settings Panel (Blur Intensity, Liquid Glass, Theme Colors, Animations) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={visualSettings}
        onUpdateSettings={handleUpdateVisualSettings}
        onResetSettings={() => {
          setVisualSettings(DEFAULT_VISUAL_SETTINGS);
          setIsDarkMode(DEFAULT_VISUAL_SETTINGS.isDarkMode);
          showToast('Reset visual & performance settings to fast 120fps defaults.');
        }}
      />

      {/* Liquid Glass Bottom Navigation Bar (6 Core Sections + Clean Account Panel + Settings Trigger) */}
      <FloatingBottomDock
        activePage={activePage}
        onNavigate={(page) => setActivePage(page)}
        onReplayBoot={() => setIsBooting(true)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        isCreator={currentUser?.isCreator}
        mfaVerified={Boolean(currentUser?.gmailVerified)}
      />

      {/* Minimalist Editorial Footer with Pure Dark Mode */}
      <footer id="main-footer" className="border-t border-stone-200/80 dark:border-white/15 bg-white/70 dark:bg-black/80 backdrop-blur-2xl pt-10 pb-24 text-xs text-stone-600 dark:text-white/70 mt-auto transition-colors duration-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-9 h-9 rounded-2xl bg-black dark:bg-white/10 border border-transparent dark:border-white/20 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-coolvetica font-bold text-sm text-stone-900 dark:text-white tracking-wide">
                PINISARA PHOTOGRAPHY · PINNAWALA CENTRAL COLLEGE
              </p>
              <p className="text-[11px] text-stone-500 dark:text-white/60">
                Hasaranga Jayawardhana · Dulen Induwara · Sayul Angammana · Udula Matheesha
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium">
            <button 
              onClick={() => {
                setActivePage('gallery');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => {
                setActivePage('output');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Works
            </button>
            <button 
              onClick={() => {
                setActivePage('scope');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Scope & Gear
            </button>
            <button 
              onClick={() => {
                setActivePage('stories');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Stories
            </button>
            <button 
              onClick={() => {
                setActivePage('albums');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Events & Albums
            </button>
            <button 
              onClick={() => {
                setActivePage('bts');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Behind the Lens
            </button>
            <button 
              onClick={() => {
                setActivePage('exhibitions');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Hall of Fame
            </button>
            <button 
              onClick={() => {
                setActivePage('chronicle');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Timeline
            </button>
            <button 
              onClick={() => {
                setActivePage('collaborations');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Collab
            </button>
            <button 
              onClick={() => {
                setActivePage('team');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Team
            </button>
            <button 
              onClick={() => {
                setActivePage('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Let's Talk
            </button>
            <button 
              onClick={() => {
                setActivePage('upload');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-stone-900 dark:text-white font-semibold hover:opacity-75 transition-opacity"
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
