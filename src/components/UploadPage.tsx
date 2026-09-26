import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  CheckCircle2,
  FileUp,
  Coins,
  Eye,
  Users,
  Crop,
  Maximize2,
  Grid,
  Sparkles,
  RotateCcw,
  ArrowUpRight,
  Crosshair
} from 'lucide-react';
import { Photo, CategoryInfo, UserProfile } from '../types';
import { CREATOR_TEAM, CURRENT_USER } from '../data/mockData';
import { FirebaseImageUploader } from './FirebaseImageUploader';

interface UploadPageProps {
  categories: CategoryInfo[];
  currentUser?: UserProfile;
  onAddPhoto: (photo: Photo) => void;
  onNavigateToGallery: () => void;
  onOpenAccountModal?: () => void;
}

type AspectRatioPreset = Photo['aspectRatio'];
type ObjectFitMode = 'cover' | 'contain' | 'fill';

const ASPECT_RATIO_OPTIONS: {
  id: AspectRatioPreset;
  label: string;
  subtitle: string;
  cssRatio: string;
  tailwindAspect: string;
}[] = [
  {
    id: '16:10',
    label: '16:10',
    subtitle: 'Editorial Hero',
    cssRatio: '16 / 10',
    tailwindAspect: 'aspect-16/10'
  },
  {
    id: '16:9',
    label: '16:9',
    subtitle: 'Widescreen 4K',
    cssRatio: '16 / 9',
    tailwindAspect: 'aspect-16/9'
  },
  {
    id: '4:3',
    label: '4:3',
    subtitle: 'Standard Masonry',
    cssRatio: '4 / 3',
    tailwindAspect: 'aspect-4/3'
  },
  {
    id: '3:2',
    label: '3:2',
    subtitle: 'DSLR Full Frame',
    cssRatio: '3 / 2',
    tailwindAspect: 'aspect-3/2'
  },
  {
    id: '1:1',
    label: '1:1',
    subtitle: 'Square Plate',
    cssRatio: '1 / 1',
    tailwindAspect: 'aspect-square'
  },
  {
    id: '4:5',
    label: '4:5',
    subtitle: 'Portrait Masonry',
    cssRatio: '4 / 5',
    tailwindAspect: 'aspect-4/5'
  },
  {
    id: '2:3',
    label: '2:3',
    subtitle: 'Tall Monograph',
    cssRatio: '2 / 3',
    tailwindAspect: 'aspect-2/3'
  },
  {
    id: '9:16',
    label: '9:16',
    subtitle: 'Mobile Story',
    cssRatio: '9 / 16',
    tailwindAspect: 'aspect-9/16'
  },
  {
    id: '21:9',
    label: '21:9',
    subtitle: 'Anamorphic',
    cssRatio: '21 / 9',
    tailwindAspect: 'aspect-21/9'
  }
];

const OBJECT_FIT_OPTIONS: { id: ObjectFitMode; label: string; description: string }[] = [
  {
    id: 'cover',
    label: 'Auto-Crop Fill (cover)',
    description: 'Fills the masonry aspect frame edge-to-edge using focal point cropping'
  },
  {
    id: 'contain',
    label: 'Uncropped Fit (contain)',
    description: 'Preserves 100% of the sensor frame inside the aspect ratio container'
  },
  {
    id: 'fill',
    label: 'Stretch Frame (fill)',
    description: 'Stretches image dimensions to match the exact target aspect ratio'
  }
];

const FOCAL_PRESETS: { label: string; x: number; y: number }[] = [
  { label: 'Center (50%, 50%)', x: 50, y: 50 },
  { label: 'Top Headroom (50%, 22%)', x: 50, y: 22 },
  { label: 'Upper Third (50%, 33%)', x: 50, y: 33 },
  { label: 'Lower Stage (50%, 72%)', x: 50, y: 72 },
  { label: 'Left Subject (30%, 50%)', x: 30, y: 50 },
  { label: 'Right Subject (70%, 50%)', x: 70, y: 50 }
];

