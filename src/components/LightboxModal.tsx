import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Users,
  Trash2,
  Crop,
  Keyboard,
  QrCode,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import QRCode from 'qrcode';
import { Photo, SupportedLanguage } from '../types';

const ASPECT_RATIO_OPTIONS: {
  value: Photo['aspectRatio'];
  label: string;
  desc: string;
  cssRatio: string | undefined;
}[] = [
  { value: 'original', label: 'Original', desc: 'Uncropped Native', cssRatio: undefined },
  { value: '16:9', label: '16:9', desc: 'Cinema Widescreen', cssRatio: '16 / 9' },
  { value: '16:10', label: '16:10', desc: 'Editorial Spread', cssRatio: '16 / 10' },
  { value: '3:2', label: '3:2', desc: 'DSLR Full Frame', cssRatio: '3 / 2' },
  { value: '4:3', label: '4:3', desc: 'Medium Format', cssRatio: '4 / 3' },
  { value: '1:1', label: '1:1', desc: 'Square Monograph', cssRatio: '1 / 1' },
  { value: '4:5', label: '4:5', desc: 'Portrait Editorial', cssRatio: '4 / 5' },
  { value: '2:3', label: '2:3', desc: 'Vertical Print', cssRatio: '2 / 3' },
  { value: '9:16', label: '9:16', desc: 'Mobile Story', cssRatio: '9 / 16' },
  { value: '21:9', label: '21:9', desc: 'Anamorphic', cssRatio: '21 / 9' }
];

type QrThemeId = 'editorial' | 'emerald' | 'noir';

const QR_THEMES: {
  id: QrThemeId;
  label: string;
  darkColor: string;
  lightColor: string;
  cardBg: string;
  cardText: string;
  badgeClass: string;
}[] = [
  {
    id: 'editorial',
    label: 'Paper White',
    darkColor: '#0c0a09',
    lightColor: '#ffffff',
    cardBg: 'bg-white border-stone-200',
    cardText: 'text-stone-900',
    badgeClass: 'bg-stone-900 text-white'
  },
  {
    id: 'emerald',
    label: 'Pinisara Green',
    darkColor: '#065f46',
    lightColor: '#ecfdf5',
    cardBg: 'bg-emerald-50 border-emerald-200',
    cardText: 'text-emerald-950',
    badgeClass: 'bg-emerald-700 text-white'
  },
  {
    id: 'noir',
    label: 'Darkroom Noir',
    darkColor: '#34d399',
    lightColor: '#09090b',
    cardBg: 'bg-zinc-950 border-emerald-500/30',
    cardText: 'text-white',
    badgeClass: 'bg-emerald-500 text-black'
  }
];

