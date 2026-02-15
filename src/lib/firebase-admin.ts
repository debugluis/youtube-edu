import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccount) {
    initializeApp({
      credential: cert(JSON.parse(serviceAccount)),
    });
  } else {
    // Fallback: uses GOOGLE_APPLICATION_CREDENTIALS env or default credentials
    initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
  }
}

export const adminDb = getFirestore();
