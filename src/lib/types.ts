export interface DivisionRanking {
  rank: number | null;
  titleHolder: string;
  titleDate: string | null;
}

export interface ClaimSnapshot {
  nickname: string;
  instagram: string;
  nationality: string;
  stance: string;
  record: string;
  age: number | null;
  bio: string;
}

export interface Fighter {
  note?: string|undefined;
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  gym: string;
  state: string;
  divisions: string[];
  rankings: Record<string, DivisionRanking>;
  gender: 'male' | 'female';
  nationality: string;
  p4pRank: number | null;
  bio: string;
  photoURL: string;
  record: string;
  age: number | null;
  stance: string;
  instagram: string;
  email: string;
  uid: string | null;
  status: 'pending' | 'approved';
  pendingClaim?: boolean;
  claimSnapshot?: ClaimSnapshot;
  marketMover?: boolean;
  shows?: string[];
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin';
}

export interface Show {
  id: string;
  title: string;
  imageURL: string;
  ticketURL: string;
  eventDate: string | null;
  active: boolean;
  createdAt: number;
}

export type PostType = 'text' | 'video';

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  coverImageURL: string;
  type: PostType;
  body: string;
  youtubeId: string;
  active: boolean;
  createdAt: number;
}
