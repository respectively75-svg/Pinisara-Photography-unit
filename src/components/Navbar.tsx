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
  Aperture,
  Columns,
  Compass,
  Award,
  Clock,
  MessageSquare
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

  const navItems: { id: AppPage; label: string; icon: React.ReactNode }[] = [
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
      className="sticky top-0 z-40 w-full liquid-glass border-b border-stone-200/80 dark:border-white/15 dark:text-white transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-3 overflow-visible">
          
          {/* Brand Logo - PINISARA PHOTOGRAPHY · PINNAWALA CENTRAL COLLEGE (Unclipped & shrink-0) */}
          <div className="flex items-center gap-4 sm:gap-6 min-w-0 overflow-visible">
            <button
              id="brand-home-btn"
              onClick={() => {
                onNavigate('gallery');
                onSearchChange('');
              }}
              className="flex items-center gap-3 group text-left focus:outline-none shrink-0 whitespace-nowrap overflow-visible"
            >
              <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-xs group-hover:scale-105 transition-all duration-700 shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div className="shrink-0 overflow-visible">
                <div className="flex items-center gap-1 overflow-visible">
                  <span className="font-sans font-bold text-base sm:text-lg tracking-tight text-stone-900 dark:text-white whitespace-nowrap">
                    Pinisara Photography<sup className="text-[10px] font-semibold ml-0.5">®</sup>
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 dark:text-white/65 font-mono tracking-wide whitespace-nowrap">
                  Pinnawala Central College
                </p>
              </div>
            </button>

            {/* Desktop Navigation Pages — Clean comma-separated editorial typography */}
            <nav className="hidden xl:flex items-center gap-0.5 pl-4 border-l border-stone-200/80 dark:border-white/15 overflow-x-auto no-scrollbar max-w-[42vw]">
              {navItems.map((item, idx) => {
                const isActive = activePage === item.id;
                const isLast = idx === navItems.length - 1;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => {
                      onNavigate(item.id);
                      if (searchQuery) onSearchChange('');
                    }}
                    className={`flex items-center gap-1 px-1.5 py-1 text-xs whitespace-nowrap shrink-0 transition-all duration-500 ${
                      isActive
                        ? 'text-stone-900 dark:text-white font-semibold'
                        : 'text-stone-400 dark:text-white/50 hover:text-stone-900 dark:hover:text-white font-medium'
                    }`}
                  >
                    <span>{item.label}{!isLast ? ',' : ''}</span>
                    {item.id === 'favorites' && favoritesCount > 0 && (
                      <span className="text-[10px] font-mono text-stone-900 dark:text-white font-bold ml-0.5">
                        ({favoritesCount})
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Center Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xs mx-3">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                id="gallery-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search captures, athletes, gear..."
                className="w-full pl-9 pr-7 py-1.5 text-xs rounded-full glass-pill text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:border-emerald-600 dark:focus:border-emerald-500 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 dark:hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Actions: Credits Indicator, Upload, Dark Mode, Account & Language */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Visual Credits Indicator in Navigation Bar */}
            <button
              id="nav-credits-indicator"
              onClick={onOpenAccountModal}
              title={`You have ${availableCredits} credits. Click to view details and top up.`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full glass-pill border-amber-300/70 dark:border-amber-500/30 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition-all duration-200 group active:scale-95 shadow-2xs"
            >
              <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Coins className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" />
              </div>
              <span className="font-mono text-xs font-bold text-amber-900 dark:text-amber-200">
                {availableCredits}
              </span>
              <span className="hidden sm:inline text-[10px] text-amber-800/80 dark:text-amber-300/80 font-medium">
                cr
              </span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="dark-mode-toggle-btn"
              onClick={onToggleDarkMode}
              className="p-2 rounded-full glass-pill text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-all duration-200 active:scale-90"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 rotate-0 transition-transform duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700 -rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Publish / Upload Button */}
            <button
              id="nav-publish-btn"
              onClick={() => onNavigate('upload')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-semibold active:scale-95 transition-all ${
                activePage === 'upload'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-xs'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Publish</span>
              <span className="sm:hidden">Upload</span>
            </button>

            {/* User Account Avatar Button */}
            <button
              id="nav-account-btn"
              onClick={onOpenAccountModal}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full glass-pill hover:border-black dark:hover:border-white transition-all text-left group active:scale-95 shadow-2xs"
              title="Manage Account, Profile & Credits"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-coolvetica text-[10px] font-bold ${
                currentUser?.isCreator 
                  ? 'bg-black dark:bg-stone-700 text-white' 
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}>
                {getInitials(currentUser?.displayName || 'User')}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-stone-900 dark:text-white leading-tight max-w-[85px] truncate">
                    {currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'Account'}
                  </span>
                  {currentUser?.isCreator && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  )}
                </div>
                <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500 block leading-tight">
                  {currentUser?.isCreator ? 'Creator' : 'Viewer'}
                </span>
              </div>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-2 rounded-full text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-white/10 transition-colors"
                title="Select language"
              >
                <Globe className="w-4 h-4" />
              </button>

              {showLangMenu && (
                <div 
                  className="absolute right-0 mt-2 w-36 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-stone-200/90 dark:border-white/15 p-1.5 z-50 animate-apple-scale-in"
                  onClick={() => setShowLangMenu(false)}
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => onLanguageChange(l.code)}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-xl flex items-center justify-between transition-colors ${
                        currentLang === l.code
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-semibold'
                          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <span>{l.label}</span>
                      {currentLang === l.code && <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-200 dark:border-white/10 space-y-2 animate-apple-slide-up">
            {/* Mobile Search Input */}
            <div className="relative w-full mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search captures..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-white placeholder-stone-400 border border-stone-200 dark:border-white/10 focus:outline-none"
              />
            </div>

            {/* Mobile Account & Credits Row */}
            <button
              onClick={() => {
                onOpenAccountModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-medium bg-stone-100/70 dark:bg-stone-900/80 border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white mb-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-black dark:bg-stone-700 text-white flex items-center justify-center font-coolvetica text-[10px]">
                  {getInitials(currentUser?.displayName || 'User')}
                </div>
                <span>{currentUser?.displayName || 'Account'}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-mono text-[11px] font-bold">
                <Coins className="w-3 h-3" />
                <span>{availableCredits} cr</span>
              </div>
            </button>

            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-stone-950 font-semibold'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'favorites' && favoritesCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {favoritesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </header>
  );
};