export const UploadPage: React.FC<UploadPageProps> = ({
  categories,
  currentUser = CURRENT_USER,
  onAddPhoto,
  onNavigateToGallery,
  onOpenAccountModal = () => {}
}) => {
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>(
    currentUser?.isCreator ? currentUser.userId.replace('usr_', '') || 'hasaranga' : 'hasaranga'
  );
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('assembly');
  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=2400&q=95'
  );
  const [tagsInput, setTagsInput] = useState<string>('Main Assembly, Flag Hoisting, School Anthem');
  const [resolutionInput, setResolutionInput] = useState<string>('4K Ultra HD (3840 × 2160)');
  const [customCamera] = useState<string>(currentUser?.camera || 'Canon EOS Kiss F');
  const [customLens] = useState<string>(currentUser?.lens || '18-55mm IS Kit Lens');
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>(['Dulen Induwara']);
  const [collaborationNotes, setCollaborationNotes] = useState<string>(
    'Joint Coverage: Stage & Ceremony + Audience Coverage'
  );
  const [ambientGlow, setAmbientGlow] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-Cropping & Masonry Aspect-Ratio Preview State
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioPreset>('16:10');
  const [objectFitMode, setObjectFitMode] = useState<ObjectFitMode>('cover');
  const [focalX, setFocalX] = useState<number>(50);
  const [focalY, setFocalY] = useState<number>(40);
  const [showRuleOfThirds, setShowRuleOfThirds] = useState<boolean>(true);
  const [autoCropEnabled, setAutoCropEnabled] = useState<boolean>(true);
  const [detectedDimensions, setDetectedDimensions] = useState<{ w: number; h: number } | null>(null);
  const [autoCropStatus, setAutoCropStatus] = useState<string>(
    'Smart Auto-Crop active — 16:10 Editorial Hero (cover · focal 50% 40%)'
  );

  const popularTags = [
    'Main Assembly',
    'Pirith Mandapaya',
    'Prefect Election',
    'Morning Radio',
    'School Parliament',
    'Big Match',
    'Inter-House Relays',
    'Colours Night',
    'Championship',
    '4K Action'
  ];

  const knownCreator = CREATOR_TEAM.find((c) => c.id === selectedCreatorId);
  const activeCreator = knownCreator || {
    id: currentUser.userId,
    name: currentUser.displayName,
    camera: currentUser.camera || customCamera,
    lens: currentUser.lens || customLens,
    role: currentUser.affiliation || 'Pinisara Photojournalist',
    handle: `@${currentUser.displayName.toLowerCase().replace(/\s+/g, '_')}`,
    avatar: '',
    bio: currentUser.bio,
    photoCount: 1
  };

  const activeAspectConfig =
    ASPECT_RATIO_OPTIONS.find((opt) => opt.id === selectedAspectRatio) || ASPECT_RATIO_OPTIONS[0];

  // Smart Auto-Crop computation based on natural image dimensions
  const runSmartAutoCrop = (width: number, height: number) => {
    if (!width || !height) return;
    const ratio = width / height;
    setObjectFitMode('cover');

    if (ratio >= 1.7) {
      setSelectedAspectRatio('16:9');
      setFocalX(50);
      setFocalY(42);
      setAutoCropStatus(
        `Auto-Cropped (${width}×${height} wide sensor) → 16:9 Widescreen · object-fit: cover · Upper-Center Headroom (50% 42%)`
      );
    } else if (ratio >= 1.52) {
      setSelectedAspectRatio('16:10');
      setFocalX(50);
      setFocalY(40);
      setAutoCropStatus(
        `Auto-Cropped (${width}×${height} DSLR frame) → 16:10 Editorial Hero · object-fit: cover · Rule-of-Thirds (50% 40%)`
      );
    } else if (ratio >= 1.2) {
      setSelectedAspectRatio('4:3');
      setFocalX(50);
      setFocalY(45);
      setAutoCropStatus(
        `Auto-Cropped (${width}×${height} 4:3 sensor) → 4:3 Standard Masonry · object-fit: cover · Balanced Center (50% 45%)`
      );
    } else if (ratio >= 0.92 && ratio <= 1.08) {
      setSelectedAspectRatio('1:1');
      setFocalX(50);
      setFocalY(50);
      setAutoCropStatus(
        `Auto-Cropped (${width}×${height} square) → 1:1 Square Plate · object-fit: cover · Center (50% 50%)`
      );
    } else {
      setSelectedAspectRatio('4:5');
      setFocalX(50);
      setFocalY(32);
      setAutoCropStatus(
        `Auto-Cropped (${width}×${height} vertical portrait) → 4:5 Portrait Masonry · object-fit: cover · Portrait Headroom (50% 32%)`
      );
    }
  };

  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setDetectedDimensions({ w: img.naturalWidth, h: img.naturalHeight });
      setResolutionInput(`4K Ultra HD (${img.naturalWidth} × ${img.naturalHeight})`);
      if (autoCropEnabled) {
        runSmartAutoCrop(img.naturalWidth, img.naturalHeight);
      }
    }
  };

  const handlePreviewClickToSetFocalPoint = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nextX = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const nextY = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setFocalX(nextX);
    setFocalY(nextY);
    setAutoCropEnabled(false);
    setAutoCropStatus(
      `Custom Crop Active → ${selectedAspectRatio} · object-fit: ${objectFitMode} · Focal Point (${nextX}% ${nextY}%)`
    );
  };

  const handleToggleCollaborator = (name: string) => {
    setSelectedCollaborators((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        setAutoCropEnabled(true);
        if (!title.trim()) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      }
      setTimeout(() => setIsProcessing(false), 400);
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = (tag: string) => {
    const currentTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (!currentTags.includes(tag)) {
      setTagsInput(currentTags.length > 0 ? `${tagsInput}, ${tag}` : tag);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    const newPhoto: Photo = {
      id: `photo-${Date.now()}`,
      eventId: 'evt-pinisara-gallery',
      title: title.trim(),
      description:
        description.trim() ||
        `Captured by ${activeCreator.name} for the Pinisara Photographers archive.`,
      category,
      originalUrl: imageUrl.trim(),
      webUrl: imageUrl.trim(),
      thumbnailUrl: imageUrl.trim(),
      resolution: resolutionInput || '4K Ultra HD (3840 × 2160)',
      aspectRatio: selectedAspectRatio,
      objectFit: objectFitMode,
      objectPosition: `${focalX}% ${focalY}%`,
      fileSizeOriginal: '18.4 MB RAW',
      fileSizeWeb: '1.8 MB',
      fileSizeMobile: '520 KB',
      photographerId: activeCreator.id,
      photographerName: activeCreator.name,
      photographerRole: activeCreator.role,
      photographerHandle: activeCreator.handle,
      camera: activeCreator.camera,
      lens: activeCreator.lens,
      settings: '1/1000s · f/4.0 · ISO 400',
      collaborators: selectedCollaborators.length > 0 ? selectedCollaborators : undefined,
      collaborationNotes:
        selectedCollaborators.length > 0 ? collaborationNotes.trim() : undefined,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      downloadCount: 0,
      likesCount: 0,
      dateTaken: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    onAddPhoto(newPhoto);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onNavigateToGallery();
    }, 1500);
  };

  const computedObjectPosition = `${focalX}% ${focalY}%`;

  return (
    <div
      id="club-upload-page"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full animate-apple-fade-in"
    >
      {/* Editorial Header */}
      <div className="max-w-2xl mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-coolvetica text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            Pinisara Studio · Smart Auto-Crop
          </span>
          <span className="font-tempting italic text-stone-500 dark:text-stone-400 text-sm">
            Creator & Collaborative Publishing
          </span>
        </div>

        <h1 className="font-source-serif font-normal text-3xl sm:text-4xl text-stone-900 dark:text-white tracking-tight leading-tight">
          Publish Captures & Masonry Auto-Crop Studio
        </h1>

        <p className="mt-2 text-stone-600 dark:text-stone-400 text-xs sm:text-sm leading-relaxed">
          Upload high-resolution school event photos and use the interactive CSS <code className="font-mono">object-fit</code> & <code className="font-mono">aspect-ratio</code> preview studio to fine-tune how your capture appears in the masonry grid before publishing.
        </p>
      </div>

      {/* Account Verification & Credits Award Banner */}
      <div className="mb-8 p-4.5 rounded-3xl ultra-glass flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-coolvetica text-sm font-bold shrink-0 ${
              currentUser?.isCreator
                ? 'bg-black dark:bg-stone-800 text-white'
                : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
            }`}
          >
            {(currentUser?.displayName || 'U').charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-900 dark:text-white">
                Publishing as {currentUser?.displayName || 'User'}
              </span>
              {currentUser?.isCreator ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-semibold">
                  Creator
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono text-[10px]">
                  Standard
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 font-mono mt-0.5">
              <span>
                {currentUser?.isCreator
                  ? `${currentUser.camera || 'DSLR'} · ${currentUser.affiliation}`
                  : 'Public Account'}
              </span>
              <span>·</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                {currentUser?.credits ?? 0} Credits
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-700/40 text-amber-800 dark:text-amber-300 text-xs font-mono font-medium flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>+50 cr reward</span>
          </div>
          <button
            onClick={onOpenAccountModal}
            className="text-xs px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium whitespace-nowrap transition-colors"
          >
            Switch Profile
          </button>
        </div>
      </div>

      {/* Direct Firebase Storage Bucket Upload Component */}
      <div className="mb-8">
        <FirebaseImageUploader
          categories={categories}
          currentUser={currentUser}
          onPhotoUploaded={(newPhoto) => {
            onAddPhoto(newPhoto);
            onNavigateToGallery();
          }}
        />
      </div>

      {/* Upload Form Card */}
      <div className="rounded-3xl ultra-glass p-6 sm:p-10 shadow-2xl">
        {success ? (
          <div className="py-16 text-center space-y-4 animate-apple-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-source-serif font-medium text-2xl text-stone-900 dark:text-white">
              Photograph Cropped & Published Successfully!
            </h3>
            <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm max-w-md mx-auto">
              "{title}" has been published to the Pinisara Photographers archive with aspect ratio{' '}
              <strong className="text-stone-900 dark:text-white">{selectedAspectRatio}</strong>,{' '}
              <code className="font-mono">object-fit: {objectFitMode}</code>, and focal point{' '}
              <code className="font-mono">{computedObjectPosition}</code>.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-xs font-mono font-bold">
              <Coins className="w-3.5 h-3.5" />
              <span>+50 Credits Added to Balance</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Attribution & Primary Lead Photographer */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-3">
                1. Lead Photographer & Assigned Camera Equipment
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CREATOR_TEAM.map((creator) => {
                  const isSelected = selectedCreatorId === creator.id;
                  return (
                    <button
                      type="button"
                      key={creator.id}
                      onClick={() => setSelectedCreatorId(creator.id)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-start justify-between ${
                        isSelected
                          ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-600/20'
                          : 'border-stone-200/90 dark:border-white/10 bg-white/70 dark:bg-stone-800/60 hover:border-stone-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div>
                        <span className="font-source-serif font-medium text-sm text-stone-900 dark:text-white block">
                          {creator.name}
                        </span>
                        <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold block mt-0.5">
                          {creator.camera}
                        </span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-1">
                          {creator.role}
                        </span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-600 text-white'
                            : 'border-stone-300 dark:border-stone-600'
                        }`}
                      >
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Collaborative Photographers / Co-Shooters */}
            <div className="p-4.5 rounded-2xl bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200/80 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    2. Co-Photographers & Collaboration
                  </span>
                </div>
                <span className="text-[10px] font-mono text-stone-400">
                  {selectedCollaborators.length} co-shooters selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {CREATOR_TEAM.map((member) => {
                  const isLead = member.id === selectedCreatorId;
                  const isChecked = selectedCollaborators.includes(member.name);
                  if (isLead) return null;

                  return (
                    <button
                      type="button"
                      key={member.id}
                      onClick={() => handleToggleCollaborator(member.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-300 active:scale-95 border ${
                        isChecked
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                          : 'glass-pill text-stone-700 dark:text-stone-300 hover:border-emerald-500/50'
                      }`}
                    >
                      <span className="text-[10px]">{isChecked ? '✓' : '+'}</span>
                      <span>{member.name}</span>
                      <span className="text-[10px] font-mono opacity-80">
                        ({member.camera.split(' ')[0]})
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedCollaborators.length > 0 && (
                <div className="pt-2">
                  <label className="block text-[11px] font-mono text-stone-600 dark:text-stone-400 mb-1">
                    Collaboration Notes / Division of Coverage
                  </label>
                  <input
                    type="text"
                    value={collaborationNotes}
                    onChange={(e) => setCollaborationNotes(e.target.value)}
                    placeholder="e.g. Lead: Stage & Podium · Co-Shooter: Audience & Procession"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:border-emerald-600 focus:outline-none font-mono"
                  />
                </div>
              )}
            </div>

            {/* Step 3: High-Resolution Image Source */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  3. High-Resolution Image Source
                </label>
                <button
                  type="button"
                  onClick={() => setAmbientGlow(!ambientGlow)}
                  className="text-[11px] font-mono flex items-center gap-1.5 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ambient Glow: {ambientGlow ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLocalFileSelect}
              />

              {/* Drag / Click Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-3xl p-6 sm:p-8 text-center cursor-pointer bg-stone-50/50 dark:bg-stone-800/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200/90 dark:border-white/10 group-hover:border-emerald-300 dark:group-hover:border-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-xs transition-colors">
                  <FileUp className="w-6 h-6 text-stone-600 dark:text-stone-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors" />
                </div>
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Click to select high-res photo from your camera or computer
                </p>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                  Auto-detects dimensions and applies Smart Auto-Crop for the masonry grid
                </p>
              </div>

              {/* Direct URL Input */}
              <div className="pt-2">
                <label className="block text-[11px] font-mono text-stone-500 dark:text-stone-400 mb-1">
                  Or paste a direct high-res image URL:
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setAutoCropEnabled(true);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:border-emerald-600 focus:outline-none text-xs font-mono"
                />
              </div>
            </div>

            {/* Step 4: AUTO-CROPPING & MASONRY ASPECT-RATIO PREVIEW STUDIO */}
            {imageUrl && (
              <div
                id="upload-auto-crop-studio"
                className="p-5 sm:p-6 rounded-3xl bg-stone-100/80 dark:bg-stone-900/70 border border-stone-200/90 dark:border-white/15 space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 dark:border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                      <Crop className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-stone-900 dark:text-white">
                        4. Auto-Cropping & Masonry Aspect-Ratio Preview
                      </h3>
                      <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {autoCropStatus}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="smart-auto-crop-btn"
                      onClick={() => {
                        setAutoCropEnabled(true);
                        if (detectedDimensions) {
                          runSmartAutoCrop(detectedDimensions.w, detectedDimensions.h);
                        } else {
                          setSelectedAspectRatio('16:10');
                          setObjectFitMode('cover');
                          setFocalX(50);
                          setFocalY(40);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Smart Auto-Crop</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRuleOfThirds((prev) => !prev)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 border transition-all ${
                        showRuleOfThirds
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold'
                          : 'glass-pill text-stone-700 dark:text-stone-300'
                      }`}
                      title="Toggle Rule-of-Thirds crop guide"
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>Grid</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAspectRatio('16:10');
                        setObjectFitMode('cover');
                        setFocalX(50);
                        setFocalY(50);
                        setAutoCropStatus('Reset to 16:10 · object-fit: cover · Center (50% 50%)');
                      }}
                      className="p-1.5 rounded-full glass-pill text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
                      title="Reset crop settings"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Aspect Ratio Preset Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-stone-600 dark:text-stone-300">
                      Target Masonry Aspect Ratio (<code className="font-mono">aspect-ratio: {activeAspectConfig.cssRatio}</code>)
                    </span>
                    {detectedDimensions && (
                      <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400">
                        Source Sensor: {detectedDimensions.w} × {detectedDimensions.h}px
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {ASPECT_RATIO_OPTIONS.map((opt) => {
                      const isSelected = selectedAspectRatio === opt.id;
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          id={`crop-aspect-${opt.id.replace(':', '-')}`}
                          onClick={() => {
                            setSelectedAspectRatio(opt.id);
                            setAutoCropEnabled(false);
                            setAutoCropStatus(
                              `Aspect Ratio ${opt.id} (${opt.subtitle}) · object-fit: ${objectFitMode} · Focal (${focalX}% ${focalY}%)`
                            );
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all duration-300 ${
                            isSelected
                              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm font-semibold'
                              : 'bg-white/80 dark:bg-stone-800/70 border-stone-200/80 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                          }`}
                        >
                          <div className="font-mono text-xs font-bold">{opt.label}</div>
                          <div
                            className={`text-[10px] truncate mt-0.5 ${
                              isSelected ? 'opacity-80' : 'text-stone-500 dark:text-stone-400'
                            }`}
                          >
                            {opt.subtitle}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CSS object-fit Mode Selector */}
                <div className="space-y-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-stone-600 dark:text-stone-300 block">
                    CSS <code className="font-mono">object-fit</code> Framing Mode
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {OBJECT_FIT_OPTIONS.map((mode) => {
                      const isSelected = objectFitMode === mode.id;
                      return (
                        <button
                          type="button"
                          key={mode.id}
                          id={`crop-object-fit-${mode.id}`}
                          onClick={() => {
                            setObjectFitMode(mode.id);
                            setAutoCropEnabled(false);
                            setAutoCropStatus(
                              `Aspect Ratio ${selectedAspectRatio} · object-fit: ${mode.id} · Focal (${focalX}% ${focalY}%)`
                            );
                          }}
                          className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                            isSelected
                              ? 'border-emerald-600 dark:border-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/50 ring-1 ring-emerald-500/30'
                              : 'bg-white/80 dark:bg-stone-800/70 border-stone-200/80 dark:border-white/10 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-stone-900 dark:text-white">
                              {mode.label}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">
                            {mode.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Focal Point (object-position) Presets & Sliders */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>
                        Focal Crop Position (<code className="font-mono">object-position: {computedObjectPosition}</code>)
                      </span>
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      Click anywhere on the crop preview below or drag sliders to re-center your subject
                    </span>
                  </div>

                  {/* Quick Focal Presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {FOCAL_PRESETS.map((preset) => {
                      const isPresetActive = focalX === preset.x && focalY === preset.y;
                      return (
                        <button
                          type="button"
                          key={preset.label}
                          onClick={() => {
                            setFocalX(preset.x);
                            setFocalY(preset.y);
                            setAutoCropEnabled(false);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                            isPresetActive
                              ? 'bg-emerald-600 text-white font-semibold'
                              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-white/10 hover:border-emerald-500'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Horizontal & Vertical Focal Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-stone-800/70 border border-stone-200/80 dark:border-white/10">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                        <span className="text-stone-600 dark:text-stone-300">Horizontal Pan (X)</span>
                        <span className="font-bold text-stone-900 dark:text-white">{focalX}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={focalX}
                        onChange={(e) => {
                          setFocalX(Number(e.target.value));
                          setAutoCropEnabled(false);
                        }}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-white/80 dark:bg-stone-800/70 border border-stone-200/80 dark:border-white/10">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                        <span className="text-stone-600 dark:text-stone-300">Vertical Headroom (Y)</span>
                        <span className="font-bold text-stone-900 dark:text-white">{focalY}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={focalY}
                        onChange={(e) => {
                          setFocalY(Number(e.target.value));
                          setAutoCropEnabled(false);
                        }}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* SIDE-BY-SIDE LIVE PREVIEW: 1) Interactive Aspect-Ratio Crop Frame + 2) Live Masonry Grid Simulation */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
                  {/* LEFT (7 Cols): Interactive CSS object-fit & aspect-ratio Crop Stage */}
                  <div className="lg:col-span-7 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
                      <span>INTERACTIVE CROP STAGE (CLICK TO RE-FOCUS)</span>
                      <span>
                        {selectedAspectRatio} · {objectFitMode} · {computedObjectPosition}
                      </span>
                    </div>

                    <div className="relative flex items-center justify-center p-4 rounded-2xl bg-stone-950/90 border border-stone-300 dark:border-white/15 min-h-[280px] overflow-hidden">
                      {ambientGlow && (
                        <div
                          className="absolute inset-0 scale-110 opacity-30 blur-2xl pointer-events-none"
                          style={{
                            backgroundImage: `url(${imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: computedObjectPosition
                          }}
                        />
                      )}

                      <div
                        onClick={handlePreviewClickToSetFocalPoint}
                        style={{ aspectRatio: activeAspectConfig.cssRatio }}
                        className="relative w-full max-h-[360px] overflow-hidden rounded-xl border-2 border-white/80 bg-stone-900 shadow-2xl cursor-crosshair select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        title="Click anywhere on the image to move the auto-crop focal point"
                      >
                        <img
                          src={imageUrl}
                          alt="Auto-Crop Aspect Ratio Preview"
                          onLoad={handleImageLoaded}
                          style={{
                            objectFit: objectFitMode,
                            objectPosition: computedObjectPosition
                          }}
                          className={`w-full h-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            isProcessing ? 'opacity-50 scale-105' : 'opacity-100 scale-100'
                          }`}
                        />

                        {/* Rule-of-Thirds Grid Overlay */}
                        {showRuleOfThirds && (
                          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                            <div className="border-r border-b border-white/30" />
                            <div className="border-r border-b border-white/30" />
                            <div className="border-b border-white/30" />
                            <div className="border-r border-b border-white/30" />
                            <div className="border-r border-b border-white/30" />
                            <div className="border-b border-white/30" />
                            <div className="border-r border-white/30" />
                            <div className="border-r border-white/30" />
                            <div />
                          </div>
                        )}

                        {/* Interactive Focal Point Reticle */}
                        {objectFitMode === 'cover' && (
                          <div
                            style={{ left: `${focalX}%`, top: `${focalY}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 border-emerald-400 bg-black/50 flex items-center justify-center pointer-events-none shadow-lg transition-all duration-300"
                          >
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          </div>
                        )}

                        {/* Bottom Metadata HUD inside Crop Stage */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 px-3 py-1.5 rounded-lg bg-black/75 text-white text-[10px] font-mono flex items-center justify-between border border-white/15 pointer-events-none">
                          <div className="flex items-center gap-1.5 truncate">
                            <Camera className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">
                              {activeCreator.name} · {activeCreator.camera}
                            </span>
                          </div>
                          <span className="text-emerald-400 font-bold shrink-0">
                            {selectedAspectRatio} · {objectFitMode.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT (5 Cols): Live Masonry Grid Context Preview */}
                  <div className="lg:col-span-5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
                      <span>LIVE MASONRY GRID PREVIEW</span>
                      <span>IN-CONTEXT APPEARANCE</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-black border border-stone-200/90 dark:border-white/15 space-y-4 shadow-md">
                      {/* Simulated Masonry Neighborhood */}
                      <div className="grid grid-cols-12 gap-3 items-start">
                        {/* Left column: The User's Live Cropped Photo Card */}
                        <div className="col-span-7 space-y-2">
                          <div
                            style={{ aspectRatio: activeAspectConfig.cssRatio }}
                            className="w-full overflow-hidden bg-stone-200 dark:bg-stone-900 ring-2 ring-emerald-500 shadow-md relative transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                          >
                            <img
                              src={imageUrl}
                              alt="Masonry Grid Preview Card"
                              style={{
                                objectFit: objectFitMode,
                                objectPosition: computedObjectPosition
                              }}
                              className="w-full h-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                            />
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono text-[8px] font-bold uppercase">
                              Your Upload ({selectedAspectRatio})
                            </span>
                          </div>

                          <div className="flex items-end justify-between gap-2 pt-0.5">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1 flex-wrap mb-1">
                                <span className="px-1.5 py-0.5 rounded bg-stone-200/80 dark:bg-white/10 text-[9px] text-stone-700 dark:text-stone-300">
                                  {category}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-stone-200/80 dark:bg-white/10 text-[9px] text-stone-700 dark:text-stone-300 truncate">
                                  {activeCreator.camera.split(' ')[0]}
                                </span>
                              </div>
                              <p className="text-xs font-sans text-stone-900 dark:text-white truncate">
                                {title.trim() || 'Untitled Capture'} - {activeCreator.name.split(' ')[0]}
                              </p>
                            </div>
                            <div className="w-6 h-6 rounded-full border border-stone-300 dark:border-white/25 flex items-center justify-center shrink-0">
                              <ArrowUpRight className="w-3 h-3 text-stone-700 dark:text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Right column: Neighboring Staggered Masonry Card for Scale Reference */}
                        <div className="col-span-5 mt-6 space-y-2 opacity-65">
                          <div className="w-full aspect-4/3 bg-stone-200 dark:bg-stone-800 overflow-hidden">
                            <img
                              src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80"
                              alt="Adjacent Masonry Card"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="inline-block px-1.5 py-0.5 rounded bg-stone-200/80 dark:bg-white/10 text-[8px] text-stone-600 dark:text-stone-400">
                              Pirith Night
                            </span>
                            <p className="text-[10px] text-stone-600 dark:text-stone-400 truncate">
                              Adjacent Gallery Item
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-200/70 dark:border-white/10 flex items-center justify-between text-[10px] font-mono text-stone-500 dark:text-stone-400">
                        <span>CSS: object-{objectFitMode}</span>
                        <span>aspect-ratio: {selectedAspectRatio}</span>
                        <span>pos: {computedObjectPosition}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Photo Metadata & Narrative */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                5. Photo Information & Classification
              </label>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Photo Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. National Flag Hoisting & College Anthem Processional"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:border-emerald-600 focus:outline-none text-sm placeholder-stone-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                    School Event Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:border-emerald-600 focus:outline-none text-sm"
                  >
                    {categories
                      .filter((c) => c.id !== 'all')
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                    Resolution Badge
                  </label>
                  <input
                    type="text"
                    value={resolutionInput}
                    onChange={(e) => setResolutionInput(e.target.value)}
                    placeholder="4K Ultra HD (3840 × 2160)"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:border-emerald-600 focus:outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                    Search Tags
                  </label>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                    Comma separated
                  </span>
                </div>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Main Assembly, Flag Hoisting, School Anthem"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:border-emerald-600 focus:outline-none text-sm"
                />

                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono mr-1">
                    Suggested:
                  </span>
                  {popularTags.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      className="px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-stone-600 dark:text-stone-300 hover:text-emerald-900 dark:hover:text-emerald-300 text-[11px] font-mono transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Caption / Ceremony Narrative & Decisive Moment Details
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of the assembly proceedings, sacred blessings, election voting, broadcasting session, or athletic milestones..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-emerald-600 focus:outline-none text-sm placeholder-stone-400"
                />
              </div>
            </div>

            {/* Submit Action Bar */}
            <div className="pt-4 border-t border-stone-100 dark:border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={onNavigateToGallery}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                id="submit-publish-photo-btn"
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-stone-900 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>
                  Publish {selectedAspectRatio} Capture (+50 cr)
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
