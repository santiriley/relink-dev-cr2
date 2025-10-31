import { onRequest } from 'firebase-functions/v2/https';
import { db } from './firebaseAdmin.js';

export const exportStats = onRequest(async (req, res) => {
  const communityId = String(req.query.communityId || '');
  const start = String(req.query.start || '');
  const end = String(req.query.end || '');
  if (!communityId || !start || !end) {
    res.status(400).send('communityId,start,end (YYYY-MM-DD) are required'); return;
  }

  const snap = await db.collection('dailyStats')
    .where('communityId','==',communityId)
    .where('date','>=',start)
    .where('date','<', end) // end exclusive
    .get();

  const rows = [['date','communityId','rriScore','saidiHoursProxy','saifiEventsProxy','voltageDipCount','brownoutCount','outageCount','minVoltage','sources']];
  snap.forEach(d => {
    const x = d.data() as any;
    rows.push([x.date,x.communityId,x.rriScore,x.saidiHoursProxy,x.saifiEventsProxy,x.voltageDipCount,x.brownoutCount,x.outageCount,(x.minVoltage ?? ''),x.sources]);
  });
  const csv = rows.map(r => r.join(',')).join('\n');
  res.setHeader('Content-Type','text/csv');
  res.status(200).send(csv);
});
