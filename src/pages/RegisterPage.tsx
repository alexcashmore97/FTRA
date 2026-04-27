import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, type UserCredential } from 'firebase/auth';
import { collection, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getFighterById } from '@/lib/fighters';
import { getDivisionsByGender } from '@/lib/divisions';
import { useAuth } from '@/lib/auth';
import type { Fighter } from '@/lib/types';
import '@/styles/auth.css';

const STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const claimId = searchParams.get('claim');
  const { role, fighterId, fighterStatus, loading: authLoading } = useAuth();
  const blockedClaim = !!claimId && role === 'fighter' && !!fighterId && fighterStatus === 'approved';

  const [claimFighter, setClaimFighter] = useState<Fighter | null>(null);
  const [claimLoading, setClaimLoading] = useState(!!claimId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetOption, setShowResetOption] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gym, setGym] = useState('');
  const [instagram, setInstagram] = useState('');
  const [state, setState] = useState('');
  const [nationality, setNationality] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [stance, setStance] = useState('');
  const [record, setRecord] = useState('');
  const [note,setNote] = useState('')
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');

  const divisions = getDivisionsByGender(gender);

  // Load claim fighter data
  useEffect(() => {
    if (!claimId) return;
    if (authLoading) return;
    if (blockedClaim) {
      setClaimLoading(false);
      return;
    }
    getFighterById(claimId)
      .then(fighter => {
        if (!fighter || fighter.uid) {
          // Fighter not found or already claimed
          setError(fighter?.uid ? 'This profile has already been claimed.' : 'Fighter profile not found.');
          setClaimLoading(false);
          return;
        }
        setClaimFighter(fighter);
        // Pre-fill form with existing data
        setFirstName(fighter.firstName);
        setLastName(fighter.lastName);
        setNickname(fighter.nickname);
        setGym(fighter.gym);
        setInstagram(fighter.instagram ?? '');
        setState(fighter.state);
        setNationality(fighter.nationality ?? '');
        setGender(fighter.gender);
        setSelectedDivisions(fighter.divisions ?? []);
        setStance(fighter.stance);
        setRecord(fighter.record);
        setAge(fighter.age ? String(fighter.age) : '');
        setBio(fighter.bio);
        setClaimLoading(false);
      })
      .catch(() => {
        setError('Failed to load fighter profile.');
        setClaimLoading(false);
      });
  }, [claimId, authLoading, blockedClaim]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setShowResetOption(false);
    setResetSent(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }

    if (selectedDivisions.length === 0) {
      setError('Please select at least one division.');
      return;
    }

    setSubmitting(true);
    sessionStorage.setItem('auth-registering', '1');

    try {
      let cred: UserCredential;
      try {
        cred = await createUserWithEmailAndPassword(auth, email, password);
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code ?? '';
        if (code !== 'auth/email-already-in-use') throw err;

        // Email already has an Auth account (e.g. orphaned by an earlier
        // rejection). Try to sign in with the supplied password and reuse it.
        try {
          cred = await signInWithEmailAndPassword(auth, email, password);
        } catch (signInErr: unknown) {
          const signInCode = (signInErr as { code?: string })?.code ?? '';
          if (
            signInCode === 'auth/wrong-password' ||
            signInCode === 'auth/invalid-credential' ||
            signInCode === 'auth/invalid-login-credentials'
          ) {
            setError('An account already exists for this email. Enter the password you used previously, or reset it below.');
            setShowResetOption(true);
          } else {
            setError(signInErr instanceof Error ? signInErr.message : 'Sign-in failed.');
          }
          return;
        }

        // Signed into an existing Auth account. Refuse only if an *approved*
        // fighter doc is already linked. Pending docs are allowed through —
        // admin resolves any duplicate by preferring the claim over the fresh
        // registration when reviewing approvals.
        const linked = await getDocs(
          query(collection(db, 'fighters'), where('uid', '==', cred.user.uid))
        );
        const approved = linked.docs.find(d => d.data().status === 'approved');
        if (approved) {
          setError('An approved fighter profile is already linked to this email. Try signing in instead.');
          return;
        }
      }

      if (claimFighter && claimId) {
        // Claim flow: snapshot the current personal fields so we can restore
        // them if the claim is rejected, then link the UID and mark pending
        // so an admin reviews before the change goes live.
        const claimSnapshot = {
          nickname: claimFighter.nickname,
          instagram: claimFighter.instagram,
          nationality: claimFighter.nationality,
          stance: claimFighter.stance,
          record: claimFighter.record,
          age: claimFighter.age,
          bio: claimFighter.bio,
        };
        await updateDoc(doc(db, 'fighters', claimId), {
          uid: cred.user.uid,
          email,
          nickname: nickname.trim(),
          instagram: instagram.trim(),
          nationality: nationality.trim(),
          stance,
          record: record.trim(),
          age: age ? parseInt(age, 10) : null,
          bio: bio.trim(),
          status: 'pending',
          pendingClaim: true,
          claimSnapshot,
        });
        navigate(`/fighter-portal/${claimId}`, { replace: true });
      } else {
        // Normal registration: create new fighter doc
        await setDoc(doc(db, 'fighters', cred.user.uid), {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          nickname: nickname.trim(),
          gym: gym.trim(),
          instagram: instagram.trim(),
          state,
          nationality: nationality.trim(),
          gender,
          divisions: selectedDivisions,
          rankings: Object.fromEntries(
            selectedDivisions.map(d => [d, { rank: null, titleHolder: '', titleDate: null }])
          ),
          stance,
          record: record.trim(),
          age: age ? parseInt(age, 10) : null,
          bio: bio.trim(),
          photoURL: '',
          p4pRank: null,
          email,
          uid: cred.user.uid,
          status: 'pending',
          note: note ? note.trim() : '',
        });
        navigate(`/fighter-portal/${cred.user.uid}`, { replace: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      setError(message);
    } finally {
      setSubmitting(false);
      sessionStorage.removeItem('auth-registering');
    }
  }

  async function handleSendReset() {
    if (!email.trim()) {
      setError('Enter your email above first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
      setError(null);
      setShowResetOption(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email.');
    }
  }

  if (claimLoading || (claimId && authLoading)) {
    return (
      <div className="page-wrapper section container" style={{ maxWidth: 640 }}>
        <div className="empty-state">Loading fighter profile...</div>
      </div>
    );
  }

  if (blockedClaim && !submitting) {
    return (
      <div className="page-wrapper section container" style={{ maxWidth: 640 }}>
        <div className="section-header" style={{ textAlign: 'center' }}>
          <div className="auth-badge fighter-badge">Claim Profile</div>
          <h2>Already signed in</h2>
          <p className="auth-subtitle">
            You're signed in to a fighter account, so you can't claim another profile.
            If this claim is for someone else, sign out first and have them complete it themselves.
          </p>
        </div>
        <div className="auth-form" style={{ alignItems: 'center' }}>
          <Link to={`/fighter-portal/${fighterId}`} className="btn btn-primary auth-submit">
            Go to my profile
          </Link>
        </div>
      </div>
    );
  }

  const isClaim = !!claimFighter;

  return (
    <div className="page-wrapper section container" style={{ maxWidth: 640 }}>
      <div className="section-header" style={{ textAlign: 'center' }}>
        <div className="auth-badge fighter-badge">
          {isClaim ? 'Claim Profile' : 'Fighter Registration'}
        </div>
        <h2>{isClaim ? `Claim ${claimFighter.firstName} ${claimFighter.lastName}'s Profile` : 'Join the Rankings'}</h2>
        <p className="auth-subtitle">
          {isClaim
            ? 'Create an account to claim this profile. Your name, division, and ranking will stay the same.'
            : 'Create your fighter profile. Once submitted, an admin will review and approve your registration.'
          }
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {/* Account section */}
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.1em', marginTop: 8 }}>
          Account
        </h4>

        <div className="auth-field">
          <label className="label">Email *</label>
          <input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
        </div>

        <div className="register-row">
          <div className="auth-field">
            <label className="label">Password *</label>
            <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" />
          </div>
          <div className="auth-field">
            <label className="label">Confirm Password *</label>
            <input className="input" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm" />
          </div>
        </div>

        {/* Profile section */}
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.1em', marginTop: 16 }}>
          Fighter Profile
        </h4>

        <div className="register-row">
          <div className="auth-field">
            <label className="label">First Name *</label>
            <input className="input" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" disabled={isClaim} />
          </div>
          <div className="auth-field">
            <label className="label">Last Name *</label>
            <input className="input" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" disabled={isClaim} />
          </div>
        </div>

        <div className="register-row">
          <div className="auth-field">
            <label className="label">Nickname</label>
            <input className="input" value={nickname} onChange={e => setNickname(e.target.value)} placeholder='e.g. "The Storm"' />
          </div>
          <div className="auth-field">
            <label className="label">Instagram</label>
            <input className="input" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@yourhandle" />
          </div>
        </div>

        <div className="register-row">
          <div className="auth-field">
            <label className="label">Gym *</label>
            <input className="input" required value={gym} onChange={e => setGym(e.target.value)} placeholder="Your gym" disabled={isClaim} />
          </div>
          <div className="auth-field">
            <label className="label">State *</label>
            <select className="input" required value={state} onChange={e => setState(e.target.value)} style={{ appearance: 'auto' }} disabled={isClaim}>
              <option value="">Select...</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="register-row">
          <div className="auth-field">
            <label className="label">Nationality</label>
            <input className="input" value={nationality} onChange={e => setNationality(e.target.value)} placeholder="e.g. Australian" />
          </div>
          <div className="auth-field">
            <label className="label">Age</label>
            <input className="input" type="number" min={14} max={60} value={age} onChange={e => setAge(e.target.value)} placeholder="Age" />
          </div>
        </div>

        <div className="register-row">
          <div className="auth-field">
            <label className="label">Gender *</label>
            <select className="input" required value={gender} onChange={e => { setGender(e.target.value as 'male' | 'female'); setSelectedDivisions([]); }} style={{ appearance: 'auto' }} disabled={isClaim}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="auth-field">
          <label className="label">Choose Division(s) *</label>
          <div className="division-chips" role="group" aria-label="Divisions">
            {divisions.map(d => {
              const checked = selectedDivisions.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`division-chip${checked ? ' is-selected' : ''}`}
                  aria-pressed={checked}
                  disabled={isClaim}
                  onClick={() => {
                    setSelectedDivisions(prev =>
                      prev.includes(d.id) ? prev.filter(x => x !== d.id) : [...prev, d.id]
                    );
                  }}
                >
                  {d.name} — {d.weight}
                </button>
              );
            })}
          </div>
        </div>

        <div className="register-row">
          <div className="auth-field">
            <label className="label">Stance</label>
            <select className="input" value={stance} onChange={e => setStance(e.target.value)} style={{ appearance: 'auto' }}>
              <option value="">Select...</option>
              <option value="Orthodox">Orthodox</option>
              <option value="Southpaw">Southpaw</option>
              <option value="Switch">Switch</option>
            </select>
          </div>
          <div className="auth-field">
            <label className="label">Record (W-L-D)</label>
            <input className="input" value={record} onChange={e => setRecord(e.target.value)} placeholder="e.g. 12-3-0" />
          </div>
        </div>
       
          <div className="auth-field">
<label className="label">Last 3 Opponents (Name and Result W/L/D) </label>
            <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. John Doe (W)" maxLength={240} />

          </div>
       

        <div className="auth-field">
          <label className="label">Bio</label>
          <textarea
            className="input"
            rows={4}
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell us about yourself, your fighting style, your journey..."
            style={{ resize: 'vertical' }}
          />
        </div>

        {error && <div className="auth-error">{error}</div>}
        {showResetOption && (
          <button type="button" className="btn btn-ghost" onClick={handleSendReset} style={{ alignSelf: 'center' }}>
            Send password reset email
          </button>
        )}
        {resetSent && (
          <div className="auth-subtitle" style={{ textAlign: 'center' }}>
            Password reset email sent. Check your inbox, then submit again.
          </div>
        )}

        <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
          {submitting ? (isClaim ? 'Claiming...' : 'Registering...') : (isClaim ? 'Claim Profile' : 'Register')}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
        </p>
      </form>
    </div>
  );
}
