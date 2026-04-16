import {
  collection,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Fighter, DivisionRanking } from './types';

const FIGHTERS_COLLECTION = 'fighters';

function parseRanking(raw: Record<string, unknown>): DivisionRanking {
  return {
    rank: (raw.rank as number) ?? null,
    titleHolder: typeof raw.titleHolder === 'string'
      ? raw.titleHolder
      : (raw.titleHolder ? 'Champion' : ''),
    titleDate: (raw.titleDate as string) ?? null,
  };
}

function docToFighter(id: string, data: Record<string, unknown>): Fighter {
  // Support both new (divisions/rankings) and legacy (division/rank/titleHolder) format
  const divisions: string[] = Array.isArray(data.divisions)
    ? data.divisions as string[]
    : data.division ? [data.division as string] : [];

  const rankings: Record<string, DivisionRanking> = {};
  if (data.rankings && typeof data.rankings === 'object' && !Array.isArray(data.rankings)) {
    const raw = data.rankings as Record<string, Record<string, unknown>>;
    for (const [divId, r] of Object.entries(raw)) {
      rankings[divId] = parseRanking(r);
    }
  } else if (divisions.length > 0) {
    // Legacy single-division format — migrate on read
    rankings[divisions[0]] = {
      rank: (data.rank as number) ?? null,
      titleHolder: typeof data.titleHolder === 'string'
        ? data.titleHolder
        : (data.titleHolder ? 'Champion' : ''),
      titleDate: (data.titleDate as string) ?? null,
    };
  }

  return {
    id,
    firstName: (data.firstName as string) ?? '',
    lastName: (data.lastName as string) ?? '',
    nickname: (data.nickname as string) ?? '',
    gym: (data.gym as string) ?? '',
    state: (data.state as string) ?? '',
    divisions,
    rankings,
    gender: (data.gender as 'male' | 'female') ?? 'male',
    nationality: (data.nationality as string) ?? '',
    p4pRank: (data.p4pRank as number) ?? null,
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
    where('divisions', 'array-contains', divisionId),
    where('status', '==', 'approved'),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => docToFighter(d.id, d.data()))
    .sort((a, b) => (a.rankings[divisionId]?.rank ?? 999) - (b.rankings[divisionId]?.rank ?? 999));
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

export async function getFighterCount(): Promise<number> {
  const q = query(
    collection(db, FIGHTERS_COLLECTION),
    where('status', '==', 'approved'),
  );
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

export async function getPendingFighters(): Promise<Fighter[]> {
  const q = query(
    collection(db, FIGHTERS_COLLECTION),
    where('status', '==', 'pending'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => docToFighter(d.id, d.data()));
}
