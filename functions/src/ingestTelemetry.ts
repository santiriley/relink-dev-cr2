
import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from './firebaseAdmin.js';
import { TELEMETRY_INGEST_TOKEN } from './config.js';

function toISO(ts: any): string {
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) throw new Error('bad-date');
    return d.toISOString();
  } catch {
    throw new Error('invalid_ts');
  }
}
function num(x: any): number | undefined {
  const n = typeof x === 'string' ? Number(x) : x;
  return Number.isFinite(n) ? n : undefined;
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
      const body = (req.body ?? {}) as any;
      const communityId = String(body.communityId || '');
      const tsISO = toISO(body.ts);
      const source = (body.source as string) || 'iot';

      if (!communityId) {
        res.status(400).json({ ok: false, reason: 'missing communityId' }); return;
      }

      // Build doc only with valid numbers
      const doc: any = { communityId, ts: tsISO, source };
      const v = num(body.voltage);   if (v !== undefined) doc.voltage = v;
      const f = num(body.frequency); if (f !== undefined) doc.frequency = f;
      const u = num(body.uptime);    if (u !== undefined) doc.uptime = u;
      const k = num(body.kWh);       if (k !== undefined) doc.kWh = k;

      await db.collection('telemetry').add(doc);
      res.json({ ok: true });
    } catch (e: any) {
      logger.error('ingestTelemetry error', { message: e?.message, stack: e?.stack });
      res.status(500).json({ ok: false, reason: e?.message || 'server' });
    }
  }
);
