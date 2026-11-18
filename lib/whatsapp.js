const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}`;

export async function sendWhatsAppMessage(to, text) {
  const response = await fetch(`${WHATSAPP_API_URL}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: text },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('WhatsApp send error:', error);
    throw new Error('Failed to send WhatsApp message');
  }
  return response.json();
}