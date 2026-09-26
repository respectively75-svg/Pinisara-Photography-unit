/**
 * School Gallery & Athletics Hub - Core Types & Interfaces
 */

export type ResolutionOption = 'original' | 'web' | 'mobile';

export interface PhotoResolution {
  name: string;
  label: string;
  dimensions: string;
  fileSize: string;
  url: string;
  badge: string;
}

export interface Photo {
  id: string;
  eventId: string;
  title: string;
  description: string;
  category: string;
  originalUrl: string;
  webUrl: string;
  mobileUrl?: string;
  thumbnailUrl: string;
  aspectRatio: '3:2' | '16:9' | '16:10' | '4:3' | '4:5' | '1:1' | '2:3' | '3:4' | '9:16' | '21:9' | 'original';
  objectFit?: 'cover' | 'contain' | 'fill';
  objectPosition?: string;
  resolution?: string;
  fileSizeOriginal?: string;
  fileSizeWeb?: string;
  fileSizeMobile?: string;
  photographerId?: string;
  photographerName: string;
  photographerRole: string;
  photographerAvatar?: string;
  photographerHandle?: string;
  camera: string;
  lens: string;
  settings: string; // e.g. "1/2000s · f/2.8 · ISO 2500"
  collaborators?: string[]; // e.g. ["Dulen Induwara", "Sayul Angammana"]
  collaborationNotes?: string; // e.g. "Joint Coverage: Hasaranga (Stage) + Dulen (Floor)"
  tags: string[];
  downloadCount: number;
  likesCount: number;
  dateTaken: string;
  createdAt: string;
  isFavorited?: boolean;
  moderationStatus?: 'approved' | 'pending' | 'rejected';
}

export interface CreatorProfile {
  id: string;
  name: string;
  camera: string;
  lens: string;
  role: string;
  avatar: string;
  handle: string;
  bio: string;
  photoCount: number;
}

export interface CollaborativePhotoAngle {
  label: string; // e.g., "Angle 1: Ceremonial Stage"
  perspective: 'stage' | 'audience' | 'macro' | 'telephoto' | 'candid' | 'sideline';
  photoId: string;
  photographerName: string;
  camera: string;
  lens?: string;
  role: string;
  focalPoint: string; // e.g., "Speaker & Mace at 108MP"
}

export interface CollaborativeSet {
  id: string;
  title: string;
  eventTitle: string;
  category: string;
  date: string;
  venue: string;
  description: string;
  team: string[]; // e.g. ["Hasaranga Jayawardhana", "Dulen Induwara"]
  leadPhotographer: string;
  fieldBriefing: string;
  equipmentUsed: string[];
  photoIds: string[];
  angles: CollaborativePhotoAngle[];
  stats: {
    totalAngles: number;
    combinedDownloads: number;
    collectiveLikes: number;
  };
}

export interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  venue: string;
  opponent?: string;
  score?: string; // e.g., "78 - 72 (OT)"
  status?: 'Live Now' | 'Final' | 'Upcoming';
  photoCount: number;
  coverPhotoUrl: string;
  description: string;
  publishedBy: string;
  collaborators?: string[];
  coverageType?: string; // e.g. "Collective Joint Coverage"
  publishedAt: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  icon: string;
  photoCount: number;
}

export type UserRole = 'student' | 'parent' | 'photographer' | 'editor' | 'admin';

export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  bio: string;
  affiliation: string; // e.g., "Pinisara Photographers Collective", "Varsity Athlete"
  website?: string;
  favorites: string[]; // array of photo IDs
  isCreator: boolean;
  camera?: string;
  lens?: string;
  uploadedCount?: number;
  credits: number;
  mfaEnabled?: boolean;
  mfaMethod?: 'totp' | 'sms' | 'gmail_code' | 'none';
  gmailVerified?: boolean;
  moderationStatus?: 'approved' | 'pending' | 'suspended';
  createdAt?: string;
  notificationPrefs?: {
    gameScores: boolean;
    newGalleries: boolean;
    schoolAnnouncements: boolean;
    creditsAttribution: boolean;
  };
}

export interface LiveNotification {
  id: string;
  type: 'game_score' | 'new_gallery' | 'announcement' | 'photographer_feature';
  title: string;
  message: string;
  eventId?: string;
  photoId?: string;
  timestamp: string;
  read: boolean;
  badge?: string;
}

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'ja';

export interface TranslationDictionary {
  [key: string]: {
    [lang in SupportedLanguage]: string;
  };
}
