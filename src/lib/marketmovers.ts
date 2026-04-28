import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { getDivisionById } from './divisions';
import { getAllShows } from './shows';
import type { Show } from './types';

// Market Movers — fighters flagged via the star toggle in the Ranking
// Manager. Show linkage is sourced from Fighter.shows; the carousel
// backdrop uses the next-upcoming or most-recent linked show's image.

export interface MarketMover {
  id: string;
  fighterName: string;
  photoURL: string;
  gym: string;
  weightClass: string;
  newRank: number;
  previousRank: number | null;
  showImageURL: string;
  showTitle: string;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// From a fighter's linked shows, pick the next upcoming show (preferred)
// or fall back to the most recent past show. Skips shows without an image.
function pickBackdropShow(linkedIds: string[], shows: Show[]): Show | null {
  if (linkedIds.length === 0) return null;
  const linked = shows.filter(s => linkedIds.includes(s.id) && s.imageURL);
  if (linked.length === 0) return null;
  const today = todayISO();

  const upcoming = linked
    .filter(s => s.eventDate && s.eventDate >= today)
    .sort((a, b) => (a.eventDate ?? '').localeCompare(b.eventDate ?? ''));
  if (upcoming.length > 0) return upcoming[0];

  const past = linked
    .filter(s => s.eventDate && s.eventDate < today)
    .sort((a, b) => (b.eventDate ?? '').localeCompare(a.eventDate ?? ''));
  if (past.length > 0) return past[0];

  // No dated shows — return any linked show
  return linked[0];
}

export async function getMarketMovers(): Promise<MarketMover[]> {
  const [fighterSnap, shows] = await Promise.all([
    getDocs(query(
      collection(db, 'fighters'),
      where('marketMover', '==', true),
      where('status', '==', 'approved'),
    )),
    getAllShows(),
  ]);

  const movers: MarketMover[] = [];

  for (const d of fighterSnap.docs) {
    const data = d.data();
    const divisions: string[] = Array.isArray(data.divisions) ? data.divisions : [];
    const primaryDivId = divisions[0];
    if (!primaryDivId) continue;

    const division = getDivisionById(primaryDivId);
    if (!division) continue;

    const rankings = (data.rankings as Record<string, { rank?: number | null }> | undefined) ?? {};
    const rank = rankings[primaryDivId]?.rank ?? null;
    if (rank == null) continue;

    const linkedShowIds: string[] = Array.isArray(data.shows) ? (data.shows as string[]) : [];
    const backdrop = pickBackdropShow(linkedShowIds, shows);

    const fullName = `${(data.firstName as string) ?? ''} ${(data.lastName as string) ?? ''}`.trim();

    movers.push({
      id: d.id,
      fighterName: fullName || 'Unknown Fighter',
      photoURL: (data.photoURL as string) ?? '',
      gym: (data.gym as string) ?? '',
      weightClass: `${division.name} ${division.weight}`,
      newRank: rank,
      previousRank: null,
      showImageURL: backdrop?.imageURL ?? '',
      showTitle: backdrop?.title ?? '',
    });
  }

  movers.sort((a, b) => {
    if (a.newRank !== b.newRank) return a.newRank - b.newRank;
    return a.fighterName.localeCompare(b.fighterName);
  });

  return movers;
}
