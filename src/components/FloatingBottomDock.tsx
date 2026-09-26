import React from 'react';
import { ArrowUp, Sliders, User } from 'lucide-react';
import { AppPage } from './Navbar';

interface FloatingBottomDockProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  onReplayBoot?: () => void;
  onOpenAccountModal?: () => void;
  onOpenSettingsModal?: () => void;
  isCreator?: boolean;
  mfaVerified?: boolean;
}

export const FloatingBottomDock: React.FC<FloatingBottomDockProps> = ({
  activePage,
  onNavigate,
  onOpenAccountModal,
  onOpenSettingsModal
}) => {
  const dockItems: { id: AppPage; label: string }[] = [
    { id: 'gallery', label: 'Home' },
    { id: 'output', label: 'Works' },
    { id: 'albums', label: 'Events' },
    { id: 'stories', label: 'Stories' },
    { id: 'team', label: 'Team' },
    { id: 'upload', label: 'Publish' }
  ];

  return (
    <div
      id="floating-bottom-dock"
      className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[96vw] pointer-events-auto animate-spring-pop"
    >
      <div className="relative flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-2.5 py-1.5 sm:py-2 rounded-full liquid-glass-dock overflow-x-auto no-scrollbar max-w-full">
        {/* Scroll to Top Circle Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-stone-700 dark:text-white/80 hover:bg-stone-200/60 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-all duration-200 active:scale-90 shrink-0"
          title="Back to top"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>

        {/* The 6 Core Navigation Sections */}
        <nav className="relative z-10 flex items-center gap-0.5 sm:gap-1.5" aria-label="Bottom Primary Navigation">
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
                style={
                  isActive
                    ? {
                        backgroundColor: 'var(--app-accent, #10b981)',
                        color: '#ffffff'
                      }
                    : undefined
                }
                className={`px-2.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-sans transition-all duration-300 whitespace-nowrap shrink-0 active:scale-95 ${
                  isActive
                    ? 'font-semibold shadow-sm scale-[1.03]'
                    : 'text-stone-800 dark:text-white/80 hover:text-black dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-white/10 font-medium'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Account Panel Trigger (Clean "Account" button without "Creator 2FA" label) */}
        {onOpenAccountModal && (
          <button
            id="bottom-dock-account-btn"
            onClick={onOpenAccountModal}
            className="relative z-10 ml-0.5 px-2.5 sm:px-3 py-1.5 rounded-full glass-pill flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-stone-900 dark:text-white hover:bg-stone-200/60 dark:hover:bg-white/15 transition-all duration-200 active:scale-95 shrink-0"
            title="Open Account Panel (Google Sign-In, Gmail Verification, Admin & Credits)"
          >
            <User className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--app-accent, #10b981)' }} />
            <span>Account</span>
          </button>
        )}

        {/* Visual & Performance Settings Trigger */}
        {onOpenSettingsModal && (
          <button
            id="bottom-dock-settings-btn"
            onClick={onOpenSettingsModal}
            className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-stone-700 dark:text-white/80 hover:bg-stone-200/60 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-all duration-200 active:scale-90 shrink-0"
            title="Visual & Performance Settings (Blur, Liquid Glass, Colors)"
            aria-label="Open Visual Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
