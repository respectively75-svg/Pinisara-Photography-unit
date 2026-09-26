import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, FileUp, Loader2 } from 'lucide-react';
import { uploadPhotoFileToFirebaseStorage, savePhotoToFirestore } from '../firebase';
import { Photo, UserProfile } from '../types';

export interface FirebaseImageUploaderProps {
  currentUser?: UserProfile;
  defaultCategory?: string;
  onPhotoUploaded?: (photo: Photo, downloadUrl: string) => void;
}

export const FirebaseImageUploader: React.FC<FirebaseImageUploaderProps> = ({
  currentUser,
  defaultCategory = 'assembly',
  onPhotoUploaded
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>(defaultCategory);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<Photo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadedPhoto(null);
    setErrorMessage(null);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    if (!title.trim()) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
  };

  const handleUploadToFirebase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setProgress(10);
    setErrorMessage(null);

    try {
      const downloadUrl = await uploadPhotoFileToFirebaseStorage(
        selectedFile,
        'photos',
        (pct) => setProgress(pct)
      );

      const savedPhoto = await savePhotoToFirestore({
        title: title.trim() || selectedFile.name,
        category,
        originalUrl: downloadUrl,
        webUrl: downloadUrl,
        thumbnailUrl: downloadUrl,
        photographerId: currentUser?.userId || 'hasaranga',
        photographerName: currentUser?.displayName || 'Hasaranga Jayawardhana',
        photographerRole: currentUser?.affiliation || 'Pinisara Photojournalist',
        camera: currentUser?.camera || 'Canon EOS Kiss F',
        lens: currentUser?.lens || '18-55mm IS Kit Lens',
      });

      setUploadedPhoto(savedPhoto);
      onPhotoUploaded?.(savedPhoto, downloadUrl);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-5 rounded-3xl apple-glass border border-stone-200/80 dark:border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-white">
            Firebase Cloud Archive Uploader
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Direct upload to Firebase Storage & Firestore metadata sync
          </p>
        </div>
        {uploadedPhoto && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Synced
          </span>
        )}
      </div>

      <form onSubmit={handleUploadToFirebase} className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition-colors"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-44 mx-auto rounded-xl object-cover"
            />
          ) : (
            <div className="py-4 space-y-1.5">
              <FileUp className="w-6 h-6 mx-auto text-stone-500 dark:text-stone-400" />
              <p className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Select image file to upload to Firebase
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Capture title..."
            className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white"
          />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (e.g. assembly)"
            className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 text-stone-900 dark:text-white"
          />
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-500 font-mono">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          className="w-full py-2.5 px-4 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading ({progress}%)...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload to Firebase Archive</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FirebaseImageUploader;
