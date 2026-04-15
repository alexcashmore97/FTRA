import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getFighterById } from '@/lib/fighters';
import { getDivisionsByGender } from '@/lib/divisions';
import type { Fighter } from '@/lib/types';
import '@/styles/auth.css';

const STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const claimId = searchParams.get('claim');

  const [claimFighter, setClaimFighter] = useState<Fighter | null>(null);
  const [claimLoading, setClaimLoading] = useState(!!claimId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const [division, setDivision] = useState('');
  const [stance, setStance] = useState('');
  const [record, setRecord] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');

  const divisions = getDivisionsByGender(gender);

  // Load claim fighter data
  useEffect(() => {
    if (!claimId) return;
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
        setDivision(fighter.divisions[0] ?? '');
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
  }, [claimId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

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

    if (!division) {
      setError('Please select a division.');
      return;
    }

    setSubmitting(true);

    try {
      // Create Firebase Auth account
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (claimFighter && claimId) {
        // Claim flow: update existing fighter doc, linking the new UID
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
        });
        navigate(`/fighter-portal/${claimId}`);
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
          divisions: [division],
          rankings: {
            [division]: { rank: null, titleHolder: '', titleDate: null },
          },
          stance,
          record: record.trim(),
          age: age ? parseInt(age, 10) : null,
          bio: bio.trim(),
          photoURL: '',
          p4pRank: null,
          email,
          uid: cred.user.uid,
          status: 'pending',
        });
        navigate(`/fighter-portal/${cred.user.uid}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      if (message.includes('email-already-in-use')) {
        setError('An account with this email already exists.');
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (claimLoading) {
    return (
      <div className="section container" style={{ maxWidth: 640 }}>
        <div className="empty-state">Loading fighter profile...</div>
      </div>
    );
  }

  const isClaim = !!claimFighter;

  return (
    <div className="section container" style={{ maxWidth: 640 }}>
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
            <select className="input" required value={gender} onChange={e => { setGender(e.target.value as 'male' | 'female'); setDivision(''); }} style={{ appearance: 'auto' }} disabled={isClaim}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="auth-field">
            <label className="label">Division *</label>
            <select className="input" required value={division} onChange={e => setDivision(e.target.value)} style={{ appearance: 'auto' }} disabled={isClaim}>
              <option value="">Select division...</option>
              {divisions.map(d => <option key={d.id} value={d.id}>{d.name} — {d.weight}</option>)}
            </select>
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
