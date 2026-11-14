'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export const STAGES = ['New', 'Contacted', 'Interested', 'Site visit', 'Negotiation', 'Booked', 'Lost'];
export const SOURCES = ['Facebook', 'Google Ads', '99acres', 'MagicBricks', 'Website', 'Referral', 'Walk-in'];
export const OUTCOMES = ['Connected', 'No answer', 'Busy', 'Callback requested', 'Not interested'];

const pad = (n) => String(n).padStart(2, '0');
export const iso = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
export const today = () => iso();
export const fmtDate = (s) => (s ? new Date(s + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '–');

/* ---------- Storage adapter ----------
   Default: browser localStorage. To use your database, replace load/save with
   fetch('/api/crm') and fetch('/api/crm', { method: 'PUT', body }) calls. */
const KEY = 'primecasa_crm_v1';
export const storage = {
  async load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } },
  async save(data) { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} },
};

const EMPTY = { leads: [], agents: ['Neha', 'Amit'], properties: [], nextId: 1 };

export function stats(leads) {
  const t = today();
  const hot = leads.filter((l) => ['Interested', 'Site visit', 'Negotiation'].includes(l.stage)).length;
  return {
    total: leads.length,
    newToday: leads.filter((l) => l.created === t).length,
    callsToday: leads.reduce((n, l) => n + l.calls.filter((c) => c.date === t).length, 0),
    visitsWeek: leads.filter((l) => l.visit && l.visit >= t && l.visit <= addDays(7)).length,
    booked: leads.filter((l) => l.stage === 'Booked').length,
    hot,
    pipeline: STAGES.map((s) => [s, leads.filter((l) => l.stage === s).length]),
  };
}

export function useCRM() {
  const [data, setData] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const skip = useRef(true);

  useEffect(() => { storage.load().then((d) => { if (d?.leads) setData(d); setReady(true); }); }, []);
  useEffect(() => { if (!ready) return; if (skip.current) { skip.current = false; return; } storage.save(data); }, [data, ready]);

  const patch = useCallback((fn) => setData((d) => fn(d)), []);
  const mapLead = (id, fn) => patch((d) => ({ ...d, leads: d.leads.map((l) => (l.id === id ? fn(l) : l)) }));

  const actions = {
    addLead: (lead) => patch((d) => ({
      ...d, nextId: d.nextId + 1,
      leads: [{ stage: 'New', source: 'Website', owner: '', next: '', visit: '', visited: false, notes: '', calls: [], ...lead, id: d.nextId, created: today() }, ...d.leads],
    })),
    updateLead: (id, p) => mapLead(id, (l) => ({ ...l, ...p, visited: p.visit !== undefined && p.visit !== l.visit ? false : l.visited })),
    deleteLead: (id) => patch((d) => ({ ...d, leads: d.leads.filter((l) => l.id !== id) })),
    logCall: (id, { outcome, note }) => mapLead(id, (l) => {
      const now = new Date();
      const call = { date: today(), time: `${pad(now.getHours())}:${pad(now.getMinutes())}`, outcome, note, by: l.owner };
      let { stage, next } = l;
      if (outcome === 'Connected' && stage === 'New') stage = 'Contacted';
      if (outcome === 'Not interested') stage = 'Lost';
      if (outcome === 'Callback requested' && !next) next = addDays(1);
      return { ...l, stage, next, calls: [...l.calls, call] };
    }),
    completeFollowUp: (id) => mapLead(id, (l) => ({ ...l, next: '' })),
    markVisited: (id) => mapLead(id, (l) => ({ ...l, visited: true })),
    importLeads: (text) => patch((d) => {
      let nid = d.nextId;
      const added = text.split('\n').map((r) => r.split(',').map((s) => s.trim())).filter((p) => p[0]).map((p) => ({
        id: nid++, name: p[0], phone: p[1] || '', project: p[2] || '', budget: '',
        source: SOURCES.includes(p[3]) ? p[3] : 'Website', stage: 'New', owner: '', created: today(), next: '', visit: '', visited: false, notes: '', calls: [],
      }));
      return { ...d, nextId: nid, leads: [...added, ...d.leads] };
    }),
    addAgent: (name) => patch((d) => (name && !d.agents.includes(name) ? { ...d, agents: [...d.agents, name] } : d)),
    addProperty: (p) => patch((d) => ({ ...d, properties: [...d.properties, p] })),
    removeProperty: (i) => patch((d) => ({ ...d, properties: d.properties.filter((_, x) => x !== i) })),
  };

  return { ready, ...data, stats: stats(data.leads), ...actions };
}
