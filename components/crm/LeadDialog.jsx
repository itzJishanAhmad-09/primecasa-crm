'use client';
import { useEffect, useRef, useState } from 'react';
import { STAGES, SOURCES, OUTCOMES, fmtDate } from '@/lib/crm-store';
import Softphone from './Softphone';

const BLANK = { name: '', phone: '', project: '', budget: '', source: 'Facebook', stage: 'New', owner: '', next: '', visit: '', notes: '' };

export default function LeadDialog({ lead, agents, properties, onSave, onDelete, onLogCall, onClose }) {
  const ref = useRef(null);
  const [f, setF] = useState(lead ?? BLANK);
  const [call, setCall] = useState({ outcome: 'Connected', note: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => { ref.current?.showModal(); }, []);
  useEffect(() => { if (lead) setF(lead); }, [lead?.id]);

  const field = (label, k, props = {}) => (
    <label className="crm-f">{label}<input value={f[k] ?? ''} onChange={set(k)} {...props} /></label>
  );
  const select = (label, k, list, blank) => (
    <label className="crm-f">{label}
      <select value={f[k] ?? ''} onChange={set(k)}>
        {blank && <option value="">{blank}</option>}
        {list.map((x) => <option key={x}>{x}</option>)}
      </select>
    </label>
  );

  return (
    <dialog ref={ref} className="crm-dialog" onClose={onClose}>
      <div className="crm-row between">
        <h2>{lead ? lead.name : 'New lead'}</h2>
        <button className="crm-btn sm" onClick={() => ref.current.close()}>Close</button>
      </div>
      {lead && (
        <div className="crm-row">
          <Softphone phone={lead.phone} onCallEnded={() => alert('Call ended. Please log the outcome below.')} />
          <a className="crm-btn sm" target="_blank" rel="noopener noreferrer" href={`https://wa.me/91${lead.phone}`}>WhatsApp</a>
        </div>
      )}
      <div className="crm-grid">
        {field('Name', 'name')}
        {field('Phone', 'phone', { inputMode: 'tel' })}
        {select('Project', 'project', properties.map((p) => p.n), 'Select project')}
        {field('Budget', 'budget', { placeholder: 'e.g. 75 L' })}
        {select('Source', 'source', SOURCES)}
        {select('Stage', 'stage', STAGES)}
        {select('Owner', 'owner', agents, 'Unassigned')}
        {field('Next follow-up', 'next', { type: 'date' })}
        {field('Site visit date', 'visit', { type: 'date' })}
        <label className="crm-f wide">Notes<textarea value={f.notes ?? ''} onChange={set('notes')} /></label>
      </div>
      <div className="crm-row">
        <button className="crm-btn pri" disabled={!f.name.trim()} onClick={() => { onSave(f); ref.current.close(); }}>
          {lead ? 'Save changes' : 'Add lead'}
        </button>
        {lead && <button className="crm-btn dng" onClick={() => { if (confirm('Delete this lead?')) { onDelete(lead.id); ref.current.close(); } }}>Delete lead</button>}
      </div>

      {lead && (
        <>
          <h3>Call log</h3>
          <div className="crm-row">
            <select value={call.outcome} onChange={(e) => setCall({ ...call, outcome: e.target.value })}>{OUTCOMES.map((o) => <option key={o}>{o}</option>)}</select>
            <input style={{ flex: 1, minWidth: 140 }} placeholder="What was discussed?" value={call.note} onChange={(e) => setCall({ ...call, note: e.target.value })} />
            <button className="crm-btn" onClick={() => { onLogCall(lead.id, call); setCall({ outcome: 'Connected', note: '' }); }}>Log call</button>
          </div>
          {lead.calls.length === 0 && <p className="crm-mute">No calls logged yet.</p>}
          {[...lead.calls].reverse().map((c, i) => (
            <div className="crm-log" key={i}><b>{c.outcome}</b> Â· {fmtDate(c.date)} {c.time} Â· {c.by}<div className="crm-mute">{c.note}</div></div>
          ))}
        </>
      )}
    </dialog>
  );
}