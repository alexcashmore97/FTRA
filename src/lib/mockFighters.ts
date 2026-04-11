import type { Fighter } from './types';

// Sample fighters for development — replace with Firestore queries
export const MOCK_FIGHTERS: Fighter[] = [
  {
    id: '1', firstName: 'Corey', lastName: 'Nicholson', nickname: 'The Storm',
    gym: 'Hammer Muay Thai', state: 'VIC',
    division: 'male-welterweight-66', weightClass: 'Welterweight 66kg', gender: 'male',
    rank: null, p4pRank: 1, titleHolder: true, titleDate: '2024-06-15',
    bio: 'A relentless competitor known for devastating elbows and iron will. Corey has fought his way through the Australian Muay Thai scene with a style that blends traditional Muay Khao pressure with sharp counter-striking.',
    photoURL: '', record: '18-3-0', age: 28, stance: 'Orthodox', email: '', uid: null,
  },
  {
    id: '2', firstName: 'Josh', lastName: 'McCulloch', nickname: '', gym: 'Absolute MMA', state: 'VIC',
    division: 'male-welterweight-66', weightClass: 'Welterweight 66kg', gender: 'male',
    rank: 1, p4pRank: 5, titleHolder: false, titleDate: null,
    bio: '', photoURL: '', record: '14-5-1', age: 26, stance: 'Southpaw', email: '', uid: null,
  },
  {
    id: '3', firstName: 'Chadd', lastName: 'Collins', nickname: 'Bad Chad', gym: 'Collins Muay Thai', state: 'QLD',
    division: 'male-welterweight-66', weightClass: 'Welterweight 66kg', gender: 'male',
    rank: 2, p4pRank: null, titleHolder: false, titleDate: null,
    bio: '', photoURL: '', record: '22-8-0', age: 30, stance: 'Orthodox', email: '', uid: null,
  },
  {
    id: '4', firstName: 'Max', lastName: 'McVicker', nickname: '', gym: 'Tigers Muay Thai', state: 'NSW',
    division: 'male-welterweight-66', weightClass: 'Welterweight 66kg', gender: 'male',
    rank: 3, p4pRank: null, titleHolder: false, titleDate: null,
    bio: '', photoURL: '', record: '10-2-0', age: 24, stance: 'Orthodox', email: '', uid: null,
  },
  {
    id: '5', firstName: 'Petchumpon', lastName: 'Rama1', nickname: '', gym: 'Rama 1 Gym', state: 'VIC',
    division: 'male-super-bantamweight-55', weightClass: 'Super Bantamweight 55kg', gender: 'male',
    rank: null, p4pRank: 2, titleHolder: true, titleDate: '2024-03-20',
    bio: '', photoURL: '', record: '45-12-0', age: 32, stance: 'Orthodox', email: '', uid: null,
  },
  {
    id: '6', firstName: 'Singnoom', lastName: '', nickname: '', gym: 'Singpatong', state: 'VIC',
    division: 'male-lightweight-61', weightClass: 'Lightweight 61kg', gender: 'male',
    rank: null, p4pRank: 3, titleHolder: true, titleDate: '2024-01-10',
    bio: '', photoURL: '', record: '38-9-2', age: 29, stance: 'Orthodox', email: '', uid: null,
  },
  {
    id: '7', firstName: 'Lucille', lastName: '', nickname: '', gym: 'Hammer Muay Thai', state: 'VIC',
    division: 'female-super-bantamweight-55', weightClass: 'Super Bantamweight 55kg', gender: 'female',
    rank: null, p4pRank: 1, titleHolder: true, titleDate: '2024-05-01',
    bio: '', photoURL: '', record: '12-2-0', age: 25, stance: 'Orthodox', email: '', uid: null,
  },
  {
    id: '8', firstName: 'Kim', lastName: 'Townsend', nickname: '', gym: 'MTI', state: 'QLD',
    division: 'female-featherweight-57', weightClass: 'Featherweight 57kg', gender: 'female',
    rank: null, p4pRank: 2, titleHolder: true, titleDate: '2024-07-20',
    bio: '', photoURL: '', record: '15-4-0', age: 27, stance: 'Southpaw', email: '', uid: null,
  },
  {
    id: '9', firstName: 'Devina', lastName: 'Martin', nickname: '', gym: 'Martin MMA', state: 'NSW',
    division: 'female-flyweight-50', weightClass: 'Flyweight 50kg', gender: 'female',
    rank: null, p4pRank: 3, titleHolder: true, titleDate: '2024-02-15',
    bio: '', photoURL: '', record: '9-1-0', age: 23, stance: 'Orthodox', email: '', uid: null,
  },
  {
    id: '10', firstName: 'Jonathan', lastName: 'Aiulu', nickname: 'The Tongan Bull', gym: 'Taipan Gym', state: 'QLD',
    division: 'male-heavyweight-91', weightClass: 'Heavyweight 91kg+', gender: 'male',
    rank: null, p4pRank: 4, titleHolder: true, titleDate: '2024-08-01',
    bio: '', photoURL: '', record: '20-3-0', age: 31, stance: 'Orthodox', email: '', uid: null,
  },
];

export function getFightersByDivision(divisionId: string): Fighter[] {
  return MOCK_FIGHTERS.filter(f => f.division === divisionId);
}

export function getFighterById(id: string): Fighter | undefined {
  return MOCK_FIGHTERS.find(f => f.id === id);
}

export function getP4PFighters(gender: 'male' | 'female'): Fighter[] {
  return MOCK_FIGHTERS
    .filter(f => f.gender === gender && f.p4pRank !== null)
    .sort((a, b) => (a.p4pRank ?? 99) - (b.p4pRank ?? 99));
}
