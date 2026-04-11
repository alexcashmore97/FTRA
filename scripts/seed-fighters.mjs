import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, writeBatch, collection, doc } from 'firebase/firestore';

// --- Load env ---
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

// --- Division key → division ID + metadata mapping ---
const DIVISION_MAP = {
  // Male
  'male:super_bantamweight_55kg':  { id: 'male-super-bantamweight-55',  weightClass: 'Super Bantamweight 55kg',  gender: 'male' },
  'male:featherweight_57kg':       { id: 'male-featherweight-57',       weightClass: 'Featherweight 57kg',       gender: 'male' },
  'male:super_featherweight_58kg': { id: 'male-super-featherweight-58', weightClass: 'Super Featherweight 58kg', gender: 'male' },
  'male:lightweight_61kg':         { id: 'male-lightweight-61',         weightClass: 'Lightweight 61kg',         gender: 'male' },
  'male:super_lightweight_63_5kg': { id: 'male-super-lightweight-63',   weightClass: 'Super Lightweight 63.5kg', gender: 'male' },
  'male:welterweight_66kg':        { id: 'male-welterweight-66',        weightClass: 'Welterweight 66kg',        gender: 'male' },
  'male:super_welterweight_70kg':  { id: 'male-super-welterweight-70',  weightClass: 'Super Welterweight 70kg',  gender: 'male' },
  'male:middleweight_72kg':        { id: 'male-middleweight-72',        weightClass: 'Middleweight 72kg',        gender: 'male' },
  'male:super_middleweight_76kg':  { id: 'male-super-middleweight-76',  weightClass: 'Super Middleweight 76kg',  gender: 'male' },
  'male:light_heavyweight_79kg':   { id: 'male-light-heavyweight-79',   weightClass: 'Light Heavyweight 79kg',   gender: 'male' },
  'male:cruiserweight_90kg':       { id: 'male-cruiserweight-90',       weightClass: 'Cruiserweight 90kg',       gender: 'male' },
  'male:heavyweight_91kg':         { id: 'male-heavyweight-91',         weightClass: 'Heavyweight 91kg+',        gender: 'male' },
  // Female
  'female:minimum_weight_45kg':       { id: 'female-minimum-weight-45',      weightClass: 'Minimum Weight 45kg',      gender: 'female' },
  'female:mini_flyweight_47kg':       { id: 'female-mini-flyweight-47',      weightClass: 'Mini Flyweight 47kg',      gender: 'female' },
  'female:light_flyweight_49kg':      { id: 'female-light-flyweight-49',     weightClass: 'Light Flyweight 49kg',     gender: 'female' },
  'female:flyweight_50kg':            { id: 'female-flyweight-50',           weightClass: 'Flyweight 50kg',           gender: 'female' },
  'female:super_flyweight_52kg':      { id: 'female-super-flyweight-52',     weightClass: 'Super Flyweight 52kg',     gender: 'female' },
  'female:bantamweight_53kg':         { id: 'female-bantamweight-53',        weightClass: 'Bantamweight 53kg',        gender: 'female' },
  'female:super_bantamweight_55kg':   { id: 'female-super-bantamweight-55',  weightClass: 'Super Bantamweight 55kg',  gender: 'female' },
  'female:featherweight_57kg':        { id: 'female-featherweight-57',       weightClass: 'Featherweight 57kg',       gender: 'female' },
  'female:super_featherweight_59kg':  { id: 'female-super-featherweight-59', weightClass: 'Super Featherweight 59kg', gender: 'female' },
  'female:lightweight_61kg':          { id: 'female-lightweight-61',         weightClass: 'Lightweight 61kg',         gender: 'female' },
  'female:super_lightweight_63_5kg':  { id: 'female-super-lightweight-63',   weightClass: 'Super Lightweight 63.5kg', gender: 'female' },
  'female:light_heavyweight_79kg':    { id: 'female-light-heavyweight-79',   weightClass: 'Light Heavyweight 79kg',   gender: 'female' },
};

// --- Helpers ---
function parseName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function parseState(gymString) {
  // "The Iron Fist Gym, QLD" → { gym: "The Iron Fist Gym", state: "QLD" }
  const match = gymString.match(/^(.+),\s*([A-Z]{2,4})$/);
  if (match) return { gym: match[1].trim(), state: match[2].trim() };
  return { gym: gymString.trim(), state: '' };
}

// --- Build fighter documents ---
const data = JSON.parse(readFileSync('src/data/fighter-data.json', 'utf-8'));
const fighters = [];

for (const [genderKey, divisions] of [['male', data.male_divisions], ['female', data.female_divisions]]) {
  for (const [divKey, divData] of Object.entries(divisions)) {
    const mapKey = `${genderKey}:${divKey}`;
    const meta = DIVISION_MAP[mapKey];
    if (!meta) {
      console.warn(`Skipping unknown division: ${mapKey}`);
      continue;
    }

    for (const f of divData.fighters) {
      const { firstName, lastName } = parseName(f.name);
      const { gym, state } = parseState(f.gym);

      fighters.push({
        firstName,
        lastName,
        nickname: '',
        gym,
        state,
        division: meta.id,
        weightClass: meta.weightClass,
        gender: meta.gender,
        rank: f.rank,
        p4pRank: null,
        titleHolder: !!f.title,
        titleDate: null,
        bio: '',
        photoURL: '',
        record: '',
        age: null,
        stance: '',
        email: '',
        uid: null,
      });
    }
  }
}

// --- Write to Firestore in batches of 500 ---
console.log(`Seeding ${fighters.length} fighters...`);

const col = collection(db, 'fighters');
let count = 0;
let batch = writeBatch(db);
let batchCount = 0;

for (const fighter of fighters) {
  const ref = doc(col);
  batch.set(ref, fighter);
  batchCount++;
  count++;

  if (batchCount === 500) {
    await batch.commit();
    console.log(`  committed batch (${count} so far)`);
    batch = writeBatch(db);
    batchCount = 0;
  }
}

if (batchCount > 0) {
  await batch.commit();
}

console.log(`Done. Seeded ${count} fighters into Firestore.`);
process.exit(0);
