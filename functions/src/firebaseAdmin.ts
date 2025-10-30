import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize once (works in deploy analyzer and at runtime)
if (!getApps().length) {
  initializeApp();
}

// Export a ready-to-use Firestore instance
export const db = getFirestore();
