'use client';
import { useMemo, useState } from 'react';
import { OUTCOMES, fmtDate } from '@/lib/crm-store';

export default function Calls({ leads, onOpen }) {
  const [outcome, setOutcome] = useState('');
  const [agent, setAgent] = useState('');

  const allCalls = useMemo(() => {
    const calls = [];
    leads.forEach(l => {
      (l.calls || []).forEach(c => {
        calls.push({ ...c, leadId: l.id, leadName: l.name, phone: l.phone });
      });
    });
    return calls.sort((a,b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [leads]);

  const agents = [...new Set(allCalls.map(c => c.by).filter(Boolean))];
  const filtered = allCalls.filter(c =>
    (!outcome || c.outcome === outcome) && (!agent || c.by === agent)
  );

  return (
    <div className="crm-card">
      <div className="crm-row between">
        <h2>Calls <em>{filtered.length}</em></h2>
        <div className="crm-row">
          <select value={outcome} onChange={e => setOutcome(e.target.value)}>
            <option value="">All outcomes</option>
            {OUTCOMES.map(o => <option key={o}>{o}</option>)}
          </select>
          <select value={agent} onChange={e => setAgent(e.target.value)}>
            <option value="">All agents</option>
            {agents.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>
      <div className="crm-tbl">
        <table>
          <thead>
            <tr><th>When</th><th>Lead</th><th>Outcome</th><th>Agent</th><th>Note</th></tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={i} className="click" onClick={() => onOpen(c.leadId)}>
                <td>{fmtDate(c.date)}<div className="crm-mute">{c.time}</div></td>
                <td><b>{c.leadName}</b><div className="crm-mute">{c.phone}</div></td>
                <td>
                  <span className={`crm-tag ${c.outcome === 'Connected' ? 'g' : c.outcome === 'Not interested' ? 'n' : ''}`}>
                    {c.outcome}
                  </span>
                </td>
                <td>{c.by || '-'}</td>
                <td className="crm-mute">{c.note || '-'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="crm-mute">No calls yet. Log a call from any lead to see it here.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}