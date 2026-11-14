import { prisma } from '@/lib/db';
import { handle, requireUser, HttpError } from '@/lib/auth';
import { INCLUDE, OUTCOMES, serialize, findLeadFor } from '@/lib/leads';

export const POST = handle(async (req, { params }) => {
  const u = await requireUser();
  const lead = await findLeadFor(u, (await params).id);
  const { outcome, note } = await req.json();
  if (!OUTCOMES.includes(outcome)) throw new HttpError(400, 'Invalid outcome');

  const patch = {};
  if (outcome === 'Connected' && lead.stage === 'New') patch.stage = 'Contacted';
  if (outcome === 'Not interested') patch.stage = 'Lost';
  if (outcome === 'Callback requested' && !lead.nextFollowUp) {
    const t = new Date(); t.setUTCDate(t.getUTCDate() + 1); t.setUTCHours(0, 0, 0, 0);
    patch.nextFollowUp = t;
  }
  const updated = await prisma.$transaction(async (tx) => {
    await tx.callLog.create({ data: { leadId: lead.id, agentId: u.id, outcome, note: String(note || '').slice(0, 2000) } });
    return tx.lead.update({ where: { id: lead.id }, data: patch, include: INCLUDE });
  });
  return Response.json(serialize(updated), { status: 201 });
});
