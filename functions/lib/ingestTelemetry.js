import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from './firebaseAdmin.js';
import { TELEMETRY_INGEST_TOKEN } from './config.js';
export const ingestTelemetry = onRequest({ cors: true }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ ok: false, error: 'Use POST' });
        return;
    }
    const token = req.header('x-api-key') ?? '';
    if (!TELEMETRY_INGEST_TOKEN || token !== TELEMETRY_INGEST_TOKEN) {
        res.status(401).json({ ok: false, error: 'unauthorized' });
        return;
    }
    try {
        const b = req.body ?? {};
        if (!b.communityId || !b.ts) {
            res.status(400).json({ ok: false, error: 'communityId and ts required' });
            return;
        }
        await db.collection('telemetry').add({
            communityId: b.communityId, ts: b.ts,
            voltage: b.voltage, frequency: b.frequency, uptime: b.uptime, kWh: b.kWh,
            source: b.source ?? 'manual', deviceId: b.deviceId ?? null
        });
        res.json({ ok: true });
    }
    catch (e) {
        logger.error(e);
        res.status(500).json({ ok: false });
    }
});
