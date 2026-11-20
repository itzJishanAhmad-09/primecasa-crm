export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import { handle, requireUser, requireAdmin, hashPassword, HttpError } from '@/lib/auth';

export const GET = handle(async () => {
  await requireUser();
  const users = await prisma.user.findMany({ where: { active: true }, select: { id: true, name: true, role: true }, orderBy: { name: 'asc' } });
  return Response.json(users);
});
export const POST = handle(async (req) => {
  await requireAdmin();
  const { name, email, password, role } = await req.json();
  if (!name || !email || String(password || '').length < 8) throw new HttpError(400, 'Name, email and an 8+ character password are required');
  if (await prisma.user.findUnique({ where: { email: email.toLowerCase() } })) throw new HttpError(409, 'Email already in use');
  const u = await prisma.user.create({ data: { name, email: email.toLowerCase(), passwordHash: await hashPassword(password), role: role === 'ADMIN' ? 'ADMIN' : 'AGENT' } });
  return Response.json({ id: u.id, name: u.name, role: u.role }, { status: 201 });
});

