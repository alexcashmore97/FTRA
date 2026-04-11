import { useState, useEffect } from 'react';
import { collection, getDocs, writeBatch, doc, query, where, orderBy, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { DIVISIONS, getDivisionsByGender, getDivisionById, type Division } from '@/lib/divisions';
import { getPendingFighters } from '@/lib/fighters';
import { writeLog, getLogEntries, type LogEntry } from '@/lib/adminLog';
import type { Fighter } from '@/lib/types';
import '@/styles/auth.css';
import '@/styles/admin.css';

type Tab = 'approvals' | 'division' | 'p4p' | 'log';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('approvals');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedDivision, setSelectedDivision] = useState<Division>(DIVISIONS[0]);
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [originalFighters, setOriginalFighters] = useState<Fighter[]>([]);
  const [pendingFighters, setPendingFighters] = useState<Fighter[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const divisions = getDivisionsByGender(gender);
  const adminEmail = user?.email ?? 'unknown';

  useEffect(() => {
    if (tab === 'approvals') loadPending();
    if (tab === 'log') loadLog();
  }, [tab]);

  useEffect(() => {
    if (tab === 'division' || tab === 'p4p') loadFighters();
  }, [selectedDivision.id, tab, gender]);

  useEffect(() => {
    const divs = getDivisionsByGender(gender);
    if (divs.length > 0) setSelectedDivision(divs[0]);
  }, [gender]);

  // ---- Data loading ----

  async function loadPending() {
    setPendingLoading(true);
    try {
      setPendingFighters(await getPendingFighters());
    } catch {
      setMessage('Failed to load pending fighters.');
    } finally {
      setPendingLoading(false);
    }
  }

  async function loadLog() {
    setLogLoading(true);
    try {
      setLogEntries(await getLogEntries(200));
    } catch {
      setMessage('Failed to load log.');
    } finally {
      setLogLoading(false);
    }
  }

  async function loadFighters() {
    setLoading(true);
    setMessage(null);
    try {
      let q;
      if (tab === 'division') {
        q = query(collection(db, 'fighters'), where('division', '==', selectedDivision.id), orderBy('rank', 'asc'));
      } else {
        q = query(collection(db, 'fighters'), where('gender', '==', gender));
      }
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Fighter));

      if (tab === 'p4p') {
        list.sort((a, b) => {
          if (a.p4pRank === null && b.p4pRank === null) return 0;
          if (a.p4pRank === null) return 1;
          if (b.p4pRank === null) return -1;
          return a.p4pRank - b.p4pRank;
        });
      }
      setFighters(list);
      setOriginalFighters(list.map(f => ({ ...f })));
    } catch {
      setMessage('Failed to load fighters.');
    } finally {
      setLoading(false);
    }
  }

  // ---- Approval actions ----

  async function approveFighter(fighter: Fighter) {
    try {
      await updateDoc(doc(db, 'fighters', fighter.id), { status: 'approved' });
      await writeLog('fighter_approved', `${fighter.firstName} ${fighter.lastName} — ${fighter.gym}, ${fighter.state}`, adminEmail);
      setPendingFighters(prev => prev.filter(f => f.id !== fighter.id));
      setMessage(`${fighter.firstName} ${fighter.lastName} approved.`);
    } catch {
      setMessage('Failed to approve fighter.');
    }
  }

  async function rejectFighter(fighter: Fighter) {
    if (!confirm(`Reject and delete ${fighter.firstName} ${fighter.lastName}? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'fighters', fighter.id));
      await writeLog('fighter_rejected', `${fighter.firstName} ${fighter.lastName} — ${fighter.gym}, ${fighter.state}`, adminEmail);
      setPendingFighters(prev => prev.filter(f => f.id !== fighter.id));
      setMessage(`${fighter.firstName} ${fighter.lastName} rejected and removed.`);
    } catch {
      setMessage('Failed to reject fighter.');
    }
  }

  // ---- Ranking edits ----

  function setDivisionRank(fighterId: string, newRank: number | null) {
    setFighters(prev => {
      const updated = prev.map(f => ({ ...f }));
      const target = updated.find(f => f.id === fighterId);
      if (!target) return prev;

      const oldRank = target.rank;
      if (oldRank !== null) {
        updated.forEach(f => { if (f.id !== fighterId && f.rank !== null && f.rank > oldRank) f.rank--; });
      }
      if (newRank !== null) {
        updated.forEach(f => { if (f.id !== fighterId && f.rank !== null && f.rank >= newRank) f.rank++; });
      }
      target.rank = newRank;

      return updated.sort((a, b) => {
        if (a.titleHolder && !b.titleHolder) return -1;
        if (!a.titleHolder && b.titleHolder) return 1;
        if (a.rank === null && b.rank === null) return 0;
        if (a.rank === null) return 1;
        if (b.rank === null) return -1;
        return a.rank - b.rank;
      });
    });
  }

  function setP4PRank(fighterId: string, newRank: number | null) {
    setFighters(prev => {
      const updated = prev.map(f => ({ ...f }));
      const target = updated.find(f => f.id === fighterId);
      if (!target) return prev;

      const oldRank = target.p4pRank;
      if (oldRank !== null) {
        updated.forEach(f => { if (f.id !== fighterId && f.p4pRank !== null && f.p4pRank > oldRank) f.p4pRank--; });
      }
      if (newRank !== null) {
        updated.forEach(f => { if (f.id !== fighterId && f.p4pRank !== null && f.p4pRank >= newRank) f.p4pRank++; });
      }
      target.p4pRank = newRank;

      return updated.sort((a, b) => {
        if (a.p4pRank === null && b.p4pRank === null) return 0;
        if (a.p4pRank === null) return 1;
        if (b.p4pRank === null) return -1;
        return a.p4pRank - b.p4pRank;
      });
    });
  }

  function toggleChampion(fighterId: string) {
    setFighters(prev => prev.map(f => f.id === fighterId ? { ...f, titleHolder: !f.titleHolder } : f));
  }

  // ---- Save with log ----

  async function saveChanges() {
    setSaving(true);
    setMessage(null);
    try {
      const batch = writeBatch(db);
      const logLines: string[] = [];

      for (const f of fighters) {
        const ref = doc(db, 'fighters', f.id);
        const orig = originalFighters.find(o => o.id === f.id);
        const name = `${f.firstName} ${f.lastName}`;

        if (tab === 'division') {
          batch.update(ref, { rank: f.rank, titleHolder: f.titleHolder });

          if (orig && orig.rank !== f.rank) {
            logLines.push(`${name}: rank ${orig.rank ?? 'unranked'} → ${f.rank ?? 'unranked'}`);
          }
          if (orig && orig.titleHolder !== f.titleHolder) {
            logLines.push(`${name}: ${f.titleHolder ? 'set as champion' : 'removed as champion'}`);
          }
        } else {
          batch.update(ref, { p4pRank: f.p4pRank });

          if (orig && orig.p4pRank !== f.p4pRank) {
            logLines.push(`${name}: P4P ${orig.p4pRank ?? 'unranked'} → ${f.p4pRank ?? 'unranked'}`);
          }
        }
      }

      await batch.commit();

      // Write log entries for every change
      if (logLines.length > 0) {
        const context = tab === 'division'
          ? `${selectedDivision.name} ${selectedDivision.weight}`
          : `${gender} P4P`;
        await writeLog(
          'ranking_update',
          `[${context}] ${logLines.join(' | ')}`,
          adminEmail,
        );
      }

      setOriginalFighters(fighters.map(f => ({ ...f })));
      setMessage('Rankings saved successfully.');
    } catch {
      setMessage('Failed to save. Check console for details.');
    } finally {
      setSaving(false);
    }
  }

  // ---- Render ----

  return (
    <div className="section container">
      <div className="section-header">
        <p className="label">Admin Portal</p>
        <h2>Ranking Manager</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Logged in as {user?.email}
          <button className="auth-logout-btn" style={{ marginLeft: 16 }} onClick={logout}>Sign Out</button>
        </p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`gender-tab ${tab === 'approvals' ? 'active' : ''}`} onClick={() => setTab('approvals')}>
          Approvals {pendingFighters.length > 0 && <span className="admin-badge-count">{pendingFighters.length}</span>}
        </button>
        <button className={`gender-tab ${tab === 'division' ? 'active' : ''}`} onClick={() => setTab('division')}>
          Division Rankings
        </button>
        <button className={`gender-tab ${tab === 'p4p' ? 'active' : ''}`} onClick={() => setTab('p4p')}>
          P4P Rankings
        </button>
        <button className={`gender-tab ${tab === 'log' ? 'active' : ''}`} onClick={() => setTab('log')}>
          Log
        </button>
      </div>

      {/* ---- Approvals ---- */}
      {tab === 'approvals' && (
        <div style={{ marginTop: 24 }}>
          {pendingLoading ? (
            <div className="empty-state">Loading pending registrations...</div>
          ) : pendingFighters.length === 0 ? (
            <div className="empty-state">No pending registrations.</div>
          ) : (
            <div className="admin-ranking-list">
              {pendingFighters.map(fighter => {
                const div = getDivisionById(fighter.division);
                return (
                  <div key={fighter.id} className="admin-ranking-row">
                    <div className="admin-fighter-info" style={{ gridColumn: '1 / 3' }}>
                      <span className="admin-fighter-name">{fighter.firstName} {fighter.lastName}</span>
                      <span className="admin-fighter-meta">
                        {fighter.gym}{fighter.state ? `, ${fighter.state}` : ''}
                        {fighter.nationality ? ` — ${fighter.nationality}` : ''}
                        {div ? ` — ${div.name} ${div.weight}` : ''}
                        {fighter.stance ? ` — ${fighter.stance}` : ''}
                        {fighter.record ? ` — ${fighter.record}` : ''}
                      </span>
                    </div>
                    <div className="admin-approval-actions">
                      <button className="admin-approve-btn" onClick={() => approveFighter(fighter)}>Approve</button>
                      <button className="admin-reject-btn" onClick={() => rejectFighter(fighter)}>Reject</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {message && <div className="admin-message" style={{ marginTop: 16 }}>{message}</div>}
        </div>
      )}

      {/* ---- Log ---- */}
      {tab === 'log' && (
        <div style={{ marginTop: 24 }}>
          {logLoading ? (
            <div className="empty-state">Loading log...</div>
          ) : logEntries.length === 0 ? (
            <div className="empty-state">No log entries yet.</div>
          ) : (
            <div className="admin-log">
              {logEntries.map(entry => (
                <div key={entry.id} className="admin-log-entry">
                  <div className="admin-log-header">
                    <span className={`admin-log-action admin-log-action--${entry.action}`}>
                      {formatAction(entry.action)}
                    </span>
                    <span className="admin-log-time">{formatDate(entry.timestamp)}</span>
                    <span className="admin-log-admin">{entry.adminEmail}</span>
                  </div>
                  <div className="admin-log-details">{entry.details}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- Rankings (division / p4p) ---- */}
      {(tab === 'division' || tab === 'p4p') && <>

        <div className="rankings-gender-tabs" style={{ marginTop: 16 }}>
          <button className={`gender-tab ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>Male</button>
          <button className={`gender-tab ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>Female</button>
        </div>

        {tab === 'division' && (
          <div className="admin-division-select">
            <select
              className="input"
              value={selectedDivision.id}
              onChange={e => {
                const div = DIVISIONS.find(d => d.id === e.target.value);
                if (div) setSelectedDivision(div);
              }}
            >
              {divisions.map(d => (
                <option key={d.id} value={d.id}>{d.name} — {d.weight}</option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="empty-state">Loading fighters...</div>
        ) : (
          <div className="admin-ranking-list">
            {fighters.length === 0 && <div className="empty-state">No fighters found.</div>}
            {fighters.map(fighter => (
              <div key={fighter.id} className={`admin-ranking-row ${fighter.titleHolder ? 'champion' : ''}`}>
                <div className="admin-rank-input">
                  {tab === 'division' ? (
                    <input
                      type="number"
                      className="input admin-rank-number"
                      min={1}
                      placeholder={fighter.titleHolder ? 'C' : '—'}
                      value={fighter.rank ?? ''}
                      onChange={e => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                        setDivisionRank(fighter.id, val);
                      }}
                    />
                  ) : (
                    <input
                      type="number"
                      className="input admin-rank-number"
                      min={1}
                      placeholder="—"
                      value={fighter.p4pRank ?? ''}
                      onChange={e => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                        setP4PRank(fighter.id, val);
                      }}
                    />
                  )}
                </div>
                <div className="admin-fighter-info">
                  <span className="admin-fighter-name">{fighter.firstName} {fighter.lastName}</span>
                  <span className="admin-fighter-meta">{fighter.gym}{fighter.state ? `, ${fighter.state}` : ''}</span>
                </div>
                {tab === 'division' && (
                  <button
                    className={`admin-champion-btn ${fighter.titleHolder ? 'active' : ''}`}
                    onClick={() => toggleChampion(fighter.id)}
                  >
                    {fighter.titleHolder ? 'Champion' : 'Set Champ'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {fighters.length > 0 && (
          <div className="admin-save-bar">
            {message && <span className="admin-message">{message}</span>}
            <button className="btn btn-primary" onClick={saveChanges} disabled={saving}>
              {saving ? 'Saving...' : 'Save Rankings'}
            </button>
          </div>
        )}

      </>}
    </div>
  );
}

function formatAction(action: string): string {
  switch (action) {
    case 'ranking_update': return 'Ranking Update';
    case 'fighter_approved': return 'Fighter Approved';
    case 'fighter_rejected': return 'Fighter Rejected';
    default: return action;
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
