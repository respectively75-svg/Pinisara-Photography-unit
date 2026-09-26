import React from 'react';
import { Home, Briefcase, Images, BookOpen, User, Mail, Upload, ShieldCheck } from 'lucide-react';
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
  const dockItems: { id: AppPage; label: string; icon: React.ReactNode }[] = [
    { id: 'gallery', label: 'Home', icon: <Home className="w-4 h-4 stroke-[2]" /> },
    { id: 'output', label: 'Works', icon: <Briefcase className="w-4 h-4 stroke-[1.9]" /> },
    { id: 'albums', label: 'Events', icon: <Images className="w-4 h-4 stroke-[1.9]" /> },
    { id: 'stories', label: 'Stories', icon: <BookOpen className="w-4 h-4 stroke-[1.9]" /> },
    { id: 'team', label: 'Team', icon: <User className="w-4 h-4 stroke-[1.9]" /> },
    { id: 'contact', label: 'Contact', icon: <Mail className="w-4 h-4 stroke-[1.9]" /> },
    { id: 'upload', label: 'Publish', icon: <Upload className="w-4 h-4 stroke-[1.9]" /> }
  ];

  return (
    <div
      id="floating-bottom-dock"
      className="fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[96vw] pointer-events-auto"
    >
      <div className="relative overflow-hidden refractive-glass-bar rounded-full px-2 sm:px-3 py-1.5 flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar max-w-full">
        <nav
          className="relative z-10 flex items-center gap-1"
          aria-label="Bottom Navigation"
        >
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
                title={item.label}
                className={`relative flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap shrink-0 active:scale-95 ${
                  isActive
                    ? 'refractive-glass-bubble text-stone-950 dark:text-white font-semibold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white font-medium'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden sm:inline text-xs tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {onOpenAccountModal && (
          <button
            id="bottom-dock-account-2fa"
            onClick={onOpenAccountModal}
            className="relative z-10 px-3 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-1.5 text-xs font-mono text-stone-800 dark:text-stone-200 transition-all duration-200 shrink-0 active:scale-95"
            title="Google Account & Gmail Verification Code"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden md:inline font-semibold text-[11px]">
              {isCreator ? 'Creator' : 'Viewer'}
            </span>
            {mfaVerified && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
