// Removes Firebase Auth users tagged as orphans by the admin reject flow.
//
// Each entry in the `auth_orphans/{uid}` Firestore collection corresponds to
// an Auth user whose fighter doc was rejected and who is no longer linked
// to any fighter profile. This script:
//   1. Reads every doc in auth_orphans
//   2. Deletes the matching Firebase Auth user
//   3. Removes the auth_orphans doc (only if the Auth delete succeeded, or
//      if the Auth user was already gone)
//
// Usage:
//   node scripts/cleanup-auth-orphans.mjs           # interactive (lists, prompts)
//   node scripts/cleanup-auth-orphans.mjs --yes     # delete without prompt
//   node scripts/cleanup-auth-orphans.mjs --dry     # list only, no deletes

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline/promises';
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
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
const auth = getAuth();

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry');
const skipPrompt = args.has('--yes');

const snap = await db.collection('auth_orphans').get();
if (snap.empty) {
  console.log('No orphaned auth UIDs to clean up.');
  process.exit(0);
}

console.log(`Found ${snap.size} orphan tag(s):`);
for (const d of snap.docs) {
  const data = d.data();
  console.log(`  ${d.id}  email=${data.email || '(none)'}  reason=${data.reason}  for=${data.originalFighterName}`);
}

if (dryRun) {
  console.log('\n--dry — no deletions performed.');
  process.exit(0);
}

if (!skipPrompt) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`\nDelete these ${snap.size} Firebase Auth user(s)? (yes/no) `);
  rl.close();
  if (answer.trim().toLowerCase() !== 'yes') {
    console.log('Aborted.');
    process.exit(0);
  }
}

let deleted = 0;
let alreadyGone = 0;
let failed = 0;

for (const d of snap.docs) {
  const uid = d.id;
  try {
    await auth.deleteUser(uid);
    console.log(`  ✓ deleted auth user ${uid}`);
    deleted++;
    await d.ref.delete();
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.log(`  · already gone ${uid}`);
      alreadyGone++;
      await d.ref.delete();
    } else {
      console.error(`  ✗ failed ${uid} — ${err.message}`);
      failed++;
    }
  }
}

console.log(`\nDone. ${deleted} deleted, ${alreadyGone} already gone, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
