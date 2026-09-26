import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  increment
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  PhotoReactionSummary,
  PhotoComment,
  ReactionType,
  RecentReactionEvent,
  UserProfile
} from './types';

// Initialize Firebase App, Firestore (with named database ID), and Auth
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Validate connection to Firestore on boot as required by Firebase guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Deterministic baseline reaction counts per photo so newly opened photos start with realistic counts
export function getInitialReactionSummary(photoId: string, baseLikes = 120): PhotoReactionSummary {
  const hash = photoId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const heart = Math.max(24, Math.floor(baseLikes * 0.52) + (hash % 19));
  const clap = Math.max(15, Math.floor(baseLikes * 0.24) + (hash % 13));
  const fire = Math.max(18, Math.floor(baseLikes * 0.31) + (hash % 17));
  const star = Math.max(7, Math.floor(baseLikes * 0.12) + (hash % 9));
  return {
    photoId,
    heart,
    clap,
    fire,
    star,
    totalCount: heart + clap + fire + star,
    updatedAt: new Date().toISOString(),
  };
}

// Deterministic default comments per photo so the Lightbox comments section is lively out of the box
export function getDefaultCommentsForPhoto(photoId: string, photoTitle: string): PhotoComment[] {
  return [
    {
      id: `seed-cmt-${photoId}-1`,
      photoId,
      authorId: 'usr_hasaranga',
      authorName: 'Hasaranga Jayawardhana',
      authorRole: 'Lead Photojournalist · Canon Kiss F',
      authorCamera: 'Canon Kiss F',
      text: `Captured this frame during "${photoTitle}". The lighting and crowd energy at Pinnawala Central College were unforgettable!`,
      reactionTag: 'fire',
      heartCount: 14,
      clapCount: 9,
      fireCount: 18,
      createdAt: '2026-09-24T10:15:00Z',
    },
    {
      id: `seed-cmt-${photoId}-2`,
      photoId,
      authorId: 'usr_sayul',
      authorName: 'Sayul Angammana',
      authorRole: 'Sideline & Radio Media · iPhone 13',
      authorCamera: 'iPhone 13',
      text: 'Crystal clear composition and color grading. Huge applause to the crew on this angle!',
      reactionTag: 'clap',
      heartCount: 8,
      clapCount: 15,
      fireCount: 6,
      createdAt: '2026-09-25T14:30:00Z',
    },
    {
      id: `seed-cmt-${photoId}-3`,
      photoId,
      authorId: 'usr_udula',
      authorName: 'Udula Matheesha',
      authorRole: 'Ultra-Res Specialist · S20 Ultra',
      authorCamera: 'Samsung S20 Ultra',
      text: 'Pure fire! Downloading the 4K RAW for the school archive wall.',
      reactionTag: 'heart',
      heartCount: 19,
      clapCount: 7,
      fireCount: 11,
      createdAt: '2026-09-25T18:45:00Z',
    },
  ];
}

// Subscribe to a single photo's aggregated reactions in Firestore (and auto-seed if not present)
export function subscribeToPhotoReactions(
  photoId: string,
  baseLikes: number,
  onUpdate: (summary: PhotoReactionSummary) => void
) {
  const safeId = photoId.replace(/[^a-zA-Z0-9_\-]/g, '-');
  const docPath = `photoReactions/${safeId}`;
  const docRef = doc(db, 'photoReactions', safeId);

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as PhotoReactionSummary;
        onUpdate(data);
      } else {
        const initial = getInitialReactionSummary(safeId, baseLikes);
        onUpdate(initial);
        try {
          await setDoc(docRef, initial);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, docPath);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, docPath);
    }
  );
}

// Subscribe to all photo reaction summaries in Firestore for gallery-wide live counters
export function subscribeToAllPhotoReactions(
  onUpdate: (map: Record<string, PhotoReactionSummary>) => void
) {
  const colPath = 'photoReactions';
  const colRef = collection(db, colPath);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const result: Record<string, PhotoReactionSummary> = {};
      snapshot.forEach((docSnap) => {
        result[docSnap.id] = docSnap.data() as PhotoReactionSummary;
      });
      onUpdate(result);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, colPath);
    }
  );
}

