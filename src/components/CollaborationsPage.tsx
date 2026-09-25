import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Camera, 
  Layers, 
  Split, 
  Download, 
  Share2, 
  Maximize2, 
  Check, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Eye, 
  Coins, 
  Smartphone,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Columns
} from 'lucide-react';
import { CollaborativeSet, Photo, CreatorProfile } from '../types';

interface CollaborationsPageProps {
  collaborativeSets: CollaborativeSet[];
  photos: Photo[];
  creators: CreatorProfile[];
  onSelectPhoto: (photo: Photo) => void;
  onQuickDownload: (photo: Photo, resolution: 'original' | 'web' | 'mobile') => void;
  onNavigateToUpload: () => void;
}

export type CollabViewMode = 'split-grid' | 'side-by-side' | 'timeline';

export const CollaborationsPage: React.FC<CollaborationsPageProps> = ({
  collaborativeSets,
  photos,
  creators,
  onSelectPhoto,
  onQuickDownload,
  onNavigateToUpload
}) => {
  const [selectedPairing, setSelectedPairing] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<CollabViewMode>('split-grid');
  const [inspectedSet, setInspectedSet] = useState<CollaborativeSet | null>(null);
  const [copiedSetId, setCopiedSetId] = useState<string | null>(null);
  const [activeAngleIndexMap, setActiveAngleIndexMap] = useState<Record<string, number>>({});

  // Duo / Pairing options
  const pairingOptions = [
    { id: 'all', label: 'All Collaborations', count: collaborativeSets.length },
    { id: 'hasaranga-dulen', label: 'Hasaranga & Dulen', count: 1, members: ['Hasaranga Jayawardhana', 'Dulen Induwara'] },
    { id: 'udula-hasaranga', label: 'Udula & Hasaranga', count: 2, members: ['Udula Matheesha', 'Hasaranga Jayawardhana'] },
    { id: 'sayul-dulen', label: 'Sayul & Dulen', count: 1, members: ['Sayul Angammana', 'Dulen Induwara'] },
    { id: 'sayul-hasaranga', label: 'Sayul & Hasaranga', count: 1, members: ['Sayul Angammana', 'Hasaranga Jayawardhana'] },
  ];

  // Category filters
  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'assembly', label: 'Main Assembly' },
    { id: 'pirith', label: 'Pirith Ceremony' },
    { id: 'election', label: 'Student Election' },
    { id: 'radio', label: 'Morning Radio' },
    { id: 'parliament', label: 'School Parliament' },
  ];

  // Filtered collaborative sets
  const filteredSets = useMemo(() => {
    return collaborativeSets.filter(set => {
      // Category filter
      if (selectedCategory !== 'all' && set.category !== selectedCategory) {
        return false;
      }

      // Pairing filter
      if (selectedPairing !== 'all') {
        const option = pairingOptions.find(p => p.id === selectedPairing);
        if (option && option.members) {
          const hasAll = option.members.every(m => set.team.includes(m));
          if (!hasAll) return false;
        }
      }

      return true;
    });
  }, [collaborativeSets, selectedCategory, selectedPairing]);

  // Aggregate stats
  const totalCombinedDownloads = useMemo(() => {
    return collaborativeSets.reduce((sum, s) => sum + s.stats.combinedDownloads, 0);
  }, [collaborativeSets]);

  const totalCollectiveLikes = useMemo(() => {
    return collaborativeSets.reduce((sum, s) => sum + s.stats.collectiveLikes, 0);
  }, [collaborativeSets]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getPhotoById = (photoId: string): Photo | undefined => {
    return photos.find(p => p.id === photoId);
  };

  const handleCopySetLink = (setId: string, title: string) => {
    const url = `${window.location.origin}/#collaborations-${setId}`;
    navigator.clipboard.writeText(`${title} — Pinisara Photographers Collaborative Project: ${url}`);
    setCopiedSetId(setId);
    setTimeout(() => setCopiedSetId(null), 2500);
  };

  return (
    <div id="collaborations-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full animate-apple-fade-in space-y-10">
      
      {/* Editorial Dashboard Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-stone-200/80 dark:border-white/10">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-coolvetica text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Joint Photography Projects</span>
            </span>
            <span className="font-tempting italic text-stone-500 dark:text-stone-400 text-sm">
              Synchronized Multi-Angle Coverage
            </span>
          </div>

          <h1 className="font-source-serif font-normal text-3xl sm:text-5xl text-stone-900 dark:text-white tracking-tight leading-tight">
            Collaborations Dashboard
          </h1>

          <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Pinisara photojournalists frequently cover major school ceremonies and athletic milestones as synchronized multi-camera field crews. Explore collaborative sets documenting the same decisive moment from contrasting optical angles.
          </p>
        </div>

        {/* Action Button: Propose Joint Shoot */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNavigateToUpload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Upload Joint Set (+50 cr)</span>
          </button>
        </div>
      </div>

      {/* High-Impact Synergy Stats Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl ultra-glass space-y-1.5 border border-stone-200/80 dark:border-white/10 shadow-xs">
          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider block font-semibold">
            Joint Projects
          </span>
          <div className="font-source-serif text-2xl sm:text-3xl font-medium text-stone-900 dark:text-white">
            {collaborativeSets.length} Sets
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
            100% 4K Multi-Angle
          </span>
        </div>

        <div className="p-5 rounded-3xl ultra-glass space-y-1.5 border border-stone-200/80 dark:border-white/10 shadow-xs">
          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider block font-semibold">
            Active Photographers
          </span>
          <div className="font-source-serif text-2xl sm:text-3xl font-medium text-stone-900 dark:text-white">
            {creators.length} Members
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
            Hasaranga · Dulen · Sayul · Udula
          </span>
        </div>

        <div className="p-5 rounded-3xl ultra-glass space-y-1.5 border border-stone-200/80 dark:border-white/10 shadow-xs">
          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider block font-semibold">
            Collective Downloads
          </span>
          <div className="font-source-serif text-2xl sm:text-3xl font-medium text-stone-900 dark:text-white">
            {totalCombinedDownloads.toLocaleString()}+
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
            Free 1-Click Multi-Res
          </span>
        </div>

        <div className="p-5 rounded-3xl ultra-glass space-y-1.5 border border-stone-200/80 dark:border-white/10 shadow-xs">
          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider block font-semibold">
            Collective Favorites
          </span>
          <div className="font-source-serif text-2xl sm:text-3xl font-medium text-stone-900 dark:text-white">
            {totalCollectiveLikes.toLocaleString()}+
          </div>
          <span className="text-[11px] text-rose-500 font-mono">
            ♥ Student Community Backing
          </span>
        </div>
      </div>

      {/* Specialized Dashboard Controls Bar */}
      <div className="p-4 sm:p-5 rounded-3xl ultra-glass space-y-4 shadow-md border border-stone-200/80 dark:border-white/10">
        
        {/* Pairing Filters */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
              Filter by Collaborating Duo / Crew
            </span>
            {selectedPairing !== 'all' && (
              <button
                onClick={() => setSelectedPairing('all')}
                className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 underline text-[11px]"
              >
                Reset Pairing
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            {pairingOptions.map(option => {
              const isSelected = selectedPairing === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedPairing(option.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-300 shrink-0 active:scale-95 ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-stone-950 border border-black dark:border-white shadow-md font-semibold'
                      : 'glass-pill text-stone-700 dark:text-stone-300 hover:bg-white/90 dark:hover:bg-stone-800/90 font-medium'
                  }`}
                >
                  <Users className="w-3 h-3 text-emerald-500" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Bar: Categories + Grid View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-200/60 dark:border-white/10">
          
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            {categories.map(cat => {
              const isCatActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-300 shrink-0 ${
                    isCatActive
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'glass-pill text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Specialized Grid View Modes */}
          <div className="flex items-center gap-1.5 glass-pill p-1 rounded-full shrink-0">
            <button
              onClick={() => setViewMode('split-grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all duration-300 ${
                viewMode === 'split-grid'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
              title="Specialized Multi-Angle Split Grid"
            >
              <Split className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Multi-Angle Split</span>
            </button>

            <button
              onClick={() => setViewMode('side-by-side')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all duration-300 ${
                viewMode === 'side-by-side'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
              title="Synchronous Angle Comparison"
            >
              <Columns className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Comparative</span>
            </button>
          </div>

        </div>

      </div>

      {/* Collaborative Sets List Render */}
      <div className="space-y-12">
        {filteredSets.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto ultra-glass rounded-3xl p-8 shadow-sm">
            <Users className="w-10 h-10 text-emerald-600 mx-auto mb-3 opacity-60" />
            <h3 className="font-source-serif font-medium text-lg text-stone-900 dark:text-white">
              No Collaborative Sets Found
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Try adjusting the pairing or category filter to view other joint projects.
            </p>
          </div>
        ) : (
          filteredSets.map((collabSet, setIdx) => {
            const activeAngleIdx = activeAngleIndexMap[collabSet.id] ?? 0;
            const primaryAngle = collabSet.angles[0];
            const secondaryAngle = collabSet.angles[1] || collabSet.angles[0];

            const photoA = getPhotoById(primaryAngle.photoId);
            const photoB = getPhotoById(secondaryAngle.photoId);

            return (
              <article
                key={collabSet.id}
                id={`collaborative-set-${collabSet.id}`}
                className="rounded-3xl ultra-glass overflow-hidden border border-stone-200/90 dark:border-white/10 shadow-xl transition-all duration-500 hover:border-emerald-500/80 dark:hover:border-emerald-400/80"
              >
                {/* Joint Project Header Bar */}
                <div className="p-6 sm:p-8 border-b border-stone-200/70 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-stone-950/40 backdrop-blur-md">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60">
                        {collabSet.category}
                      </span>
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{collabSet.date}</span>
                      </span>
                      <span className="text-stone-400 dark:text-stone-600">·</span>
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-mono flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{collabSet.venue}</span>
                      </span>
                    </div>

                    <h2 className="font-source-serif font-medium text-xl sm:text-2xl text-stone-900 dark:text-white tracking-tight">
                      {collabSet.title}
                    </h2>

                    <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
                      {collabSet.description}
                    </p>
                  </div>

                  {/* Right Header Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopySetLink(collabSet.id, collabSet.title)}
                      className="p-2.5 rounded-full glass-pill hover:bg-white/90 dark:hover:bg-stone-800 transition-colors"
                      title="Share collaborative set link"
                    >
                      {copiedSetId === collabSet.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Share2 className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                      )}
                    </button>

                    <button
                      onClick={() => setInspectedSet(collabSet)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-stone-950 text-xs font-semibold shadow-xs hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Synergy</span>
                    </button>
                  </div>
                </div>

                {/* Team Roster & Field Equipment Bar */}
                <div className="px-6 py-3.5 bg-stone-100/60 dark:bg-stone-900/60 border-b border-stone-200/50 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 font-semibold uppercase">
                      Field Crew:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {collabSet.team.map(member => (
                        <div key={member} className="flex items-center gap-1.5 bg-white/70 dark:bg-stone-800/80 px-2.5 py-1 rounded-full border border-stone-200/60 dark:border-white/10 text-stone-800 dark:text-stone-200 text-xs font-medium">
                          <div className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-coolvetica font-bold flex items-center justify-center">
                            {getInitials(member)}
                          </div>
                          <span>{member}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-stone-500 dark:text-stone-400">
                    <span className="hidden sm:inline">Gear Deployed:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      {collabSet.equipmentUsed.join(' · ')}
                    </span>
                  </div>
                </div>

                {/* SPECIALIZED GRID VIEW: MULTI-ANGLE DUAL SPLIT */}
                {viewMode === 'split-grid' ? (
                  <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Angle A Column */}
                    {photoA && (
                      <div className="flex flex-col rounded-3xl overflow-hidden bg-stone-100/50 dark:bg-stone-900/50 border border-stone-200/80 dark:border-white/10 shadow-sm group/angle">
                        {/* Angle Banner */}
                        <div className="p-3.5 bg-white/60 dark:bg-stone-800/60 border-b border-stone-200/70 dark:border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="font-semibold text-xs text-stone-900 dark:text-white">
                              {primaryAngle.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold">
                            {primaryAngle.role}
                          </span>
                        </div>

                        {/* Photo Canvas */}
                        <div 
                          className="relative aspect-16/10 overflow-hidden cursor-pointer bg-stone-200 dark:bg-stone-950"
                          onClick={() => onSelectPhoto(photoA)}
                        >
                          <img
                            src={photoA.webUrl}
                            alt={photoA.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) group-hover/angle:scale-104"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white font-mono text-[9px] font-semibold tracking-wider">
                              4K RAW
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/angle:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Click to inspect 4K capture</span>
                            </span>
                          </div>
                        </div>

                        {/* Angle Telemetry Details */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h4 className="font-source-serif font-medium text-base text-stone-900 dark:text-white">
                              {photoA.title}
                            </h4>
                            <p className="text-stone-600 dark:text-stone-300 text-xs mt-1 leading-relaxed">
                              <span className="font-semibold text-emerald-700 dark:text-emerald-400">Focal Point:</span> {primaryAngle.focalPoint}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-coolvetica text-[10px] font-bold flex items-center justify-center">
                                {getInitials(primaryAngle.photographerName)}
                              </div>
                              <span className="font-medium text-stone-900 dark:text-stone-100">
                                {primaryAngle.photographerName}
                              </span>
                            </div>

                            <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400">
                              {primaryAngle.camera}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2">
                            <button
                              onClick={() => onSelectPhoto(photoA)}
                              className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 hover:text-emerald-600 font-medium transition-colors"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Full Lightbox</span>
                            </button>

                            <button
                              onClick={() => onQuickDownload(photoA, 'original')}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Angle A</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Angle B Column */}
                    {photoB && (
                      <div className="flex flex-col rounded-3xl overflow-hidden bg-stone-100/50 dark:bg-stone-900/50 border border-stone-200/80 dark:border-white/10 shadow-sm group/angle">
                        {/* Angle Banner */}
                        <div className="p-3.5 bg-white/60 dark:bg-stone-800/60 border-b border-stone-200/70 dark:border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                            <span className="font-semibold text-xs text-stone-900 dark:text-white">
                              {secondaryAngle.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100/80 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 font-semibold">
                            {secondaryAngle.role}
                          </span>
                        </div>

                        {/* Photo Canvas */}
                        <div 
                          className="relative aspect-16/10 overflow-hidden cursor-pointer bg-stone-200 dark:bg-stone-950"
                          onClick={() => onSelectPhoto(photoB)}
                        >
                          <img
                            src={photoB.webUrl}
                            alt={photoB.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) group-hover/angle:scale-104"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white font-mono text-[9px] font-semibold tracking-wider">
                              4K RAW
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/angle:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Click to inspect 4K capture</span>
                            </span>
                          </div>
                        </div>

                        {/* Angle Telemetry Details */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <h4 className="font-source-serif font-medium text-base text-stone-900 dark:text-white">
                              {photoB.title}
                            </h4>
                            <p className="text-stone-600 dark:text-stone-300 text-xs mt-1 leading-relaxed">
                              <span className="font-semibold text-sky-700 dark:text-sky-400">Focal Point:</span> {secondaryAngle.focalPoint}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-stone-200/60 dark:border-white/10 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-coolvetica text-[10px] font-bold flex items-center justify-center">
                                {getInitials(secondaryAngle.photographerName)}
                              </div>
                              <span className="font-medium text-stone-900 dark:text-stone-100">
                                {secondaryAngle.photographerName}
                              </span>
                            </div>

                            <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400">
                              {secondaryAngle.camera}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2">
                            <button
                              onClick={() => onSelectPhoto(photoB)}
                              className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 hover:text-emerald-600 font-medium transition-colors"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>Full Lightbox</span>
                            </button>

                            <button
                              onClick={() => onQuickDownload(photoB, 'original')}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Angle B</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  /* COMPARATIVE SYNCHRONIZED VIEW */
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {collabSet.angles.map((ang, idx) => (
                          <button
                            key={ang.label}
                            onClick={() => setActiveAngleIndexMap(prev => ({ ...prev, [collabSet.id]: idx }))}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              activeAngleIdx === idx
                                ? 'bg-black text-white dark:bg-white dark:text-stone-950 font-semibold shadow-xs'
                                : 'glass-pill text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                            }`}
                          >
                            {ang.label}
                          </button>
                        ))}
                      </div>

                      <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                        Synchronized Field Study
                      </span>
                    </div>

                    {/* Active Selected Angle Showcase */}
                    {(() => {
                      const curAngle = collabSet.angles[activeAngleIdx] || primaryAngle;
                      const curPhoto = getPhotoById(curAngle.photoId);
                      if (!curPhoto) return null;

                      return (
                        <div className="relative rounded-3xl overflow-hidden aspect-16/9 bg-stone-900 group/zoom">
                          <img
                            src={curPhoto.webUrl}
                            alt={curPhoto.title}
                            className="w-full h-full object-cover transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) group-hover/zoom:scale-103"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                            <div className="max-w-xl space-y-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[10px] uppercase font-semibold">
                                {curAngle.label} · {curAngle.role}
                              </span>
                              <h3 className="font-source-serif font-medium text-xl sm:text-2xl text-white">
                                {curPhoto.title}
                              </h3>
                              <p className="text-xs text-stone-300 leading-relaxed">
                                {curAngle.focalPoint}
                              </p>
                              <div className="flex items-center gap-3 pt-2 text-xs font-mono text-emerald-400">
                                <span>{curAngle.photographerName}</span>
                                <span>·</span>
                                <span>{curAngle.camera}</span>
                                <span>·</span>
                                <span>{curAngle.lens}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Footer Synergy Bar */}
                <div className="px-6 py-4 bg-white/40 dark:bg-stone-950/40 border-t border-stone-200/60 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-stone-500 dark:text-stone-400 font-mono text-[11px]">
                    <span>Collective Downloads: {collabSet.stats.combinedDownloads}</span>
                    <span>·</span>
                    <span>Collective Favorites: {collabSet.stats.collectiveLikes}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectedSet(collabSet)}
                      className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>View Full Collaborative Specs</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </article>
            );
          })
        )}
      </div>

      {/* INSPECTION MODAL FOR COLLABORATIVE SET */}
      {inspectedSet && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 select-none animate-apple-fade-in"
          onClick={() => setInspectedSet(null)}
        >
          <div 
            className="w-full max-w-3xl rounded-3xl ultra-glass border border-white/20 dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl animate-apple-scale-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-stone-200/80 dark:border-white/10">
              <div>
                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                  Collaborative Project Briefing
                </span>
                <h3 className="font-source-serif font-medium text-2xl text-stone-900 dark:text-white mt-1">
                  {inspectedSet.title}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                  {inspectedSet.eventTitle} · {inspectedSet.date} · {inspectedSet.venue}
                </p>
              </div>
              <button 
                onClick={() => setInspectedSet(null)}
                className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-white/10 text-stone-600 dark:text-stone-300 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Field Briefing Narrative */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1.5">
              <span className="text-[11px] font-mono font-semibold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Field Strategy & Archival Mission</span>
              </span>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                {inspectedSet.fieldBriefing}
              </p>
            </div>

            {/* Angles Matrix Breakdown */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-stone-900 dark:text-white uppercase tracking-wider font-mono">
                Synchronized Optical Angles ({inspectedSet.angles.length})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inspectedSet.angles.map(ang => {
                  const p = getPhotoById(ang.photoId);
                  return (
                    <div key={ang.label} className="p-4 rounded-2xl bg-white/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-900 dark:text-white">{ang.label}</span>
                        <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">{ang.role}</span>
                      </div>

                      {p && (
                        <div 
                          className="relative aspect-16/10 rounded-xl overflow-hidden cursor-pointer"
                          onClick={() => {
                            setInspectedSet(null);
                            onSelectPhoto(p);
                          }}
                        >
                          <img src={p.webUrl} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="text-[11px] space-y-1 font-mono text-stone-600 dark:text-stone-300 pt-1">
                        <div>Photographer: <span className="font-semibold text-stone-900 dark:text-white">{ang.photographerName}</span></div>
                        <div>Camera: {ang.camera}</div>
                        {ang.lens && <div>Lens: {ang.lens}</div>}
                        <div className="text-stone-500 dark:text-stone-400 font-sans text-xs pt-1">{ang.focalPoint}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-4 border-t border-stone-200/80 dark:border-white/10 flex justify-end">
              <button
                onClick={() => setInspectedSet(null)}
                className="px-5 py-2 rounded-full bg-black dark:bg-white text-white dark:text-stone-950 text-xs font-semibold shadow-xs"
              >
                Close Specs
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
