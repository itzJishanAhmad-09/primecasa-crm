function Write-File {
  param([string]$Path, [string]$Content)
  $full = Join-Path $PSScriptRoot $Path
  $dir  = Split-Path $full -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $existed = Test-Path $full
  [System.IO.File]::WriteAllText($full, $Content, (New-Object System.Text.UTF8Encoding($false)))
  $size = (Get-Item $full).Length
  $action = if ($existed) { "updated" } else { "created" }
  Write-Host ("  {0,-12} {1,-45} {2} bytes" -f $action, $Path, $size) -ForegroundColor Green
}

Write-Host "Creating 5 screen files..." -ForegroundColor Cyan
Write-Host ""

Write-File "components\crm\SiteVisits.jsx" @'
'use client';
import { today, addDays } from '@/lib/crm-store';
import { Due, StageTag } from './LeadsView';

export default function SiteVisits({ leads, onOpen, onMarkVisited }) {
  const t = today(), wk = addDays(7);
  const wv = leads.filter(l => l.visit);
  const pending = wv.filter(l => !l.visited);
  const done = wv.filter(l => l.visited).sort((a,b) => b.visit.localeCompare(a.visit)).slice(0,20);
  const group = (test) => pending.filter(l => test(l.visit)).sort((a,b) => a.visit.localeCompare(b.visit));

  const Row = ({ l }) => (
    <div className="crm-task">
      <div>
        <b>{l.name}</b> <StageTag s={l.stage} />
        <div className="crm-mute">{l.phone} | {l.project || 'No project'} | {l.owner || 'Unassigned'}</div>
      </div>
      <Due d={l.visit} />
      <a className="crm-btn sm" href={`tel:${l.phone}`}>Call</a>
      <button className="crm-btn sm" onClick={() => onOpen(l.id)}>Open</button>
      {!l.visited && <button className="crm-btn sm" onClick={() => onMarkVisited(l.id)}>Mark visited</button>}
    </div>
  );

  const Section = ({ title, items }) => (
    <div className="crm-card">
      <h2>{title} <em>{items.length}</em></h2>
      {items.length === 0 && <p className="crm-mute">Nothing here.</p>}
      {items.map(l => <Row key={l.id} l={l} />)}
    </div>
  );

  return (
    <>
      <Section title="Overdue" items={group(d => d < t)} />
      <Section title="Today" items={group(d => d === t)} />
      <Section title="Next 7 days" items={group(d => d > t && d <= wk)} />
      <Section title="Later" items={group(d => d > wk)} />
      {done.length > 0 && <Section title="Recently visited" items={done} />}
    </>
  );
}
'@

Write-File "components\crm\Bookings.jsx" @'
'use client';
import { fmtDate } from '@/lib/crm-store';

