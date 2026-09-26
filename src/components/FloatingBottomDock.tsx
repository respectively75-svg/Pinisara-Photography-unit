import React, { useState } from 'react';
import { ArrowUp, ShieldCheck } from 'lucide-react';
import { AppPage } from './Navbar';

interface FloatingBottomDockProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  onReplayBoot?: () => void;
  onOpenAccountModal?: () => void;
  isCreator?: boolean;
  mfaVerified?: boolean;
}

export const FloatingBottomDock: React.FC<FloatingBottomDockProps> = ({
  activePage,
  onNavigate,
  onOpenAccountModal,
  isCreator = true,
  mfaVerified = true
}) => {
  // Only the 6 most important sections in the bottom navigation bar
  const dockItems: { id: AppPage; label: string }[] = [
    { id: 'gallery', label: 'Home' },
    { id: 'output', label: 'Works' },
    { id: 'carousel', label: 'Bookshelf' },
    { id: 'albums', label: 'Events' },
    { id: 'stories', label: 'Stories' },
    { id: 'upload', label: 'Publish' }
  ];

  return (
    <div
      id="floating-bottom-dock"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] overflow-visible pointer-events-auto"
    >
      <div
        className="relative flex items-center gap-1 sm:gap-1.5 px-2.5 py-2 rounded-full liquid-glass-dock"
      >
        {/* Scroll to Top Circle Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-stone-700 dark:text-white/80 hover:bg-stone-200/60 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-all duration-500 shrink-0"
          title="Back to top"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>

        {/* The 6 Core Navigation Sections */}
        <nav className="relative z-10 flex items-center gap-1 sm:gap-1.5" aria-label="Bottom Primary Navigation">
          {dockItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                id={`bottom-dock-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-sans transition-all duration-500 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm scale-[1.02]'
                    : 'text-stone-800 dark:text-white/80 hover:text-black dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-white/10 font-medium'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Secure Google + 2FA Account Badge Trigger inside Liquid Glass Bar */}
        {onOpenAccountModal && (
          <button
            id="bottom-dock-account-2fa"
            onClick={onOpenAccountModal}
            className="relative z-10 ml-0.5 pl-2.5 pr-3 py-1.5 rounded-full glass-pill flex items-center gap-1.5 text-[11px] font-mono text-stone-900 dark:text-white hover:scale-105 transition-all duration-500 shrink-0"
            title="Google Account & 2-Factor Authentication Security (Creator & Viewer)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-white shrink-0" />
            <span className="hidden sm:inline font-semibold">
              {isCreator ? 'Creator 2FA' : 'Viewer 2FA'}
            </span>
            {mfaVerified && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-white" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
