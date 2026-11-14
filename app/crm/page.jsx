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