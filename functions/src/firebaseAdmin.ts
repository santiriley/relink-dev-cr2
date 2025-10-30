import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp();
}

export const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });
// after: export const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
