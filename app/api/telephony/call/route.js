import { prisma } from '@/lib/db';
import { handle, requireUser, HttpError } from '@/lib/auth';

export const POST = handle(async (req) => {
  const user = await requireUser();
  const { leadId } = await req.json();
  
  const lead = await prisma.lead.findUnique({ where: { id: Number(leadId) } });
  if (!lead) throw new HttpError(404, 'Lead not found');
  
  if (!user.telephonyExtension) {
    throw new HttpError(400, 'Please ask your Admin to set your Phone Number (telephonyExtension) in the database before calling.');
  }

  // In production: Replace this mock block with your Exotel or Twilio API call.
  const mockCallId = `call_${Date.now()}_${lead.id}`;
  
  await prisma.callLog.create({
    data: {
      leadId: lead.id,
      agentId: user.id,
      outcome: 'Initiated',
      note: `Calling ${lead.phone} from ${user.telephonyExtension}`,
      providerCallId: mockCallId
    }
  });

  return Response.json({ ok: true, callId: mockCallId, message: 'Call initiated successfully.' });
});