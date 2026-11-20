export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('Webhook verified!');
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(req) {
  const body = await req.json();
  const entry = body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];

  if (message?.type === 'text') {
    const from = message.from;
    const text = message.text.body;
    const externalId = message.id;

    // Try to find by matching last 10 digits
    const leads = await prisma.lead.findMany();
    const lead = leads.find(l => l.phone.endsWith(from.slice(-10)));

    if (lead) {
      await prisma.message.create({
        data: {
          leadId: lead.id,
          direction: 'inbound',
          channel: 'whatsapp',
          content: text,
          status: 'received',
          externalId: externalId,
        },
      });
    }
  }
  return NextResponse.json({ status: 'ok' });
}
