import React from 'react';
import { Calendar, MapPin, Images, ArrowRight, Trophy, Users, ShieldCheck, Sparkles } from 'lucide-react';
import { EventItem } from '../types';

interface AlbumsPageProps {
  events: EventItem[];
  onSelectEventCategory: (category: string) => void;
}

export const AlbumsPage: React.FC<AlbumsPageProps> = ({
  events,
  onSelectEventCategory
}) => {
  return (
    <div id="albums-events-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full animate-apple-fade-in">
      {/* Editorial Header */}
      <div className="max-w-3xl mb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-coolvetica text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            Pinisara Photographers Archive
          </span>
          <span className="font-tempting italic text-stone-500 dark:text-stone-400 text-sm">
            Curated Ceremonial & School Milestones
          </span>
        </div>

        <h1 className="font-source-serif font-normal text-3xl sm:text-5xl text-stone-900 dark:text-white tracking-tight leading-tight">
          School Albums & Collaborative Coverage
        </h1>

        <p className="mt-3 text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed">
          Comprehensive collaborative coverage of main assemblies, all-night pirith chanting ceremonies, prefect elections, morning radio broadcasting, student parliament sessions, and cricket derbies in uncompressed 4K.
        </p>
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {events.map((event) => (
          <div
            key={event.id}
            id={`album-card-${event.id}`}
            className="rounded-3xl ultra-glass glass-card-hover overflow-hidden shadow-lg hover:border-emerald-500 dark:hover:border-emerald-400 animate-apple-fade-in flex flex-col group"
          >
            {/* Cover Image */}
            <div className="relative aspect-16/10 overflow-hidden bg-stone-100 dark:bg-stone-800">
              <img
                src={event.coverPhotoUrl}
                alt={event.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full bg-black/60 dark:bg-black/75 backdrop-blur-md text-white font-mono text-[10px] font-semibold uppercase tracking-wider border border-white/10">
                  {event.category}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600/90 dark:bg-emerald-500/90 backdrop-blur-md text-white font-mono text-[10px] font-semibold">
                  <Images className="w-3 h-3" />
                  <span>{event.photoCount} Photos</span>
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 mb-2 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                    <span>{event.date}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </span>
                </div>

                <h3 className="font-source-serif font-medium text-lg text-stone-900 dark:text-white mb-2 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-300 line-clamp-2">
                  {event.title}
                </h3>

                <p className="text-stone-600 dark:text-stone-300 text-xs leading-relaxed line-clamp-3 mb-4">
                  {event.description}
                </p>

                {/* Collaborative Team Badge */}
                {event.collaborators && event.collaborators.length > 0 && (
                  <div className="mb-4 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-emerald-800 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{event.coverageType || 'Joint Coverage Team'}</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600 dark:text-stone-300 truncate">
                      {event.publishedBy} + {event.collaborators.join(', ')}
                    </div>
                  </div>
                )}

                {event.score && (
                  <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-white/10 text-xs font-mono text-stone-800 dark:text-stone-200">
                    <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Result: {event.score}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-stone-100 dark:border-white/10 mt-auto">
                <button
                  id={`open-album-btn-${event.id}`}
                  onClick={() => onSelectEventCategory(event.category)}
                  className="w-full py-2.5 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-stone-950 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 active:scale-98 shadow-xs"
                >
                  <span>Explore Album Photos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
