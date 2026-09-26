import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Heart, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Check, 
  Copy, 
  Info,
  Smartphone,
  ShieldCheck,
  Send,
  MessageCircle,
  Sparkles,
  Users,
  Trash2,
  Flame,
  Star,
  HandMetal,
  ImagePlus
} from 'lucide-react';
import {
  Photo,
  SupportedLanguage,
  UserProfile,
  ReactionType,
  PhotoReactionSummary,
  PhotoComment,
  RecentReactionEvent
} from '../types';
import {
  subscribeToPhotoReactions,
  addPhotoReactionInFirestore,
  subscribeToRecentPhotoReactionEvents,
  subscribeToPhotoComments,
  addPhotoCommentInFirestore,
  reactToCommentInFirestore,
  getInitialReactionSummary
} from '../firebase';
import { CURRENT_USER } from '../data/mockData';

interface LightboxModalProps {
  photo: Photo | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleFavorite: (photoId: string) => void;
  onDownload: (photo: Photo, resolution: 'original' | 'web' | 'mobile') => void;
  onDeletePhoto?: (photoId: string) => void;
  onChangePhoto?: (photoId: string, newImageUrl: string) => void;
  currentLang: SupportedLanguage;
  allPhotosCount: number;
  currentIndex: number;
  currentUser?: UserProfile;
}

