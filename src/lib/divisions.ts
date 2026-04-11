export interface Division {
  id: string;
  name: string;
  weight: string;
  gender: 'male' | 'female';
  sortOrder: number;
  image: string;
}

export const DIVISIONS: Division[] = [
  // Male
  { id: 'male-super-bantamweight-55', name: 'Super Bantamweight', weight: '55kg', gender: 'male', sortOrder: 1, image: '/images/divisions/male/super-bantamweight.jpg' },
  { id: 'male-featherweight-57', name: 'Featherweight', weight: '57kg', gender: 'male', sortOrder: 2, image: '/images/divisions/male/featherweight.jpg' },
  { id: 'male-super-featherweight-58', name: 'Super Featherweight', weight: '58kg', gender: 'male', sortOrder: 3, image: '/images/divisions/male/super-featherweight.jpg' },
  { id: 'male-lightweight-61', name: 'Lightweight', weight: '61kg', gender: 'male', sortOrder: 4, image: '/images/divisions/male/lightweight.jpg' },
  { id: 'male-super-lightweight-63', name: 'Super Lightweight', weight: '63.5kg', gender: 'male', sortOrder: 5, image: '/images/divisions/male/super-lightweight.jpg' },
  { id: 'male-welterweight-66', name: 'Welterweight', weight: '66kg', gender: 'male', sortOrder: 6, image: '/images/divisions/male/welterweight.jpg' },
  { id: 'male-super-welterweight-70', name: 'Super Welterweight', weight: '70kg', gender: 'male', sortOrder: 7, image: '/images/divisions/male/super-welterweight.jpg' },
  { id: 'male-middleweight-72', name: 'Middleweight', weight: '72kg', gender: 'male', sortOrder: 8, image: '/images/divisions/male/middleweight.jpg' },
  { id: 'male-super-middleweight-76', name: 'Super Middleweight', weight: '76kg', gender: 'male', sortOrder: 9, image: '/images/divisions/male/super-middleweight.jpg' },
  { id: 'male-light-heavyweight-79', name: 'Light Heavyweight', weight: '79kg', gender: 'male', sortOrder: 10, image: '/images/divisions/male/light-heavyweight.jpg' },
  { id: 'male-cruiserweight-90', name: 'Cruiserweight', weight: '90kg', gender: 'male', sortOrder: 11, image: '/images/divisions/male/cruiserweight.jpg' },
  { id: 'male-heavyweight-91', name: 'Heavyweight', weight: '91kg+', gender: 'male', sortOrder: 12, image: '/images/divisions/male/heavyweight.jpg' },
  // Female
  { id: 'female-minimum-weight-45', name: 'Minimum Weight', weight: '45kg', gender: 'female', sortOrder: 1, image: '/images/divisions/female/minimum-weight.jpg' },
  { id: 'female-mini-flyweight-47', name: 'Mini Flyweight', weight: '47kg', gender: 'female', sortOrder: 2, image: '/images/divisions/female/mini-flyweight.jpg' },
  { id: 'female-light-flyweight-49', name: 'Light Flyweight', weight: '49kg', gender: 'female', sortOrder: 3, image: '/images/divisions/female/light-flyweight.jpg' },
  { id: 'female-flyweight-50', name: 'Flyweight', weight: '50kg', gender: 'female', sortOrder: 4, image: '/images/divisions/female/flyweight.jpg' },
  { id: 'female-super-flyweight-52', name: 'Super Flyweight', weight: '52kg', gender: 'female', sortOrder: 5, image: '/images/divisions/female/super-flyweight.jpg' },
  { id: 'female-bantamweight-53', name: 'Bantamweight', weight: '53kg', gender: 'female', sortOrder: 6, image: '/images/divisions/female/bantamweight.jpg' },
  { id: 'female-super-bantamweight-55', name: 'Super Bantamweight', weight: '55kg', gender: 'female', sortOrder: 7, image: '/images/divisions/female/super-bantamweight.jpg' },
  { id: 'female-featherweight-57', name: 'Featherweight', weight: '57kg', gender: 'female', sortOrder: 8, image: '/images/divisions/female/featherweight.jpg' },
  { id: 'female-super-featherweight-59', name: 'Super Featherweight', weight: '59kg', gender: 'female', sortOrder: 9, image: '/images/divisions/female/super-featherweight.jpg' },
  { id: 'female-lightweight-61', name: 'Lightweight', weight: '61kg', gender: 'female', sortOrder: 10, image: '/images/divisions/female/lightweight.jpg' },
  { id: 'female-super-lightweight-63', name: 'Super Lightweight', weight: '63.5kg', gender: 'female', sortOrder: 11, image: '/images/divisions/female/super-lightweight.jpg' },
  { id: 'female-light-heavyweight-79', name: 'Light Heavyweight', weight: '79kg', gender: 'female', sortOrder: 12, image: '/images/divisions/female/light-heavyweight.jpg' },
];

export function getDivisionsByGender(gender: 'male' | 'female'): Division[] {
  return DIVISIONS.filter(d => d.gender === gender).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getDivisionById(id: string): Division | undefined {
  return DIVISIONS.find(d => d.id === id);
}
