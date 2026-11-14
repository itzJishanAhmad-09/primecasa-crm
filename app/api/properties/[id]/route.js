import { prisma } from '@/lib/db';
import { handle, requireAdmin } from '@/lib/auth';
export const DELETE = handle(async (_req, { params }) => {
  await requireAdmin();
  await prisma.property.delete({ where: { id: Number((await params).id) } });
  return Response.json({ ok: true });
});
