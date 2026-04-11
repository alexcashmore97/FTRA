import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { doc, getDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { auth, db } from './firebase';

type Role = 'admin' | 'fighter' | null;
type FighterStatus = 'pending' | 'approved' | null;

interface AuthState {
  user: User | null;
  role: Role;
  fighterId: string | null;
  fighterStatus: FighterStatus;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  fighterId: null,
  fighterStatus: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [fighterId, setFighterId] = useState<string | null>(null);
  const [fighterStatus, setFighterStatus] = useState<FighterStatus>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setRole(null);
        setFighterId(null);
        setFighterStatus(null);
        setLoading(false);
        return;
      }

      try {
        // Check if user is admin
        const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
        if (adminDoc.exists()) {
          setRole('admin');
          setFighterId(null);
          setFighterStatus(null);
          setLoading(false);
          return;
        }

        // Check if user is a fighter (query fighters collection by uid)
        const fighterQuery = query(collection(db, 'fighters'), where('uid', '==', firebaseUser.uid));
        const fighterSnap = await getDocs(fighterQuery);
        if (!fighterSnap.empty) {
          const fighterDoc = fighterSnap.docs[0];
          const status = (fighterDoc.data().status as 'pending' | 'approved') ?? 'approved';
          setRole('fighter');
          setFighterId(fighterDoc.id);
          setFighterStatus(status);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Failed to resolve user role:', err);
      }

      // Authenticated but no role assigned (or lookup failed)
      setRole(null);
      setFighterId(null);
      setFighterStatus(null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, role, fighterId, fighterStatus, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
