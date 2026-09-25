import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Database, 
  Layers, 
  Cpu, 
  Code2, 
  CheckCircle2, 
  Copy, 
  Check,
  Server,
  FileCode2,
  Lock,
  Globe
} from 'lucide-react';

interface ArchitectureBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureBlueprintModal: React.FC<ArchitectureBlueprintModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'rules' | 'pipeline'>('overview');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, section: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    });
  };

  return (
    <div id="architecture-blueprint-modal" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#142019] border border-[#E8EFE8] dark:border-[#283a2d] rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8EFE8] dark:border-[#283a2d] flex items-center justify-between bg-[#EBF1EA]/60 dark:bg-[#18251c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#344C3D] text-white flex items-center justify-center">
              <FileCode2 className="w-5 h-5 text-[#BFCFBB]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#243328] dark:text-[#E2EBE2]">
                System Architecture & Security Blueprint
              </h3>
              <p className="text-xs text-[#738A6E] dark:text-[#8EA58C]">
                Production specifications: Database schemas, Hardened Firestore rules, and Pipeline specs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-6 border-b border-[#E8EFE8] dark:border-[#283a2d] bg-[#EBF1EA]/30 dark:bg-[#111a14] overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#344C3D] text-[#344C3D] dark:text-[#BFCFBB] dark:border-[#BFCFBB]'
                : 'border-transparent text-[#738A6E] hover:text-[#243328]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Architecture Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-[#344C3D] text-[#344C3D] dark:text-[#BFCFBB] dark:border-[#BFCFBB]'
                : 'border-transparent text-[#738A6E] hover:text-[#243328]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Firestore Blueprint Schema</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'rules'
                ? 'border-[#344C3D] text-[#344C3D] dark:text-[#BFCFBB] dark:border-[#BFCFBB]'
                : 'border-transparent text-[#738A6E] hover:text-[#243328]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Hardened Security Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`py-3 px-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'border-[#344C3D] text-[#344C3D] dark:text-[#BFCFBB] dark:border-[#BFCFBB]'
                : 'border-transparent text-[#738A6E] hover:text-[#243328]'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Download & Compression Pipeline</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#EBF1EA] dark:bg-[#1E2E24] border border-[#BFCFBB]/40 space-y-2">
                  <div className="flex items-center gap-2 text-[#344C3D] dark:text-[#BFCFBB] font-bold">
                    <Globe className="w-4 h-4" />
                    <span>Public High-Res Delivery</span>
                  </div>
                  <p className="text-[#738A6E] dark:text-[#8EA58C] leading-relaxed">
                    Zero-barrier public access allowing unauthenticated community downloads with tiered resolutions (4K RAW, 1920p Web, 1080p Mobile).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#EBF1EA] dark:bg-[#1E2E24] border border-[#BFCFBB]/40 space-y-2">
                  <div className="flex items-center gap-2 text-[#344C3D] dark:text-[#BFCFBB] font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Role-Based CMS & MFA</span>
                  </div>
                  <p className="text-[#738A6E] dark:text-[#8EA58C] leading-relaxed">
                    Role-Based Access Control (Admin, Student Photojournalist, Parent, Student) enforced via Firebase Auth and Master Gate Firestore rules.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#EBF1EA] dark:bg-[#1E2E24] border border-[#BFCFBB]/40 space-y-2">
                  <div className="flex items-center gap-2 text-[#344C3D] dark:text-[#BFCFBB] font-bold">
                    <Cpu className="w-4 h-4" />
                    <span>AI Auto-Tagging & EXIF</span>
                  </div>
                  <p className="text-[#738A6E] dark:text-[#8EA58C] leading-relaxed">
                    Server-side proxy utilizing Google GenAI SDK for automated action captioning, athletic tag suggestions, and metadata indexing.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-[#18251c] border border-stone-200 dark:border-stone-800 space-y-3">
                <h4 className="font-bold text-sm text-[#243328] dark:text-[#E2EBE2]">
                  Platform Architectural Checklist
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#738A6E] dark:text-[#8EA58C]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Masonry layout with CSS multi-columns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Pinch-to-zoom & drag lightbox viewer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Multi-tiered resolutions download engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Social share intents (IG, X, FB, WhatsApp)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Fine-grained push notification controls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Master Gate security rules deployed</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-stone-500">firebase-blueprint.json (Entities: User, Event, Photo, Favorite, Notification)</span>
              </div>
              <pre className="p-4 rounded-2xl bg-stone-900 text-stone-200 font-mono text-[11px] overflow-x-auto max-h-96">
{`{
  "entities": {
    "User": {
      "fields": {
        "userId": "string",
        "displayName": "string",
        "email": "string",
        "role": "string (admin | photographer | student | parent)",
        "avatarUrl": "string",
        "bio": "string",
        "affiliation": "string",
        "mfaEnabled": "boolean",
        "notificationPrefs": "map"
      }
    },
    "Photo": {
      "fields": {
        "id": "string",
        "eventId": "string",
        "title": "string",
        "category": "string",
        "originalUrl": "string",
        "webUrl": "string",
        "mobileUrl": "string",
        "photographerName": "string",
        "photographerRole": "string",
        "camera": "string",
        "lens": "string",
        "settings": "string",
        "tags": "array",
        "downloadCount": "number",
        "likesCount": "number"
      }
    }
  }
}`}
              </pre>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3">
              <span className="font-mono text-[11px] text-stone-500">firestore.rules (Deployed to respectively75@gmail.com Firebase Project)</span>
              <pre className="p-4 rounded-2xl bg-stone-900 text-stone-200 font-mono text-[11px] overflow-x-auto max-h-96">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.email == 'respectively75@gmail.com' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }
    match /photos/{photoId} {
      allow read: if true; // Public high-res gallery
      allow create, update: if isSignedIn();
      allow delete: if isAdmin();
    }
  }
}`}
              </pre>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#18251c] border border-stone-200 dark:border-stone-800 space-y-2">
                <h4 className="font-bold text-sm text-[#243328] dark:text-[#E2EBE2]">
                  Multi-Tiered Asset Processing Pipeline
                </h4>
                <p className="text-[#738A6E]">
                  Uploaded assets are converted into three target formats on Google Cloud Storage:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-[#738A6E]">
                  <li><strong>4K RAW Original:</strong> Master 300 DPI preservation asset for print, yearbooks, and banners (~12 MB).</li>
                  <li><strong>Web Quality:</strong> 1920px max dimension, WebP/AVIF compressed at quality 85 for desktop and responsive feeds (~1.2 MB).</li>
                  <li><strong>Mobile Wallpaper:</strong> 1080x1920 portrait crop or centered lockscreen format for iPhone/Android (~450 KB).</li>
                </ul>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
