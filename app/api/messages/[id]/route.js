export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import { handle, requireUser } from '@/lib/auth';

export const GET = handle(async (_req, { params }) => {
  await requireUser();
  const { id } = await params;
  const messages = await prisma.message.findMany({
    where: { leadId: Number(id) },
    orderBy: { createdAt: 'asc' },
  });
  return Response.json(messages);
});