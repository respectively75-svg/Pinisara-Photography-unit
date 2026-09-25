import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Image as ImageIcon,
  User,
  AlertCircle,
  FileUp,
  Sparkles,
  Coins,
  Layers,
  Eye,
  Sliders,
  Check,
  Users,
  Radio,
  Landmark,
  Vote,
  Scale
} from 'lucide-react';
import { Photo, CategoryInfo, UserProfile } from '../types';
import { CREATOR_TEAM, CURRENT_USER } from '../data/mockData';

interface UploadPageProps {
  categories: CategoryInfo[];
  currentUser?: UserProfile;
  onAddPhoto: (photo: Photo) => void;
  onNavigateToGallery: () => void;
  onOpenAccountModal?: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({
  categories,
  currentUser = CURRENT_USER,
  onAddPhoto,
  onNavigateToGallery,
  onOpenAccountModal = () => {}
}) => {
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>(
    currentUser?.isCreator ? (currentUser.userId.replace('usr_', '') || 'hasaranga') : 'hasaranga'
  );
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('assembly');
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=2400&q=95');
  const [tagsInput, setTagsInput] = useState<string>('Main Assembly, Flag Hoisting, School Anthem');
  const [resolutionInput, setResolutionInput] = useState<string>('4K Ultra HD (3840 × 2160)');
  const [customCamera, setCustomCamera] = useState<string>(currentUser?.camera || 'Canon EOS R50');
  const [customLens, setCustomLens] = useState<string>(currentUser?.lens || '18-45mm f/4.5-6.3 IS STM');
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>(['Dulen Induwara']);
  const [collaborationNotes, setCollaborationNotes] = useState<string>('Joint Coverage: Stage & Ceremony + Audience Coverage');
  const [ambientGlow, setAmbientGlow] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Determine active creator profile info
  const knownCreator = CREATOR_TEAM.find(c => c.id === selectedCreatorId);
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

  const handleToggleCollaborator = (name: string) => {
    setSelectedCollaborators(prev => 
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
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
        if (!title.trim()) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      }
      setTimeout(() => setIsProcessing(false), 500);
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = (tag: string) => {
    const currentTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
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
      description: description.trim() || `Captured by ${activeCreator.name} for the Pinisara Photographers archive.`,
      category,
      originalUrl: imageUrl.trim(),
      webUrl: imageUrl.trim(),
      thumbnailUrl: imageUrl.trim(),
      resolution: resolutionInput || '4K Ultra HD (3840 × 2160)',
      aspectRatio: '16:9',
      fileSizeOriginal: '18.4 MB RAW',
      fileSizeWeb: '1.8 MB',
      fileSizeMobile: '520 KB',
      photographerId: activeCreator.id,
      photographerName: activeCreator.name,
      photographerRole: activeCreator.role,
      photographerHandle: activeCreator.handle,
      camera: activeCreator.camera,
      lens: activeCreator.lens,
      settings: '',
      collaborators: selectedCollaborators.length > 0 ? selectedCollaborators : undefined,
      collaborationNotes: selectedCollaborators.length > 0 ? collaborationNotes.trim() : undefined,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
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
    }, 1800);
  };

