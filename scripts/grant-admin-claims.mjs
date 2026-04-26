// One-time: read every UID in the `admins/` Firestore collection and set
// the `admin: true` custom claim on the matching Firebase Auth user.
//
// Setup:
//   1. In Firebase console: Project Settings → Service Accounts → Generate new private key
//   2. Save the JSON as scripts/service-account.json (it's gitignored by default if you
//      added it; double-check before committing)
//   3. Run: node scripts/grant-admin-claims.mjs
//
// After running, each admin must sign out + sign back in for the claim to land in their
// ID token. Then retry uploads.

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = resolve(__dirname, 'service-account.json');

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));
} catch {
  console.error(`Could not read ${keyPath}.`);
  console.error('Download a service account key from Firebase console → Project Settings → Service Accounts.');
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();
const auth = getAuth();

const snap = await db.collection('admins').get();
if (snap.empty) {
  console.log('No documents in admins/ collection. Nothing to do.');
  process.exit(0);
}

console.log(`Found ${snap.size} admin doc(s). Setting custom claims...`);

let granted = 0;
let failed = 0;
for (const doc of snap.docs) {
  const uid = doc.id;
  try {
    const user = await auth.getUser(uid);
    const existing = user.customClaims || {};
    await auth.setCustomUserClaims(uid, { ...existing, admin: true });
    console.log(`  ✓ ${user.email || uid}`);
    granted++;
  } catch (err) {
    console.error(`  ✗ ${uid} — ${err.message}`);
    failed++;
  }
}

console.log(`\nDone. ${granted} granted, ${failed} failed.`);
console.log('Each admin must sign out and back in for the claim to take effect.');
process.exit(0);
