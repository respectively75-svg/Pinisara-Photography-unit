import React, { useState, useRef } from 'react';
import {
  Upload,
  CheckCircle2,
  CloudUpload,
  Crop,
  Image as ImageIcon,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Photo, CategoryInfo, UserProfile } from '../types';
import { uploadPhotoFileToFirebaseStorage, savePhotoToFirestore } from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';

interface FirebaseImageUploaderProps {
  categories: CategoryInfo[];
  currentUser: UserProfile;
  onPhotoUploaded: (photo: Photo) => void;
  compact?: boolean;
}

const ASPECT_PRESETS: Photo['aspectRatio'][] = [
  '16:10',
  '16:9',
  '3:2',
  '4:3',
  '1:1',
  '4:5',
  '9:16',
  '21:9'
];

export const FirebaseImageUploader: React.FC<FirebaseImageUploaderProps> = ({
  categories,
  currentUser,
  onPhotoUploaded,
  compact = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('assembly');
  const [aspectRatio, setAspectRatio] = useState<Photo['aspectRatio']>('16:10');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedBucketPath, setUploadedBucketPath] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setSelectedFile(file);
    const objUrl = URL.createObjectURL(file);
    setPreviewUrl(objUrl);
    if (!title.trim()) {
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      setTitle(cleanTitle);
    }
    setUploadedBucketPath(null);
  };

  const handleUploadToFirebaseBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(8);

    const { url, storagePath } = await uploadPhotoFileToFirebaseStorage(
      selectedFile,
      (pct) => setUploadProgress(pct)
    );

    const newPhoto: Photo = {
      id: `photo-fb-${Date.now()}`,
      eventId: `evt-${category}-2026`,
      title: title.trim() || 'Pinisara Campus Capture',
      description: `Uploaded securely to Firebase Storage bucket (${firebaseConfig.storageBucket}) by ${
        currentUser.displayName || 'Pinisara Photographer'
      }.`,
      category,
      originalUrl: url,
      webUrl: url,
      mobileUrl: url,
      thumbnailUrl: url,
      aspectRatio,
      objectFit: 'cover',
      objectPosition: '50% 50%',
      photographerId: currentUser.userId || 'pinisara_creator',
      photographerName: currentUser.displayName || 'Pinisara Photographer',
      photographerRole: currentUser.isCreator
        ? 'Verified Creator'
        : 'Community Contributor',
      camera: currentUser.camera || 'Canon EOS Kiss F',
      lens: currentUser.lens || '18-55mm IS',
      settings: '1/1250s · f/4.0 · ISO 400',
      tags: [category, 'Firebase Storage', '4K Archive', 'Pinisara'],
      downloadCount: 0,
      likesCount: 1,
      dateTaken: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      moderationStatus: 'approved'
    };

    // Persist metadata to Firestore so real-time subscribers receive the new photo
    try {
      await savePhotoToFirestore(newPhoto);
    } catch {
      // Handled gracefully if guest
    }

    setUploadedBucketPath(storagePath);
    setIsUploading(false);
    onPhotoUploaded(newPhoto);

    setTimeout(() => {
      setSelectedFile(null);
      setPreviewUrl(null);
      setTitle('');
      setUploadProgress(0);
    }, 1400);
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl liquid-glass border border-stone-200/80 dark:border-white/15 space-y-4 animate-spring-pop">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl accent-glow-btn flex items-center justify-center">
            <CloudUpload className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-source-serif font-semibold text-sm sm:text-base text-stone-900 dark:text-white">
              Firebase Storage Bucket Direct Uploader
            </h3>
            <p className="text-[11px] font-mono text-stone-500 dark:text-white/60">
              Bucket: {firebaseConfig.storageBucket} · Auto-Updates Live Feed
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full glass-pill text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Real-Time Feed Sync</span>
        </span>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleSelectFile(file);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
            : 'border-stone-300 dark:border-white/20 hover:border-emerald-500/70 bg-white/40 dark:bg-white/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleSelectFile(file);
          }}
        />

        {previewUrl ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-24 h-24 rounded-xl object-cover border border-white/20 shadow-md shrink-0"
            />
            <div className="space-y-1 min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{selectedFile?.name}</p>
              <p className="text-[11px] font-mono text-stone-500 dark:text-white/60">
                {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : ''} · Ready
                for Firebase Storage
              </p>
              <span className="inline-block text-[11px] text-emerald-600 dark:text-emerald-400 font-medium underline">
                Click to choose a different photo
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 py-2">
            <ImageIcon className="w-7 h-7 mx-auto text-stone-400 dark:text-white/50" />
            <p className="text-xs font-semibold">
              Drag & drop a photograph here, or{' '}
              <span className="underline text-emerald-600 dark:text-emerald-400">browse files</span>
            </p>
            <p className="text-[11px] text-stone-500 dark:text-white/55 font-mono">
              Uploads directly to Firebase Storage & publishes to the live gallery feed
            </p>
          </div>
        )}
      </div>

      {/* Metadata & Aspect Ratio Controls when a file is selected */}
      {selectedFile && (
        <form onSubmit={handleUploadToFirebaseBucket} className="space-y-3 animate-apple-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-mono uppercase text-stone-500 dark:text-white/65 mb-1">
                Photograph Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Morning Assembly Flag Hoisting"
                className="w-full px-3 py-2 text-xs rounded-xl glass-pill text-stone-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-stone-500 dark:text-white/65 mb-1">
                Event Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-pill text-stone-900 dark:text-white bg-transparent focus:outline-none"
              >
                {categories
                  .filter((c) => c.id !== 'all')
                  .map((c) => (
                    <option key={c.id} value={c.id} className="text-black">
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          {!compact && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-stone-500 dark:text-white/65 flex items-center gap-1 mr-1">
                <Crop className="w-3 h-3" /> Ratio:
              </span>
              {ASPECT_PRESETS.map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${
                    aspectRatio === ratio
                      ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                      : 'glass-pill'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span>Uploading to Firebase Storage bucket...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {uploadedBucketPath && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-mono text-[11px] truncate">
                Stored in bucket: {uploadedBucketPath} · Gallery Feed Updated!
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-2.5 px-4 rounded-2xl accent-glow-btn text-xs font-semibold flex items-center justify-center gap-2 shadow-md"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading to Firebase Storage ({uploadProgress}%)...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload to Firebase Storage & Publish to Feed (+50 Credits)</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
