import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from './firebaseAdmin.js';
import { TELEMETRY_INGEST_TOKEN } from './config.js';

export const ingestTelemetry = onRequest(
  { cors: true, secrets: [TELEMETRY_INGEST_TOKEN] },
  async (req, res) => {
    try {
      if (req.method !== 'POST') {
        res.status(405).json({ ok: false, error: 'Use POST' });
        return;
      }

      const token = req.header('x-api-key') ?? '';
      const expected = TELEMETRY_INGEST_TOKEN.value();
      if (!expected || token !== expected) {
        res.status(401).json({ ok: false, error: 'unauthorized' });
        return;
      }

      const { communityId, ts, voltage, source, frequency, uptime, kWh } = req.body ?? {};
      if (!communityId || ts === undefined || typeof voltage !== 'number') {
        res.status(400).json({ ok: false, error: 'bad-payload' });
        return;
      }

      // accept ISO string or epoch ms
      const tsMs = typeof ts === 'number' ? ts : Date.parse(ts);
      if (!Number.isFinite(tsMs)) {
        res.status(400).json({ ok: false, error: 'ts-invalid' });
        return;
      }

      const doc: Record<string, unknown> = {
        communityId,
        ts: new Date(tsMs).toISOString(),
        voltage,
        source: source ?? 'iot',
      };
      if (typeof frequency === 'number') doc.frequency = frequency;
      if (typeof uptime === 'number')    doc.uptime    = uptime;
      if (typeof kWh === 'number')       doc.kWh       = kWh;

      await db.collection('telemetry').add(doc);
      res.json({ ok: true });
    } catch (e) {
      logger.error('ingestTelemetry error', e as any);
      res.status(500).json({ ok: false, error: e instanceof Error ? e.message : 'unknown' });
    }
  }
);
