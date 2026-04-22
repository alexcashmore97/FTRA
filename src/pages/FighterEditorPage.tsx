import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { getDivisionById } from '@/lib/divisions';
import { writeLog } from '@/lib/adminLog';
import type { DivisionRanking } from '@/lib/types';
import type { Fighter } from '@/lib/types';
import '@/styles/auth.css';
import '@/styles/fighter-editor.css';

export default function FighterEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { user, role, fighterId, logout } = useAuth();
  const isAdmin = role === 'admin';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fighter, setFighter] = useState<Fighter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Form fields
  const [nickname, setNickname] = useState('');
  const [gym, setGym] = useState('');
  const [instagram, setInstagram] = useState('');
  const [bio, setBio] = useState('');
  const [stance, setStance] = useState('');
  const [record, setRecord] = useState('');
  const [age, setAge] = useState('');

  // Fighters can only edit their own profile; admins can edit any
  if (!isAdmin && fighterId && id !== fighterId) {
    return <Navigate to={`/fighter-portal/${fighterId}`} replace />;
  }

  useEffect(() => {
    if (!id) return;
    loadFighter();
  }, [id]);

  async function loadFighter() {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'fighters', id!));
      if (!snap.exists()) {
        setMessage('Fighter profile not found.');
        setLoading(false);
        return;
      }
      const data = { id: snap.id, ...snap.data() } as Fighter;
      setFighter(data);
      setNickname(data.nickname || '');
      setGym(data.gym || '');
      setInstagram(data.instagram || '');
      setBio(data.bio || '');
      setStance(data.stance || '');
      setRecord(data.record || '');
      setAge(data.age?.toString() || '');
      setPhotoPreview(data.photoURL || null);
    } catch {
      setMessage('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Photo must be under 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file.');
      return;
    }

    setUploading(true);
    setMessage(null);
    try {
      const uploadUid = isAdmin ? (fighter?.uid || id!) : user!.uid;
      const storageRef = ref(storage, `fighters/${uploadUid}/profile.${file.name.split('.').pop()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhotoPreview(url);

      // Save immediately to Firestore
      await updateDoc(doc(db, 'fighters', id!), { photoURL: url });
      setMessage('Photo uploaded.');
    } catch (err) {
      console.error('Photo upload error:', err);
      setMessage('Photo upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateDoc(doc(db, 'fighters', id!), {
        nickname,
        gym,
        instagram,
        bio,
        stance,
        record,
        age: age ? parseInt(age, 10) : null,
      });
      setMessage('Profile saved.');
    } catch {
      setMessage('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleApproval() {
    if (!fighter || !isAdmin) return;
    const newStatus = fighter.status === 'approved' ? 'pending' : 'approved';
    setToggling(true);
    setMessage(null);
    try {
      await updateDoc(doc(db, 'fighters', id!), { status: newStatus });
      const action = newStatus === 'pending' ? 'fighter_hidden' : 'fighter_approved';
      const detail = `${fighter.firstName} ${fighter.lastName} status set to ${newStatus}`;
      await writeLog(action, detail, user?.email || 'unknown');
      setFighter({ ...fighter, status: newStatus });
      setMessage(newStatus === 'pending' ? 'Fighter hidden from rankings.' : 'Fighter approved and visible.');
    } catch {
      setMessage('Failed to update approval status.');
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return (
      <div className="section container">
        <div className="empty-state">Loading profile...</div>
      </div>
    );
  }

  if (!fighter) {
    return (
      <div className="section container">
        <div className="empty-state">{message || 'Fighter not found.'}</div>
      </div>
    );
  }

  const divisionEntries = (fighter.divisions ?? []).map(dId => ({
    division: getDivisionById(dId),
    ranking: fighter.rankings?.[dId] as DivisionRanking | undefined,
  })).filter(e => e.division);

  return (
    <div className="section container">
      <div className="section-header">
        <p className="label">{isAdmin ? 'Admin' : 'Fighter Portal'}</p>
        <h2>{isAdmin ? `Editing: ${fighter?.firstName} ${fighter?.lastName}` : 'Edit Profile'}</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Logged in as {user?.email}
          <button className="auth-logout-btn" style={{ marginLeft: 16 }} onClick={logout}>
            Sign Out
          </button>
        </p>
      </div>

      <div className="fighter-editor-layout">
        {/* Read-only info card */}
        <div className="fighter-editor-readonly">
          <div className="fighter-editor-photo" onClick={() => fileInputRef.current?.click()}>
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" />
            ) : (
              <div className="fighter-photo-placeholder">
                {fighter.firstName?.[0]}{fighter.lastName?.[0]}
              </div>
            )}
            <div className="fighter-editor-photo-overlay">
              {uploading ? 'Uploading...' : 'Change Photo'}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="fighter-editor-static">
            <h3>{fighter.firstName} {fighter.lastName}</h3>
            {divisionEntries.map(({ division: div, ranking }) => (
              <div key={div!.id} style={{ marginTop: 4 }}>
                <p className="label">{div!.name} — {div!.weight}{ranking?.rank != null ? ` (#${ranking.rank})` : ''}</p>
                {ranking?.titleHolder && <span className="ranking-title-badge" style={{ marginTop: 4 }}>{ranking.titleHolder}</span>}
              </div>
            ))}
            {fighter.p4pRank !== null && <p className="label" style={{ marginTop: 4 }}>P4P: #{fighter.p4pRank}</p>}
          </div>
        </div>

        {/* Editable form */}
        <form className="fighter-editor-form" onSubmit={handleSave}>
          <div className="auth-field">
            <label className="label">Nickname</label>
            <input className="input" value={nickname} onChange={e => setNickname(e.target.value)} placeholder='e.g. "The Storm"' />
          </div>

          <div className="auth-field">
            <label className="label">Gym</label>
            <input className="input" value={gym} onChange={e => setGym(e.target.value)} placeholder="Your gym name" />
          </div>

          <div className="auth-field">
            <label className="label">Instagram</label>
            <input className="input" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@yourhandle" />
          </div>

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

          <div className="auth-field">
            <label className="label">Age</label>
            <input className="input" type="number" min={14} max={60} value={age} onChange={e => setAge(e.target.value)} placeholder="Age" />
          </div>

          <div className="auth-field">
            <label className="label">Bio</label>
            <textarea
              className="input"
              rows={6}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell fans about yourself, your fighting style, your journey..."
              style={{ resize: 'vertical' }}
            />
          </div>

          {message && <div className="admin-message">{message}</div>}

          <div className="fighter-editor-actions">
            <button type="submit" className="btn btn-primary auth-submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            {isAdmin && (
              <button
              style={{marginTop:'10px'}}
                type="button"
                className={`btn btn-small ${fighter.status === 'approved' ? 'btn-hide' : 'btn-approve'}`}
                disabled={toggling}
                onClick={handleToggleApproval}
              >
                {toggling
                  ? '...'
                  : fighter.status === 'approved'
                    ? 'Hide'
                    : 'Approve'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
