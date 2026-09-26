import React, { useState, useRef } from 'react';
import {
  Calendar,
  MapPin,
  Images,
  ArrowRight,
  Trophy,
  Users,
  Plus,
  ImagePlus,
  Upload,
  Check,
  X,
  Camera,
  Eye,
  Trash2
} from 'lucide-react';
import { EventItem, Photo } from '../types';
import { CREATOR_TEAM } from '../data/mockData';
import { CursorParallaxImage, ScrollParallaxReveal } from './ParallaxAndScroll';

interface AlbumsPageProps {
  events: EventItem[];
  photos: Photo[];
  onSelectEventCategory: (category: string) => void;
  onSelectPhoto: (photo: Photo) => void;
  onUpdateEventThumbnail: (eventId: string, newCoverUrl: string) => void;
  onAddMultiplePhotosToEvent: (eventId: string, newPhotos: Photo[], newCoverUrl?: string) => void;
  onCreateNewEvent?: (newEvent: EventItem, initialPhotos: Photo[]) => void;
  onDeletePhoto?: (photoId: string) => void;
}

export const AlbumsPage: React.FC<AlbumsPageProps> = ({
  events,
  photos,
  onSelectEventCategory,
  onSelectPhoto,
  onUpdateEventThumbnail,
  onAddMultiplePhotosToEvent,
  onCreateNewEvent,
  onDeletePhoto
}) => {
  // Active modal states
  const [editingThumbnailEvent, setEditingThumbnailEvent] = useState<EventItem | null>(null);
  const [addingPhotosEvent, setAddingPhotosEvent] = useState<EventItem | null>(null);
  const [viewingAlbumEvent, setViewingAlbumEvent] = useState<EventItem | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState<boolean>(false);

  // Thumbnail change state
  const [customThumbUrl, setCustomThumbUrl] = useState<string>('');
  const thumbFileInputRef = useRef<HTMLInputElement>(null);

  // Multi-image batch upload state for an event
  const [stagedBatchFiles, setStagedBatchFiles] = useState<
    { id: string; title: string; dataUrl: string; setAsCover?: boolean }[]
  >([]);
  const [batchPhotographerId, setBatchPhotographerId] = useState<string>(CREATOR_TEAM[0].id);
  const [batchUrlInput, setBatchUrlInput] = useState<string>('');
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  // New Event Creation State
  const [newEventTitle, setNewEventTitle] = useState<string>('');
  const [newEventCategory, setNewEventCategory] = useState<string>('assembly');
  const [newEventVenue, setNewEventVenue] = useState<string>('Pinnawala Central College');
  const [newEventDesc, setNewEventDesc] = useState<string>('');

  // Handle single thumbnail file upload
  const handleThumbnailFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingThumbnailEvent) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateEventThumbnail(editingThumbnailEvent.id, reader.result);
        setEditingThumbnailEvent(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle multi-file selection (Add many images to one event)
  const handleBatchFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setStagedBatchFiles((prev) => [
            ...prev,
            {
              id: `staged-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
              title: cleanName ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1) : `Event Capture #${prev.length + 1}`,
              dataUrl: reader.result as string,
              setAsCover: false
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrlToStagedBatch = () => {
    if (!batchUrlInput.trim()) return;
    setStagedBatchFiles((prev) => [
      ...prev,
      {
        id: `staged-url-${Date.now()}`,
        title: `${addingPhotosEvent?.title || 'Event'} Photo #${prev.length + 1}`,
        dataUrl: batchUrlInput.trim(),
        setAsCover: false
      }
    ]);
    setBatchUrlInput('');
  };

  const handleCommitBatchUpload = () => {
    if (!addingPhotosEvent || stagedBatchFiles.length === 0) return;
    const creator = CREATOR_TEAM.find((c) => c.id === batchPhotographerId) || CREATOR_TEAM[0];
    const today = new Date().toISOString().split('T')[0];

    const createdPhotos: Photo[] = stagedBatchFiles.map((item, idx) => ({
      id: `event-photo-${addingPhotosEvent.id}-${Date.now()}-${idx}`,
      eventId: addingPhotosEvent.id,
      title: item.title || `${addingPhotosEvent.title} — Shot ${idx + 1}`,
      description: `Captured during ${addingPhotosEvent.title} at ${addingPhotosEvent.venue} using ${creator.camera}.`,
      category: addingPhotosEvent.category,
      dateTaken: today,
      createdAt: new Date().toISOString(),
      photographerId: creator.id,
      photographerName: creator.name,
      photographerRole: creator.role,
      camera: creator.camera,
      lens: creator.lens,
      settings: creator.id.includes('hasaranga')
        ? '1/1000s · f/5.6 · ISO 200'
        : creator.id.includes('dulen')
        ? '1/500s · f/2.2 · ISO 400'
        : creator.id.includes('sayul')
        ? '1/640s · f/1.6 · ISO 64'
        : '1/320s · f/1.8 · ISO 400',
      aspectRatio: '3:2',
      thumbnailUrl: item.dataUrl,
      webUrl: item.dataUrl,
      originalUrl: item.dataUrl,
      tags: [addingPhotosEvent.category, 'Pinnawala Central College', addingPhotosEvent.title.split(' ')[0]],
      downloadCount: 0,
      likesCount: 1,
      isFavorited: false
    }));

    const coverCandidate = stagedBatchFiles.find((f) => f.setAsCover)?.dataUrl;
    onAddMultiplePhotosToEvent(addingPhotosEvent.id, createdPhotos, coverCandidate);
    setStagedBatchFiles([]);
    setAddingPhotosEvent(null);
  };

  const handleCreateNewEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !onCreateNewEvent) return;
    const creator = CREATOR_TEAM.find((c) => c.id === batchPhotographerId) || CREATOR_TEAM[0];
    const today = new Date().toISOString().split('T')[0];
    const coverUrl =
      stagedBatchFiles[0]?.dataUrl ||
      'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600&q=85';

    const newEvtId = `evt-custom-${Date.now()}`;
    const createdPhotos: Photo[] = stagedBatchFiles.map((item, idx) => ({
      id: `event-photo-${newEvtId}-${idx}`,
      eventId: newEvtId,
      title: item.title || `${newEventTitle} #${idx + 1}`,
      description: newEventDesc || `Captured at ${newEventVenue} by ${creator.name}.`,
      category: newEventCategory,
      dateTaken: today,
      createdAt: new Date().toISOString(),
      photographerId: creator.id,
      photographerName: creator.name,
      photographerRole: creator.role,
      camera: creator.camera,
      lens: creator.lens,
      settings: '1/500s · f/2.8 · ISO 200',
      aspectRatio: '3:2',
      thumbnailUrl: item.dataUrl,
      webUrl: item.dataUrl,
      originalUrl: item.dataUrl,
      tags: [newEventCategory, 'Pinnawala Central College'],
      downloadCount: 0,
      likesCount: 1,
      isFavorited: false
    }));

    const newEventObj: EventItem = {
      id: newEvtId,
      title: newEventTitle.trim(),
      date: today,
      category: newEventCategory,
      venue: newEventVenue.trim() || 'Pinnawala Central College',
      description:
        newEventDesc.trim() ||
        `School event album captured by Pinisara Photography with cameras and phones at Pinnawala Central College.`,
      coverPhotoUrl: coverUrl,
      photoCount: Math.max(createdPhotos.length, 1),
      publishedBy: `${creator.name} (${creator.camera})`,
      publishedAt: new Date().toISOString()
    };

    onCreateNewEvent(newEventObj, createdPhotos);
    setNewEventTitle('');
    setNewEventDesc('');
    setStagedBatchFiles([]);
    setIsCreatingEvent(false);
  };

  return (
    <div
      id="albums-events-page"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full animate-apple-fade-in"
    >
      {/* Editorial Header + Create Event Button */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 pb-8 border-b border-stone-200 dark:border-white/15">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-coolvetica text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-white border border-stone-200 dark:border-white/20 backdrop-blur-xl">
              Pinisara Photography · Event Albums
            </span>
            <span className="font-tempting italic text-stone-500 dark:text-white/70 text-sm">
              Pinnawala Central College
            </span>
          </div>

          <h1 className="font-source-serif font-normal text-3xl sm:text-5xl text-stone-900 dark:text-white tracking-tight leading-tight">
            School Event Albums
          </h1>

          <p className="text-stone-600 dark:text-white/75 text-sm sm:text-base leading-relaxed">
            Browse every school event album, change any event’s cover thumbnail whenever you want, or batch-upload dozens of photos from our cameras and phones into a single event at once.
          </p>
        </div>

        {onCreateNewEvent && (
          <button
            onClick={() => {
              setStagedBatchFiles([]);
              setIsCreatingEvent(true);
            }}
            className="self-start lg:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-85 transition-all duration-700 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event Album</span>
          </button>
        )}
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {events.map((event) => {
          const eventPhotos = photos.filter((p) => p.category === event.category);

          return (
            <ScrollParallaxReveal key={event.id} speed={0.04}>
              <div
                id={`album-card-${event.id}`}
                className="rounded-3xl ultra-glass glass-card-hover overflow-hidden shadow-lg flex flex-col group h-full"
              >
                {/* Cover Image with Cursor Parallax + Change Thumbnail & Add Photos Controls */}
                <div className="relative aspect-16/10 overflow-hidden bg-stone-100 dark:bg-black">
                  <CursorParallaxImage
                    src={event.coverPhotoUrl}
                    alt={event.title}
                    intensity={22}
                    tiltIntensity={4}
                    onClick={() => setViewingAlbumEvent(event)}
                    containerClassName="w-full h-full cursor-pointer"
                  />

                  <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xl text-white font-mono text-[10px] font-semibold uppercase tracking-wider border border-white/20">
                      {event.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 z-10 pointer-events-none">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xl text-white font-mono text-[10px] font-semibold border border-white/20">
                      <Images className="w-3 h-3" />
                      <span>{Math.max(event.photoCount, eventPhotos.length)} Photos</span>
                    </span>
                  </div>

                  {/* Quick Hover/Touch Toolbar on Cover Thumbnail: Change Thumbnail & Add Many Images */}
                  <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomThumbUrl('');
                        setEditingThumbnailEvent(event);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-white hover:text-black backdrop-blur-2xl text-white text-[11px] font-mono font-semibold border border-white/25 transition-all duration-500 shadow-md"
                      title="Change the cover thumbnail of this event"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Change Thumbnail</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setStagedBatchFiles([]);
                        setAddingPhotosEvent(event);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-black backdrop-blur-2xl text-[11px] font-mono font-semibold border border-white transition-all duration-500 shadow-md"
                      title="Add many images at once to this event"
                    >
                      <ImagePlus className="w-3 h-3" />
                      <span>+ Add Photos</span>
                    </button>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-white/65 mb-2 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 opacity-70" />
                        <span>{event.date}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 opacity-70 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </span>
                    </div>

                    <h3
                      onClick={() => setViewingAlbumEvent(event)}
                      className="font-source-serif font-medium text-lg text-stone-900 dark:text-white mb-2 leading-snug cursor-pointer hover:opacity-75 transition-opacity line-clamp-2"
                    >
                      {event.title}
                    </h3>

                    <p className="text-stone-600 dark:text-white/75 text-xs leading-relaxed line-clamp-3 mb-4">
                      {event.description}
                    </p>

                    {/* Mini Strip of Photos Inside This Event */}
                    {eventPhotos.length > 0 && (
                      <div className="mb-4 space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 dark:text-white/55 block">
                          Photos in this event ({eventPhotos.length} loaded)
                        </span>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                          {eventPhotos.slice(0, 6).map((p) => (
                            <img
                              key={p.id}
                              src={p.thumbnailUrl}
                              alt={p.title}
                              onClick={() => onSelectPhoto(p)}
                              className="w-11 h-11 rounded-lg object-cover cursor-pointer border border-stone-200 dark:border-white/20 hover:scale-105 transition-transform shrink-0"
                              title={p.title}
                            />
                          ))}
                          <button
                            onClick={() => {
                              setStagedBatchFiles([]);
                              setAddingPhotosEvent(event);
                            }}
                            className="w-11 h-11 rounded-lg border border-dashed border-stone-300 dark:border-white/30 flex items-center justify-center text-stone-500 dark:text-white/70 hover:bg-stone-100 dark:hover:bg-white/10 shrink-0"
                            title="Add more photos to this event"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Collaborative Team Badge */}
                    {event.collaborators && event.collaborators.length > 0 && (
                      <div className="mb-4 p-3 rounded-2xl bg-stone-100/80 dark:bg-white/5 backdrop-blur-xl border border-stone-200/70 dark:border-white/15 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-stone-800 dark:text-white">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>Taken Together</span>
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-600 dark:text-white/75 truncate">
                          {event.publishedBy} + {event.collaborators.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-stone-200/70 dark:border-white/15 mt-auto flex items-center gap-2">
                    <button
                      onClick={() => setViewingAlbumEvent(event)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-85 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open Album ({eventPhotos.length})</span>
                    </button>

                    <button
                      id={`open-album-btn-${event.id}`}
                      onClick={() => onSelectEventCategory(event.category)}
                      className="py-2.5 px-3 rounded-xl glass-pill text-stone-800 dark:text-white text-xs font-medium flex items-center justify-center gap-1 hover:opacity-80 transition-all"
                      title="Filter main gallery by this event"
                    >
                      <span>Filter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </ScrollParallaxReveal>
          );
        })}
      </div>

      {/* MODAL 1: CHANGE EVENT THUMBNAIL */}
      {editingThumbnailEvent && (
        <div
          data-modal-scroll="true"
          onClick={() => setEditingThumbnailEvent(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-apple-blur-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl ultra-glass border border-stone-200 dark:border-white/20 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-stone-900 dark:text-white"
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 dark:border-white/15 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 dark:text-white/65 block">
                  Customize Event Cover
                </span>
                <h3 className="font-source-serif text-xl sm:text-2xl font-medium mt-1">
                  Change Thumbnail: {editingThumbnailEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setEditingThumbnailEvent(null)}
                className="p-2 rounded-full glass-pill"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Option 1: Upload Cover Image from Device */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold block">
                1. Upload a New Thumbnail from Your Phone or Computer
              </span>
              <input
                ref={thumbFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailFileSelect}
                className="hidden"
              />
              <button
                onClick={() => thumbFileInputRef.current?.click()}
                className="w-full py-6 border-2 border-dashed border-stone-300 dark:border-white/25 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-stone-100/60 dark:hover:bg-white/5 transition-colors"
              >
                <Upload className="w-6 h-6" />
                <span className="text-xs font-semibold">Click to choose an image file from your device</span>
                <span className="text-[11px] text-stone-500 dark:text-white/60">
                  Instantly updates the event’s cover thumbnail
                </span>
              </button>
            </div>

            {/* Option 2: Pick Any Existing Photo to Be the Event Thumbnail */}
            <div className="space-y-2.5">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold block">
                2. Or Pick a Photo from the Gallery as the Cover Thumbnail
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1">
                {photos.map((p) => {
                  const isCurrent = editingThumbnailEvent.coverPhotoUrl === p.thumbnailUrl || editingThumbnailEvent.coverPhotoUrl === p.webUrl;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onUpdateEventThumbnail(editingThumbnailEvent.id, p.webUrl);
                        setEditingThumbnailEvent(null);
                      }}
                      className={`relative aspect-4/3 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        isCurrent ? 'border-black dark:border-white scale-95' : 'border-transparent hover:scale-105'
                      }`}
                    >
                      <img src={p.thumbnailUrl} alt={p.title} className="w-full h-full object-cover" />
                      {isCurrent && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[10px] font-mono font-bold">
                          Current
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Option 3: Paste Direct Image URL */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold block">
                3. Or Paste an Image URL
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={customThumbUrl}
                  onChange={(e) => setCustomThumbUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-white/10 border border-stone-200 dark:border-white/20 text-xs focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (customThumbUrl.trim()) {
                      onUpdateEventThumbnail(editingThumbnailEvent.id, customThumbUrl.trim());
                      setEditingThumbnailEvent(null);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-semibold"
                >
                  Apply URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD MANY IMAGES TO ONE EVENT (BATCH MULTI-UPLOAD) */}
      {addingPhotosEvent && (
        <div
          data-modal-scroll="true"
          onClick={() => setAddingPhotosEvent(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-apple-blur-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-3xl ultra-glass border border-stone-200 dark:border-white/20 p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto text-stone-900 dark:text-white"
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 dark:border-white/15 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 dark:text-white/65 block">
                  Multi-Photo Event Uploader · Pinisara Photography
                </span>
                <h3 className="font-source-serif text-xl sm:text-2xl font-medium mt-1">
                  Add Many Images to: {addingPhotosEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setAddingPhotosEvent(null)}
                className="p-2 rounded-full glass-pill"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Select Which Club Member Took These Photos */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider font-semibold block">
                Taken By (Camera / Phone)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CREATOR_TEAM.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setBatchPhotographerId(member.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      batchPhotographerId === member.id
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold'
                        : 'glass-pill text-stone-700 dark:text-white/80'
                    }`}
                  >
                    <span className="text-xs block truncate">{member.name.split(' ')[0]}</span>
                    <span className="text-[10px] font-mono opacity-75 block truncate">{member.camera}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-File Picker */}
            <div className="space-y-3">
              <input
                ref={batchFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleBatchFilesSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => batchFileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-stone-300 dark:border-white/25 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-stone-100/60 dark:hover:bg-white/5 transition-colors"
              >
                <ImagePlus className="w-8 h-8" />
                <span className="text-sm font-semibold">
                  Select Multiple Photos from Your Phone or Camera SD Card
                </span>
                <span className="text-xs text-stone-500 dark:text-white/60">
                  You can select 2, 5, 10, or more images at once to add to this single event
                </span>
              </button>

              {/* Also allow adding by URL */}
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={batchUrlInput}
                  onChange={(e) => setBatchUrlInput(e.target.value)}
                  placeholder="Or paste an image URL to add to batch..."
                  className="flex-1 px-4 py-2 rounded-xl bg-stone-100 dark:bg-white/10 border border-stone-200 dark:border-white/20 text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddUrlToStagedBatch}
                  className="px-4 py-2 rounded-xl glass-pill text-xs font-semibold"
                >
                  + Add URL
                </button>
              </div>
            </div>

            {/* Staged Photos Grid */}
            {stagedBatchFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                    Ready to Add ({stagedBatchFiles.length} {stagedBatchFiles.length === 1 ? 'Photo' : 'Photos'})
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-white/60">
                    Click “Set as Event Cover” on any photo to also make it the event thumbnail
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-64 overflow-y-auto p-1">
                  {stagedBatchFiles.map((item, idx) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-stone-200 dark:border-white/20 overflow-hidden bg-white/60 dark:bg-white/5 p-2 space-y-2"
                    >
                      <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-black">
                        <img src={item.dataUrl} alt={item.title} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setStagedBatchFiles((prev) => prev.filter((x) => x.id !== item.id))
                          }
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/75 text-white flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStagedBatchFiles((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, title: val } : x))
                          );
                        }}
                        className="w-full px-2 py-1 text-xs rounded-lg bg-stone-100 dark:bg-white/10 border border-stone-200 dark:border-white/15 focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setStagedBatchFiles((prev) =>
                            prev.map((x, i) => ({ ...x, setAsCover: i === idx ? !x.setAsCover : false }))
                          )
                        }
                        className={`w-full py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider font-semibold transition-all ${
                          item.setAsCover
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'glass-pill text-stone-600 dark:text-white/75'
                        }`}
                      >
                        {item.setAsCover ? '✓ New Event Thumbnail' : 'Set as Event Cover'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-stone-200 dark:border-white/15 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAddingPhotosEvent(null)}
                className="px-4 py-2.5 rounded-full glass-pill text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={stagedBatchFiles.length === 0}
                onClick={handleCommitBatchUpload}
                className="px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>
                  Publish {stagedBatchFiles.length} {stagedBatchFiles.length === 1 ? 'Photo' : 'Photos'} to Event
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW ALL PHOTOS IN AN EVENT ALBUM */}
      {viewingAlbumEvent && (
        <div
          data-modal-scroll="true"
          onClick={() => setViewingAlbumEvent(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-apple-blur-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl rounded-3xl ultra-glass border border-stone-200 dark:border-white/20 p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto text-stone-900 dark:text-white"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-white/15 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 dark:text-white/65 block">
                  {viewingAlbumEvent.date} · {viewingAlbumEvent.venue}
                </span>
                <h3 className="font-source-serif text-2xl sm:text-3xl font-medium mt-1">
                  {viewingAlbumEvent.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const target = viewingAlbumEvent;
                    setViewingAlbumEvent(null);
                    setEditingThumbnailEvent(target);
                  }}
                  className="px-3.5 py-2 rounded-full glass-pill text-xs font-medium flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Cover</span>
                </button>
                <button
                  onClick={() => {
                    const target = viewingAlbumEvent;
                    setViewingAlbumEvent(null);
                    setStagedBatchFiles([]);
                    setAddingPhotosEvent(target);
                  }}
                  className="px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold flex items-center gap-1.5"
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  <span>+ Add More Photos</span>
                </button>
                <button
                  onClick={() => setViewingAlbumEvent(null)}
                  className="p-2 rounded-full glass-pill"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {photos
                .filter((p) => p.category === viewingAlbumEvent.category)
                .map((photo) => (
                  <div
                    key={photo.id}
                    className="rounded-2xl overflow-hidden border border-stone-200 dark:border-white/15 bg-white/50 dark:bg-white/5 flex flex-col justify-between group"
                  >
                    <div
                      onClick={() => {
                        setViewingAlbumEvent(null);
                        onSelectPhoto(photo);
                      }}
                      className="relative aspect-4/3 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={photo.webUrl}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      />
                      {/* Subtle Animated Hover Overlay with Camera Model & Date Taken */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-end p-3.5 pointer-events-none">
                        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-1.5 text-[11px] font-mono text-white">
                          <Camera className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="font-medium truncate">{photo.camera}</span>
                          <span aria-hidden="true" className="text-white/45">·</span>
                          <Calendar className="w-3 h-3 text-emerald-400/90 shrink-0" />
                          <time dateTime={photo.dateTaken} className="text-stone-200 shrink-0">
                            {photo.dateTaken}
                          </time>
                        </div>
                      </div>
                    </div>
                    <div className="p-3.5 flex items-center justify-between gap-2 text-xs">
                      <div className="truncate">
                        <p className="font-semibold truncate">{photo.title}</p>
                        <p className="text-[10px] font-mono opacity-70">
                          {photo.photographerName.split(' ')[0]} · {photo.camera} · {photo.dateTaken}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            onUpdateEventThumbnail(viewingAlbumEvent.id, photo.webUrl);
                            setViewingAlbumEvent({ ...viewingAlbumEvent, coverPhotoUrl: photo.webUrl });
                          }}
                          className="px-2.5 py-1 rounded-lg glass-pill text-[10px] font-mono shrink-0 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                        >
                          Make Cover
                        </button>
                        {onDeletePhoto && (
                          <button
                            onClick={() => onDeletePhoto(photo.id)}
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-600 hover:text-white dark:text-white transition-colors"
                            title="Delete this image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE NEW EVENT ALBUM WITH MULTIPLE PHOTOS */}
      {isCreatingEvent && (
        <div
          data-modal-scroll="true"
          onClick={() => setIsCreatingEvent(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-apple-blur-in"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateNewEventSubmit}
            className="w-full max-w-2xl rounded-3xl ultra-glass border border-stone-200 dark:border-white/20 p-6 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto text-stone-900 dark:text-white"
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 dark:border-white/15 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 dark:text-white/65 block">
                  Pinisara Photography · New School Album
                </span>
                <h3 className="font-source-serif text-xl sm:text-2xl font-medium mt-1">
                  Create New Event Album & Add Photos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingEvent(false)}
                className="p-2 rounded-full glass-pill"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider block mb-1.5">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g., Inter-House Sports Meet 2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-white/10 border border-stone-200 dark:border-white/20 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase tracking-wider block mb-1.5">
                  Category
                </label>
                <select
                  value={newEventCategory}
                  onChange={(e) => setNewEventCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-black border border-stone-200 dark:border-white/20 text-xs focus:outline-none"
                >
                  <option value="assembly">Main Assembly</option>
                  <option value="pirith">Pirith Ceremony</option>
                  <option value="election">Prefect Election</option>
                  <option value="radio">Morning Radio</option>
                  <option value="parliament">School Parliament</option>
                  <option value="cricket">Cricket & Sports</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider block mb-1.5">
                Notes / Description
              </label>
              <textarea
                rows={2}
                value={newEventDesc}
                onChange={(e) => setNewEventDesc(e.target.value)}
                placeholder="Shot by our club members on Canon DSLRs and phones..."
                className="w-full px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-white/10 border border-stone-200 dark:border-white/20 text-xs focus:outline-none"
              />
            </div>

            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleBatchFilesSelect}
                id="new-event-multi-files"
                className="hidden"
              />
              <label
                htmlFor="new-event-multi-files"
                className="w-full py-6 border-2 border-dashed border-stone-300 dark:border-white/25 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-stone-100/60 dark:hover:bg-white/5 transition-colors"
              >
                <ImagePlus className="w-6 h-6" />
                <span className="text-xs font-semibold">
                  Select Multiple Photos for This Event ({stagedBatchFiles.length} selected)
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-stone-200 dark:border-white/15 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreatingEvent(false)}
                className="px-4 py-2 rounded-full glass-pill text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold"
              >
                Create Event Album
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
