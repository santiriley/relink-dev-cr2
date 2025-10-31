import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from './firebaseAdmin.js';
import { TELEMETRY_INGEST_TOKEN } from './config.js';

function toISO(ts: any): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) throw new Error('invalid_ts');
  return d.toISOString();
}
function num(x: any): number | undefined {
  const n = typeof x === 'string' ? Number(x) : x;
  return Number.isFinite(n) ? n : undefined;
}
function scrub<T extends Record<string, any>>(obj: T) {
  // remove undefined & NaN
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && !(typeof v === 'number' && Number.isNaN(v)))
  );
}

export const ingestTelemetry = onRequest(
  { cors: true, secrets: [TELEMETRY_INGEST_TOKEN] },
  async (req, res) => {
    if (req.method !== 'POST') { res.status(405).send('Use POST'); return; }

    // Auth
    const key = (req.get('x-api-key') ?? '').trim();
    const expected = (TELEMETRY_INGEST_TOKEN.value() ?? '').trim();
    if (!key || key !== expected) {
      res.status(401).json({ ok: false, reason: 'unauthorized' }); return;
    }

    try {
      const b = (req.body ?? {}) as any;
      const communityId = String(b.communityId || '');
      if (!communityId) { res.status(400).json({ ok: false, reason: 'missing communityId' }); return; }

      const ts = toISO(b.ts);
      const base = {
        communityId,
        ts,
        source: (b.source as string) || 'iot',
        voltage: num(b.voltage),
        frequency: num(b.frequency),
        uptime: num(b.uptime),
        kWh: num(b.kWh),
      };

      const doc = scrub(base);
      await db.collection('telemetry').add(doc);
      res.json({ ok: true });
    } catch (e: any) {
      logger.error('ingestTelemetry error', { message: e?.message, stack: e?.stack });
      res.status(500).json({ ok: false, reason: e?.message || 'server' });
    }
  }
);