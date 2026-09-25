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
  Calendar, 
  Check, 
  Copy, 
  Info,
  Smartphone,
  ShieldCheck,
  Send,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Users
} from 'lucide-react';
import { Photo, SupportedLanguage } from '../types';

interface LightboxModalProps {
  photo: Photo | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleFavorite: (photoId: string) => void;
  onDownload: (photo: Photo, resolution: 'original' | 'web' | 'mobile') => void;
  currentLang: SupportedLanguage;
  allPhotosCount: number;
  currentIndex: number;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  photo,
  onClose,
  onPrev,
  onNext,
  onToggleFavorite,
  onDownload,
  allPhotosCount,
  currentIndex
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showMetadataPanel, setShowMetadataPanel] = useState<boolean>(true);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedRawLink, setCopiedRawLink] = useState<boolean>(false);
  const [shareStatusMessage, setShareStatusMessage] = useState<string | null>(null);
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setShowShareMenu(false);
    setCopiedLink(false);
    setCopiedRawLink(false);
    setShareStatusMessage(null);
    setDownloadDropdownOpen(false);
  }, [photo?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!photo) return;
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

  /**
   * Web Share API Integration
   * Invokes native device share sheet on supported platforms (iOS, Android, macOS, Chrome/Edge),
   * allowing users to send photos directly to WhatsApp, Messages, Instagram, Twitter, etc.
   * Gracefully opens the Apple frosted glass social sheet if Web Share is unavailable or cancelled.
   */
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
        if (err.name === 'AbortError') {
          // User closed share sheet intentionally
          return;
        }
        // Fallback to social share menu
        setShowShareMenu(true);
      }
    } else {
      // Browser doesn't support Web Share API (e.g. desktop non-Safari/Edge)
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

  // Direct Social Platform URLs
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
      .join('')
      .toUpperCase();
  };

  const isMobileCamera = photo.camera.includes('iPhone') || photo.camera.includes('Samsung');

  return (
    <div 
      id="lightbox-overlay"
      className="fixed inset-0 z-50 bg-black/90 dark:bg-black/95 backdrop-blur-3xl flex flex-col justify-between select-none animate-apple-fade-in"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top App Bar with Frosted Blur Glass */}
      <header className="h-16 sm:h-18 px-4 sm:px-6 flex items-center justify-between border-b border-white/10 z-30 bg-black/40 backdrop-blur-2xl">
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
            <p className="text-[11px] font-mono text-emerald-400">
              Pinisara Photographers · {currentIndex + 1} of {allPhotosCount}
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
            <span className="text-xs font-mono px-2 min-w-[45px] text-center">
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

            {/* Apple Frosted Glass Share Sheet Modal */}
            {showShareMenu && (
              <div 
                id="lightbox-share-dropdown"
                className="absolute right-0 mt-2 w-72 bg-stone-950/90 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/15 p-4 z-40 animate-apple-scale-in text-white"
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

                {/* Social Direct Share Buttons */}
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

                {/* Native Device Share trigger */}
                {typeof navigator !== 'undefined' && !!navigator.share && (
                  <button
                    onClick={() => {
                      setShowShareMenu(false);
                      handleWebShare();
                    }}
                    className="w-full mb-2.5 py-2 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open Native Device Share Sheet</span>
                  </button>
                )}

                {/* Copy Links */}
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
            onClick={() => onToggleFavorite(photo.id)}
            className={`p-2 rounded-full border transition-transform active:scale-90 ${
              photo.isFavorited
                ? 'bg-rose-500 border-rose-400 text-white'
                : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
            }`}
            title={photo.isFavorited ? 'Remove favorite' : 'Add favorite'}
          >
            <Heart className={`w-4 h-4 ${photo.isFavorited ? 'fill-current' : ''}`} />
          </button>

          {/* Toggle Metadata Panel */}
          <button
            onClick={() => setShowMetadataPanel(!showMetadataPanel)}
            className={`p-2 rounded-full border transition-colors ${
              showMetadataPanel 
                ? 'bg-emerald-700 border-emerald-600 text-white' 
                : 'bg-white/10 border-white/15 text-white hover:bg-white/20'
            }`}
            title="Toggle details"
          >
            <Info className="w-4 h-4" />
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

      {/* Share feedback toast */}
      {shareStatusMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-xl border border-emerald-400/40 flex items-center gap-2 animate-apple-slide-up">
          <Check className="w-3.5 h-3.5" />
          <span>{shareStatusMessage}</span>
        </div>
      )}

      {/* Main Viewing Canvas with Ambient Blur Backdrop */}
      <div className="relative flex-1 flex overflow-hidden">
        
        {/* Ambient Glow behind high-res photo */}
        <div 
          className="absolute inset-0 scale-110 opacity-20 blur-3xl pointer-events-none transition-all duration-700"
          style={{
            backgroundImage: `url(${photo.webUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

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
          className={`w-full h-full flex items-center justify-center p-4 ${
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
              maxHeight: 'calc(100vh - 120px)',
              maxWidth: showMetadataPanel ? 'calc(100vw - 360px)' : 'calc(100vw - 80px)',
            }}
            className="object-contain shadow-2xl select-none rounded-xl"
            draggable={false}
          />
        </div>

        {/* Side Metadata & Contributor Credits Panel */}
        {showMetadataPanel && (
          <div 
            id="lightbox-metadata-panel"
            className="w-full sm:w-80 md:w-96 bg-stone-950/90 backdrop-blur-3xl border-l border-white/15 h-full p-6 text-white overflow-y-auto shrink-0 flex flex-col gap-6 z-20 animate-apple-slide-up"
          >
            {/* Title & Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                  {photo.category}
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  {photo.dateTaken}
                </span>
              </div>
              <h2 className="font-source-serif font-medium text-xl leading-snug text-white">
                {photo.title}
              </h2>
              <p className="mt-2 text-xs text-stone-300 leading-relaxed">
                {photo.description}
              </p>
            </div>

            {/* Photographer Attribution Card - Monogram & Camera Badge */}
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-3 backdrop-blur-xl">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pinisara Photographers Credit</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Minimalist Monogram */}
                <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white font-coolvetica text-base font-bold flex items-center justify-center shrink-0 shadow-sm">
                  {getInitials(photo.photographerName)}
                </div>
                <div className="truncate">
                  <h4 className="font-source-serif font-medium text-base text-white truncate">
                    {photo.photographerName}
                  </h4>
                  <p className="text-xs text-emerald-300 truncate">
                    {photo.photographerRole}
                  </p>
                  {photo.photographerHandle && (
                    <p className="text-[11px] text-stone-400 font-mono">
                      {photo.photographerHandle}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-stone-400 italic pt-1 border-t border-white/10">
                Pinisara Photographers public media archive. Free to download & share for students, athletes, and families.
              </div>
            </div>

            {/* Collaborative Field Crew Details */}
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
                    <span className="font-semibold text-white">Co-Shooters:</span> {photo.collaborators.join(', ')}
                  </p>
                  {photo.collaborationNotes && (
                    <p className="text-[11px] text-emerald-300 font-mono pt-1.5 border-t border-emerald-500/20">
                      {photo.collaborationNotes}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Camera Body & Lens Details */}
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
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">Camera Body</span>
                  <span className="font-coolvetica text-white text-sm tracking-wide block mt-0.5">{photo.camera}</span>
                </div>
                {photo.lens && (
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] text-stone-400 uppercase font-mono block">Lens Configuration</span>
                    <span className="font-mono text-stone-300 text-xs block mt-0.5">{photo.lens}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Resolution & File Info */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1.5">
              <div className="flex justify-between text-stone-400">
                <span>Resolution</span>
                <span className="font-mono text-white">{photo.resolution || '4K Ultra HD (3840 × 2160)'}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Aspect Ratio</span>
                <span className="font-mono text-white">{photo.aspectRatio}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Format</span>
                <span className="font-mono text-emerald-400 font-semibold">Uncompressed 4K RAW</span>
              </div>
            </div>

            {/* Prominent Web Share Button in Side Panel */}
            <div className="pt-2 space-y-2">
              <button
                id="lightbox-panel-webshare-btn"
                onClick={handleWebShare}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Share via Web Share / Socials</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-white/10"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Photo Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-400" />
                    <span>Copy Direct Link</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
