export interface Fighter {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  gym: string;
  state: string;
  division: string;
  weightClass: string;
  gender: 'male' | 'female';
  nationality: string;
  rank: number | null;
  p4pRank: number | null;
  titleHolder: boolean;
  titleDate: string | null;
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