  return (
    <div id="club-upload-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full animate-apple-fade-in">
      {/* Editorial Header */}
      <div className="max-w-2xl mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-coolvetica text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            Pinisara Studio
          </span>
          <span className="font-tempting italic text-stone-500 dark:text-stone-400 text-sm">
            Creator & Collaborative Publishing
          </span>
        </div>

        <h1 className="font-source-serif font-normal text-3xl sm:text-4xl text-stone-900 dark:text-white tracking-tight leading-tight">
          Publish Captures & Joint Coverage
        </h1>

        <p className="mt-2 text-stone-600 dark:text-stone-400 text-xs sm:text-sm leading-relaxed">
          Upload and attribute high-resolution captures for main assembly, sacred pirith blessings, student council elections, morning radio broadcasts, school parliament, and sports derbies. Tag collaborative co-shooters and earn +50 credits.
        </p>
      </div>

      {/* Account Verification & Credits Award Banner */}
      <div className="mb-8 p-4.5 rounded-3xl ultra-glass flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-coolvetica text-sm font-bold shrink-0 ${
            currentUser?.isCreator 
              ? 'bg-black dark:bg-stone-800 text-white' 
              : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
          }`}>
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
              <span>{currentUser?.isCreator ? `${currentUser.camera || 'DSLR'} · ${currentUser.affiliation}` : 'Public Account'}</span>
              <span>·</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{currentUser?.credits ?? 0} Credits</span>
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

      {/* Upload Form Card with Apple Ultra Glass */}
      <div className="rounded-3xl ultra-glass p-6 sm:p-10 shadow-2xl">
        {success ? (
          <div className="py-16 text-center space-y-4 animate-apple-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-source-serif font-medium text-2xl text-stone-900 dark:text-white">
              Photograph Published Successfully!
            </h3>
            <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm max-w-md mx-auto">
              "{title}" has been published to the Pinisara Photographers archive with attribution to {activeCreator.name} ({activeCreator.camera})
              {selectedCollaborators.length > 0 && ` and collaborative co-shooters: ${selectedCollaborators.join(', ')}`}.
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
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-600 text-white' : 'border-stone-300 dark:border-stone-600'
                      }`}>
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

              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                Working as a collective on the main assembly, pirith ceremony, or election? Select your fellow photographers who collaborated on this shoot:
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {CREATOR_TEAM.map((member) => {
                  const isLead = member.id === selectedCreatorId;
                  const isChecked = selectedCollaborators.includes(member.name);
                  if (isLead) return null; // Don't allow co-selecting the lead

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
                      <span className="text-[10px] font-mono opacity-80">({member.camera.split(' ')[0]})</span>
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

            {/* Step 3: High-Resolution Image Source with Ambient Blur */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                  3. High-Resolution Image Source & Ambient Glow
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
                  Supports JPEG, PNG, RAW, WebP, HEIC up to uncompressed 4K (3840×2160)
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
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:border-emerald-600 focus:outline-none text-xs font-mono"
                />
              </div>

              {/* Image Preview with Apple Ambient Blur Effect */}
              {imageUrl && (
                <div className="relative mt-4 pt-2">
                  <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-2 font-medium">
                    High-Fidelity Preview & Color Backdrop
                  </span>

                  <div className="relative max-w-md mx-auto">
                    {/* Ambient Light Blur Backdrop */}
                    {ambientGlow && (
                      <div 
                        className="absolute inset-0 scale-105 rounded-3xl opacity-40 dark:opacity-30 blur-2xl pointer-events-none transition-all duration-1000"
                        style={{
                          backgroundImage: `url(${imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                    )}

                    {/* Foreground Container */}
                    <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-stone-200/90 dark:border-white/15 bg-stone-100 dark:bg-stone-900 shadow-xl">
                      <img
                        src={imageUrl}
                        alt="Upload Preview"
                        className={`w-full h-full object-cover transition-all duration-700 ${
                          isProcessing ? 'blur-md scale-105' : 'blur-0 scale-100'
                        }`}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      
                      {/* Frosted Metadata Pill */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-black/75 dark:bg-stone-950/80 backdrop-blur-md text-white text-[10px] font-mono flex items-center justify-between border border-white/10">
                        <div className="flex items-center gap-1.5 truncate">
                          <Camera className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">Attributed: {activeCreator.name} · {activeCreator.camera}</span>
                        </div>
                        <span className="text-emerald-400 font-bold shrink-0">4K RAW</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Photo Metadata & Narrative */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                4. Photo Information & Classification
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
                    {categories.filter(c => c.id !== 'all').map((cat) => (
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
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-800 text-stone-900 dark:text-white focus:border-emerald-600 focus:outline-none text-sm font-mono text-xs"
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

                {/* Popular Tags Quick Click */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono mr-1">Suggested:</span>
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
                <span>Publish 4K Capture (+50 cr)</span>
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
