import { serve } from "https://deno.land/std/http/server.ts";

function verifySignature(req: Request, secret: string): boolean {
  const sig = req.headers.get('x-hook-signature') || req.headers.get('x-signature') || req.headers.get('authorization') || '';
  // Expect exact match to secret or prefix whsec_v1=
  return sig === secret || sig === `whsec_v1=${secret}` || sig === `Bearer ${secret}`;
}

serve(async (req) => {
  try {
    const secret = Deno.env.get('SMS_WEBHOOK_SECRET') || '';
    if (!secret || !verifySignature(req, secret)) {
      return new Response(JSON.stringify({ error: 'invalid signature' }), { status: 401 });
    }
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM } = Deno.env.toObject();
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM) {
      return new Response(JSON.stringify({ error: 'missing twilio env' }), { status: 500 });
    }
    const body = await req.json().catch(() => ({}));
    const phone = body.phone as string;
    const message = body.message as string;
    if (!phone || !message) return new Response(JSON.stringify({ error: 'bad request' }), { status: 400 });

    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const params = new URLSearchParams();
    params.set('To', phone);
    params.set('From', TWILIO_FROM);
    params.set('Body', message);

    const twilioResp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    const twilioJson = await twilioResp.json().catch(() => ({}));
    if (!twilioResp.ok) {
      return new Response(JSON.stringify({ error: 'twilio_failed', details: twilioJson }), { status: 502 });
    }
    return new Response(JSON.stringify({ status: 'sent', sid: twilioJson.sid || null }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});


