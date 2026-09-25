import React, { useState } from 'react';
import { Radio, Zap, ChevronRight, X } from 'lucide-react';
import { LiveNotification } from '../types';

interface LiveTickerProps {
  notifications: LiveNotification[];
  onSelectNotification: (notif: LiveNotification) => void;
  onSimulateLiveEvent: () => void;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({
  notifications,
  onSelectNotification,
  onSimulateLiveEvent
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const latestAlert = notifications[0];

  if (!latestAlert || isDismissed) return null;

  return (
    <div 
      id="live-athletics-ticker" 
      className="glass-blur border-b border-stone-200/70 dark:border-stone-800 py-1.5 px-4 text-stone-800 dark:text-stone-200 transition-all"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        
        {/* Live indicator & message */}
        <div className="flex items-center gap-2.5 overflow-hidden w-full sm:w-auto">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium text-[10px] tracking-wider uppercase border border-emerald-200 dark:border-emerald-800 whitespace-nowrap font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Wire
          </span>

          <button
            onClick={() => onSelectNotification(latestAlert)}
            className="flex items-center gap-2 hover:opacity-75 truncate text-left focus:outline-none silky-smooth"
          >
            <span className="font-semibold text-stone-900 dark:text-stone-100 truncate">
              {latestAlert.title}
            </span>
            <span className="hidden md:inline text-stone-500 dark:text-stone-400 truncate max-w-lg">
              — {latestAlert.message}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          </button>
        </div>

        {/* Action: Simulate trigger + Dismiss */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            id="simulate-live-score-btn"
            onClick={onSimulateLiveEvent}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-[11px] font-medium transition-colors border border-stone-200 dark:border-stone-700"
            title="Simulate incoming real-time score or gallery drop"
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Simulate Real-time Alert</span>
          </button>
          
          <button
            onClick={() => setIsDismissed(true)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
            title="Dismiss wire"
            aria-label="Dismiss wire"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
