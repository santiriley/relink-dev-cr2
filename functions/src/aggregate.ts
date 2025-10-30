import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from './firebaseAdmin.js';

export async function runAggregate() {
  const today = new Date().toISOString().slice(0,10);
  const since = new Date(); since.setDate(since.getDate() - 1);

  const communities = await db.collection('communities').get();
  await Promise.all(communities.docs.map(async d => {
    const communityId = d.id;

    const outagesSnap = await db.collection('outages')
      .where('communityId','==',communityId)
      .where('startedAt','>=',since.toISOString()).get();

    let saifiEvents = 0, saidiHours = 0;
    outagesSnap.forEach(o => {
      saifiEvents += 1;
      const data = o.data();
      const start = new Date(data.startedAt).getTime();
      const end = data.endedAt ? new Date(data.endedAt).getTime() : Date.now();
      saidiHours += Math.max(0, (end - start) / 3_600_000);
    });

    const teleSnap = await db.collection('telemetry')
      .where('communityId','==',communityId)
      .where('ts','>=',since.toISOString()).get();

    let voltageDipCount = 0;
    teleSnap.forEach(t => {
      const v = t.get('voltage');
      if (typeof v === 'number' && v < 200) voltageDipCount++;
    });

    await db.collection('aggregates').doc(`${today}-${communityId}`).set({
      date: today, communityId,
      saidiHours: Number(saidiHours.toFixed(2)),
      saifiEvents, voltageDipCount,
      dieselKWhEst: 0, hhAffordabilityPct: null
    }, { merge: true });
  }));
  logger.info('Aggregate complete', today);
}

export const nightlyAggregate = onSchedule('every 24 hours', runAggregate);
export const aggregateNow = onRequest(async (_req, res) => { await runAggregate(); res.json({ ok:true }); });
