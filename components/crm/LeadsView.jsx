'use client';
import { useMemo, useState } from 'react';
import { STAGES, fmtDate, today } from '@/lib/crm-store';

export const Due = ({ d }) => (!d ? null : d < today() ? <span className="crm-od">Overdue Â· {fmtDate(d)}</span> : d === today() ? <b>Today</b> : fmtDate(d));
export const StageTag = ({ s }) => <span className={`crm-tag ${s === 'Booked' ? 'g' : s === 'New' || s === 'Lost' ? 'n' : ''}`}>{s}</span>;

export default function LeadsView({ leads, agents, onOpen }) {
  const [q, setQ] = useState(''); const [st, setSt] = useState(''); const [ow, setOw] = useState('');
  
  const [queueMode, setQueueMode] = useState(false);
  const [queueIndex, setQueueIndex] = useState(0);

  const rows = useMemo(() => {
    const s = q.toLowerCase();
    return leads.filter((l) => (!st || l.stage === st) && (!ow || (ow === 'Unassigned' ? !l.owner : l.owner === ow)) &&
      (!s || `${l.name}${l.phone}${l.project}${l.source}`.toLowerCase().includes(s)))
      .sort((a, b) => (b.score || 0) - (a.score || 0)); // Sort by Score (Highest first)
  }, [leads, q, st, ow]);

  const currentLead = rows[queueIndex];

  return (
    <div className="crm-card">
      
      {queueMode && currentLead && (
        <div style={{ background: '#f0f7ff', border: '2px solid #b31b1b', padding: 20, borderRadius: 12, marginBottom: 20 }}>
          <div className="crm-row between">
            <h2 style={{ margin: 0 }}>Calling: {currentLead.name} <span className="crm-mute">({queueIndex + 1} of {rows.length})</span></h2>
            <button className="crm-btn dng" onClick={() => setQueueMode(false)}>Exit Queue</button>
          </div>
          <p style={{ fontSize: '1.1rem', margin: '10px 0' }}>ðŸ“ž {currentLead.phone} Â· Score: {currentLead.score || 0}</p>
          <div className="crm-row">
            <button className="crm-btn pri" onClick={() => onOpen(currentLead.id)}>Open Lead & Call</button>
            <button className="crm-btn" disabled={queueIndex === 0} onClick={() => setQueueIndex(i => i - 1)}>Previous</button>
            <button className="crm-btn" onClick={() => { if (queueIndex < rows.length - 1) setQueueIndex(i => i + 1); else setQueueMode(false); }}>
              {queueIndex === rows.length - 1 ? 'Finish Session' : 'Next Lead'}
            </button>
          </div>
        </div>
      )}

      <div className="crm-row between">
        <div className="crm-row">
          <input type="search" placeholder="Search name, phone or project" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={st} onChange={(e) => setSt(e.target.value)}><option value="">All stages</option>{STAGES.map((s) => <option key={s}>{s}</option>)}</select>
          <select value={ow} onChange={(e) => setOw(e.target.value)}><option value="">All owners</option>{[...agents, 'Unassigned'].map((a) => <option key={a}>{a}</option>)}</select>
        </div>
        {!queueMode && (
          <button className="crm-btn pri" onClick={() => { setQueueMode(true); setQueueIndex(0); }} disabled={rows.length === 0}>
            ðŸš€ Start Calling Queue
          </button>
        )}
      </div>
      
      <div className="crm-tbl">
        <table>
          <thead>
            <tr>
              <th>Score</th> {/* NEW COLUMN */}
              <th>Lead</th>
              <th>Interested in</th>
              <th>Source</th>
              <th>Stage</th>
              <th>Next follow-up</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="click" onClick={() => onOpen(l.id)}>
                <td>
                  <b style={{ color: (l.score || 0) >= 25 ? '#b31b1b' : '#333' }}>
                    {(l.score || 0) >= 25 ? 'ðŸ”¥ ' : ''}{l.score || 0}
                  </b>
                </td>
                <td><b>{l.name}</b><div className="crm-mute">{l.phone}</div></td>
                <td>{l.project}<div className="crm-mute">{l.budget}</div></td>
                <td>{l.source}</td><td><StageTag s={l.stage} /></td><td><Due d={l.next} /></td>
                <td>{l.owner || <span className="crm-mute">Unassigned</span>}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="crm-mute">No leads match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}