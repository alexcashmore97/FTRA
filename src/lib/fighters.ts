import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Fighter } from './types';

const FIGHTERS_COLLECTION = 'fighters';

function docToFighter(id: string, data: Record<string, unknown>): Fighter {
  return {
    id,
    firstName: (data.firstName as string) ?? '',
    lastName: (data.lastName as string) ?? '',
    nickname: (data.nickname as string) ?? '',
    gym: (data.gym as string) ?? '',
    state: (data.state as string) ?? '',
    division: (data.division as string) ?? '',
    weightClass: (data.weightClass as string) ?? '',
    gender: (data.gender as 'male' | 'female') ?? 'male',
    nationality: (data.nationality as string) ?? '',
    rank: (data.rank as number) ?? null,
    p4pRank: (data.p4pRank as number) ?? null,
    titleHolder: (data.titleHolder as boolean) ?? false,
    titleDate: (data.titleDate as string) ?? null,
    bio: (data.bio as string) ?? '',
    photoURL: (data.photoURL as string) ?? '',
    record: (data.record as string) ?? '',
    age: (data.age as number) ?? null,
    stance: (data.stance as string) ?? '',
    instagram: (data.instagram as string) ?? '',
    email: (data.email as string) ?? '',
    uid: (data.uid as string) ?? null,
    status: (data.status as 'pending' | 'approved') ?? 'approved',
  };
}

export async function getFighterById(id: string): Promise<Fighter | null> {
  const snap = await getDoc(doc(db, FIGHTERS_COLLECTION, id));
  if (!snap.exists()) return null;
  return docToFighter(snap.id, snap.data());
}

export async function getFightersByDivision(divisionId: string): Promise<Fighter[]> {
  const q = query(
    collection(db, FIGHTERS_COLLECTION),
    where('division', '==', divisionId),
    where('status', '==', 'approved'),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => docToFighter(d.id, d.data()))
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
}

export async function getP4PFighters(gender: 'male' | 'female'): Promise<Fighter[]> {
  const q = query(
    collection(db, FIGHTERS_COLLECTION),
    where('gender', '==', gender),
    where('status', '==', 'approved'),
    where('p4pRank', '>', 0),
    orderBy('p4pRank', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => docToFighter(d.id, d.data()));
}

export async function getAllFighters(): Promise<Fighter[]> {
  const q = query(
    collection(db, FIGHTERS_COLLECTION),
    where('status', '==', 'approved'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => docToFighter(d.id, d.data()));
}

export async function getPendingFighters(): Promise<Fighter[]> {
  const q = query(
    collection(db, FIGHTERS_COLLECTION),
    where('status', '==', 'pending'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => docToFighter(d.id, d.data()));
}
