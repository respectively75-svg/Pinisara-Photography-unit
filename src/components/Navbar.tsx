import React, { useState } from 'react';
import { 
  Camera, 
  Search, 
  Heart, 
  Upload, 
  Menu, 
  X,
  Globe,
  Users,
  Images,
  LayoutGrid,
  Sun,
  Moon,
  Coins,
  Sparkles,
  Layers,
  Activity,
  BookOpen,
  Columns,
  Compass,
  Award,
  Clock,
  MessageSquare,
  Home,
  Briefcase,
  User,
  Mail
} from 'lucide-react';
import { SupportedLanguage, UserProfile } from '../types';
import { CURRENT_USER } from '../data/mockData';

export type AppPage =
  | 'gallery'
  | 'output'
  | 'scope'
  | 'stories'
  | 'albums'
  | 'carousel'
  | 'bts'
  | 'exhibitions'
  | 'chronicle'
  | 'optical'
  | 'collaborations'
  | 'activity'
  | 'team'
  | 'favorites'
  | 'upload'
  | 'contact';

interface NavbarProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  favoritesCount: number;
  currentUser?: UserProfile;
  onOpenAccountModal?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  currentLang,
  onLanguageChange,
  searchQuery,
  onSearchChange,
  favoritesCount,
  currentUser = CURRENT_USER,
  onOpenAccountModal = () => {},
  isDarkMode = false,
  onToggleDarkMode = () => {}
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMorePagesMenu, setShowMorePagesMenu] = useState(false);

  const primaryCapsuleItems: { id: AppPage; label: string; icon: React.ReactNode }[] = [
    { id: 'gallery', label: 'Home', icon: <Home className="w-4 h-4 stroke-[2]" /> },
    { id: 'output', label: 'Works', icon: <Briefcase className="w-4 h-4 stroke-[1.9]" /> },
    { id: 'albums', label: 'Events', icon: <Images className="w-4 h-4 stroke-[1.9]" /> },
    { id: 'stories', label: 'Stories', icon: <BookOpen className="w-4 h-4 stroke-[1.9]" /> },
    { id: 'team', label: 'Team', icon: <User className="w-4 h-4 stroke-[1.9]" /> },
    { id: 'contact', label: 'Contact', icon: <Mail className="w-4 h-4 stroke-[1.9]" /> },
  ];

  const allNavItems: { id: AppPage; label: string; icon: React.ReactNode }[] = [
    { id: 'gallery', label: 'Home', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: 'output', label: 'Works', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'scope', label: 'Scope', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'stories', label: 'Stories', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'albums', label: 'Events & Albums', icon: <Images className="w-3.5 h-3.5" /> },
    { id: 'carousel', label: 'Carousel', icon: <Columns className="w-3.5 h-3.5" /> },
    { id: 'bts', label: 'Behind the Lens', icon: <Camera className="w-3.5 h-3.5" /> },
    { id: 'exhibitions', label: 'Hall of Fame', icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'chronicle', label: 'Timeline', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'collaborations', label: 'Collab', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'team', label: 'Team', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'favorites', label: 'Favorites', icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'contact', label: "Let's Talk", icon: <MessageSquare className="w-3.5 h-3.5" /> },
  ];

  const secondaryItems = allNavItems.filter(
    (item) => !primaryCapsuleItems.some((p) => p.id === item.id)
  );

  const languages: { code: SupportedLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'ja', label: '日本語' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const availableCredits = currentUser?.credits ?? 0;

  return (
    <header 
      id="main-header" 
      className="sticky top-0 z-40 w-full px-3 sm:px-6 lg:px-8 pt-2.5 pb-2 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto">
        {/* Clean Subtle Header with Single Center Capsule */}
        <div className="relative overflow-hidden rounded-full refractive-glass-bar px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
          
          {/* Zone 1: Clean Brand Wordmark (No white box halo) */}
          <div className="relative z-10 flex items-center gap-2.5 min-w-0 shrink-0">
            <button
              id="brand-home-btn"
              onClick={() => {
                onNavigate('gallery');
                onSearchChange('');
              }}
              className="flex items-center gap-2.5 group text-left focus:outline-none min-w-0"
            >
              <div className="w-8 h-8 rounded-full bg-stone-900 dark:bg-white/15 text-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-sans font-bold text-sm sm:text-base tracking-tight text-stone-900 dark:text-white truncate hidden sm:block">
                Pinisara Photography
              </span>
            </button>
          </div>

          {/* Zone 2: Primary Navigation Links (Single-layer, scaled-back subtle active droplet) */}
          <nav
            aria-label="Primary Navigation"
            className="relative z-10 hidden md:flex items-center gap-1"
          >
            {primaryCapsuleItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => {
                    onNavigate(item.id);
                    if (searchQuery) onSearchChange('');
                  }}
                  title={item.label}
                  className={`relative flex items-center justify-center gap-2 px-3.5 lg:px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'refractive-glass-bubble text-stone-950 dark:text-white font-semibold'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="hidden lg:inline tracking-tight">{item.label}</span>
                </button>
              );
            })}

            {/* More Chapters Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMorePagesMenu((prev) => !prev)}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  secondaryItems.some((s) => s.id === activePage)
                    ? 'refractive-glass-bubble text-stone-950 dark:text-white font-semibold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
                }`}
                title="More gallery chapters & tools"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">More</span>
                {favoritesCount > 0 && (
                  <span className="text-[10px] font-mono tabular-nums text-rose-600 dark:text-rose-400 font-bold">
                    · {favoritesCount}
                  </span>
                )}
              </button>

              {showMorePagesMenu && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 mt-3 w-56 rounded-2xl bg-white/95 dark:bg-stone-950/95 backdrop-blur-xl border border-stone-200/80 dark:border-white/10 shadow-xl p-2 z-50 animate-apple-scale-in"
                  onClick={() => setShowMorePagesMenu(false)}
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-stone-400">
                    Archive Chapters
                  </div>
                  <div className="space-y-0.5">
                    {secondaryItems.map((item) => {
                      const isActive = activePage === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onNavigate(item.id);
                            if (searchQuery) onSearchChange('');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-stone-900 text-white dark:bg-white/15 dark:text-white font-semibold'
                              : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                          {item.id === 'favorites' && favoritesCount > 0 && (
                            <span className="text-[10px] font-mono tabular-nums font-bold">
                              {favoritesCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3: Clean Uncluttered Right Actions (No heavy white bubbles around every icon) */}
          <div className="relative z-10 flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Subtle Search Input */}
            <div className="hidden xl:flex relative w-44 2xl:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                id="gallery-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search archive..."
                className="w-full pl-8 pr-6 py-1.5 text-xs rounded-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-stone-300 dark:focus:border-white/20 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 dark:hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Credits Indicator (Quiet inline button) */}
            <button
              id="nav-credits-indicator"
              onClick={onOpenAccountModal}
              title={`You have ${availableCredits} credits. Click to view details.`}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-mono font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-colors"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span className="tabular-nums">{availableCredits}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="dark-mode-toggle-btn"
              onClick={onToggleDarkMode}
              className="p-2 rounded-full text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors active:scale-90"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Publish Button */}
            <button
              id="nav-publish-btn"
              onClick={() => onNavigate('upload')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-stone-900 dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Publish</span>
            </button>

            {/* User Account Button */}
            <button
              id="nav-account-btn"
              onClick={onOpenAccountModal}
              className="flex items-center gap-1.5 p-1 sm:pr-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all text-left active:scale-95"
              title="Manage Google Account, Profile & Credits"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-coolvetica text-[10px] font-bold">
                {getInitials(currentUser?.displayName || 'User')}
              </div>
              <span className="hidden md:inline text-xs font-medium text-stone-800 dark:text-stone-200 max-w-[76px] truncate">
                {currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'Account'}
              </span>
            </button>

            {/* Language Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-2 rounded-full text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white transition-colors"
                title="Select language"
              >
                <Globe className="w-4 h-4" />
              </button>

              {showLangMenu && (
                <div 
                  className="absolute right-0 mt-3 w-36 bg-white/95 dark:bg-stone-950/95 backdrop-blur-xl border border-stone-200/80 dark:border-white/10 shadow-xl rounded-2xl p-1.5 z-50 animate-apple-scale-in"
                  onClick={() => setShowLangMenu(false)}
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => onLanguageChange(l.code)}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-xl flex items-center justify-between transition-colors ${
                        currentLang === l.code
                          ? 'bg-stone-900 text-white dark:bg-white/15 dark:text-white font-semibold'
                          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <span>{l.label}</span>
                      {currentLang === l.code && <span className="font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-stone-700 dark:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 rounded-3xl bg-white/95 dark:bg-stone-950/95 backdrop-blur-xl border border-stone-200/80 dark:border-white/10 shadow-xl space-y-2 animate-apple-slide-up">
            <div className="relative w-full mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search captures..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-full bg-stone-100 dark:bg-white/5 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {allNavItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-stone-900 text-white dark:bg-white/15 dark:text-white font-semibold'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
