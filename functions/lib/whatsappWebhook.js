import { onRequest } from 'firebase-functions/v2/https';
import { db } from './firebaseAdmin.js';
import { WHATSAPP_VERIFY_TOKEN } from './config.js';
function parseOutageText(t) {
    const mId = t.match(/communityId=([^\s]+)/i);
    const mNotes = t.match(/notes=(.*)$/i);
    return { communityId: mId?.[1], notes: mNotes?.[1] ?? '' };
}
export const whatsappWebhook = onRequest({ cors: true, secrets: [WHATSAPP_VERIFY_TOKEN] }, async (req, res) => {
    if (req.method === 'GET') {
        const verify = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        if (verify === WHATSAPP_VERIFY_TOKEN.value()) {
            res.status(200).send(challenge);
            return;
        }
        res.status(403).send('forbidden');
        return;
    }
    if (req.method === 'POST') {
        try {
            const text = JSON.stringify(req.body);
            if (/OUTAGE/i.test(text)) {
                const { communityId, notes } = parseOutageText(text);
                if (communityId) {
                    await db.collection('outages').add({
                        communityId, startedAt: new Date().toISOString(),
                        endedAt: null, source: 'whatsapp', notes
                    });
                }
            }
            res.json({ ok: true });
            return;
        }
        catch {
            res.json({ ok: true });
            return;
        }
    }
    res.status(200).send('ok');
});
