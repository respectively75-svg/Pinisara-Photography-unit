import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Calendar, 
  Clock, 
  ArrowUpRight, 
  Sparkles, 
  Users, 
  Radio, 
  Landmark, 
  Vote, 
  Scale, 
  Trophy, 
  CheckCircle2,
  Bell,
  Layers,
  MapPin
} from 'lucide-react';
import { Photo, EventItem } from '../types';

export interface ActivityFeedItem {
  id: string;
  type: 'upload' | 'upcoming_event' | 'collaboration';
  title: string;
  subtitle: string;
  description: string;
  timestamp: string;
  category: string;
  photographerName?: string;
  camera?: string;
  settings?: string;
  collaborators?: string[];
  venue?: string;
  eventDate?: string;
  thumbnailUrl?: string;
  photoId?: string;
  isNew?: boolean;
}

interface ActivityFeedProps {
  photos: Photo[];
  events: EventItem[];
  onSelectPhoto: (photo: Photo) => void;
  onSelectCategory: (category: string) => void;
  onNavigateToCollaborations?: () => void;
  compact?: boolean;
}

export const INITIAL_UPCOMING_SCHOOL_EVENTS: ActivityFeedItem[] = [
  {
    id: 'act-evt-1',
    type: 'upcoming_event',
    title: 'Monday Morning Main Assembly & Colours Awarding',
    subtitle: 'Pinnawala Central College · Main Quadrangle',
    description: 'Full 4-photographer synchronized deployment covering the National & College Flag hoisting, Principal’s keynote, and athletic colours presentation.',
    timestamp: 'Upcoming · Tomorrow, 7:15 AM',
    category: 'assembly',
    venue: 'Pinnawala Central College Main Quadrangle',
    eventDate: 'Monday, 07:15 AM',
    collaborators: ['Hasaranga Jayawardhana', 'Dulen Induwara', 'Sayul Angammana', 'Udula Matheesha'],
    isNew: true
  },
  {
    id: 'act-evt-2',
    type: 'upcoming_event',
    title: 'Annual All-Night Pirith Chanting & Morning Dana',
    subtitle: 'Pinnawala Central College · Ceremonial Hall',
    description: 'Low-light 108MP and prime f/1.8 coverage of the Karanduwa relic procession, Pirith Mandapaya illumination, and student blessings.',
    timestamp: 'Upcoming · Friday, 6:30 PM',
    category: 'pirith',
    venue: 'College Ceremonial Pirith Mandapaya',
    eventDate: 'Friday, 06:30 PM',
    collaborators: ['Udula Matheesha', 'Hasaranga Jayawardhana', 'Sayul Angammana'],
    isNew: true
  },
  {
    id: 'act-evt-3',
    type: 'upcoming_event',
    title: 'Morning Radio Program — Live Studio Broadcast',
    subtitle: 'Pinisara Photography & Media Unit Booth',
    description: 'Live candid studio session documenting morning news anchors, soundboard mixing engineers, and school bulletin broadcasts.',
    timestamp: 'Daily · 7:00 AM – 7:30 AM',
    category: 'radio',
    venue: 'Pinnawala Central College Radio Studio',
    eventDate: 'Daily Morning Slot',
    collaborators: ['Sayul Angammana', 'Hasaranga Jayawardhana']
  },
  {
    id: 'act-evt-4',
    type: 'upcoming_event',
    title: '4th Sitting of the Pinnawala Central Student Parliament',
    subtitle: 'Parliamentary Debating Chamber',
    description: 'Telephoto and floor coverage of the Speaker’s ceremonial mace procession and student ministerial cabinet debates.',
    timestamp: 'Upcoming · Next Wednesday, 1:30 PM',
    category: 'parliament',
    venue: 'Pinnawala Central Debating Hall',
    eventDate: 'Wednesday, 01:30 PM',
    collaborators: ['Udula Matheesha', 'Dulen Induwara']
  },
  {
    id: 'act-evt-5',
    type: 'upcoming_event',
    title: 'Senior Prefect & Student Council General Election',
    subtitle: 'Pinnawala Central College Polling Stations',
    description: 'Documentary coverage of secret ballot voting booths, Election Commission auditing, and official Head Prefect declaration.',
    timestamp: 'Scheduled · Next Month',
    category: 'election',
    venue: 'College Auditorium & Polling Booths',
    eventDate: '08:30 AM – 03:30 PM',
    collaborators: ['Sayul Angammana', 'Dulen Induwara', 'Hasaranga Jayawardhana']
  }
];

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  photos,
  onSelectPhoto,
  onSelectCategory,
  onNavigateToCollaborations,
  compact = false
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'uploads' | 'events'>('all');
  const [remindedIds, setRemindedIds] = useState<string[]>([]);
  const [livePulseTime, setLivePulseTime] = useState<string>('Just now');

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePulseTime('Synced just now');
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Build real-time upload activity items directly from the current photos state
  // so newly published photos appear at the top immediately
  const uploadItems: ActivityFeedItem[] = photos.slice(0, 6).map((photo, idx) => ({
    id: `act-photo-${photo.id}`,
    type: photo.collaborators && photo.collaborators.length > 0 ? 'collaboration' : 'upload',
    title: photo.title,
    subtitle: `${photo.photographerName} · ${photo.camera}`,
    description: photo.description,
    timestamp: idx === 0 ? 'Uploaded 12m ago' : idx === 1 ? 'Uploaded 1h ago' : idx === 2 ? 'Uploaded 3h ago' : `Uploaded on ${photo.dateTaken}`,
    category: photo.category,
    photographerName: photo.photographerName,
    camera: photo.camera,
    settings: photo.settings,
    collaborators: photo.collaborators,
    thumbnailUrl: photo.thumbnailUrl,
    photoId: photo.id,
    isNew: idx < 2
  }));

  // Interleave uploads and upcoming school events for the 'all' feed
  const combinedFeed: ActivityFeedItem[] = [];
  const maxLen = Math.max(uploadItems.length, INITIAL_UPCOMING_SCHOOL_EVENTS.length);
  for (let i = 0; i < maxLen; i++) {
    if (uploadItems[i]) combinedFeed.push(uploadItems[i]);
    if (INITIAL_UPCOMING_SCHOOL_EVENTS[i]) combinedFeed.push(INITIAL_UPCOMING_SCHOOL_EVENTS[i]);
  }

  const displayedItems = combinedFeed.filter(item => {
    if (activeFilter === 'uploads') return item.type === 'upload' || item.type === 'collaboration';
    if (activeFilter === 'events') return item.type === 'upcoming_event';
    return true;
  }).slice(0, compact ? 6 : 12);

  const toggleReminder = (id: string) => {
    setRemindedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'assembly': return <Landmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'pirith': return <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'election': return <Vote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'radio': return <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'parliament': return <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      default: return <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <section 
      id="activity-feed-section" 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full animate-apple-fade-in"
    >
      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-stone-200/80 dark:border-white/10">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Activity Pulse · {livePulseTime}</span>
            </span>
            <span className="text-stone-300 dark:text-stone-700">·</span>
            <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
              Pinnawala Central College
            </span>
          </div>

          <h2 className="font-source-serif font-normal text-3xl sm:text-4xl text-stone-900 dark:text-white tracking-tight">
            Pinisara Photography Activity Feed
          </h2>

          <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm leading-relaxed">
            Real-time dispatches of newly published 4K captures and upcoming school event coverage schedules across Pinnawala Central College.
          </p>
        </div>

        {/* Apple Segmented Filter Control */}
        <div className="flex items-center p-1 rounded-full glass-pill self-start md:self-auto">
          <button
            id="activity-filter-all"
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-500 ${
              activeFilter === 'all'
                ? 'bg-black text-white dark:bg-white dark:text-stone-950 shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            All Updates
          </button>
          <button
            id="activity-filter-uploads"
            onClick={() => setActiveFilter('uploads')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-500 ${
              activeFilter === 'uploads'
                ? 'bg-black text-white dark:bg-white dark:text-stone-950 shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            New 4K Uploads
          </button>
          <button
            id="activity-filter-events"
            onClick={() => setActiveFilter('events')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-500 ${
              activeFilter === 'events'
                ? 'bg-black text-white dark:bg-white dark:text-stone-950 shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Upcoming Events
          </button>
        </div>
      </div>

      {/* Minimalist Apple-Inspired Activity Cards Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedItems.map((item, index) => {
          const isUpload = item.type === 'upload' || item.type === 'collaboration';
          const isReminded = remindedIds.includes(item.id);
          const linkedPhoto = item.photoId ? photos.find(p => p.id === item.photoId) : undefined;

          return (
            <article
              key={item.id}
              style={{ animationDelay: `${Math.min(index * 60, 480)}ms` }}
              className="group rounded-3xl ultra-glass glass-card-hover p-5 sm:p-6 flex flex-col justify-between border border-stone-200/80 dark:border-white/10 animate-apple-fade-in"
            >
              <div>
                {/* Top Metadata Row (Unboxed clean typography per anti-slop discipline) */}
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-stone-500 dark:text-stone-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    {isUpload ? (
                      <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    )}
                    <span className="uppercase tracking-wider font-semibold text-stone-800 dark:text-stone-200">
                      {item.type === 'collaboration' ? 'Joint Upload' : isUpload ? 'New 4K Capture' : 'Upcoming Event'}
                    </span>
                    {item.isNew && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">LIVE</span>
                      </>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-[10px]">
                    <Clock className="w-3 h-3 opacity-70" />
                    <span>{item.timestamp}</span>
                  </span>
                </div>

                {/* Optional Thumbnail Preview for Photo Uploads */}
                {isUpload && item.thumbnailUrl && (
                  <div 
                    onClick={() => linkedPhoto && onSelectPhoto(linkedPhoto)}
                    className="relative aspect-16/10 rounded-2xl overflow-hidden mb-4 bg-stone-100 dark:bg-stone-900 cursor-pointer border border-stone-200/60 dark:border-white/10"
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) group-hover:scale-105"
                    />
                    {item.settings && (
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-white/85 dark:bg-black/75 backdrop-blur-md text-[10px] font-mono text-stone-900 dark:text-white border border-white/40 dark:border-white/15">
                        f/ {item.settings}
                      </div>
                    )}
                  </div>
                )}

                {/* Event Schedule Banner for Upcoming School Events */}
                {!isUpload && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-stone-100/70 dark:bg-white/5 border border-stone-200/70 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-stone-800 flex items-center justify-center shadow-2xs">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                          Scheduled Assignment
                        </span>
                        <span className="text-xs font-semibold text-stone-900 dark:text-white font-mono">
                          {item.eventDate}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      {item.category}
                    </span>
                  </div>
                )}

                {/* Title & Description */}
                <h3 
                  onClick={() => {
                    if (linkedPhoto) onSelectPhoto(linkedPhoto);
                    else onSelectCategory(item.category);
                  }}
                  className="font-source-serif font-medium text-lg text-stone-900 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {item.title}
                </h3>

                <p className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-1">
                  {item.subtitle}
                </p>

                <p className="mt-2.5 text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-2">
                  {item.description}
                </p>

                {/* Collaborators / Assigned Crew */}
                {item.collaborators && item.collaborators.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-stone-200/60 dark:border-white/10 flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                    <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">
                      Crew: {item.collaborators.map(c => c.split(' ')[0]).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer Action */}
              <div className="mt-5 pt-3.5 border-t border-stone-200/70 dark:border-white/10 flex items-center justify-between text-xs">
                {isUpload ? (
                  <>
                    <button
                      onClick={() => linkedPhoto && onSelectPhoto(linkedPhoto)}
                      className="font-semibold text-stone-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                    >
                      <span>Inspect 4K Capture</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    {item.type === 'collaboration' && onNavigateToCollaborations && (
                      <button
                        onClick={onNavigateToCollaborations}
                        className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Layers className="w-3 h-3" />
                        <span>View Set</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onSelectCategory(item.category)}
                      className="font-semibold text-stone-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                    >
                      <span>Browse Past {item.category}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleReminder(item.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                        isReminded
                          ? 'bg-emerald-600 text-white'
                          : 'glass-pill text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400'
                      }`}
                    >
                      {isReminded ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Notified</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-3 h-3" />
                          <span>Notify Me</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
