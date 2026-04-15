export interface DivisionRanking {
  rank: number | null;
  titleHolder: string;
  titleDate: string | null;
}

export interface Fighter {
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
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'admin';
}
