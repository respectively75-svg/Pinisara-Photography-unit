import React from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trophy, 
  Image as ImageIcon, 
  Radio, 
  Sparkles,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { LiveNotification, SupportedLanguage } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: LiveNotification[];
  onSelectNotification: (notif: LiveNotification) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectNotification,
  onMarkAllRead,
  onClearAll
}) => {
  if (!isOpen) return null;

  const getIcon = (type: LiveNotification['type']) => {
    switch (type) {
      case 'game_score':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      case 'new_gallery':
        return <ImageIcon className="w-4 h-4 text-emerald-500" />;
      case 'photographer_feature':
        return <Sparkles className="w-4 h-4 text-sky-500" />;
      default:
        return <Radio className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div id="notifications-backdrop" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-[#142019] border-l border-[#E8EFE8] dark:border-[#283a2d] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8EFE8] dark:border-[#283a2d] flex items-center justify-between bg-[#EBF1EA]/50 dark:bg-[#18251c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#344C3D] text-white flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#BFCFBB]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-[#243328] dark:text-[#E2EBE2]">
                Athletic Activity Wire
              </h3>
              <p className="text-[11px] text-[#738A6E] dark:text-[#8EA58C]">
                Real-time scores, gallery drops, and media updates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2 bg-stone-50 dark:bg-[#111a14] border-b border-[#E8EFE8] dark:border-[#283a2d] flex items-center justify-between text-xs">
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-[#738A6E] hover:text-[#344C3D] font-medium"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>

          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-rose-500 hover:text-rose-700 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear wire</span>
          </button>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E8EFE8] dark:divide-[#283a2d]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-xs">
              No recent notifications on the wire.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onSelectNotification(n)}
                className={`p-4 cursor-pointer transition-colors flex items-start gap-3 ${
                  !n.read
                    ? 'bg-[#EBF1EA]/60 dark:bg-[#1E2E24]/50'
                    : 'hover:bg-stone-50 dark:hover:bg-[#18251c]'
                }`}
              >
                <div className="p-2 rounded-xl bg-white dark:bg-[#18251c] shadow-xs shrink-0 mt-0.5 border border-stone-200 dark:border-stone-800">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="font-bold text-xs text-[#243328] dark:text-[#E2EBE2] truncate">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                      {n.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-[#738A6E] dark:text-[#8EA58C] leading-snug line-clamp-2">
                    {n.message}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#344C3D] dark:text-[#BFCFBB] flex items-center gap-1">
                      <span>View details</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
