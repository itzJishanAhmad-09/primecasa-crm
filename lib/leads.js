import { prisma } from './db';
import { HttpError } from './auth';

export const STAGES = ['New', 'Contacted', 'Interested', 'Site visit', 'Negotiation', 'Booked', 'Lost'];
export const OUTCOMES = ['Connected', 'No answer', 'Busy', 'Callback requested', 'Not interested'];
export const INCLUDE = { owner: true, calls: { include: { agent: true }, orderBy: { createdAt: 'asc' } } };

const IST = 'Asia/Kolkata';
const day = (x) => (x ? x.toISOString().slice(0, 10) : '');
export const toDate = (s) => (s ? new Date(s + 'T00:00:00Z') : null);

/* DB row -> the shape the React modules expect */
export const serialize = (l) => ({
  id: l.id, name: l.name, phone: l.phone, project: l.project || '', budget: l.budget || '',
  source: l.source, stage: l.stage, owner: l.owner?.name || '', ownerId: l.ownerId,
  next: day(l.nextFollowUp), visit: day(l.visitDate), visited: l.visited, notes: l.notes || '',
  created: l.createdAt.toLocaleDateString('en-CA', { timeZone: IST }),
  calls: (l.calls || []).map((c) => ({
    date: c.createdAt.toLocaleDateString('en-CA', { timeZone: IST }),
    time: c.createdAt.toLocaleTimeString('en-GB', { timeZone: IST, hour: '2-digit', minute: '2-digit' }),
    outcome: c.outcome, note: c.note || '', by: c.agent?.name || '',
  })),
});

/* Agents only see their own leads; admins see everything. */
export const scope = (u) => (u.role === 'ADMIN' ? {} : { ownerId: u.id });

export async function findLeadFor(u, id) {
  const lead = await prisma.lead.findFirst({ where: { id: Number(id), ...scope(u) }, include: INCLUDE });
  if (!lead) throw new HttpError(404, 'Lead not found');
  return lead;
}

/* Validate + whitelist fields from a request body. Only fields present are returned. */
export async function leadData(body, u) {
  const d = {};
  const str = (k, max = 300) => { if (body[k] !== undefined) d[k] = String(body[k]).trim().slice(0, max); };
  ['name', 'phone', 'project', 'budget', 'source'].forEach((k) => str(k));
  if (body.notes !== undefined) d.notes = String(body.notes).slice(0, 5000);
  if (body.stage !== undefined) {
    if (!STAGES.includes(body.stage)) throw new HttpError(400, 'Invalid stage');
    d.stage = body.stage;
  }
  if (body.next !== undefined) d.nextFollowUp = toDate(body.next);
  if (body.visit !== undefined) d.visitDate = toDate(body.visit);
  if (body.visited !== undefined) d.visited = !!body.visited;
  if (body.owner !== undefined && u.role === 'ADMIN') {
    const o = body.owner ? await prisma.user.findFirst({ where: { name: body.owner, active: true } }) : null;
    d.ownerId = o ? o.id : null;
  }
  if (d.name === '') throw new HttpError(400, 'Name is required');
  return d;
}
