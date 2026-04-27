// Creates a single claimable fighter profile for testing the claim flow.
// Run anytime you need a fresh test profile to claim against.
//
// Usage:
//   node scripts/seed-claimable.mjs

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const division = 'male-lightweight-61';

const fighter = {
  firstName: 'Alex',
  lastName: `Cashmore claim`,
  nickname: '',
  gym: 'Test Gym',
  state: 'NSW',
  divisions: [division],
  rankings: { [division]: { rank: null, titleHolder: '', titleDate: null } },
  gender: 'male',
  nationality: 'Australian',
  bio: 'Auto-generated claimable test fighter.',
  record: '0-0-0',
  age: 25,
  stance: 'Orthodox',
  instagram: '',
  p4pRank: null,
  photoURL: '',
  email: '',
  uid: null,
  status: 'approved',
};

const ref = db.collection('fighters').doc();
await ref.set(fighter);

console.log(`Created claimable fighter:`);
console.log(`  ID:    ${ref.id}`);
console.log(`  Name:  ${fighter.firstName} ${fighter.lastName}`);
console.log(`  Claim: /register?claim=${ref.id}`);
process.exit(0);
