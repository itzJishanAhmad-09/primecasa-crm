export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import { handle, requireUser } from '@/lib/auth';

export const POST = handle(async (req) => {
  const u = await requireUser();
  const { text } = await req.json();
  const data = String(text || '').split('\n').map((r) => r.split(',').map((s) => s.trim())).filter((p) => p[0]).slice(0, 2000)
    .map((p) => ({ name: p[0], phone: p[1] || '', project: p[2] || null, source: p[3] || 'Website', ownerId: u.role === 'ADMIN' ? null : u.id }));
  const r = await prisma.lead.createMany({ data, skipDuplicates: true });
  return Response.json({ imported: r.count });
});

