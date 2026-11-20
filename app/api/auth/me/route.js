export const dynamic = 'force-dynamic';

import { handle, requireUser } from '@/lib/auth';
export const GET = handle(async () => { const u = await requireUser(); return Response.json({ id: u.id, name: u.name, role: u.role }); });

