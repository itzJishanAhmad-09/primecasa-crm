'use client';
import { useMemo, useState } from 'react';
import { STAGES, fmtDate, today } from '@/lib/crm-store';

export const Due = ({ d }) => (!d ? null : d < today() ? <span className="crm-od">Overdue · {fmtDate(d)}</span> : d === today() ? <b>Today</b> : fmtDate(d));
export const StageTag = ({ s }) => <span className={`crm-tag ${s === 'Booked' ? 'g' : s === 'New' || s === 'Lost' ? 'n' : ''}`}>{s}</span>;

export default function LeadsView({ leads, agents, onOpen }) {
  const [q, setQ] = useState(''); const [st, setSt] = useState(''); const [ow, setOw] = useState('');
  const rows = useMemo(() => {
    const s = q.toLowerCase();
    return leads.filter((l) => (!st || l.stage === st) && (!ow || (ow === 'Unassigned' ? !l.owner : l.owner === ow)) &&
      (!s || `${l.name}${l.phone}${l.project}${l.source}`.toLowerCase().includes(s)));
  }, [leads, q, st, ow]);

  return (
    <div className="crm-card">
      <div className="crm-row">
        <input type="search" placeholder="Search name, phone or project" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={st} onChange={(e) => setSt(e.target.value)}><option value="">All stages</option>{STAGES.map((s) => <option key={s}>{s}</option>)}</select>
        <select value={ow} onChange={(e) => setOw(e.target.value)}><option value="">All owners</option>{[...agents, 'Unassigned'].map((a) => <option key={a}>{a}</option>)}</select>
      </div>
      <div className="crm-tbl">
        <table>
          <thead><tr><th>Lead</th><th>Interested in</th><th>Source</th><th>Stage</th><th>Next follow-up</th><th>Owner</th></tr></thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="click" onClick={() => onOpen(l.id)}>
                <td><b>{l.name}</b><div className="crm-mute">{l.phone}</div></td>
                <td>{l.project}<div className="crm-mute">{l.budget}</div></td>
                <td>{l.source}</td><td><StageTag s={l.stage} /></td><td><Due d={l.next} /></td>
                <td>{l.owner || <span className="crm-mute">Unassigned</span>}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="crm-mute">No leads match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
