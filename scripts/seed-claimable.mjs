// Adds a single fighter doc to Firestore in the same shape as the original
// seeded data (status: approved, divisions[], rankings{}, uid/email blank so
// the profile is claimable). Re-running creates a new doc each time.
//
// Usage:
//   node scripts/seed-claimable.mjs \
//     --name "Jon Rig" \
//     --division male-cruiserweight-90 \
//     [--gym "Team Pinky Muay Thai"] \
//     [--state SA] \
//     [--rank 11] \
//     [--gender male|female] \
//     [--nickname "..."] \
//     [--nationality Australian] \
//     [--stance Orthodox]
//
// --gym accepts "Gym Name, ST" — the state is parsed out automatically if
// --state is not also provided.

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Mirrors src/lib/divisions.ts. Keep in sync if divisions ever change.
const VALID_DIVISIONS = new Set([
  // Male
  'male-super-bantamweight-55',
  'male-featherweight-57',
  'male-super-featherweight-58',
  'male-lightweight-61',
  'male-super-lightweight-63',
  'male-welterweight-66',
  'male-super-welterweight-70',
  'male-middleweight-72',
  'male-super-middleweight-76',
  'male-light-heavyweight-79',
  'male-cruiserweight-90',
  'male-heavyweight-91',
  // Female
  'female-minimum-weight-45',
  'female-mini-flyweight-47',
  'female-light-flyweight-49',
  'female-flyweight-50',
  'female-super-flyweight-52',
  'female-bantamweight-53',
  'female-super-bantamweight-55',
  'female-featherweight-57',
  'female-super-featherweight-59',
  'female-lightweight-61',
  'female-super-lightweight-63',
  'female-light-heavyweight-79',
]);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      out[key] = next;
      i++;
    } else {
      out[key] = true;
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

if (!args.name || !args.division) {
  console.error('Required: --name "First Last" --division <division-id>');
  console.error('Optional: --gym "..." --state SA --rank 11 --gender male|female');
  console.error('          --nickname "..." --nationality "..." --stance "..."');
  process.exit(1);
}

if (!VALID_DIVISIONS.has(args.division)) {
  console.error(`Unknown division ID: "${args.division}"`);
  console.error('Valid IDs:');
  for (const id of [...VALID_DIVISIONS].sort()) console.error(`  ${id}`);
  process.exit(1);
}

const rank = (args.rank === undefined || args.rank === '') ? null : Number(args.rank);
if (rank !== null && Number.isNaN(rank)) {
  console.error(`Invalid --rank: ${args.rank}`);
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = resolve(__dirname, 'service-account.json');

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));
} catch {
  console.error(`Could not read ${keyPath}.`);
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// --- Build fighter doc ---
const nameParts = String(args.name).trim().split(/\s+/);
const firstName = nameParts[0] ?? '';
const lastName = nameParts.slice(1).join(' ');

let gym = (args.gym ?? '').toString().trim();
let state = (args.state ?? '').toString().trim();
if (!state && gym) {
  const m = gym.match(/^(.+),\s*([A-Z]{2,4})$/);
  if (m) { gym = m[1].trim(); state = m[2].trim(); }
}

const gender = args.gender
  ? String(args.gender)
  : (args.division.startsWith('female-') ? 'female' : 'male');

const fighter = {
  firstName,
  lastName,
  nickname: (args.nickname ?? '').toString().trim(),
  gym,
  state,
  divisions: [args.division],
  rankings: {
    [args.division]: { rank, titleHolder: '', titleDate: null },
  },
  gender,
  nationality: (args.nationality ?? 'Australian').toString().trim(),
  bio: '',
  record: '',
  age: null,
  stance: (args.stance ?? '').toString().trim(),
  instagram: '',
  p4pRank: null,
  photoURL: '',
  email: '',
  uid: null,
  status: 'approved',
};

const ref = db.collection('fighters').doc();
await ref.set(fighter);

console.log('Created fighter:');
console.log(`  ID:        ${ref.id}`);
console.log(`  Name:      ${firstName} ${lastName}`);
console.log(`  Division:  ${args.division} (rank ${rank ?? '—'})`);
console.log(`  Claim URL: /register?claim=${ref.id}`);
process.exit(0);