export default function Bookings({ leads, onOpen }) {
  const booked = leads.filter(l => l.stage === 'Booked').sort((a,b) => (b.created || '').localeCompare(a.created || ''));

  function exportCsv() {
    const rows = [['Name','Phone','Project','Budget','Owner','Created','Notes']];
    booked.forEach(l => rows.push([l.name, l.phone, l.project, l.budget, l.owner, l.created, l.notes]));
    const csv = rows.map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="crm-card">
      <div className="crm-row between">
        <h2>Bookings <em>{booked.length}</em></h2>
        <button className="crm-btn" onClick={exportCsv} disabled={booked.length === 0}>Export CSV</button>
      </div>
      <div className="crm-tbl">
        <table>
          <thead>
            <tr><th>Customer</th><th>Project</th><th>Budget</th><th>Owner</th><th>Booked on</th></tr>
          </thead>
          <tbody>
            {booked.map(l => (
              <tr key={l.id} className="click" onClick={() => onOpen(l.id)}>
                <td><b>{l.name}</b><div className="crm-mute">{l.phone}</div></td>
                <td>{l.project || '-'}</td>
                <td>{l.budget || '-'}</td>
                <td>{l.owner || 'Unassigned'}</td>
                <td>{fmtDate(l.created)}</td>
              </tr>
            ))}
            {booked.length === 0 && (
              <tr><td colSpan={5} className="crm-mute">No bookings yet. Move a lead to "Booked" stage to see it here.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
'@

Write-File "components\crm\Calls.jsx" @'
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
'@

Write-File "components\crm\Settings.jsx" @'
'use client';
import { useState } from 'react';

export default function Settings({ properties, users, onAddProperty, onRemoveProperty, onAddAgent }) {
  const [prop, setProp] = useState({ n: '', t: '', p: '', u: '' });
  const [agent, setAgent] = useState({ name: '', email: '', password: '', role: 'AGENT' });
  const [err, setErr] = useState('');

  async function addProp(e) {
    e.preventDefault(); setErr('');
    try { await onAddProperty(prop); setProp({ n: '', t: '', p: '', u: '' }); }
    catch (e) { setErr(e.message || 'Failed to add project'); }
  }

  async function addAgent(e) {
    e.preventDefault(); setErr('');
    try { await onAddAgent(agent); setAgent({ name: '', email: '', password: '', role: 'AGENT' }); }
    catch (e) { setErr(e.message || 'Failed to add user'); }
  }

  return (
    <div>
      {err && <div className="crm-card" style={{ color: '#c8102e' }}>{err}</div>}

      <div className="crm-card">
        <h2>Projects <em>{properties.length}</em></h2>
        <div className="crm-tbl">
          <table>
            <thead><tr><th>Name</th><th>Type</th><th>Price</th><th>Units</th><th></th></tr></thead>
            <tbody>
              {properties.map((p, i) => (
                <tr key={p.id}>
                  <td>{p.n}</td><td>{p.t}</td><td>{p.p}</td><td>{p.u}</td>
                  <td>
                    <button className="crm-btn sm dng" onClick={() => { if (confirm(`Delete "${p.n}"?`)) onRemoveProperty(i); }}>Delete</button>
                  </td>
                </tr>
              ))}
              {properties.length === 0 && <tr><td colSpan={5} className="crm-mute">No projects yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <form onSubmit={addProp} className="crm-row" style={{ marginTop: 12 }}>
          <input placeholder="Name" value={prop.n} onChange={e => setProp({ ...prop, n: e.target.value })} required />
          <input placeholder="Type (e.g. 2 and 3 BHK)" value={prop.t} onChange={e => setProp({ ...prop, t: e.target.value })} />
          <input placeholder="Price (e.g. 55L-95L)" value={prop.p} onChange={e => setProp({ ...prop, p: e.target.value })} />
          <input type="number" placeholder="Units" value={prop.u} onChange={e => setProp({ ...prop, u: e.target.value })} style={{ width: 90 }} />
          <button className="crm-btn pri" type="submit">Add project</button>
        </form>
      </div>

      <div className="crm-card">
        <h2>Users <em>{users.length}</em></h2>
        <div className="crm-tbl">
          <table>
            <thead><tr><th>Name</th><th>Role</th></tr></thead>
            <tbody>
              {users.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.role}</td></tr>)}
              {users.length === 0 && <tr><td colSpan={2} className="crm-mute">No users yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <form onSubmit={addAgent} className="crm-row" style={{ marginTop: 12 }}>
          <input placeholder="Name" value={agent.name} onChange={e => setAgent({ ...agent, name: e.target.value })} required />
          <input type="email" placeholder="Email" value={agent.email} onChange={e => setAgent({ ...agent, email: e.target.value })} required />
          <input type="password" placeholder="Password (8+)" value={agent.password} onChange={e => setAgent({ ...agent, password: e.target.value })} required minLength={8} />
          <select value={agent.role} onChange={e => setAgent({ ...agent, role: e.target.value })}>
            <option value="AGENT">Agent</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="crm-btn pri" type="submit">Add user</button>
        </form>
      </div>
    </div>
  );
}
'@

Write-File "app\crm\page.jsx" @'
'use client';
import { useState } from 'react';
import { useCRM } from '@/lib/crm-api-store';
import Dashboard from '@/components/crm/Dashboard';
import LeadsView from '@/components/crm/LeadsView';
import FollowUps from '@/components/crm/FollowUps';
import LeadDialog from '@/components/crm/LeadDialog';
import Settings from '@/components/crm/Settings';
import SiteVisits from '@/components/crm/SiteVisits';
import Bookings from '@/components/crm/Bookings';
import Calls from '@/components/crm/Calls';
import './crm.css';

const TABS = ['Dashboard', 'Leads', 'Follow-ups', 'Visits', 'Bookings', 'Calls', 'Settings'];

export default function CRMPage() {
  const crm = useCRM();
  const [tab, setTab] = useState('Dashboard');
  const [openId, setOpenId] = useState(null);
  if (!crm.ready) return <p style={{ padding: 24 }}>Loading...</p>;

  const lead = openId ? crm.leads.find(l => l.id === openId) : null;

  return (
    <div className="crm">
      <div className="crm-row between">
        <nav className="crm-row">
          {TABS.map(t => (
            <button key={t} className={`crm-btn ${tab === t ? 'pri' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </nav>
        <div className="crm-row">
          {crm.me && <span className="crm-mute">{crm.me.name} ({crm.me.role})</span>}
          <button className="crm-btn" onClick={crm.logout}>Logout</button>
          <button className="crm-btn pri" onClick={() => setOpenId(0)}>Add lead</button>
        </div>
      </div>

      {tab === 'Dashboard' && <Dashboard stats={crm.stats} />}
      {tab === 'Leads' && <LeadsView leads={crm.leads} agents={crm.agents} onOpen={setOpenId} />}
      {tab === 'Follow-ups' && <FollowUps leads={crm.leads} onOpen={setOpenId} onDone={crm.completeFollowUp} />}
      {tab === 'Visits' && <SiteVisits leads={crm.leads} onOpen={setOpenId} onMarkVisited={crm.markVisited} />}
      {tab === 'Bookings' && <Bookings leads={crm.leads} onOpen={setOpenId} />}
      {tab === 'Calls' && <Calls leads={crm.leads} onOpen={setOpenId} />}
      {tab === 'Settings' && (
        <Settings
          properties={crm.properties}
          users={crm.users}
          onAddProperty={crm.addProperty}
          onRemoveProperty={crm.removeProperty}
          onAddAgent={crm.addAgent}
        />
      )}

      {openId !== null && (
        <LeadDialog
          key={openId}
          lead={lead}
          agents={crm.agents}
          properties={crm.properties}
          onSave={f => (lead ? crm.updateLead(lead.id, f) : crm.addLead(f))}
          onDelete={crm.deleteLead}
          onLogCall={crm.logCall}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
'@

Write-Host ""
Write-Host "All 5 files done." -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: reload http://localhost:3002/crm" -ForegroundColor Yellow
