import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import admin from './firebaseAdmin.js';
import { TELEMETRY_INGEST_TOKEN } from './config.js';

export const ingestTelemetry = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok:false, error:'Use POST' });
  const token = req.header('x-api-key') ?? '';
  if (!TELEMETRY_INGEST_TOKEN || token !== TELEMETRY_INGEST_TOKEN) {
    return res.status(401).json({ ok:false, error:'unauthorized' });
  }
  try {
    const b = req.body ?? {};
    if (!b.communityId || !b.ts) return res.status(400).json({ ok:false, error:'communityId and ts required' });
    await admin.firestore().collection('telemetry').add({
      communityId: b.communityId, ts: b.ts,
      voltage: b.voltage, frequency: b.frequency, uptime: b.uptime, kWh: b.kWh,
      source: b.source ?? 'manual', deviceId: b.deviceId ?? null
    });
    return res.json({ ok:true });
  } catch (e:any) { logger.error(e); return res.status(500).json({ ok:false }); }
});
