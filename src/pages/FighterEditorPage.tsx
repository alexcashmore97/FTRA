import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { getDivisionById } from '@/lib/divisions';
import type { DivisionRanking } from '@/lib/types';
import type { Fighter } from '@/lib/types';
import '@/styles/auth.css';
import '@/styles/fighter-editor.css';

export default function FighterEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { user, role, fighterId, logout } = useAuth();
  const isAdmin = role === 'admin';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [fighter, setFighter] = useState<Fighter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

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
      setVideoPreview(data.videoURL || null);
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

  async function handleVideoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setMessage('Video must be under 50MB.');
      return;
    }

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const validExts = ['mp4', 'mov', 'webm', 'm4v', 'avi'];
    const isVideoByType = file.type.startsWith('video/');
    const isVideoByExt = validExts.includes(ext);
    if (!isVideoByType && !isVideoByExt) {
      setMessage('Please upload a video file (.mp4, .mov, .webm).');
      return;
    }

    setUploadingVideo(true);
    setVideoProgress(0);
    setMessage(null);

    try {
      const uploadUid = isAdmin ? (fighter?.uid || id!) : user!.uid;
      const ext = file.name.split('.').pop() || 'mp4';
      const storageRef = ref(storage, `fighters/${uploadUid}/highlight.${ext}`);

      const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
      await new Promise<void>((resolve, reject) => {
        task.on('state_changed',
          snap => setVideoProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          () => resolve(),
        );
      });
      const url = await getDownloadURL(storageRef);
      setVideoPreview(url);
      await updateDoc(doc(db, 'fighters', id!), { videoURL: url });
      setMessage('Highlight reel uploaded.');
    } catch (err) {
      console.error('Video upload error:', err);
      setMessage('Video upload failed.');
    } finally {
      setUploadingVideo(false);
      setVideoProgress(0);
    }
  }

  async function handleRemoveVideo() {
    if (!confirm('Remove your highlight reel?')) return;
    try {
      // Best-effort delete from storage (url may not match current path)
      if (fighter?.videoURL) {
        try {
          await deleteObject(ref(storage, fighter.videoURL));
        } catch {
          // ignore — file may already be gone or path differs
        }
      }
      await updateDoc(doc(db, 'fighters', id!), { videoURL: '' });
      setVideoPreview(null);
      setMessage('Highlight reel removed.');
    } catch {
      setMessage('Failed to remove video.');
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

          {/* Highlight reel upload */}
          <div className="fighter-editor-video">
            {videoPreview ? (
              <video
                src={videoPreview}
                controls
                muted
                playsInline
                preload="metadata"
                className="fighter-editor-video-preview"
              />
            ) : (
              <div className="fighter-editor-video-empty">
                No highlight reel uploaded
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, fontSize: '0.75rem', padding: '8px 12px' }}
                onClick={() => videoInputRef.current?.click()}
                disabled={uploadingVideo}
              >
                {uploadingVideo ? `Uploading ${videoProgress}%` : (videoPreview ? 'Replace Video' : 'Upload Highlight (max 50MB)')}
              </button>
              {videoPreview && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: '0.75rem', padding: '8px 12px' }}
                  onClick={handleRemoveVideo}
                  disabled={uploadingVideo}
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*,.mov,.mp4,.webm,.m4v"
              style={{ display: 'none' }}
              onChange={handleVideoUpload}
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

          <button type="submit" className="btn btn-primary auth-submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