interface FloatingParticle {
  id: number;
  type: ReactionType;
  tx: number;
  rot: number;
  leftPercent: number;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  photo,
  onClose,
  onPrev,
  onNext,
  onToggleFavorite,
  onDownload,
  onDeletePhoto,
  onChangePhoto,
  allPhotosCount,
  currentIndex,
  currentUser = CURRENT_USER
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showMetadataPanel, setShowMetadataPanel] = useState<boolean>(true);
  const [activeSideTab, setActiveSideTab] = useState<'comments' | 'details'>('comments');
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedRawLink, setCopiedRawLink] = useState<boolean>(false);
  const [shareStatusMessage, setShareStatusMessage] = useState<string | null>(null);
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !photo || !onChangePhoto) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChangePhoto(photo.id, reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Firestore Real-Time Reactions State per Photo
  const [reactionSummary, setReactionSummary] = useState<PhotoReactionSummary | null>(null);
  const [recentReactions, setRecentReactions] = useState<RecentReactionEvent[]>([]);
  const [activeStamp, setActiveStamp] = useState<{ type: ReactionType; key: number } | null>(null);
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [userClickedReactions, setUserClickedReactions] = useState<Record<string, boolean>>({});

  // Firestore Real-Time Comments State per Photo
  const [comments, setComments] = useState<PhotoComment[]>([]);
  const [commentText, setCommentText] = useState<string>('');
  const [selectedCommentReactionTag, setSelectedCommentReactionTag] = useState<ReactionType>('heart');
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Subscribe to Firestore Reactions & Comments whenever photo changes
  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setShowShareMenu(false);
    setCopiedLink(false);
    setCopiedRawLink(false);
    setShareStatusMessage(null);
    setDownloadDropdownOpen(false);
    setActiveStamp(null);

    if (!photo) return;

    // Initialize optimistic reaction summary immediately
    setReactionSummary(getInitialReactionSummary(photo.id, photo.likesCount));

    const unsubReactions = subscribeToPhotoReactions(
      photo.id,
      photo.likesCount,
      (summary) => {
        setReactionSummary(summary);
      }
    );

    const unsubRecentEvents = subscribeToRecentPhotoReactionEvents(
      photo.id,
      (events) => {
        setRecentReactions(events);
      }
    );

    const unsubComments = subscribeToPhotoComments(
      photo.id,
      photo.title,
      (loadedComments) => {
        setComments(loadedComments);
      }
    );

    return () => {
      unsubReactions();
      unsubRecentEvents();
      unsubComments();
    };
  }, [photo?.id]);

  // Trigger Tinder-style Reaction Burst + Store in Firestore
  const handleTriggerReaction = async (type: ReactionType) => {
    if (!photo) return;

    // 1. Spawn Tinder-style floating particles & stamp
    const now = Date.now();
    setActiveStamp({ type, key: now });

    const newParticles: FloatingParticle[] = Array.from({ length: 6 }).map((_, idx) => ({
      id: now + idx,
      type,
      tx: (Math.random() - 0.5) * 90,
      rot: (Math.random() - 0.5) * 40,
      leftPercent: 35 + Math.random() * 30
    }));
    setParticles((prev) => [...prev.slice(-12), ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 1200);

    setUserClickedReactions((prev) => ({
      ...prev,
      [`${photo.id}_${type}`]: true
    }));

    // 2. Optimistic UI update
    setReactionSummary((prev) => {
      const base = prev || getInitialReactionSummary(photo.id, photo.likesCount);
      return {
        ...base,
        [type]: base[type] + 1,
        totalCount: base.totalCount + 1,
        updatedAt: new Date().toISOString()
      };
    });

    // If heart is clicked and photo isn't favorited yet, sync favorite
    if (type === 'heart' && !photo.isFavorited) {
      onToggleFavorite(photo.id);
    }

    // 3. Persist to Firestore
    try {
      await addPhotoReactionInFirestore(
        photo.id,
        type,
        {
          userId: currentUser?.userId || 'guest_viewer',
          displayName: currentUser?.displayName || 'School Viewer'
        },
        photo.likesCount
      );
    } catch (err) {
      console.error('Failed to store photo reaction:', err);
    }
  };

  // Post a new comment to Firestore
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo || !commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    const cleanText = commentText.trim();
    setCommentText('');

    try {
      // Also increment the chosen reaction type for the photo when posting a comment with a reaction vibe
      await addPhotoCommentInFirestore(photo.id, currentUser, cleanText, selectedCommentReactionTag);
      await handleTriggerReaction(selectedCommentReactionTag);
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // React to a specific comment in Firestore (heart, clap, fire)
  const handleCommentReaction = async (
    comment: PhotoComment,
    reaction: 'heart' | 'clap' | 'fire'
  ) => {
    if (!photo) return;

    // Spawn mini particle burst for tactile feedback
    const now = Date.now();
    const miniParticles: FloatingParticle[] = Array.from({ length: 3 }).map((_, idx) => ({
      id: now + idx,
      type: reaction,
      tx: (Math.random() - 0.5) * 60,
      rot: (Math.random() - 0.5) * 30,
      leftPercent: 45 + Math.random() * 20
    }));
    setParticles((prev) => [...prev.slice(-12), ...miniParticles]);

    // Optimistic update on comments state
    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== comment.id) return c;
        return {
          ...c,
          heartCount: c.heartCount + (reaction === 'heart' ? 1 : 0),
          clapCount: c.clapCount + (reaction === 'clap' ? 1 : 0),
          fireCount: c.fireCount + (reaction === 'fire' ? 1 : 0)
        };
      })
    );

    try {
      await reactToCommentInFirestore(photo.id, comment, reaction);
      // Also increment photo's overall reaction counter in Firestore
      await addPhotoReactionInFirestore(
        photo.id,
        reaction,
        {
          userId: currentUser?.userId || 'guest_viewer',
          displayName: currentUser?.displayName || 'School Viewer'
        },
        photo.likesCount
      );
    } catch (err) {
      console.error('Error reacting to comment:', err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!photo) return;
      // Ignore keyboard shortcuts if typing in comment input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        if (e.key === 'Escape') (document.activeElement as HTMLElement).blur();
        return;
      }
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleResetZoom();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photo, zoomLevel]);

  if (!photo) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWebShare = async () => {
    const shareUrl = photo.webUrl || window.location.href;
    const shareText = `"${photo.title}" — 4K photograph by ${photo.photographerName} (${photo.camera}) on Pinisara Photographers archive.`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: photo.title,
          text: shareText,
          url: shareUrl
        });
        setShareStatusMessage('Shared successfully via device!');
        setTimeout(() => setShareStatusMessage(null), 3000);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setShowShareMenu(true);
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const handleCopyLink = () => {
    const url = photo.webUrl || window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyRawLink = () => {
    navigator.clipboard.writeText(photo.originalUrl);
    setCopiedRawLink(true);
    setTimeout(() => setCopiedRawLink(false), 2000);
  };

  const shareTargetUrl = encodeURIComponent(photo.webUrl || window.location.href);
  const shareTitleText = encodeURIComponent(`"${photo.title}" by ${photo.photographerName} (${photo.camera}) on Pinisara Photographers`);

  const shareLinks = [
    {
      name: 'WhatsApp',
      url: `https://api.whatsapp.com/send?text=${shareTitleText}%20${shareTargetUrl}`,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      icon: <MessageCircle className="w-4 h-4" />
    },
    {
      name: 'X / Twitter',
      url: `https://twitter.com/intent/tweet?text=${shareTitleText}&url=${shareTargetUrl}`,
      color: 'bg-black hover:bg-stone-800',
      icon: <span className="font-bold text-xs">𝕏</span>
    },
    {
      name: 'Telegram',
      url: `https://t.me/share/url?url=${shareTargetUrl}&text=${shareTitleText}`,
      color: 'bg-sky-500 hover:bg-sky-600',
      icon: <Send className="w-4 h-4" />
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareTargetUrl}`,
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: <span className="font-bold text-xs">f</span>
    }
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const isMobileCamera = photo.camera.includes('iPhone') || photo.camera.includes('Samsung');
  const counts = reactionSummary || getInitialReactionSummary(photo.id, photo.likesCount);

  const renderReactionIcon = (type: ReactionType, className = 'w-5 h-5') => {
    switch (type) {
      case 'heart':
        return <Heart className={`${className} fill-rose-500 text-rose-500`} />;
      case 'clap':
        return <HandMetal className={`${className} text-amber-400`} />;
      case 'fire':
        return <Flame className={`${className} fill-orange-500 text-orange-400`} />;
      case 'star':
        return <Star className={`${className} fill-sky-400 text-sky-400`} />;
    }
  };

  const stampConfig: Record<ReactionType, { label: string; border: string; text: string }> = {
    heart: {
      label: 'SUPER LOVE',
      border: 'border-rose-500 bg-rose-500/20',
      text: 'text-rose-400'
    },
    clap: {
      label: 'BRAVO CLAP',
      border: 'border-amber-400 bg-amber-500/20',
      text: 'text-amber-300'
    },
    fire: {
      label: 'PURE FIRE',
      border: 'border-orange-500 bg-orange-500/20',
      text: 'text-orange-400'
    },
    star: {
      label: 'SUPER STAR',
      border: 'border-sky-400 bg-sky-500/20',
      text: 'text-sky-300'
    }
  };

  return (
    <div 
      id="lightbox-overlay"
      className="fixed inset-0 z-50 bg-black/92 backdrop-blur-3xl flex flex-col justify-between select-none animate-apple-fade-in"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top App Bar with Frosted Blur Glass */}
      <header className="h-16 sm:h-18 px-4 sm:px-6 flex items-center justify-between border-b border-white/10 z-30 bg-black/50 backdrop-blur-2xl">
        <div className="flex items-center gap-3 text-white">
          <button
            id="lightbox-close-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/15 text-white transition-colors active:scale-95"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="hidden sm:block">
            <h3 className="font-source-serif font-medium text-sm text-white truncate max-w-sm">
              {photo.title}
            </h3>
            <p className="text-[11px] font-mono text-emerald-400 tabular-nums">
              Pinisara Photographers · {currentIndex + 1} of {allPhotosCount} · {counts.totalCount} Reactions
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center bg-white/10 backdrop-blur-xl rounded-full p-1 border border-white/10 text-white">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-1.5 hover:bg-white/20 rounded-full disabled:opacity-30 transition-colors"
              title="Zoom out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono tabular-nums px-2 min-w-[45px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-1.5 hover:bg-white/20 rounded-full disabled:opacity-30 transition-colors"
              title="Zoom in (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoomLevel > 1 && (
              <button
                onClick={handleResetZoom}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-emerald-400"
                title="Reset zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Web Share Button */}
          <div className="relative">
            <button
              id="lightbox-share-btn"
              onClick={handleWebShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xl border border-white/15 transition-all active:scale-95"
              title="Share photo via Web Share API or social apps"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {showShareMenu && (
              <div 
                id="lightbox-share-dropdown"
                className="absolute right-0 mt-2 w-72 bg-stone-950/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/15 p-4 z-40 animate-apple-scale-in text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold font-mono uppercase tracking-wider">
                      Share Photo
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowShareMenu(false)}
                    className="p-1 rounded-full text-stone-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {shareLinks.map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2.5 rounded-2xl ${platform.color} text-white text-xs font-medium flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95`}
                    >
                      {platform.icon}
                      <span>{platform.name}</span>
                    </a>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <button
                    onClick={handleCopyLink}
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs flex items-center justify-between transition-colors"
                  >
                    <span className="text-[11px] text-stone-300">Copy Web Link</span>
                    {copiedLink ? (
                      <span className="text-emerald-400 text-[10px] font-mono flex items-center gap-1 font-semibold">
                        <Check className="w-3 h-3" /> Copied!
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                    )}
                  </button>

                  <button
                    onClick={handleCopyRawLink}
                    className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs flex items-center justify-between transition-colors"
                  >
                    <span className="text-[11px] text-stone-300">Copy 4K RAW File URL</span>
                    {copiedRawLink ? (
                      <span className="text-emerald-400 text-[10px] font-mono flex items-center gap-1 font-semibold">
                        <Check className="w-3 h-3" /> Copied!
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Toggle Favorite */}
          <button
            id="lightbox-favorite-btn"
            onClick={() => handleTriggerReaction('heart')}
            className={`p-2 rounded-full border transition-transform active:scale-90 ${
              photo.isFavorited
                ? 'bg-rose-500 border-rose-400 text-white'
                : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
            }`}
            title="Send Heart Reaction"
          >
            <Heart className={`w-4 h-4 ${photo.isFavorited ? 'fill-current' : ''}`} />
          </button>

          {/* Change Photo Button */}
          {onChangePhoto && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                id="lightbox-change-photo-btn"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/15 text-white text-xs font-semibold transition-all active:scale-95"
                title="Change / Replace this photo"
              >
                <ImagePlus className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Change Photo</span>
              </button>
            </>
          )}

          {/* Delete Photo */}
          {onDeletePhoto && (
            <button
              id="lightbox-delete-btn"
              onClick={() => onDeletePhoto(photo.id)}
              className="p-2 rounded-full border bg-white/10 border-white/15 text-white hover:bg-rose-600 hover:border-rose-500 transition-colors active:scale-90"
              title="Delete this photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Toggle Side Panel */}
          <button
            onClick={() => setShowMetadataPanel(!showMetadataPanel)}
            className={`p-2 rounded-full border transition-colors ${
              showMetadataPanel 
                ? 'bg-emerald-700 border-emerald-600 text-white' 
                : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
            }`}
            title="Toggle Reactions & Comments Panel"
          >
            <MessageCircle className="w-4 h-4" />
          </button>

          {/* Download Dropdown */}
          <div className="relative">
            <button
              id="lightbox-download-trigger"
              onClick={() => setDownloadDropdownOpen(!downloadDropdownOpen)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Free Download</span>
            </button>

            {downloadDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-stone-950/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-2.5 z-40 animate-apple-scale-in"
                onClick={() => setDownloadDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                  Multi-Resolution 4K Downloads
                </div>
                <button
                  onClick={() => onDownload(photo, 'original')}
                  className="w-full text-left p-2.5 rounded-2xl hover:bg-white/10 text-white text-xs flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="font-semibold block">Original 4K RAW</span>
                    <span className="text-[10px] text-stone-400">Full uncompressed quality</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">~12 MB</span>
                </button>
                <button
                  onClick={() => onDownload(photo, 'web')}
                  className="w-full text-left p-2.5 rounded-2xl hover:bg-white/10 text-white text-xs flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="font-semibold block">Web Quality (1080p)</span>
                    <span className="text-[10px] text-stone-400">Optimized for web & social</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">~1.2 MB</span>
                </button>
                <button
                  onClick={() => onDownload(photo, 'mobile')}
                  className="w-full text-left p-2.5 rounded-2xl hover:bg-white/10 text-white text-xs flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="font-semibold block">Mobile Wallpaper</span>
                    <span className="text-[10px] text-stone-400">Vertical screen crop</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">~450 KB</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Viewing Canvas + Side Comments & Reactions Panel */}
      <div className="relative flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left / Center High-Res Photo Stage with Tinder Floating Reaction Dock */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden min-h-[320px]">
          {/* Ambient Glow behind high-res photo */}
          <div 
            className="absolute inset-0 scale-110 opacity-20 blur-3xl pointer-events-none transition-all duration-700"
            style={{
              backgroundImage: `url(${photo.webUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />

          {/* Tinder-Style Stamp Badge Overlay on Reaction */}
          {activeStamp && (
            <div
              key={activeStamp.key}
              className={`absolute top-8 left-8 sm:top-12 sm:left-12 z-30 px-5 py-2 rounded-2xl border-4 ${stampConfig[activeStamp.type].border} backdrop-blur-md pointer-events-none animate-tinder-stamp`}
            >
              <div className="flex items-center gap-2">
                {renderReactionIcon(activeStamp.type, 'w-7 h-7')}
                <span className={`font-coolvetica font-bold text-2xl sm:text-3xl tracking-wider uppercase ${stampConfig[activeStamp.type].text}`}>
                  {stampConfig[activeStamp.type].label}
                </span>
              </div>
            </div>
          )}

          {/* Floating Tinder Particle Bursts */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
            {particles.map((p) => (
              <div
                key={p.id}
                style={{
                  left: `${p.leftPercent}%`,
                  bottom: '90px',
                  '--tx': `${p.tx}px`,
                  '--rot': `${p.rot}deg`
                } as React.CSSProperties}
                className="absolute animate-tinder-particle"
              >
                <div className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/25 shadow-2xl">
                  {renderReactionIcon(p.type, 'w-6 h-6')}
                </div>
              </div>
            ))}
          </div>

          {/* Previous Button */}
          <button
            id="lightbox-prev-arrow"
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-2xl transition-all hover:scale-110 active:scale-95 border border-white/15"
            title="Previous Photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            id="lightbox-next-arrow"
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-2xl transition-all hover:scale-110 active:scale-95 border border-white/15"
            title="Next Photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image Canvas Container */}
          <div 
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            className={`w-full h-full flex items-center justify-center p-4 pb-24 ${
              zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            }`}
          >
            <img
              src={photo.originalUrl}
              alt={photo.title}
              referrerPolicy="no-referrer"
              style={{
                transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                maxHeight: 'calc(100vh - 190px)',
                maxWidth: showMetadataPanel ? 'calc(100vw - 440px)' : 'calc(100vw - 80px)',
              }}
              className="object-contain shadow-2xl select-none rounded-xl"
              draggable={false}
            />
          </div>

          {/* Floating Tinder-Style Circular Reaction Deck over Bottom of Photo */}
          <div
            id="lightbox-tinder-floating-bar"
            className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 sm:gap-4 px-5 py-2.5 rounded-full refractive-glass-bar"
          >
            {/* Heart Reaction (Tinder Like / Super Love) */}
            <button
              id="tinder-stage-react-heart"
              onClick={() => handleTriggerReaction('heart')}
              className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-rose-500/30 to-pink-600/30 hover:from-rose-500 hover:to-pink-600 border border-rose-400/60 text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-90"
              title="Heart Reaction (Firestore Live Counter)"
            >
              <Heart className="w-5 h-5 fill-rose-500 text-rose-400 group-hover:fill-white group-hover:text-white transition-transform group-hover:scale-110" />
              <span className="font-mono text-xs font-bold tabular-nums">{counts.heart}</span>
            </button>

            {/* Clap Reaction (Applause) */}
            <button
              id="tinder-stage-react-clap"
              onClick={() => handleTriggerReaction('clap')}
              className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-600/30 hover:from-amber-500 hover:to-yellow-600 border border-amber-400/60 text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-90"
              title="Clap / Applause Reaction (Firestore Live Counter)"
            >
              <HandMetal className="w-5 h-5 text-amber-300 group-hover:text-white transition-transform group-hover:scale-110" />
              <span className="font-mono text-xs font-bold tabular-nums">{counts.clap}</span>
            </button>

            {/* Fire Reaction (Lit / Flame) */}
            <button
              id="tinder-stage-react-fire"
              onClick={() => handleTriggerReaction('fire')}
              className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-orange-500/30 to-red-600/30 hover:from-orange-500 hover:to-red-600 border border-orange-400/60 text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-90"
              title="Fire Reaction (Firestore Live Counter)"
            >
              <Flame className="w-5 h-5 fill-orange-500 text-orange-400 group-hover:fill-white group-hover:text-white transition-transform group-hover:scale-110" />
              <span className="font-mono text-xs font-bold tabular-nums">{counts.fire}</span>
            </button>

            {/* Super Star Reaction (Tinder Super Like) */}
            <button
              id="tinder-stage-react-star"
              onClick={() => handleTriggerReaction('star')}
              className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-sky-500/30 to-blue-600/30 hover:from-sky-500 hover:to-blue-600 border border-sky-400/60 text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-90"
              title="Super Star Reaction (Firestore Live Counter)"
            >
              <Star className="w-5 h-5 fill-sky-400 text-sky-300 group-hover:fill-white group-hover:text-white transition-transform group-hover:scale-110" />
              <span className="font-mono text-xs font-bold tabular-nums">{counts.star}</span>
            </button>
          </div>
        </div>

        {/* Right Side Panel: Photo Comments & Tinder-Style Reactions Section + Camera Metadata */}
        {showMetadataPanel && (
          <div 
            id="lightbox-metadata-panel"
            className="w-full lg:w-[420px] xl:w-[450px] bg-stone-950/95 backdrop-blur-3xl border-t lg:border-t-0 lg:border-l border-white/15 h-[52vh] lg:h-full p-5 sm:p-6 text-white overflow-y-auto shrink-0 flex flex-col gap-5 z-20 animate-apple-slide-up"
          >
            {/* Top Segmented Switcher: Photo Comments & Reactions vs Camera EXIF Info */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-full refractive-glass-bar">
              <button
                id="tab-lightbox-comments"
                onClick={() => setActiveSideTab('comments')}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeSideTab === 'comments'
                    ? 'refractive-glass-bubble text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Comments & Reactions ({comments.length})</span>
              </button>
              <button
                id="tab-lightbox-details"
                onClick={() => setActiveSideTab('details')}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeSideTab === 'details'
                    ? 'refractive-glass-bubble text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Camera & EXIF</span>
              </button>
            </div>

            {/* Compact Photo Title Header */}
            <div className="pb-3 border-b border-white/10">
              <div className="flex items-center justify-between gap-2 text-xs text-stone-400">
                <span className="uppercase tracking-wider font-mono text-emerald-400 font-semibold">
                  {photo.category}
                </span>
                <span>·</span>
                <span className="font-mono">{photo.photographerName}</span>
                <span>·</span>
                <span className="font-mono">{photo.camera}</span>
              </div>
              <h2 className="font-source-serif font-medium text-lg leading-snug text-white mt-1">
                {photo.title}
              </h2>
            </div>

            {activeSideTab === 'comments' ? (
              <div className="flex flex-col gap-5 flex-1">
                {/* TINDER-STYLE REACTION DECK CARD (Firestore Live Counters per Photo) */}
                <div
                  id="lightbox-comments-reaction-deck"
                  className="p-4 rounded-3xl bg-white/5 border border-white/15 space-y-3.5 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                        <span>Swipe / Tap Photo Reactions</span>
                      </span>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Real-time Firestore reactions stored per photo
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-lg font-bold text-white tabular-nums">
                        {counts.totalCount}
                      </span>
                      <span className="block text-[10px] font-mono text-stone-400 uppercase">
                        Total Vibes
                      </span>
                    </div>
                  </div>

                  {/* 4 Big Tactile Tinder-Style Circular Reaction Buttons */}
                  <div className="grid grid-cols-4 gap-2.5 pt-1">
                    {/* 1. HEART */}
                    <button
                      id="comment-panel-react-heart"
                      onClick={() => handleTriggerReaction('heart')}
                      className={`group flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 hover:-translate-y-1 active:scale-90 ${
                        userClickedReactions[`${photo.id}_heart`]
                          ? 'bg-rose-500/25 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)]'
                          : 'bg-white/5 hover:bg-rose-500/20 border-white/15 hover:border-rose-400/60'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Heart className="w-5 h-5 fill-white text-white" />
                      </div>
                      <span className="text-[11px] font-semibold text-white mt-2">Heart</span>
                      <span className="font-mono text-xs font-bold text-rose-300 tabular-nums">
                        {counts.heart}
                      </span>
                    </button>

                    {/* 2. CLAP */}
                    <button
                      id="comment-panel-react-clap"
                      onClick={() => handleTriggerReaction('clap')}
                      className={`group flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 hover:-translate-y-1 active:scale-90 ${
                        userClickedReactions[`${photo.id}_clap`]
                          ? 'bg-amber-500/25 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                          : 'bg-white/5 hover:bg-amber-500/20 border-white/15 hover:border-amber-400/60'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <HandMetal className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[11px] font-semibold text-white mt-2">Clap</span>
                      <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">
                        {counts.clap}
                      </span>
                    </button>

                    {/* 3. FIRE */}
                    <button
                      id="comment-panel-react-fire"
                      onClick={() => handleTriggerReaction('fire')}
                      className={`group flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 hover:-translate-y-1 active:scale-90 ${
                        userClickedReactions[`${photo.id}_fire`]
                          ? 'bg-orange-500/25 border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.35)]'
                          : 'bg-white/5 hover:bg-orange-500/20 border-white/15 hover:border-orange-400/60'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Flame className="w-5 h-5 fill-white text-white" />
                      </div>
                      <span className="text-[11px] font-semibold text-white mt-2">Fire</span>
                      <span className="font-mono text-xs font-bold text-orange-300 tabular-nums">
                        {counts.fire}
                      </span>
                    </button>

                    {/* 4. SUPER STAR */}
                    <button
                      id="comment-panel-react-star"
                      onClick={() => handleTriggerReaction('star')}
                      className={`group flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 hover:-translate-y-1 active:scale-90 ${
                        userClickedReactions[`${photo.id}_star`]
                          ? 'bg-sky-500/25 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.35)]'
                          : 'bg-white/5 hover:bg-sky-500/20 border-white/15 hover:border-sky-400/60'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Star className="w-5 h-5 fill-white text-white" />
                      </div>
                      <span className="text-[11px] font-semibold text-white mt-2">Super</span>
                      <span className="font-mono text-xs font-bold text-sky-300 tabular-nums">
                        {counts.star}
                      </span>
                    </button>
                  </div>

                  {/* Live Recent Reaction Activity Stream */}
                  {recentReactions.length > 0 && (
                    <div className="pt-2 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px] text-stone-300">
                      <span className="font-mono text-[10px] uppercase text-stone-400 shrink-0">
                        Live:
                      </span>
                      {recentReactions.slice(0, 4).map((ev) => (
                        <span
                          key={ev.id}
                          className="inline-flex items-center gap-1 text-[11px] text-white/90 shrink-0"
                        >
                          {renderReactionIcon(ev.type, 'w-3 h-3')}
                          <span>{ev.userName.split(' ')[0]}</span>
                          <span className="text-stone-500">·</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* PHOTO COMMENT COMPOSER WITH REACTION TAG */}
                <form
                  onSubmit={handlePostComment}
                  className="p-3.5 rounded-3xl bg-white/5 border border-white/15 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white/90">
                      Add Comment & Reaction as {currentUser?.displayName?.split(' ')[0] || 'Viewer'}
                    </span>
                    <div className="flex items-center gap-1">
                      {(['heart', 'clap', 'fire', 'star'] as ReactionType[]).map((rt) => (
                        <button
                          key={rt}
                          type="button"
                          onClick={() => setSelectedCommentReactionTag(rt)}
                          className={`p-1.5 rounded-full border transition-all ${
                            selectedCommentReactionTag === rt
                              ? 'bg-white/20 border-white scale-110'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                          title={`Attach ${rt} reaction to comment`}
                        >
                          {renderReactionIcon(rt, 'w-3.5 h-3.5')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="lightbox-comment-input"
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment on this capture..."
                      maxLength={500}
                      className="flex-1 px-3.5 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-white/40"
                    />
                    <button
                      id="lightbox-comment-submit"
                      type="submit"
                      disabled={!commentText.trim() || isSubmittingComment}
                      className="px-4 py-2.5 rounded-2xl bg-white text-black font-semibold text-xs hover:opacity-90 disabled:opacity-40 transition-all shrink-0 flex items-center gap-1.5 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </div>
                </form>

                {/* COMMENTS FEED WITH PER-COMMENT REACTION BUTTONS (Heart, Clap, Fire) */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span className="font-mono uppercase tracking-wider text-[11px]">
                      Photo Comments ({comments.length})
                    </span>
                    <span className="text-[11px]">Tap ❤️ 👏 🔥 on any comment</span>
                  </div>

                  <div className="space-y-2.5">
                    {comments.map((cmt) => (
                      <div
                        key={cmt.id}
                        className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-white/15 text-white font-coolvetica text-xs font-bold flex items-center justify-center shrink-0">
                              {getInitials(cmt.authorName)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-xs text-white truncate">
                                  {cmt.authorName}
                                </span>
                                {cmt.reactionTag && cmt.reactionTag !== 'none' && (
                                  <span className="shrink-0">
                                    {renderReactionIcon(cmt.reactionTag as ReactionType, 'w-3.5 h-3.5')}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] font-mono text-stone-400 truncate">
                                {cmt.authorRole || 'Pinisara Community'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-stone-200 leading-relaxed">{cmt.text}</p>

                        {/* Per-Comment Tinder-Style Mini Reaction Buttons (Heart, Clap, Fire) */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleCommentReaction(cmt, 'heart')}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 hover:bg-rose-500/30 border border-rose-400/30 text-xs text-white transition-all active:scale-90"
                            title="Heart this comment"
                          >
                            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-400" />
                            <span className="font-mono text-[11px] font-semibold tabular-nums">
                              {cmt.heartCount || 0}
                            </span>
                          </button>

                          <button
                            onClick={() => handleCommentReaction(cmt, 'clap')}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/30 border border-amber-400/30 text-xs text-white transition-all active:scale-90"
                            title="Clap for this comment"
                          >
                            <HandMetal className="w-3.5 h-3.5 text-amber-400" />
                            <span className="font-mono text-[11px] font-semibold tabular-nums">
                              {cmt.clapCount || 0}
                            </span>
                          </button>

                          <button
                            onClick={() => handleCommentReaction(cmt, 'fire')}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/15 hover:bg-orange-500/30 border border-orange-400/30 text-xs text-white transition-all active:scale-90"
                            title="Fire reaction on this comment"
                          >
                            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-400" />
                            <span className="font-mono text-[11px] font-semibold tabular-nums">
                              {cmt.fireCount || 0}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Camera Equipment & Attribution Tab */
              <div className="space-y-5">
                <p className="text-xs text-stone-300 leading-relaxed">{photo.description}</p>

                <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-3 backdrop-blur-xl">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pinisara Photographers Credit</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white font-coolvetica text-base font-bold flex items-center justify-center shrink-0 shadow-sm">
                      {getInitials(photo.photographerName)}
                    </div>
                    <div className="truncate">
                      <h4 className="font-source-serif font-medium text-base text-white truncate">
                        {photo.photographerName}
                      </h4>
                      <p className="text-xs text-emerald-300 truncate">{photo.photographerRole}</p>
                    </div>
                  </div>
                </div>

                {photo.collaborators && photo.collaborators.length > 0 && (
                  <div className="p-4 rounded-3xl bg-emerald-950/40 border border-emerald-500/20 space-y-2 backdrop-blur-xl">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                      <Users className="w-3.5 h-3.5" />
                      <span>Joint Field Crew Collaboration</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="text-stone-300">
                        <span className="font-semibold text-white">Lead:</span> {photo.photographerName}
                      </p>
                      <p className="text-stone-300">
                        <span className="font-semibold text-white">Co-Shooters:</span>{' '}
                        {photo.collaborators.join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                    {isMobileCamera ? (
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>Camera Equipment</span>
                  </h4>

                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-[10px] text-stone-400 uppercase font-mono block">
                        Camera Body
                      </span>
                      <span className="font-coolvetica text-white text-sm tracking-wide block mt-0.5">
                        {photo.camera}
                      </span>
                    </div>
                    {photo.lens && (
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-[10px] text-stone-400 uppercase font-mono block">
                          Lens Configuration
                        </span>
                        <span className="font-mono text-stone-300 text-xs block mt-0.5">
                          {photo.lens}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
