import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Post, PostType } from './types';

const POSTS_COLLECTION = 'posts';

function docToPost(id: string, data: Record<string, unknown>): Post {
  return {
    id,
    title: (data.title as string) ?? '',
    excerpt: (data.excerpt as string) ?? '',
    coverImageURL: (data.coverImageURL as string) ?? '',
    type: ((data.type as PostType) === 'video' ? 'video' : 'text'),
    body: (data.body as string) ?? '',
    youtubeId: (data.youtubeId as string) ?? '',
    active: (data.active as boolean) ?? true,
    createdAt: (data.createdAt as number) ?? 0,
  };
}

export async function getAllPosts(): Promise<Post[]> {
  const q = query(collection(db, POSTS_COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => docToPost(d.id, d.data()));
}

export async function getActivePosts(): Promise<Post[]> {
  const all = await getAllPosts();
  return all.filter(p => p.active);
}

export async function uploadPostImage(postId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const storageRef = ref(storage, `posts/${postId}/cover.${ext}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function addPost(data: Omit<Post, 'id' | 'createdAt'>): Promise<string> {
  const r = await addDoc(collection(db, POSTS_COLLECTION), {
    ...data,
    createdAt: Date.now(),
  });
  return r.id;
}

export async function updatePost(id: string, data: Partial<Omit<Post, 'id' | 'createdAt'>>): Promise<void> {
  await updateDoc(doc(db, POSTS_COLLECTION, id), data);
}

export async function deletePost(id: string, imageURL?: string): Promise<void> {
  await deleteDoc(doc(db, POSTS_COLLECTION, id));
  if (imageURL) {
    try {
      const path = decodeURIComponent(new URL(imageURL).pathname.split('/o/')[1].split('?')[0]);
      await deleteObject(ref(storage, path));
    } catch {
      // image already gone or url not parseable — ignore
    }
  }
}

// Accepts a YouTube iframe snippet, watch URL, short URL, or embed URL and
// returns the bare 11-char video ID. Returns '' if nothing recognisable.
export function parseYouTubeId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // Direct 11-char id
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  // Pull every URL-ish chunk out of the input (handles raw iframes too)
  const candidates: string[] = [];
  const srcMatch = trimmed.match(/src\s*=\s*["']([^"']+)["']/i);
  if (srcMatch) candidates.push(srcMatch[1]);
  const urlMatches = trimmed.match(/https?:\/\/[^\s"'<>]+/g);
  if (urlMatches) candidates.push(...urlMatches);
  if (candidates.length === 0) candidates.push(trimmed);

  for (const c of candidates) {
    const patterns = [
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?[^"'\s]*v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
      const m = c.match(p);
      if (m) return m[1];
    }
  }
  return '';
}
