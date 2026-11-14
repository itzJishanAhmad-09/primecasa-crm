import { prisma } from '@/lib/db';
import { handle, requireUser } from '@/lib/auth';
import { INCLUDE, serialize, findLeadFor, leadData } from '@/lib/leads';

export const GET = handle(async (_req, { params }) => {
  const u = await requireUser();
  return Response.json(serialize(await findLeadFor(u, (await params).id)));
});

export const PATCH = handle(async (req, { params }) => {
  const u = await requireUser();
  const existing = await findLeadFor(u, (await params).id);
  const body = await req.json();
  const data = await leadData(body, u);
  if (body.visit !== undefined && body.visited === undefined && body.visit !== (existing.visitDate?.toISOString().slice(0, 10) || '')) data.visited = false;
  const lead = await prisma.lead.update({ where: { id: existing.id }, data, include: INCLUDE });
  return Response.json(serialize(lead));
});

export const DELETE = handle(async (_req, { params }) => {
  const u = await requireUser();
  const existing = await findLeadFor(u, (await params).id);
  await prisma.lead.delete({ where: { id: existing.id } });
  return Response.json({ ok: true });
});
