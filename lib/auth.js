import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const hashPassword = (p) => bcrypt.hash(p, 10);
export const checkPassword = (p, h) => bcrypt.compare(p, h);
const key = () => new TextEncoder().encode(process.env.JWT_SECRET);

export async function startSession(user) {
  const token = await new SignJWT({ uid: user.id, role: user.role }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(key());
  (await cookies()).set('crm_session', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 });
}
export async function endSession() { (await cookies()).delete('crm_session'); }

export async function currentUser() {
  const c = (await cookies()).get('crm_session');
  if (!c) return null;
  try {
    const { payload } = await jwtVerify(c.value, key());
    const u = await prisma.user.findUnique({ where: { id: payload.uid } });
    return u && u.active ? u : null;
  } catch { return null; }
}
export async function requireUser() {
  const u = await currentUser();
  if (!u) throw new HttpError(401, 'Please sign in');
  return u;
}
export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== 'ADMIN') throw new HttpError(403, 'Admins only');
  return u;
}
/* Wrap every route handler so errors become clean JSON responses. */
export const handle = (fn) => async (req, ctx) => {
  try { return await fn(req, ctx); }
  catch (e) {
    if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
    console.error(e);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
};
