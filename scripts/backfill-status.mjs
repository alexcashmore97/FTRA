// One-time script: add status='approved' to all fighters missing the field
// Run with: node scripts/backfill-status.mjs
// Uses client Firebase SDK + signs in as admin to have write permissions

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(resolve(__dirname, '..', '.env'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) env[key.trim()] = val.join('=').trim();
});

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});

const db = getFirestore(app);
const auth = getAuth(app);

function prompt(q) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => rl.question(q, ans => { rl.close(); res(ans); }));
}

async function backfill() {
  const email = await prompt('Admin email: ');
  const password = await prompt('Admin password: ');

  console.log('Signing in...');
  await signInWithEmailAndPassword(auth, email, password);
  console.log('Authenticated.\n');

  const snap = await getDocs(collection(db, 'fighters'));
  let updated = 0;

  for (const d of snap.docs) {
    if (!d.data().status) {
      await updateDoc(doc(db, 'fighters', d.id), { status: 'approved' });
      updated++;
      console.log(`  ✓ ${d.data().firstName || ''} ${d.data().lastName || ''}`);
    }
  }

  console.log(`\nDone. Updated ${updated} of ${snap.size} fighters.`);
  process.exit(0);
}

backfill().catch(err => { console.error(err.message || err); process.exit(1); });
