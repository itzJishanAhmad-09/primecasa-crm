export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import { handle, requireUser } from '@/lib/auth';
import { INCLUDE, serialize, scope, leadData } from '@/lib/leads';

export const GET = handle(async () => {
  const u = await requireUser();
  const rows = await prisma.lead.findMany({ where: scope(u), include: INCLUDE, orderBy: { createdAt: 'desc' } });
  return Response.json(rows.map(serialize));
});

export const POST = handle(async (req) => {
  const u = await requireUser();
  const data = await leadData(await req.json(), u);
  if (!data.name) return Response.json({ error: 'Name is required' }, { status: 400 });
  if (u.role !== 'ADMIN') data.ownerId = u.id;
  const lead = await prisma.lead.create({ data, include: INCLUDE });
  return Response.json(serialize(lead), { status: 201 });
});