interface LightboxModalProps {
  photo: Photo | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleFavorite: (photoId: string) => void;
  onDownload: (photo: Photo, resolution: 'original' | 'web' | 'mobile') => void;
  onDeletePhoto?: (photoId: string) => void;
  onUpdateAspectRatio?: (
    photoId: string,
    aspectRatio: Photo['aspectRatio'],
    objectFit?: 'cover' | 'contain'
  ) => void;
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
  onDeletePhoto,
  onUpdateAspectRatio,
  allPhotosCount,
  currentIndex
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showMetadataPanel, setShowMetadataPanel] = useState<boolean>(true);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  const [showRatioMenu, setShowRatioMenu] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [qrTargetMode, setQrTargetMode] = useState<'lightbox' | 'direct'>('lightbox');
  const [qrTheme, setQrTheme] = useState<QrThemeId>('editorial');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedRawLink, setCopiedRawLink] = useState<boolean>(false);
  const [copiedQrUrl, setCopiedQrUrl] = useState<boolean>(false);
  const [shareStatusMessage, setShareStatusMessage] = useState<string | null>(null);
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState<boolean>(false);
  const [activeKeyPulse, setActiveKeyPulse] = useState<'left' | 'right' | 'esc' | null>(null);

  const [selectedRatio, setSelectedRatio] = useState<Photo['aspectRatio']>(
    photo?.aspectRatio || 'original'
  );
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>(
    photo?.objectFit === 'contain' ? 'contain' : 'cover'
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Build the shareable mobile URLs for the current photo
  const mobileLightboxUrl = useMemo(() => {
    if (!photo) return '';
    if (typeof window === 'undefined') return photo.webUrl || photo.originalUrl;
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('photo', photo.id);
    return url.toString();
  }, [photo?.id]);

  const directImageFileUrl = useMemo(() => {
    if (!photo) return '';
    const candidate = photo.originalUrl || photo.webUrl || '';
    // Data URLs can exceed QR code capacity; gracefully use mobileLightboxUrl if data URI
    if (candidate.startsWith('data:') && candidate.length > 1800) {
      return mobileLightboxUrl;
    }
    return candidate || mobileLightboxUrl;
  }, [photo?.originalUrl, photo?.webUrl, mobileLightboxUrl]);

  const activeQrUrl = qrTargetMode === 'direct' ? directImageFileUrl : mobileLightboxUrl;
  const activeQrThemeObj = QR_THEMES.find((t) => t.id === qrTheme) || QR_THEMES[0];

  // Generate real scannable QR code whenever photo, target mode, or QR theme changes
  useEffect(() => {
    let isMounted = true;
    if (!photo || !activeQrUrl) return;

    QRCode.toDataURL(activeQrUrl, {
      width: 520,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: activeQrThemeObj.darkColor,
        light: activeQrThemeObj.lightColor
      }
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch(() => {
        // Fallback to mobileLightboxUrl if URL was too long
        QRCode.toDataURL(mobileLightboxUrl || 'https://pinisara.photography', {
          width: 480,
          margin: 2
        })
          .then((fallbackUrl) => {
            if (isMounted) setQrDataUrl(fallbackUrl);
          })
          .catch(() => {});
      });

    return () => {
      isMounted = false;
    };
  }, [photo?.id, activeQrUrl, activeQrThemeObj.darkColor, activeQrThemeObj.lightColor, mobileLightboxUrl]);

  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setShowShareMenu(false);
    setShowRatioMenu(false);
    setCopiedLink(false);
    setCopiedRawLink(false);
    setCopiedQrUrl(false);
    setShareStatusMessage(null);
    setDownloadDropdownOpen(false);
    if (photo) {
      setSelectedRatio(photo.aspectRatio || 'original');
      setFitMode(photo.objectFit === 'contain' ? 'contain' : 'cover');
    }
  }, [photo?.id]);

  const handleApplyAspectRatio = (
    ratio: Photo['aspectRatio'],
    nextFit: 'cover' | 'contain' = fitMode
  ) => {
    if (!photo) return;
    setSelectedRatio(ratio);
    setFitMode(nextFit);
    if (onUpdateAspectRatio) {
      onUpdateAspectRatio(photo.id, ratio, nextFit);
    }
    setShareStatusMessage(`Aspect ratio updated to ${ratio.toUpperCase()} (${nextFit})`);
    setTimeout(() => setShareStatusMessage(null), 2200);
  };

  // Download a high-resolution shareable QR Code Pass PNG (with photo title, photographer & QR code)
  const handleDownloadQrCard = () => {
    if (!photo || !qrDataUrl) return;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1040;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.onload = () => {
      // Card Background
      ctx.fillStyle = activeQrThemeObj.lightColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border Frame
      ctx.strokeStyle = activeQrThemeObj.darkColor;
      ctx.lineWidth = 6;
      ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

      // Header Branding
      ctx.fillStyle = activeQrThemeObj.darkColor;
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PINISARA PHOTOGRAPHY · MOBILE PASS', canvas.width / 2, 95);

      ctx.font = '15px monospace';
      ctx.globalAlpha = 0.75;
      ctx.fillText('PINNAWALA CENTRAL COLLEGE ARCHIVE', canvas.width / 2, 125);
      ctx.globalAlpha = 1;

      // Draw QR Code in Center
      const qrSize = 540;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 165;
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Photo Title & Attribution Footer
      ctx.fillStyle = activeQrThemeObj.darkColor;
      ctx.font = 'bold 28px Georgia, serif';
      const cleanTitle =
        photo.title.length > 34 ? photo.title.slice(0, 32) + '…' : photo.title;
      ctx.fillText(cleanTitle, canvas.width / 2, 765);

      ctx.font = '600 18px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        `Shot by ${photo.photographerName} · ${photo.camera}`,
        canvas.width / 2,
        808
      );

      ctx.font = '15px monospace';
      ctx.globalAlpha = 0.7;
      ctx.fillText(
        'Scan with your phone camera to open & download in 4K',
        canvas.width / 2,
        865
      );
      ctx.font = '13px monospace';
      const displayUrl =
        activeQrUrl.length > 56 ? activeQrUrl.slice(0, 54) + '…' : activeQrUrl;
      ctx.fillText(displayUrl, canvas.width / 2, 915);
      ctx.globalAlpha = 1;

      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `pinisara-qr-${photo.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShareStatusMessage('Downloaded shareable QR Code Pass (PNG)!');
      setTimeout(() => setShareStatusMessage(null), 2600);
    };
    qrImg.src = qrDataUrl;
  };

  const handleCopyQrTargetUrl = () => {
    if (!activeQrUrl) return;
    navigator.clipboard.writeText(activeQrUrl);
    setCopiedQrUrl(true);
    setShareStatusMessage('Mobile QR link copied to clipboard!');
    setTimeout(() => {
      setCopiedQrUrl(false);
      setShareStatusMessage(null);
    }, 2200);
  };

  // Keyboard navigation: ArrowLeft / ArrowRight to cycle photos, Esc to close, R to cycle aspect ratio, Q for QR code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!photo) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (showQrModal || showShareMenu || showRatioMenu || downloadDropdownOpen) {
          setShowQrModal(false);
          setShowShareMenu(false);
          setShowRatioMenu(false);
          setDownloadDropdownOpen(false);
          return;
        }
        setActiveKeyPulse('esc');
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveKeyPulse('left');
        setTimeout(() => setActiveKeyPulse(null), 220);
        onPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveKeyPulse('right');
        setTimeout(() => setActiveKeyPulse(null), 220);
        onNext();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        const idx = ASPECT_RATIO_OPTIONS.findIndex((o) => o.value === selectedRatio);
        const nextOpt = ASPECT_RATIO_OPTIONS[(idx + 1) % ASPECT_RATIO_OPTIONS.length];
        handleApplyAspectRatio(nextOpt.value);
      } else if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        setShowQrModal((prev) => !prev);
        setShowShareMenu(false);
        setShowRatioMenu(false);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoomLevel((prev) => Math.min(prev + 0.5, 3));
      } else if (e.key === '-') {
        e.preventDefault();
        setZoomLevel((prev) => {
          const next = Math.max(prev - 0.5, 1);
          if (next === 1) setPanPosition({ x: 0, y: 0 });
          return next;
        });
      } else if (e.key === '0') {
        e.preventDefault();
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    photo,
    zoomLevel,
    selectedRatio,
    fitMode,
    showQrModal,
    showShareMenu,
    showRatioMenu,
    downloadDropdownOpen,
    onClose,
    onPrev,
    onNext
  ]);

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
    const shareUrl = mobileLightboxUrl || photo.webUrl || window.location.href;
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
    const url = mobileLightboxUrl || photo.webUrl || window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyRawLink = () => {
    navigator.clipboard.writeText(photo.originalUrl);
    setCopiedRawLink(true);
    setTimeout(() => setCopiedRawLink(false), 2000);
  };

  const shareTargetUrl = encodeURIComponent(
    mobileLightboxUrl || photo.webUrl || window.location.href
  );
  const shareTitleText = encodeURIComponent(
    `"${photo.title}" by ${photo.photographerName} (${photo.camera}) on Pinisara Photographers`
  );

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
  const currentRatioConfig =
    ASPECT_RATIO_OPTIONS.find((r) => r.value === selectedRatio) || ASPECT_RATIO_OPTIONS[0];

  return (
    <div
      id="lightbox-overlay"
      className="fixed inset-0 z-50 bg-black/92 backdrop-blur-xl flex flex-col justify-between select-none animate-apple-fade-in"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top App Bar */}
      <header className="h-16 sm:h-18 px-3 sm:px-6 flex items-center justify-between border-b border-white/10 z-30 bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5 sm:gap-3 text-white min-w-0">
          <button
            id="lightbox-close-btn"
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-white/15 text-white transition-all active:scale-90 ${
              activeKeyPulse === 'esc' ? 'bg-white/30 scale-90' : ''
            }`}
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h3 className="font-source-serif font-medium text-xs sm:text-sm text-white truncate max-w-[140px] sm:max-w-sm">
              {photo.title}
            </h3>
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-emerald-400">
              <span>
                {currentIndex + 1} of {allPhotosCount}
              </span>
              <span className="hidden md:inline text-white/40">•</span>
              <span className="hidden md:inline-flex items-center gap-1 text-white/65">
                <Keyboard className="w-3 h-3" />
                ←/→ Navigate · Esc Close · R Ratio · Q QR Code
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Interactive Aspect Ratio Selector */}
          <div className="relative">
            <button
              id="lightbox-aspect-ratio-btn"
              onClick={() => {
                setShowRatioMenu(!showRatioMenu);
                setShowShareMenu(false);
                setShowQrModal(false);
                setDownloadDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-mono font-semibold border border-white/15 transition-all active:scale-95"
              title="Change Aspect Ratio (Shortcut: R)"
            >
              <Crop className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">
                {selectedRatio === 'original' ? 'Ratio: Orig' : selectedRatio}
              </span>
            </button>

            {showRatioMenu && (
              <div
                id="lightbox-ratio-dropdown"
                className="absolute right-0 mt-2 w-72 bg-stone-950/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-3.5 z-40 animate-spring-pop text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Crop className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold font-mono uppercase tracking-wider">
                      Change Aspect Ratio
                    </span>
                  </div>
                  <button
                    onClick={() => setShowRatioMenu(false)}
                    className="p-1 rounded-full text-stone-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Fit vs Crop Toggle */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/10 rounded-xl mb-3 text-[11px] font-mono">
                  <button
                    onClick={() => handleApplyAspectRatio(selectedRatio, 'cover')}
                    className={`py-1.5 rounded-lg transition-all ${
                      fitMode === 'cover'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    Crop to Fill (Cover)
                  </button>
                  <button
                    onClick={() => handleApplyAspectRatio(selectedRatio, 'contain')}
                    className={`py-1.5 rounded-lg transition-all ${
                      fitMode === 'contain'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    Full Frame (Contain)
                  </button>
                </div>

                {/* Aspect Ratio Grid */}
                <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto pr-0.5">
                  {ASPECT_RATIO_OPTIONS.map((opt) => {
                    const isActive = selectedRatio === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          handleApplyAspectRatio(opt.value, fitMode);
                          setShowRatioMenu(false);
                        }}
                        className={`p-2 rounded-xl text-left border transition-all flex items-center justify-between ${
                          isActive
                            ? 'bg-emerald-600/30 border-emerald-400 text-white font-semibold'
                            : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <span className="font-mono text-xs block font-bold">{opt.label}</span>
                          <span className="text-[10px] text-stone-400 block">{opt.desc}</span>
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center bg-white/10 rounded-full p-1 border border-white/10 text-white">
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
                title="Reset zoom (0)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dedicated Shareable Mobile QR Code Button */}
          <button
            id="lightbox-qr-btn"
            onClick={() => {
              setShowQrModal(!showQrModal);
              setShowShareMenu(false);
              setShowRatioMenu(false);
              setDownloadDropdownOpen(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
              showQrModal
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/15'
            }`}
            title="Generate Shareable Mobile QR Code (Shortcut: Q)"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden md:inline">QR Code</span>
          </button>

          {/* Web Share Button */}
          <div className="relative">
            <button
              id="lightbox-share-btn"
              onClick={handleWebShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/15 transition-all active:scale-95"
              title="Share photo"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {showShareMenu && (
              <div
                id="lightbox-share-dropdown"
                className="absolute right-0 mt-2 w-72 bg-stone-950/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/15 p-4 z-40 animate-spring-pop text-white"
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

                {/* Instant Mobile QR Code Trigger inside Share Menu */}
                <button
                  onClick={() => {
                    setShowShareMenu(false);
                    setShowQrModal(true);
                  }}
                  className="w-full mb-3 p-2.5 rounded-2xl bg-emerald-600/25 hover:bg-emerald-600/35 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between transition-all active:scale-95"
                >
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Show Mobile QR Code</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    Scan on Phone
                  </span>
                </button>

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
                    <span className="text-[11px] text-stone-300">Copy Mobile Lightbox Link</span>
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
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {downloadDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-stone-950/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-2.5 z-40 animate-spring-pop"
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

      {/* Feedback Toast */}
      {shareStatusMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold shadow-xl border border-emerald-400/40 flex items-center gap-2 animate-spring-pop">
          <Check className="w-3.5 h-3.5" />
          <span>{shareStatusMessage}</span>
        </div>
      )}

      {/* Shareable Mobile QR Code Modal Overlay */}
      {showQrModal && (
        <div
          id="lightbox-qr-modal"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-apple-fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-stone-950/95 border border-white/20 p-5 sm:p-6 text-white shadow-2xl animate-spring-pop space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-source-serif font-semibold text-base text-white leading-tight">
                    Mobile QR Code Handoff
                  </h3>
                  <p className="text-[11px] font-mono text-stone-400">
                    Point your phone camera to open immediately
                  </p>
                </div>
              </div>
              <button
                id="close-qr-modal-btn"
                onClick={() => setShowQrModal(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target URL Mode Switcher (Mobile Lightbox vs Direct 4K Image File) */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/10 rounded-2xl text-xs font-mono">
              <button
                type="button"
                onClick={() => setQrTargetMode('lightbox')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  qrTargetMode === 'lightbox'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Lightbox</span>
              </button>
              <button
                type="button"
                onClick={() => setQrTargetMode('direct')}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  qrTargetMode === 'direct'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Direct 4K Image</span>
              </button>
            </div>

            {/* Scannable QR Code Pass Card */}
            <div
              className={`rounded-3xl border p-5 flex flex-col items-center text-center shadow-xl transition-colors duration-300 ${activeQrThemeObj.cardBg} ${activeQrThemeObj.cardText}`}
            >
              <div className="flex items-center justify-between w-full mb-3 text-[10px] font-mono uppercase tracking-wider opacity-75">
                <span>Pinisara Photography</span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${activeQrThemeObj.badgeClass}`}>
                  {qrTargetMode === 'lightbox' ? 'LIGHTBOX PASS' : '4K RAW FILE'}
                </span>
              </div>

              <div className="relative w-52 h-52 sm:w-56 sm:h-56 rounded-2xl overflow-hidden flex items-center justify-center bg-white/95 shadow-inner p-2">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR code for ${photo.title}`}
                    className="w-full h-full object-contain select-none"
                  />
                ) : (
                  <div className="text-xs font-mono text-stone-400 animate-pulse">
                    Generating QR…
                  </div>
                )}
              </div>

              <h4 className="font-source-serif font-semibold text-base mt-3 line-clamp-1">
                {photo.title}
              </h4>
              <p className="text-xs opacity-75 font-mono mt-0.5">
                {photo.photographerName} · {photo.camera}
              </p>
            </div>

            {/* QR Theme Switcher */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                Pass Theme:
              </span>
              <div className="flex items-center gap-1.5">
                {QR_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setQrTheme(t.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all ${
                      qrTheme === t.id
                        ? 'border-emerald-400 bg-emerald-500/20 text-white font-bold'
                        : 'border-white/10 bg-white/5 text-stone-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Encoded URL Preview & Copy / Download Actions */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2 text-xs">
              <span className="font-mono text-[11px] text-stone-300 truncate flex-1">
                {activeQrUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyQrTargetUrl}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
              >
                {copiedQrUrl ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadQrCard}
                className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download QR Pass</span>
              </button>
              <button
                type="button"
                onClick={handleWebShare}
                className="py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Share to Phone</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Viewing Canvas */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Previous Photo Button (Keyboard ArrowLeft) */}
        <button
          id="lightbox-prev-arrow"
          onClick={onPrev}
          className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/65 hover:bg-black/90 text-white transition-all hover:scale-110 active:scale-95 border border-white/15 ${
            activeKeyPulse === 'left' ? 'scale-125 bg-emerald-600 border-emerald-300' : ''
          }`}
          title="Previous Photo (← Left Arrow Key)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Photo Button (Keyboard ArrowRight) */}
        <button
          id="lightbox-next-arrow"
          onClick={onNext}
          className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/65 hover:bg-black/90 text-white transition-all hover:scale-110 active:scale-95 border border-white/15 ${
            activeKeyPulse === 'right' ? 'scale-125 bg-emerald-600 border-emerald-300' : ''
          }`}
          title="Next Photo (→ Right Arrow Key)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Image Canvas Container with Live Aspect Ratio Frame */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          className={`w-full h-full flex items-center justify-center p-4 sm:p-8 ${
            zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          }`}
        >
          <div
            style={{
              aspectRatio: currentRatioConfig.cssRatio,
              transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
              transition: isDragging ? 'none' : 'all 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
              maxHeight: 'calc(100vh - 130px)',
              maxWidth: showMetadataPanel ? 'calc(100vw - 380px)' : 'calc(100vw - 90px)'
            }}
            className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/15 bg-stone-950 flex items-center justify-center"
          >
            <img
              src={photo.originalUrl}
              alt={photo.title}
              referrerPolicy="no-referrer"
              style={{
                maxHeight: currentRatioConfig.cssRatio ? '100%' : 'calc(100vh - 130px)',
                objectPosition: photo.objectPosition || '50% 50%'
              }}
              className={`w-full h-full select-none transition-all duration-300 ${
                currentRatioConfig.cssRatio
                  ? fitMode === 'cover'
                    ? 'object-cover'
                    : 'object-contain'
                  : 'object-contain'
              }`}
              draggable={false}
            />
          </div>
        </div>

        {/* Side Metadata, Mobile QR Card & Aspect Ratio Controls Panel */}
        {showMetadataPanel && (
          <div
            id="lightbox-metadata-panel"
            className="hidden sm:flex w-80 md:w-96 bg-stone-950/92 border-l border-white/15 h-full p-6 text-white overflow-y-auto shrink-0 flex-col gap-5 z-20 animate-apple-slide-up"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                  {photo.category}
                </span>
                <span className="text-xs text-stone-400 font-mono">{photo.dateTaken}</span>
              </div>
              <h2 className="font-source-serif font-medium text-xl leading-snug text-white">
                {photo.title}
              </h2>
              <p className="mt-2 text-xs text-stone-300 leading-relaxed">{photo.description}</p>
            </div>

            {/* Instant Mobile QR Code Card inside Side Panel */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Open on Mobile (QR)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="text-[10px] font-mono text-emerald-300 hover:text-white underline"
                >
                  Expand Pass (Q)
                </button>
              </div>

              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="w-20 h-20 rounded-xl bg-white p-1.5 shrink-0 shadow-md hover:scale-105 transition-transform"
                  title="Click to enlarge QR Code"
                >
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Code for ${photo.title}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] text-stone-400 font-mono">
                      QR…
                    </div>
                  )}
                </button>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <p className="text-xs font-medium text-white leading-snug">
                    Scan with your phone camera to open this photo immediately.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={handleDownloadQrCard}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Save QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyQrTargetUrl}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedQrUrl ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Aspect Ratio Quick Switcher Card in Side Panel */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                  <Crop className="w-3.5 h-3.5" />
                  <span>Frame Aspect Ratio</span>
                </div>
                <span className="text-[10px] font-mono text-stone-400">Press R to cycle</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ASPECT_RATIO_OPTIONS.map((opt) => {
                  const active = selectedRatio === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleApplyAspectRatio(opt.value, fitMode)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all active:scale-95 ${
                        active
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'bg-white/10 text-stone-300 hover:bg-white/20'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photographer Attribution Card */}
            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-3">
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

            {/* Collaborative Field Crew Details */}
            {photo.collaborators && photo.collaborators.length > 0 && (
              <div className="p-4 rounded-3xl bg-emerald-950/40 border border-emerald-500/20 space-y-2">
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

            {/* Camera Body & Lens Details */}
            <div className="space-y-2.5">
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

            {/* Keyboard Shortcuts Guide */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-stone-300 font-semibold mb-1">
                <Keyboard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Keyboard Shortcuts</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Previous / Next Photo</span>
                <span className="font-mono text-white">← / → Arrow Keys</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Cycle Aspect Ratio</span>
                <span className="font-mono text-white">R Key</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Mobile QR Code Pass</span>
                <span className="font-mono text-white">Q Key</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Close Lightbox</span>
                <span className="font-mono text-white">Esc Key</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