// Trigger a Tinder-style reaction (heart, clap, fire, star) on a photo in Firestore
export async function addPhotoReactionInFirestore(
  photoId: string,
  reactionType: ReactionType,
  user: { userId: string; displayName: string },
  baseLikes = 120
): Promise<PhotoReactionSummary> {
  const safePhotoId = photoId.replace(/[^a-zA-Z0-9_\-]/g, '-');
  const summaryPath = `photoReactions/${safePhotoId}`;
  const summaryRef = doc(db, 'photoReactions', safePhotoId);

  try {
    const snap = await getDoc(summaryRef);
    const nowIso = new Date().toISOString();
    let nextSummary: PhotoReactionSummary;

    if (!snap.exists()) {
      const initial = getInitialReactionSummary(safePhotoId, baseLikes);
      nextSummary = {
        ...initial,
        [reactionType]: initial[reactionType] + 1,
        totalCount: initial.totalCount + 1,
        updatedAt: nowIso,
      };
      await setDoc(summaryRef, nextSummary);
    } else {
      const current = snap.data() as PhotoReactionSummary;
      nextSummary = {
        photoId: safePhotoId,
        heart: current.heart + (reactionType === 'heart' ? 1 : 0),
        clap: current.clap + (reactionType === 'clap' ? 1 : 0),
        fire: current.fire + (reactionType === 'fire' ? 1 : 0),
        star: current.star + (reactionType === 'star' ? 1 : 0),
        totalCount: (current.totalCount || 0) + 1,
        updatedAt: nowIso,
      };
      await updateDoc(summaryRef, {
        [reactionType]: increment(1),
        totalCount: increment(1),
        updatedAt: nowIso,
      });
    }

    // Record individual reaction event in subcollection /photos/{photoId}/reactions/{reactionId}
    const reactionId = `rx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const reactionPath = `photos/${safePhotoId}/reactions/${reactionId}`;
    const reactionRef = doc(db, 'photos', safePhotoId, 'reactions', reactionId);
    const eventPayload: RecentReactionEvent = {
      id: reactionId,
      photoId: safePhotoId,
      userId: (user.userId || 'guest_viewer').slice(0, 120),
      userName: (user.displayName || 'School Gallery Viewer').slice(0, 95),
      type: reactionType,
      createdAt: nowIso,
    };
    await setDoc(reactionRef, eventPayload);

    return nextSummary;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, summaryPath);
    throw error;
  }
}

// Subscribe to recent individual reaction events on a photo
export function subscribeToRecentPhotoReactionEvents(
  photoId: string,
  onUpdate: (events: RecentReactionEvent[]) => void
) {
  const safePhotoId = photoId.replace(/[^a-zA-Z0-9_\-]/g, '-');
  const colPath = `photos/${safePhotoId}/reactions`;
  const q = query(
    collection(db, 'photos', safePhotoId, 'reactions'),
    orderBy('createdAt', 'desc'),
    limit(8)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: RecentReactionEvent[] = [];
      snapshot.forEach((d) => list.push(d.data() as RecentReactionEvent));
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, colPath);
    }
  );
}

// Subscribe to comments for a photo in LightboxModal (and seed default comments if empty)
export function subscribeToPhotoComments(
  photoId: string,
  photoTitle: string,
  onUpdate: (comments: PhotoComment[]) => void
) {
  const safePhotoId = photoId.replace(/[^a-zA-Z0-9_\-]/g, '-');
  const colPath = `photos/${safePhotoId}/comments`;
  const colRef = collection(db, 'photos', safePhotoId, 'comments');
  const q = query(colRef, orderBy('createdAt', 'desc'), limit(50));

  return onSnapshot(
    q,
    async (snapshot) => {
      if (snapshot.empty) {
        const defaults = getDefaultCommentsForPhoto(safePhotoId, photoTitle);
        onUpdate(defaults);
        try {
          for (const cmt of defaults) {
            const cmtRef = doc(db, 'photos', safePhotoId, 'comments', cmt.id);
            await setDoc(cmtRef, cmt);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, colPath);
        }
      } else {
        const list: PhotoComment[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as PhotoComment);
        });
        onUpdate(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, colPath);
    }
  );
}

// Add a new comment to a photo in Firestore
export async function addPhotoCommentInFirestore(
  photoId: string,
  author: UserProfile,
  text: string,
  reactionTag: ReactionType | 'none' = 'none'
): Promise<PhotoComment> {
  const safePhotoId = photoId.replace(/[^a-zA-Z0-9_\-]/g, '-');
  const commentId = `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const path = `photos/${safePhotoId}/comments/${commentId}`;
  const commentRef = doc(db, 'photos', safePhotoId, 'comments', commentId);

  const newComment: PhotoComment = {
    id: commentId,
    photoId: safePhotoId,
    authorId: (author.userId || 'usr_viewer').slice(0, 120),
    authorName: (author.displayName || 'Community Member').slice(0, 95),
    authorRole: (
      author.isCreator
        ? `Creator · ${author.camera || 'Canon DSLR'}`
        : 'Verified School Viewer'
    ).slice(0, 75),
    authorCamera: (author.camera || 'Mobile / Web').slice(0, 75),
    text: text.trim().slice(0, 580),
    reactionTag,
    heartCount: reactionTag === 'heart' ? 1 : 0,
    clapCount: reactionTag === 'clap' ? 1 : 0,
    fireCount: reactionTag === 'fire' ? 1 : 0,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(commentRef, newComment);
    return newComment;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

// React (heart, clap, fire) to a specific comment in the LightboxModal comments section
export async function reactToCommentInFirestore(
  photoId: string,
  comment: PhotoComment,
  reaction: 'heart' | 'clap' | 'fire'
): Promise<void> {
  const safePhotoId = photoId.replace(/[^a-zA-Z0-9_\-]/g, '-');
  const safeCommentId = comment.id.replace(/[^a-zA-Z0-9_\-]/g, '-');
  const path = `photos/${safePhotoId}/comments/${safeCommentId}`;
  const commentRef = doc(db, 'photos', safePhotoId, 'comments', safeCommentId);

  const fieldMap = {
    heart: 'heartCount',
    clap: 'clapCount',
    fire: 'fireCount',
  } as const;
  const targetField = fieldMap[reaction];

  try {
    await updateDoc(commentRef, {
      [targetField]: increment(1),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Save or update user profile in Firestore when registering/signing in via Google Popup or Gmail code
export async function saveUserProfileToFirestore(user: UserProfile): Promise<void> {
  const safeUserId = (user.userId || `usr_${Date.now()}`).replace(/[^a-zA-Z0-9_\-]/g, '_');
  const path = `users/${safeUserId}`;
  const userRef = doc(db, 'users', safeUserId);

  const payload = {
    userId: safeUserId,
    displayName: (user.displayName || 'School Member').slice(0, 95),
    email: (user.email || '').slice(0, 140),
    role: user.role || (user.isCreator ? 'photographer' : 'student'),
    bio: (user.bio || 'Pinisara Photography Community').slice(0, 290),
    affiliation: (user.affiliation || 'Pinnawala Central College').slice(0, 95),
    camera: (user.camera || 'Canon EOS Kiss F').slice(0, 75),
    lens: (user.lens || '18-55mm IS Kit Lens').slice(0, 75),
    isCreator: Boolean(user.isCreator),
    credits: Number(user.credits || 100),
    uploadedCount: Number(user.uploadedCount || 0),
    mfaEnabled: true,
    mfaMethod: user.mfaMethod || 'totp',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(userRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export { signInWithPopup, onAuthStateChanged };
export type { FirebaseUser };
