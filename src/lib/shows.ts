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
import type { Show } from './types';

const SHOWS_COLLECTION = 'shows';

function docToShow(id: string, data: Record<string, unknown>): Show {
  return {
    id,
    title: (data.title as string) ?? '',
    imageURL: (data.imageURL as string) ?? '',
    ticketURL: (data.ticketURL as string) ?? '',
    eventDate: (data.eventDate as string) ?? null,
    active: (data.active as boolean) ?? true,
    createdAt: (data.createdAt as number) ?? 0,
  };
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getAllShows(): Promise<Show[]> {
  const q = query(collection(db, SHOWS_COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => docToShow(d.id, d.data()));
}

export async function getActiveShows(): Promise<Show[]> {
  const all = await getAllShows();
  const today = todayISO();
  return all
    .filter(s => s.active && s.imageURL)
    .filter(s => !s.eventDate || s.eventDate >= today)
    .sort((a, b) => {
      const aDate = a.eventDate ?? '9999-12-31';
      const bDate = b.eventDate ?? '9999-12-31';
      return aDate.localeCompare(bDate);
    });
}

export async function uploadShowImage(showId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const storageRef = ref(storage, `shows/${showId}/poster.${ext}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function addShow(data: Omit<Show, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, SHOWS_COLLECTION), {
    ...data,
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function updateShow(id: string, data: Partial<Omit<Show, 'id' | 'createdAt'>>): Promise<void> {
  await updateDoc(doc(db, SHOWS_COLLECTION, id), data);
}

export async function deleteShow(id: string, imageURL?: string): Promise<void> {
  await deleteDoc(doc(db, SHOWS_COLLECTION, id));
  if (imageURL) {
    try {
      const path = decodeURIComponent(new URL(imageURL).pathname.split('/o/')[1].split('?')[0]);
      await deleteObject(ref(storage, path));
    } catch {
      // image already gone or url not parseable — ignore
    }
  }
}
