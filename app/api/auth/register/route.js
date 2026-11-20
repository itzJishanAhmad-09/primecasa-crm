export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import { handle, HttpError, hashPassword, startSession } from '@/lib/auth';

export const POST = handle(async (req) => {
  const { name, email, password, companyName, phone, teamSize } = await req.json();
  
  if (!name || !email || String(password || '').length < 8) {
    throw new HttpError(400, 'Name, email and an 8+ character password are required');
  }
  
  if (await prisma.user.findUnique({ where: { email: email.toLowerCase() } })) {
    throw new HttpError(409, 'Email already in use');
  }

  const u = await prisma.user.create({ 
    data: { 
      name, 
      email: email.toLowerCase(), 
      passwordHash: await hashPassword(password), 
      role: 'ADMIN',
      companyName: companyName || null,
      phone: phone || null,
      teamSize: teamSize || null
    } 
  });
  
  await startSession(u);
  return Response.json({ name: u.name, role: u.role }, { status: 201 });
});
