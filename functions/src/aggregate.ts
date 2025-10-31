import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from './firebaseAdmin.js';

function dayBounds(yyyy_mm_dd: string) {
  const start = new Date(`${yyyy_mm_dd}T00:00:00Z`);
  const end = new Date(`${yyyy_mm_dd}T00:00:00Z`); end.setUTCDate(end.getUTCDate() + 1);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}
function idFor(communityId: string, date: string) { return `${communityId}_${date}`; }

export async function aggregateDay(communityId: string, date: string) {
  const { startISO, endISO } = dayBounds(date);

  const rSnap = await db.collection('reports')
    .where('communityId','==',communityId)
    .where('tsStart','>=',startISO)
    .where('tsStart','<', endISO).get();

  let outageCount = 0, brownoutCount = 0, voltageDipCountReports = 0;
  let saidiHoursProxy = 0, saifiEventsProxy = 0;

  rSnap.forEach(doc => {
    const r = doc.data() as any;
    if (r.type === 'outage') {
      outageCount += 1; saifiEventsProxy += 1;
      const start = new Date(r.tsStart).getTime();
      const end   = r.tsEnd ? new Date(r.tsEnd).getTime() : (start + 30 * 60_000);
      const durHrs = Math.max(0, (end - start) / 3_600_000);
      saidiHoursProxy += durHrs;
    } else if (r.type === 'brownout') {
      brownoutCount += 1;
    } else if (r.type === 'voltage_dip') {
      voltageDipCountReports += 1;
    }
  });

  const tSnap = await db.collection('telemetry')
    .where('communityId','==',communityId)
    .where('ts','>=',startISO)
    .where('ts','<', endISO).get();

  let minVoltage: number|undefined = undefined;
  let voltageDipCountTelemetry = 0;
  tSnap.forEach(doc => {
    const t = doc.data() as any;
    if (typeof t.voltage === 'number') {
      if (minVoltage === undefined || t.voltage < minVoltage) minVoltage = t.voltage;
      if (t.voltage < 190) voltageDipCountTelemetry += 1;
    }
  });

  const voltageDipCount = voltageDipCountReports + voltageDipCountTelemetry;

  let rri = 100
    - 10 * saidiHoursProxy
    - 3  * brownoutCount
    - 1  * voltageDipCount
    - (minVoltage !== undefined && minVoltage < 190 ? 1 : 0);
  rri = Math.max(0, Math.round(rri));

  const sources: 'reports'|'telemetry'|'mixed' =
    rSnap.empty && !tSnap.empty ? 'telemetry'
    : !rSnap.empty && tSnap.empty ? 'reports'
    : (!rSnap.empty && !tSnap.empty ? 'mixed' : 'reports');

  await db.collection('dailyStats').doc(idFor(communityId, date)).set({
    communityId, date,
    outageCount, brownoutCount, voltageDipCount,
    saidiHoursProxy: Number(saidiHoursProxy.toFixed(2)),
    saifiEventsProxy,
    minVoltage: minVoltage ?? null,
    rriScore: rri,
    sources
  }, { merge: true });
}

export async function runAggregate(date?: string) {
  const d = date ?? new Date().toISOString().slice(0,10);
  const communities = await db.collection('communities').get();
  await Promise.all(communities.docs.map(async doc => aggregateDay(doc.id, d)));
  logger.info('Aggregate complete', { date: d, communities: communities.size });
}

export const nightlyAggregate = onSchedule('every 24 hours', async () => { await runAggregate(); });
export const aggregateNow = onRequest(async (req, res) => {
  const d = (req.query?.date as string) || undefined;
  await runAggregate(d);
  res.json({ ok: true, date: d ?? new Date().toISOString().slice(0,10) });
});