import React, { useEffect, useRef, useState } from 'react';
import { Search, X, Sparkles } from 'lucide-react';

interface NavbarSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  matchingCount?: number;
  totalCount?: number;
  isMobile?: boolean;
}

const QUICK_SEARCH_CHIPS = ['Assembly', 'Pirith', 'Cricket', 'Parliament', 'Canon', 'iPhone'];

export const NavbarSearchBar: React.FC<NavbarSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  matchingCount,
  isMobile = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut (Cmd/Ctrl + K or '/') to focus the Navbar search bar
  useEffect(() => {
    if (isMobile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === '/' && !isTyping) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  return (
    <div className="relative w-full">
      <div
        className={`relative flex items-center w-full rounded-full glass-pill transition-all duration-200 ${
          isFocused
            ? 'ring-2 ring-emerald-500/30 border-emerald-500 dark:border-emerald-400 scale-[1.01]'
            : ''
        }`}
      >
        <Search
          className={`ml-3.5 w-3.5 h-3.5 shrink-0 transition-colors ${
            isFocused || searchQuery
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-stone-400'
          }`}
        />
        <input
          ref={inputRef}
          id={isMobile ? 'mobile-navbar-search-input' : 'gallery-search-input'}
          type="text"
          value={searchQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 160)}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search photos, events, cameras, tags..."
          className="w-full pl-2.5 pr-16 py-1.5 text-xs bg-transparent text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none"
          aria-label="Real-time gallery search"
        />

        {/* Real-time filtered count badge or keyboard shortcut hint */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery ? (
            <>
              {typeof matchingCount === 'number' && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold">
                  {matchingCount}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  inputRef.current?.focus();
                }}
                className="p-0.5 rounded-full text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            !isMobile && (
              <span className="hidden xl:inline-block px-1.5 py-0.5 rounded-md bg-stone-200/70 dark:bg-white/10 text-stone-500 dark:text-white/50 font-mono text-[10px]">
                ⌘K
              </span>
            )
          )}
        </div>
      </div>

      {/* Quick Real-Time Filter Suggestions Dropdown when focused */}
      {isFocused && !searchQuery && !isMobile && (
        <div className="absolute left-0 right-0 mt-2 p-2.5 rounded-2xl liquid-glass shadow-xl border border-stone-200/80 dark:border-white/15 z-50 animate-spring-pop">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-white/55 mb-1.5 px-1">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>Instant Real-Time Filter</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {QUICK_SEARCH_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSearchChange(chip);
                }}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium glass-pill hover:border-emerald-500 transition-all active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
