export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import { handle, HttpError } from '@/lib/auth';

export const POST = handle(async (req) => {
  if (!process.env.CAPTURE_KEY || req.headers.get('x-capture-key') !== process.env.CAPTURE_KEY) throw new HttpError(401, 'Bad key');
  const b = await req.json();
  const name = String(b.name || '').trim(), phone = String(b.phone || '').replace(/\D/g, '').slice(-10);
  if (!name || phone.length < 10) throw new HttpError(400, 'name and a 10-digit phone are required');

  const dup = await prisma.lead.findFirst({ where: { phone } });
  if (dup) return Response.json({ duplicate: true, id: dup.id });

  const agents = await prisma.user.findMany({ where: { role: 'AGENT', active: true }, include: { _count: { select: { leads: true } } } });
  agents.sort((a, b) => a._count.leads - b._count.leads);
  const lead = await prisma.lead.create({ data: {
    name, phone, project: b.project || null, budget: b.budget || null, source: b.source || 'Website', ownerId: agents[0]?.id ?? null,
  } });
  return Response.json({ id: lead.id, assignedTo: agents[0]?.name ?? null }, { status: 201 });
});

