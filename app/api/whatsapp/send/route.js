import { handle, requireUser, HttpError } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export const POST = handle(async (req) => {
  await requireUser();
  const { leadId, text } = await req.json();

  const lead = await prisma.lead.findUnique({ where: { id: Number(leadId) } });
  if (!lead || !lead.phone) throw new HttpError(400, 'Lead not found or has no phone number');

  const result = await sendWhatsAppMessage(lead.phone, text);

  const message = await prisma.message.create({
    data: {
      leadId: lead.id,
      direction: 'outbound',
      channel: 'whatsapp',
      content: text,
      status: 'sent',
      externalId: result.messages?.[0]?.id,
    },
  });

  return Response.json(message);
});