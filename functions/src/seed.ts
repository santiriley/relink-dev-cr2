import { onRequest } from 'firebase-functions/v2/https';
import { db } from './firebaseAdmin.js';

export const seedCommunity = onRequest(async (req, res) => {
  const q = req.query as any;
  const id = String(q.id ?? 'costa-rica-demo');
  const doc = {
    name: String(q.name ?? 'CR Demo'),
    country: String(q.country ?? 'CR'),
    muni: String(q.muni ?? 'Poás'),
    lat: Number(q.lat ?? 10.1),
    lng: Number(q.lng ?? -84.2),
    households: Number(q.households ?? 500)
  };
  await db.collection('communities').doc(id).set(doc, { merge: true });
  res.json({ ok:true, id });
});
