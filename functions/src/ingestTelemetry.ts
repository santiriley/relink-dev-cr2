import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from './firebaseAdmin.js';
import { TELEMETRY_INGEST_TOKEN } from './config.js';

const VERSION = 'ingestTelemetry v3'; // bump when you redeploy

function toISO(ts: any): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) throw new Error('invalid_ts');
  return d.toISOString();
}
function num(x: any): number | undefined {
  const n = typeof x === 'string' ? Number(x) : x;
  return Number.isFinite(n) ? n : undefined;
}
function clean(o: Record<string, any>) {
  // Remove keys that are undefined or NaN
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined) continue;
    if (typeof v === 'number' && Number.isNaN(v)) continue;
    out[k] = v;
  }
  // Extra belt-and-suspenders: JSON clone drops any lingering undefined
  return JSON.parse(JSON.stringify(out));
}

export const ingestTelemetry = onRequest(
  { cors: true, secrets: [TELEMETRY_INGEST_TOKEN] },
  async (req, res) => {
    if (req.method !== 'POST') { res.status(405).send('Use POST'); return; }

    const key = (req.get('x-api-key') ?? '').trim();
    const expected = (TELEMETRY_INGEST_TOKEN.value() ?? '').trim();
    if (!key || key !== expected) { res.status(401).json({ ok: false, reason: 'unauthorized' }); return; }

    try {
      const b = (req.body ?? {}) as any;
      const communityId = String(b.communityId || '');
      if (!communityId) { res.status(400).json({ ok: false, reason: 'missing communityId' }); return; }

      const ts = toISO(b.ts);
      // Build doc only when the property exists and is valid
      const doc: Record<string, any> = {
        communityId,
        ts,
        source: typeof b.source === 'string' && b.source ? b.source : 'iot',
      };

      if (Object.prototype.hasOwnProperty.call(b, 'voltage')) {
        const v = num(b.voltage); if (v !== undefined) doc.voltage = v;
      }
      if (Object.prototype.hasOwnProperty.call(b, 'frequency')) {
        const f = num(b.frequency); if (f !== undefined) doc.frequency = f;
      }
      if (Object.prototype.hasOwnProperty.call(b, 'uptime')) {
        const u = num(b.uptime); if (u !== undefined) doc.uptime = u;
      }
      if (Object.prototype.hasOwnProperty.call(b, 'kWh')) {
        const k = num(b.kWh); if (k !== undefined) doc.kWh = k;
      }

      const finalDoc = clean(doc);
      logger.info(VERSION, { bodyKeys: Object.keys(b), writeKeys: Object.keys(finalDoc) });

      await db.collection('telemetry').add(finalDoc);
      res.json({ ok: true });
    } catch (e: any) {
      logger.error('ingestTelemetry error', { message: e?.message, stack: e?.stack });
      res.status(500).json({ ok: false, reason: e?.message || 'server' });
    }
  }
);