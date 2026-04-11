# HANDOFF-NEXT — Phase 2 Tasks

> Pick up where HANDOFF.md left off. Frontend boilerplate is done. These are the remaining features.

---

## Blockers to resolve first

### 1. Run `npm run dev` and fix any compile errors
The full frontend was written without a running dev server. Expect possible import issues or TS strictness errors. Fix them before moving on.

### 2. Firebase project needs connecting
`firebase login` and `firebase init` haven't been run yet. The `.env` file doesn't exist — only `.env.example`. Someone needs to:
```
firebase login        # interactive — user must run this
firebase init         # select Firestore, Auth, Storage, Hosting
```
Then populate `.env` with the real project credentials.

---

## Task A — Auth system (both admin + fighter)

**Files to create:**
- `src/lib/auth.ts` — auth context provider, `useAuth()` hook, login/logout helpers
- `src/components/ProtectedRoute.tsx` — wrapper that checks auth + role before rendering children
- `src/pages/admin/AdminLoginPage.tsx` — email/password login form
- `src/pages/fighter-portal/FighterLoginPage.tsx` — email/password login form

**How it works:**
- Firebase Auth email/password for both roles
- On login, check Firestore `admins` collection for admin role
- For fighters, match `auth.currentUser.uid` to `fighters` collection `uid` field
- `ProtectedRoute` takes a `role` prop: `'admin'` | `'fighter'`
- Redirect to login page if not authenticated or wrong role

**Routes to add in `App.tsx`:**
```tsx
<Route path="/admin/login" element={<AdminLoginPage />} />
<Route path="/admin/rankings" element={<ProtectedRoute role="admin"><AdminRankingsPage /></ProtectedRoute>} />
<Route path="/fighter-portal/login" element={<FighterLoginPage />} />
<Route path="/fighter-portal/profile" element={<ProtectedRoute role="fighter"><FighterEditorPage /></ProtectedRoute>} />
```

---

## Task B — Admin ranking manager UI

**File:** `src/pages/admin/AdminRankingsPage.tsx`

**Requirements:**
1. Select a division from a dropdown (or tabs)
2. See current ranked fighters in order
3. Change a fighter's rank via number input or drag-and-drop
4. **Auto-reorder logic:** When admin sets fighter X to rank 3, all fighters at rank 3+ shift down by one. When removing a fighter from rankings (set to null), close the gap.
5. Toggle champion status (separate from rank — champion has no numeric rank, they're "C")
6. Save changes to Firestore
7. Separate section for P4P rankings (same reorder logic, across all divisions)

**Auto-reorder function (core logic):**
```ts
function setRank(fighters: Fighter[], fighterId: string, newRank: number | null): Fighter[] {
  const target = fighters.find(f => f.id === fighterId);
  if (!target) return fighters;

  const oldRank = target.rank;

  // Remove from current position
  if (oldRank !== null) {
    fighters.filter(f => f.rank !== null && f.rank > oldRank).forEach(f => f.rank!--);
  }

  // Insert at new position
  if (newRank !== null) {
    fighters.filter(f => f.rank !== null && f.rank >= newRank).forEach(f => f.rank!++);
  }

  target.rank = newRank;
  return [...fighters];
}
```

**Firestore writes:** Batch update all affected fighters in a single `writeBatch()`.

---

## Task C — Fighter profile editor

**File:** `src/pages/fighter-portal/FighterEditorPage.tsx`

**Requirements:**
1. Fighter logs in → fetch their doc from Firestore by `uid`
2. Editable fields (6):
   - `nickname`
   - `gym`
   - `bio` (textarea)
   - `stance` (dropdown: Orthodox / Southpaw / Switch)
   - `record` (text input, e.g. "12-3-0")
   - `photoURL` (upload via Firebase Storage, display preview)
3. Photo upload flow:
   - Accept jpg/png, max 5MB
   - Upload to `fighters/{fighterId}/profile.jpg` in Firebase Storage
   - Get download URL, save to `photoURL` field
4. Save button → update Firestore doc
5. Show read-only fields they can't edit: `firstName`, `lastName`, `division`, `rank`, `p4pRank`

---

## Task D — Replace mock data with Firestore queries

**Files to update:**
- `src/pages/DivisionRankingsPage.tsx` — query `fighters` where `division == divisionId`, order by `rank`
- `src/pages/P4PRankingsPage.tsx` — query `fighters` where `gender == X` and `p4pRank != null`, order by `p4pRank`
- `src/pages/FighterProfilePage.tsx` — fetch single doc by ID
- `src/pages/HomePage.tsx` — optionally show fighter counts per division

**Firestore query pattern:**
```ts
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const q = query(
  collection(db, 'fighters'),
  where('division', '==', divisionId),
  orderBy('rank', 'asc')
);
const snapshot = await getDocs(q);
const fighters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fighter));
```

**Create a shared hook:** `src/lib/useFighters.ts` with loading/error states.

---

## Task E — Seed Firestore with real(ish) data

Once Firebase is connected, write a one-time seed script (`scripts/seed.ts` or run from browser console) that:
1. Creates all 24 division docs in `divisions` collection
2. Creates 10-20 fighter docs from the mock data in `src/lib/mockFighters.ts`
3. Creates 1 admin doc linked to the admin's Firebase Auth uid

---

## Task F — Polish & QA

- [ ] Framer Motion page transitions (wrap routes in `AnimatePresence`)
- [ ] Framer Motion on ranking rows (staggered entrance)
- [ ] Scroll to top on route change
- [ ] Mobile test all pages
- [ ] Loading skeletons while Firestore queries resolve
- [ ] Error boundaries / 404 page
- [ ] SEO meta tags per page (react-helmet or similar)
- [ ] Favicon using FTRA branding

---

## Suggested split

| Task | Best for | Depends on |
|------|----------|------------|
| A — Auth system | Either agent | Firebase project connected |
| B — Admin rankings | Agent who does A | Task A done |
| C — Fighter editor | Other agent | Task A done |
| D — Firestore queries | Either | Firebase connected + some data seeded |
| E — Seed script | Either | Firebase connected |
| F — Polish | Split between both | Everything else mostly done |
