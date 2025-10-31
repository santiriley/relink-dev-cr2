import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from './firebaseAdmin.js';
import { WHATSAPP_VERIFY_TOKEN, REPORT_SALT } from './config.js';
import { parseWhatsAppText } from './whatsappParser.js';
import { createHash } from 'crypto';

function extractWA(req: any) {
  const w = req?.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const text = w?.text?.body ?? req?.body?.text ?? req?.body?.message ?? '';
  const from = w?.from ?? req?.body?.from ?? null;
  return { text, from };
}

export const whatsappWebhook = onRequest({ cors: true, secrets: [WHATSAPP_VERIFY_TOKEN, REPORT_SALT] }, async (req, res) => {
  if (req.method === 'GET') {
    const verify = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (verify === WHATSAPP_VERIFY_TOKEN.value()) { res.status(200).send(challenge as any); return; }
    res.status(403).send('forbidden'); return;
  }

  if (req.method === 'POST') {
    try {
      const { text, from } = extractWA(req);
      const parsed = parseWhatsAppText(text);
      if (!parsed) { res.json({ ok: true, ignored: true }); return; }

      const salt = REPORT_SALT.value() || 'salt';
      const reporterHash = createHash('sha256').update(`${salt}:${from ?? 'anonymous'}`).digest('hex');

      await db.collection('reports').add({
        communityId: parsed.communityId,
        type: parsed.type,
        tsStart: parsed.tsStart,
        tsEnd: parsed.type !== 'voltage_dip' ? (parsed.tsEnd ?? null) : null,
        notes: parsed.notes ?? null,
        reporterHash,
        confidence: parsed.confidence,
        source: 'whatsapp'
      });

      res.json({ ok: true }); return;
    } catch (e) {
      logger.error('whatsappWebhook error', e);
      res.json({ ok: true }); return;
    }
  }

  res.status(200).send('ok');
});
