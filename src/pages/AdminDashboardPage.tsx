import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, writeBatch, doc, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { DIVISIONS, getDivisionsByGender, getDivisionById, type Division } from '@/lib/divisions';
import { getPendingFighters } from '@/lib/fighters';
import { writeLog, getLogEntries, type LogEntry } from '@/lib/adminLog';
import type { Fighter, DivisionRanking } from '@/lib/types';
import '@/styles/auth.css';
import '@/styles/admin.css';

type Tab = 'approvals' | 'division' | 'p4p' | 'log';

// Rank input with local state — only commits to parent on blur/Enter so that
// mid-typing values don't trigger the auto-compaction logic.
function RankInput({
  value,
  placeholder,
  onCommit,
}: {
  value: number | null;
  placeholder: string;
  onCommit: (v: number | null) => void;
}) {
  const [draft, setDraft] = useState<string>(value?.toString() ?? '');

  // Sync from prop when the source of truth changes externally (e.g. compaction)
  useEffect(() => {
    setDraft(value?.toString() ?? '');
  }, [value]);

  function commit() {
    const parsed = draft === '' ? null : parseInt(draft, 10);
    const committed = Number.isNaN(parsed) ? null : parsed;
    onCommit(committed);
  }

  return (
    <input
      type="number"
      className="input admin-rank-number"
      min={1}
      placeholder={placeholder}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
      }}
    />
  );
}

// Helper to safely read a division ranking from a fighter
function divRanking(fighter: Fighter, divId: string): DivisionRanking {
  return fighter.rankings[divId] ?? { rank: null, titleHolder: '', titleDate: null };
}

// Helper to set a field in a fighter's division ranking (returns new rankings object)
function withDivRanking(fighter: Fighter, divId: string, patch: Partial<DivisionRanking>): Record<string, DivisionRanking> {
  return {
    ...fighter.rankings,
    [divId]: { ...divRanking(fighter, divId), ...patch },
  };
}

