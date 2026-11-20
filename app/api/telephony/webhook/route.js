export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';

export async function POST(req) {
  try {
    let body = {};
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const formData = await req.formData();
      body = Object.fromEntries(formData);
    }

    const providerCallId = body.CallSid || body.Sid;
    const recordingUrl = body.RecordingUrl || null;
    const duration = parseInt(body.CallDuration || body.Duration || '0', 10);
    
    if (providerCallId) {
      await prisma.callLog.updateMany({
        where: { providerCallId },
        data: { recordingUrl, duration }
      });
    }
    
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return Response.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
