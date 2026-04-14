import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

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
const snap = await getDocs(collection(db, 'fighters'));

console.log(`Found ${snap.size} fighter docs. Backfilling status...`);

let count = 0;
let batch = writeBatch(db);
let batchCount = 0;

for (const d of snap.docs) {
  const data = d.data();
  if (!data.status) {
    batch.update(doc(db, 'fighters', d.id), { status: 'approved' });
    batchCount++;
    count++;

    if (batchCount === 500) {
      await batch.commit();
      console.log(`  committed batch (${count} so far)`);
      batch = writeBatch(db);
      batchCount = 0;
    }
  }
}

if (batchCount > 0) {
  await batch.commit();
}

console.log(`Done. Set status='approved' on ${count} docs.`);
process.exit(0);