// Deep-clone a fighter (shallow clone + clone rankings map)
function cloneFighter(f: Fighter): Fighter {
  return { ...f, rankings: { ...f.rankings } };
}

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

  const [search, setSearch] = useState('');
  const divisions = getDivisionsByGender(gender);
  const adminEmail = user?.email ?? 'unknown';
  const divId = selectedDivision.id;

  useEffect(() => {
    if (tab === 'approvals') loadPending();
    if (tab === 'log') loadLog();
  }, [tab]);

  useEffect(() => {
    setSearch('');
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
    if (fighters.length === 0) setLoading(true);
    setMessage(null);
    try {
      let q;
      if (tab === 'division') {
        q = query(collection(db, 'fighters'), where('divisions', 'array-contains', selectedDivision.id), where('status', '==', 'approved'));
      } else {
        q = query(collection(db, 'fighters'), where('gender', '==', gender), where('status', '==', 'approved'));
      }
      const snap = await getDocs(q);
      const list: Fighter[] = snap.docs.map(d => {
        const data = d.data();
        // Build divisions + rankings from either new or legacy format
        const divs: string[] = Array.isArray(data.divisions)
          ? data.divisions
          : data.division ? [data.division] : [];
        const rankings: Record<string, DivisionRanking> = {};
        if (data.rankings && typeof data.rankings === 'object' && !Array.isArray(data.rankings)) {
          for (const [k, v] of Object.entries(data.rankings as Record<string, Record<string, unknown>>)) {
            rankings[k] = {
              rank: (v.rank as number) ?? null,
              titleHolder: typeof v.titleHolder === 'string' ? v.titleHolder : (v.titleHolder ? 'Champion' : ''),
              titleDate: (v.titleDate as string) ?? null,
            };
          }
        } else if (divs.length > 0) {
          rankings[divs[0]] = {
            rank: (data.rank as number) ?? null,
            titleHolder: typeof data.titleHolder === 'string' ? data.titleHolder : (data.titleHolder ? 'Champion' : ''),
            titleDate: (data.titleDate as string) ?? null,
          };
        }
        return {
          id: d.id,
          firstName: (data.firstName as string) ?? '',
          lastName: (data.lastName as string) ?? '',
          nickname: (data.nickname as string) ?? '',
          gym: (data.gym as string) ?? '',
          state: (data.state as string) ?? '',
          divisions: divs,
          rankings,
          gender: (data.gender as 'male' | 'female') ?? 'male',
          nationality: (data.nationality as string) ?? '',
          p4pRank: (data.p4pRank as number) ?? null,
          bio: (data.bio as string) ?? '',
          photoURL: (data.photoURL as string) ?? '',
          videoURL: (data.videoURL as string) ?? '',
          record: (data.record as string) ?? '',
          age: (data.age as number) ?? null,
          stance: (data.stance as string) ?? '',
          instagram: (data.instagram as string) ?? '',
          email: (data.email as string) ?? '',
          uid: (data.uid as string) ?? null,
          status: (data.status as 'pending' | 'approved') ?? 'approved',
        };
      });

      if (tab === 'division') {
        const did = selectedDivision.id;
        list.sort((a, b) => {
          const aR = divRanking(a, did);
          const bR = divRanking(b, did);
          if (aR.titleHolder && !bR.titleHolder) return -1;
          if (!aR.titleHolder && bR.titleHolder) return 1;
          if (aR.rank === null && bR.rank === null) return 0;
          if (aR.rank === null) return 1;
          if (bR.rank === null) return -1;
          return aR.rank - bR.rank;
        });
      }

      if (tab === 'p4p') {
        list.sort((a, b) => {
          if (a.p4pRank === null && b.p4pRank === null) return 0;
          if (a.p4pRank === null) return 1;
          if (b.p4pRank === null) return -1;
          return a.p4pRank - b.p4pRank;
        });
      }
      setFighters(list);
      setOriginalFighters(list.map(cloneFighter));
    } catch (err) {
      console.error('Load fighters error:', err);
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
      // Apply the new rank to the target fighter
      const withNewRank = prev.map(f => f.id === fighterId
        ? { ...cloneFighter(f), rankings: withDivRanking(f, divId, { rank: newRank }) }
        : f
      );

      // Gather all ranked fighters, sort by rank (ties: edited fighter wins)
      const rankedIds = withNewRank
        .filter(f => divRanking(f, divId).rank !== null)
        .sort((a, b) => {
          const aR = divRanking(a, divId).rank ?? 999;
          const bR = divRanking(b, divId).rank ?? 999;
          if (aR !== bR) return aR - bR;
          if (a.id === fighterId) return -1;
          if (b.id === fighterId) return 1;
          return 0;
        })
        .map(f => f.id);

      // Build map of id → new consecutive rank (1, 2, 3, ...)
      const consecutive = new Map<string, number>();
      rankedIds.forEach((id, i) => consecutive.set(id, i + 1));

      // Apply consecutive ranks — compacts any gaps
      const compacted = withNewRank.map(f => {
        const nr = consecutive.get(f.id);
        if (nr === undefined) return f; // unranked — leave alone
        if (divRanking(f, divId).rank === nr) return f; // no change
        return { ...cloneFighter(f), rankings: withDivRanking(f, divId, { rank: nr }) };
      });

      // Sort the list so rows visually reorder on commit
      return compacted.sort((a, b) => {
        const aR = divRanking(a, divId);
        const bR = divRanking(b, divId);
        if (aR.titleHolder && !bR.titleHolder) return -1;
        if (!aR.titleHolder && bR.titleHolder) return 1;
        if (aR.rank === null && bR.rank === null) return 0;
        if (aR.rank === null) return 1;
        if (bR.rank === null) return -1;
        return aR.rank - bR.rank;
      });
    });
  }

  function setP4PRank(fighterId: string, newRank: number | null) {
    setFighters(prev => {
      const withNewRank = prev.map(f => f.id === fighterId ? { ...f, p4pRank: newRank } : f);

      const rankedIds = withNewRank
        .filter(f => f.p4pRank !== null)
        .sort((a, b) => {
          const aR = a.p4pRank ?? 999;
          const bR = b.p4pRank ?? 999;
          if (aR !== bR) return aR - bR;
          if (a.id === fighterId) return -1;
          if (b.id === fighterId) return 1;
          return 0;
        })
        .map(f => f.id);

      const consecutive = new Map<string, number>();
      rankedIds.forEach((id, i) => consecutive.set(id, i + 1));

      const compacted = withNewRank.map(f => {
        const nr = consecutive.get(f.id);
        if (nr === undefined) return f;
        if (f.p4pRank === nr) return f;
        return { ...f, p4pRank: nr };
      });

      return compacted.sort((a, b) => {
        if (a.p4pRank === null && b.p4pRank === null) return 0;
        if (a.p4pRank === null) return 1;
        if (b.p4pRank === null) return -1;
        return a.p4pRank - b.p4pRank;
      });
    });
  }

  function setChampionTitle(fighterId: string, title: string) {
    setFighters(prev => prev.map(f =>
      f.id === fighterId ? { ...f, rankings: withDivRanking(f, divId, { titleHolder: title }) } : f
    ));
  }

  function setTitleDate(fighterId: string, date: string) {
    setFighters(prev => prev.map(f =>
      f.id === fighterId ? { ...f, rankings: withDivRanking(f, divId, { titleDate: date || null }) } : f
    ));
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
          // Write the full rankings map for this fighter
          batch.update(ref, { rankings: f.rankings });

          const newR = divRanking(f, divId);
          const oldR = orig ? divRanking(orig, divId) : { rank: null, titleHolder: '', titleDate: null };

          if (oldR.rank !== newR.rank) {
            logLines.push(`${name}: rank ${oldR.rank ?? 'unranked'} → ${newR.rank ?? 'unranked'}`);
          }
          if (oldR.titleHolder !== newR.titleHolder) {
            logLines.push(`${name}: ${newR.titleHolder ? `set as ${newR.titleHolder}` : 'title removed'}`);
          }
        } else {
          batch.update(ref, { p4pRank: f.p4pRank });

          if (orig && orig.p4pRank !== f.p4pRank) {
            logLines.push(`${name}: P4P ${orig.p4pRank ?? 'unranked'} → ${f.p4pRank ?? 'unranked'}`);
          }
        }
      }

      await batch.commit();

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

      setOriginalFighters(fighters.map(cloneFighter));
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
                const divNames = fighter.divisions.map(dId => {
                  const d = getDivisionById(dId);
                  return d ? `${d.name} ${d.weight}` : dId;
                }).join(', ');
                return (
                  <div key={fighter.id} className="admin-ranking-row">
                    <div className="admin-fighter-info" style={{ gridColumn: '1 / 3' }}>
                      <span className="admin-fighter-name">{fighter.firstName} {fighter.lastName}</span>
                      <span className="admin-fighter-meta">
                        {fighter.gym}{fighter.state ? `, ${fighter.state}` : ''}
                        {fighter.nationality ? ` — ${fighter.nationality}` : ''}
                        {divNames ? ` — ${divNames}` : ''}
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

        <div className="admin-search" style={{ marginTop: 16 }}>
          <input
            className="input"
            type="text"
            placeholder="Search by name or gym..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="empty-state">Loading fighters...</div>
        ) : (
          <div className="admin-ranking-list">
            {fighters.length === 0 && <div className="empty-state">No fighters found.</div>}
            {fighters.filter(f => {
              if (!search.trim()) return true;
              const s = search.toLowerCase();
              const name = `${f.firstName} ${f.lastName}`.toLowerCase();
              const gym = (f.gym || '').toLowerCase();
              return name.includes(s) || gym.includes(s);
            }).map(fighter => {
              const ranking = divRanking(fighter, divId);
              return (
                <div key={fighter.id} className={`admin-ranking-row ${ranking.titleHolder ? 'champion' : ''}`}>
                  <div className="admin-rank-input">
                    {tab === 'division' ? (
                      <RankInput
                        value={ranking.rank}
                        placeholder={ranking.titleHolder ? 'C' : '—'}
                        onCommit={val => setDivisionRank(fighter.id, val)}
                      />
                    ) : (
                      <RankInput
                        value={fighter.p4pRank}
                        placeholder="—"
                        onCommit={val => setP4PRank(fighter.id, val)}
                      />
                    )}
                  </div>
                  <div className="admin-fighter-info">
                    <Link to={`/fighters/${fighter.id}`} className="admin-fighter-name-link">
                      {fighter.firstName} {fighter.lastName}
                    </Link>
                    <span className="admin-fighter-meta">{fighter.gym}{fighter.state ? `, ${fighter.state}` : ''}</span>
                  </div>
                  <Link to={`/fighter-portal/${fighter.id}`} className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                    Edit
                  </Link>
                  {tab === 'division' && (
                    <div className="admin-title-controls">
                      <select
                        className="input admin-title-select"
                        value={ranking.titleHolder}
                        onChange={e => setChampionTitle(fighter.id, e.target.value)}
                        style={{ appearance: 'auto' }}
                      >
                        <option value="">No Title</option>
                        <option value="WBC World Champion">World Champion</option>
                        <option value="WBC Australian Champion">National Champion</option>
                        <option value={`WBC ${fighter.state} State Champion`}>State Champion ({fighter.state})</option>
                      </select>
                      {ranking.titleHolder && (
                        <input
                          type="date"
                          className="input admin-title-date"
                          value={ranking.titleDate ?? ''}
                          onChange={e => setTitleDate(fighter.id, e.target.value)}
                          title="Date belt was received"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
