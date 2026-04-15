import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';

const env = Object.fromEntries(
  readFileSync('.env', 'utf-8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});

const db = getFirestore(app);
const DIV_ID = 'male-welterweight-66';

// Scraped source of truth for male welterweight 66kg
const ORIGINAL = [
  { rank: 1,  name: "Max McVicker" },
  { rank: 2,  name: "Albert Tu'ua" },
  { rank: 3,  name: "Ramesh Habib" },
  { rank: 4,  name: "Cas Haberfield" },
  { rank: 5,  name: "Petch Sitmonchai" },
  { rank: 6,  name: "Carter Lawrence" },
  { rank: 7,  name: "Josh King" },
  { rank: 8,  name: "Kai Weate-Jones", title: "WBC Australian Champion" },
  { rank: 9,  name: "Jason Scott" },
  { rank: 10, name: "Alexi Petroulias" },
  { rank: 11, name: "Brandon Baresic" },
  { rank: 12, name: "Billy Coulter" },
  { rank: 13, name: "Deren Chen" },
  { rank: 15, name: "Joseph Stockwell", title: "WBC WA State Champion" },
  { rank: 16, name: "Jimme Sitmonchai" },
  { rank: 17, name: "Corey Bartlett" },
  { rank: 18, name: "Nilson Laki" },
  { rank: 19, name: "Eli Evitt" },
  { rank: 20, name: "Caleb Curley" },
  { rank: 21, name: "Dassakorn Saton" },
  { rank: 22, name: "Tariq Luckens" },
  { rank: 23, name: "Jake Heavey" },
  { rank: 24, name: "Elias Selloum" },
  { rank: 25, name: "Andrew Mitchell" },
  { rank: 26, name: "Jaiven Callander" },
];

function normalize(s) {
  return s.toLowerCase().replace(/['']/g, "'").replace(/\s+/g, ' ').trim();
}

// Fetch all welterweight fighters (both legacy and new format)
console.log('Loading welterweight fighters...');
const qLegacy = query(collection(db, 'fighters'), where('division', '==', DIV_ID));
const qNew = query(collection(db, 'fighters'), where('divisions', 'array-contains', DIV_ID));
const [legacySnap, newSnap] = await Promise.all([getDocs(qLegacy), getDocs(qNew)]);

// Merge by doc ID
const docs = new Map();
for (const d of legacySnap.docs) docs.set(d.id, d);
for (const d of newSnap.docs) docs.set(d.id, d);

console.log(`Found ${docs.size} fighters in this division.`);

// Build a lookup by full name
const byName = new Map();
for (const [id, d] of docs) {
  const data = d.data();
  const fullName = normalize(`${data.firstName || ''} ${data.lastName || ''}`);
  byName.set(fullName, { id, data });
}

// Apply original ranks
let batch = writeBatch(db);
let updated = 0;
let notFound = [];

for (const entry of ORIGINAL) {
  const key = normalize(entry.name);
  const match = byName.get(key);
  if (!match) {
    notFound.push(entry.name);
    continue;
  }

  // Merge the new ranking into existing rankings map (preserve other divisions)
  const existingRankings = (match.data.rankings && typeof match.data.rankings === 'object')
    ? match.data.rankings
    : {};

  const updatedRankings = {
    ...existingRankings,
    [DIV_ID]: {
      rank: entry.rank,
      titleHolder: entry.title || '',
      titleDate: existingRankings[DIV_ID]?.titleDate ?? null,
    },
  };

  batch.update(doc(db, 'fighters', match.id), {
    rankings: updatedRankings,
    // Also update legacy fields for backward compat
    rank: entry.rank,
    titleHolder: entry.title || '',
  });
  updated++;
  byName.delete(key); // mark as handled
}

// Any remaining welterweight fighters that weren't in the original list — clear their rank
const stragglers = [];
for (const [, match] of byName) {
  const data = match.data;
  // Only clear if they're actually in welterweight
  const inDiv = (Array.isArray(data.divisions) && data.divisions.includes(DIV_ID))
    || data.division === DIV_ID;
  if (!inDiv) continue;

  const existingRankings = (data.rankings && typeof data.rankings === 'object')
    ? data.rankings
    : {};
  const updatedRankings = {
    ...existingRankings,
    [DIV_ID]: {
      rank: null,
      titleHolder: '',
      titleDate: null,
    },
  };
  batch.update(doc(db, 'fighters', match.id), {
    rankings: updatedRankings,
    rank: null,
    titleHolder: '',
  });
  stragglers.push(`${data.firstName} ${data.lastName}`);
  updated++;
}

await batch.commit();

console.log(`\n✓ Updated ${updated} fighters.`);
if (notFound.length) console.log(`\nNot found in Firestore:\n  ${notFound.join('\n  ')}`);
if (stragglers.length) console.log(`\nCleared rank on unlisted fighters:\n  ${stragglers.join('\n  ')}`);
process.exit(0);
