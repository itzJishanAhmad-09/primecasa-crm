'use client';
import { useCallback, useEffect, useState } from 'react';
import { stats } from './crm-store';

async function api(url, method = 'GET', body) {
  const r = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  if (r.status === 401 && typeof window !== 'undefined') { window.location.href = '/login'; throw new Error('Signed out'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { alert(j.error || 'Something went wrong'); throw new Error(j.error); }
  return j;
}

export function useCRM() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [me, setMe] = useState(null);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    const [m, l, u, p] = await Promise.all([api('/api/auth/me'), api('/api/leads'), api('/api/agents'), api('/api/properties')]);
    setMe(m); setLeads(l); setUsers(u); setProperties(p); setReady(true);
  }, []);
  useEffect(() => { reload().catch(() => {}); }, [reload]);

  const swap = (l) => setLeads((a) => a.map((x) => (x.id === l.id ? l : x)));
  return {
    ready, me, leads, properties, users, agents: users.map((u) => u.name), stats: stats(leads),
    addLead: async (f) => { const l = await api('/api/leads', 'POST', f); setLeads((a) => [l, ...a]); },
    updateLead: async (id, f) => swap(await api(`/api/leads/${id}`, 'PATCH', f)),
    deleteLead: async (id) => { await api(`/api/leads/${id}`, 'DELETE'); setLeads((a) => a.filter((x) => x.id !== id)); },
    logCall: async (id, c) => swap(await api(`/api/leads/${id}/calls`, 'POST', c)),
    completeFollowUp: async (id) => swap(await api(`/api/leads/${id}`, 'PATCH', { next: '' })),
    markVisited: async (id) => swap(await api(`/api/leads/${id}`, 'PATCH', { visited: true })),
    importLeads: async (text) => { await api('/api/leads/import', 'POST', { text }); await reload(); },
    addAgent: async (a) => { await api('/api/agents', 'POST', a); setUsers(await api('/api/agents')); },
    addProperty: async (p) => { const r = await api('/api/properties', 'POST', p); setProperties((a) => [...a, r]); },
    removeProperty: async (i) => { const p = properties[i]; await api(`/api/properties/${p.id}`, 'DELETE'); setProperties((a) => a.filter((x) => x.id !== p.id)); },
    sendMessage: async (leadId, text) => { const m = await api('/api/whatsapp/send', 'POST', { leadId, text }); return m; },
    logout: async () => { await api('/api/auth/logout', 'POST'); window.location.href = '/login'; },
  };
}