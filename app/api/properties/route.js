import { prisma } from '@/lib/db';
import { handle, requireUser, requireAdmin } from '@/lib/auth';

const out = (p) => ({ id: p.id, n: p.name, t: p.type || '', p: p.priceRange || '', u: p.units });

export const GET = handle(async () => {
  await requireUser();
  return Response.json((await prisma.property.findMany({ orderBy: { id: 'asc' } })).map(out));
});
export const POST = handle(async (req) => {
  await requireAdmin();
  const b = await req.json();
  if (!String(b.n || '').trim()) return Response.json({ error: 'Name is required' }, { status: 400 });
  const p = await prisma.property.create({ data: { name: b.n.trim(), type: b.t || null, priceRange: b.p || null, units: Number(b.u) || 0 } });
  return Response.json(out(p), { status: 201 });
});
