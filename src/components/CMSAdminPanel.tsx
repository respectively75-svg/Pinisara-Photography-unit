import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Trash2, 
  Sparkles, 
  Camera, 
  Check, 
  X, 
  Plus, 
  Image as ImageIcon, 
  Tag, 
  Calendar, 
  User, 
  Layers,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Photo, CategoryInfo, UserProfile } from '../types';

interface CMSAdminPanelProps {
  categories: CategoryInfo[];
  existingPhotos: Photo[];
  onAddPhoto: (newPhoto: Photo) => void;
  onDeletePhoto: (photoId: string) => void;
  onClose: () => void;
  currentUser: UserProfile | null;
}

export const CMSAdminPanel: React.FC<CMSAdminPanelProps> = ({
  categories,
  existingPhotos,
  onAddPhoto,
  onDeletePhoto,
  onClose,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');
  
  // Upload Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[1]?.id || 'basketball');
  const [photographerName, setPhotographerName] = useState(currentUser?.displayName || 'Elena Rostova');
  const [photographerRole, setPhotographerRole] = useState(currentUser?.affiliation || 'Lead Varsity Photojournalist');
  const [camera, setCamera] = useState('Sony Alpha 1');
  const [lens, setLens] = useState('FE 70-200mm f/2.8 GM II');
  const [settings, setSettings] = useState('1/2000s · f/2.8 · ISO 3200');
  const [tagsInput, setTagsInput] = useState('Varsity, Basketball, Semifinals, Action');
  const [aspectRatio, setAspectRatio] = useState<'3:2' | '16:9' | '4:5' | '1:1'>('3:2');
  
  // Image selection
  const [imagePreview, setImagePreview] = useState<string>('https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=2560&q=95');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // AI-Assisted Auto-Tagging & Smart Caption
  const handleGenerateAITags = async () => {
    setIsAILoading(true);
    try {
      const response = await fetch('/api/ai/auto-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTitle: title || `${category} Game Action`,
          category: category,
          rawTags: tagsInput,
          description: description
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.tags && Array.isArray(data.tags)) {
          setTagsInput(data.tags.join(', '));
        }
        if (data.suggestedCaption && !description) {
          setDescription(data.suggestedCaption);
        }
        if (data.suggestedExif) {
          setSettings(data.suggestedExif);
        }
      }
    } catch (err) {
      console.error('AI generation error:', err);
    } finally {
      setIsAILoading(false);
    }
  };

  // Submit new photo
  const handlePublishPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imagePreview) return;

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(t => t.length > 0);

    const newPhoto: Photo = {
      id: `photo-upload-${Date.now()}`,
      eventId: `evt-${category}-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Action snapshot from Pinecrest Athletics.',
      category,
      originalUrl: imagePreview,
      webUrl: imagePreview,
      mobileUrl: imagePreview,
      thumbnailUrl: imagePreview,
      aspectRatio,
      photographerName: photographerName.trim() || 'Student Journalist',
      photographerRole: photographerRole.trim() || 'Pinecrest Media Guild',
      photographerAvatar: currentUser?.avatarUrl,
      camera,
      lens,
      settings,
      tags: parsedTags.length > 0 ? parsedTags : ['Athletics', 'HighRes'],
      downloadCount: 0,
      likesCount: 0,
      dateTaken: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      isFavorited: false,
    };

    onAddPhoto(newPhoto);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setTitle('');
      setDescription('');
    }, 2000);
  };

  return (
    <div id="cms-admin-modal" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#142019] border border-[#E8EFE8] dark:border-[#283a2d] rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E8EFE8] dark:border-[#283a2d] flex items-center justify-between bg-[#EBF1EA]/60 dark:bg-[#18251c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#344C3D] text-white flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#BFCFBB]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#243328] dark:text-[#E2EBE2]">
                Media Content Management System (CMS)
              </h2>
              <p className="text-xs text-[#738A6E] dark:text-[#8EA58C]">
                Publish high-res galleries, auto-tag athletes, manage downloads & credits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex items-center bg-white dark:bg-[#111a14] p-1 rounded-xl border border-[#E8EFE8] dark:border-[#283a2d]">
              <button
                id="cms-tab-upload"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-[#344C3D] text-white'
                    : 'text-[#738A6E] hover:text-[#243328] dark:hover:text-white'
                }`}
              >
                Batch Upload
              </button>
              <button
                id="cms-tab-manage"
                onClick={() => setActiveTab('manage')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'manage'
                    ? 'bg-[#344C3D] text-white'
                    : 'text-[#738A6E] hover:text-[#243328] dark:hover:text-white'
                }`}
              >
                Live Catalog ({existingPhotos.length})
              </button>
            </div>

            <button
              id="cms-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'upload' ? (
            <form onSubmit={handlePublishPhoto} className="space-y-6">
              
              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Photo published into live gallery in real-time! No reload required.</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column: Drag & Drop Image Zone */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#243328] dark:text-[#E2EBE2] block">
                    High-Resolution Asset
                  </label>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[260px] ${
                      isDragOver
                        ? 'border-[#344C3D] bg-[#EBF1EA]'
                        : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelection}
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="relative w-full h-56 rounded-xl overflow-hidden group">
                        <img
                          src={imagePreview}
                          alt="Upload preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                          Click or drag to replace image
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-full bg-[#EBF1EA] dark:bg-[#1E2E24] text-[#344C3D] dark:text-[#BFCFBB] flex items-center justify-center mx-auto">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-semibold text-[#243328] dark:text-[#E2EBE2]">
                          Drag & drop 4K RAW or high-res JPEG here
                        </p>
                        <p className="text-[11px] text-[#738A6E]">
                          Supports up to 50MB · WebP, AVIF, JPEG, PNG
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Aspect Ratio selector */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#738A6E] font-medium">Aspect Ratio:</span>
                    <div className="flex gap-1">
                      {(['3:2', '16:9', '4:5', '1:1'] as const).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setAspectRatio(ratio)}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                            aspectRatio === ratio
                              ? 'bg-[#344C3D] text-white'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Column: Metadata & AI Auto-Tagging Form */}
                <div className="space-y-4">
                  
                  {/* Title & Category */}
                  <div>
                    <label className="text-xs font-bold text-[#243328] dark:text-[#E2EBE2] block mb-1">
                      Photo Title / Action Headline *
                    </label>
                    <input
                      id="cms-input-title"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Q4 Buzzer Beater Fadeaway from the Wing"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#18251c] text-[#243328] dark:text-[#E2EBE2] border border-stone-200 dark:border-stone-800 focus:border-[#344C3D] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#243328] dark:text-[#E2EBE2] block mb-1">
                        Category
                      </label>
                      <select
                        id="cms-select-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#18251c] text-[#243328] dark:text-[#E2EBE2] border border-stone-200 dark:border-stone-800 focus:border-[#344C3D] focus:outline-none"
                      >
                        {categories.filter(c => c.id !== 'all').map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#243328] dark:text-[#E2EBE2] block mb-1">
                        Photographer Credit
                      </label>
                      <input
                        id="cms-input-photographer"
                        type="text"
                        value={photographerName}
                        onChange={(e) => setPhotographerName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#18251c] text-[#243328] dark:text-[#E2EBE2] border border-stone-200 dark:border-stone-800 focus:border-[#344C3D] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Description with AI Assistant Button */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#243328] dark:text-[#E2EBE2]">
                        Journalism Caption & Story
                      </label>
                      <button
                        type="button"
                        id="cms-ai-generate-tags-btn"
                        onClick={handleGenerateAITags}
                        disabled={isAILoading}
                        className="flex items-center gap-1 text-[11px] font-bold text-[#344C3D] dark:text-[#BFCFBB] hover:underline disabled:opacity-50"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>{isAILoading ? 'Analyzing...' : 'AI Auto-Tag & Caption'}</span>
                      </button>
                    </div>
                    <textarea
                      id="cms-input-description"
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Context of play, athlete names, game milestone, or quarter..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#18251c] text-[#243328] dark:text-[#E2EBE2] border border-stone-200 dark:border-stone-800 focus:border-[#344C3D] focus:outline-none"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-xs font-bold text-[#243328] dark:text-[#E2EBE2] block mb-1">
                      Athletic Tags (comma separated)
                    </label>
                    <input
                      id="cms-input-tags"
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="e.g., Julian Hayes #12, Varsity Basketball, Clutch, Playoffs"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-[#18251c] text-[#243328] dark:text-[#E2EBE2] border border-stone-200 dark:border-stone-800 focus:border-[#344C3D] focus:outline-none"
                    />
                  </div>

                  {/* EXIF Settings */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Camera Body</span>
                      <input
                        type="text"
                        value={camera}
                        onChange={(e) => setCamera(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded bg-stone-50 dark:bg-[#18251c] border border-stone-200 dark:border-stone-800"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Exposure (ISO, Shutter, f/)</span>
                      <input
                        type="text"
                        value={settings}
                        onChange={(e) => setSettings(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded bg-stone-50 dark:bg-[#18251c] border border-stone-200 dark:border-stone-800 font-mono"
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* Submit / Publish Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8EFE8] dark:border-[#283a2d]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:underline"
                >
                  Cancel
                </button>
                <button
                  id="cms-publish-submit-btn"
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#344C3D] hover:bg-[#223329] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <Upload className="w-4 h-4 text-[#BFCFBB]" />
                  <span>Publish to Public Gallery</span>
                </button>
              </div>

            </form>
          ) : (
            /* Manage Existing Photos Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#738A6E] pb-2 border-b border-[#E8EFE8] dark:border-[#283a2d]">
                <span>Manage active gallery items, photographer attributions, and downloads</span>
                <span>{existingPhotos.length} total photos</span>
              </div>

              <div className="divide-y divide-[#E8EFE8] dark:divide-[#283a2d]">
                {existingPhotos.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-14 h-14 rounded-xl object-cover ring-1 ring-stone-200 dark:ring-stone-800"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-[#243328] dark:text-[#E2EBE2] line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="text-[11px] text-[#738A6E] flex items-center gap-2 mt-0.5">
                          <span>{item.category}</span>
                          <span>· By {item.photographerName}</span>
                          <span className="font-mono text-[10px]">({item.downloadCount} dl)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDeletePhoto(item.id)}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
