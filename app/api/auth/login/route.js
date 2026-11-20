export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import { handle, HttpError, checkPassword, startSession } from '@/lib/auth';

export const POST = handle(async (req) => {
  const { email, password } = await req.json();
  const u = await prisma.user.findUnique({ where: { email: String(email || '').toLowerCase().trim() } });
  if (!u || !u.active || !(await checkPassword(String(password || ''), u.passwordHash))) throw new HttpError(401, 'Wrong email or password');
  await startSession(u);
  return Response.json({ name: u.name, role: u.role });
});

