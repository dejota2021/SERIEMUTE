import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  onSnapshot,
  Firestore,
  writeBatch
} from 'firebase/firestore';
import { DayStrategy } from './data/strategyData';

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

const STORAGE_FIREBASE_CONFIG_KEY = 'mute_firebase_config_v1';
export const CAMPAIGN_ID = 'mute_dejota2021_campaign';

// Official credentials provided by dejota2021 for the planmute project
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyCj3RMuiKm2X8qO9HD_60PgKuckyT6_B28",
  authDomain: "planmute.firebaseapp.com",
  projectId: "planmute",
  storageBucket: "planmute.firebasestorage.app",
  messagingSenderId: "17276375503",
  appId: "1:17276375503:web:69cf133bb5d540eff4c2ba"
};

// Recommended foolproof Firestore security rules for planmute
export const FOOLPROOF_FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

// Read config with fallback to official planmute config
export function getStoredFirebaseConfig(): FirebaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_FIREBASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.projectId === 'planmute' && parsed.apiKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored Firebase config', e);
  }

  // Fallback to Vite env variables if set
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
  }

  // Default to official planmute credentials
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: FirebaseConfig) {
  localStorage.setItem(STORAGE_FIREBASE_CONFIG_KEY, JSON.stringify(config));
}

export function clearFirebaseConfig() {
  localStorage.removeItem(STORAGE_FIREBASE_CONFIG_KEY);
}

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

export function initFirebase(customConfig?: FirebaseConfig): { app: FirebaseApp; db: Firestore } | null {
  const config = customConfig || getStoredFirebaseConfig();
  if (!config || !config.projectId) {
    return null;
  }

  try {
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApps()[0];
    }
    dbInstance = getFirestore(appInstance);
    return { app: appInstance, db: dbInstance };
  } catch (error) {
    console.error('[Firebase] Error initializing Firebase:', error);
    return null;
  }
}

export function getDb(): Firestore | null {
  if (dbInstance) return dbInstance;
  const init = initFirebase();
  return init ? init.db : null;
}

// Test live read/write capability and diagnose Firestore rules
export async function testFirestoreConnection(): Promise<{
  success: boolean;
  message: string;
  code?: string;
}> {
  const db = getDb();
  if (!db) {
    return {
      success: false,
      message: 'No se pudo inicializar Firebase con el proyecto planmute.',
      code: 'uninitialized'
    };
  }

  try {
    const testDocRef = doc(db, 'campaigns', CAMPAIGN_ID);
    await setDoc(testDocRef, {
      _lastPing: new Date().toISOString(),
      artist: 'dejota2021',
      album: 'MUTE'
    }, { merge: true });
    
    return {
      success: true,
      message: '¡Conexión y permisos verificados exitosamente con Firebase planmute!'
    };
  } catch (err: any) {
    console.error('[Firebase] Error durante test de conexión:', err);
    return {
      success: false,
      message: err.message || 'Error de conexión',
      code: err.code || 'unknown'
    };
  }
}

// Global callback for notifying UI of write errors (e.g. permission-denied)
let onSyncErrorCallback: ((error: any) => void) | null = null;
export function setOnSyncError(cb: ((error: any) => void) | null) {
  onSyncErrorCallback = cb;
}

// Ultra-fast immediate write to Firestore with parallel dual-channel broadcast
export async function syncDayToFirestore(day: DayStrategy): Promise<boolean> {
  const db = getDb();
  if (!db) {
    console.warn('[Firestore] Firestore no está inicializado');
    return false;
  }

  const daySummary = {
    isRecorded: !!day.isRecorded,
    isReviewed: !!day.isReviewed,
    isPublished: !!day.isPublished,
    notes: day.notes || '',
  };

  const dayPayload = {
    id: day.id,
    day: day.day,
    phase: day.phase,
    title: day.title,
    isRecorded: !!day.isRecorded,
    isReviewed: !!day.isReviewed,
    isPublished: !!day.isPublished,
    notes: day.notes || '',
    updatedAt: new Date().toISOString(),
  };

  try {
    const campaignRef = doc(db, 'campaigns', CAMPAIGN_ID);
    const dayRef = doc(db, 'campaigns', CAMPAIGN_ID, 'days', `day_${day.day}`);

    await Promise.all([
      setDoc(dayRef, dayPayload, { merge: true }),
      setDoc(
        campaignRef,
        {
          daysState: {
            [day.id]: daySummary,
          },
          lastUpdatedDay: day.id,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
    ]);

    return true;
  } catch (err: any) {
    console.error(`[Firestore] Error al sincronizar día ${day.day}:`, err);
    if (onSyncErrorCallback) {
      onSyncErrorCallback(err);
    }
    return false;
  }
}

// Batch sync all 30 days to Firestore
export async function syncAllDaysToFirestore(days: DayStrategy[]): Promise<boolean> {
  const db = getDb();
  if (!db) {
    console.warn('syncAllDaysToFirestore: Firestore is not initialized');
    return false;
  }

  try {
    const daysStateMap: Record<number, { isRecorded: boolean; isReviewed: boolean; isPublished: boolean; notes: string }> = {};
    const batch = writeBatch(db);

    days.forEach((day) => {
      daysStateMap[day.id] = {
        isRecorded: !!day.isRecorded,
        isReviewed: !!day.isReviewed,
        isPublished: !!day.isPublished,
        notes: day.notes || '',
      };

      const dayRef = doc(db, 'campaigns', CAMPAIGN_ID, 'days', `day_${day.day}`);
      batch.set(
        dayRef,
        {
          id: day.id,
          day: day.day,
          phase: day.phase,
          title: day.title,
          isRecorded: !!day.isRecorded,
          isPublished: !!day.isPublished,
          notes: day.notes || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    });

    const campaignRef = doc(db, 'campaigns', CAMPAIGN_ID);
    batch.set(
      campaignRef,
      {
        artist: 'dejota2021',
        album: 'MUTE',
        daysState: daysStateMap,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    await batch.commit();
    console.log('[Firestore] Los 30 días sincronizados en lote exitosamente en planmute');
    return true;
  } catch (error: any) {
    console.error('Error batch syncing days to Firestore:', error);
    if (onSyncErrorCallback) {
      onSyncErrorCallback(error);
    }
    return false;
  }
}

// Real-time subscription combining instant document push with collection sync
export function subscribeToFirestoreDays(
  onData: (
    remoteDays: Record<number, { isRecorded: boolean; isReviewed?: boolean; isPublished: boolean; notes: string }>,
    count: number
  ) => void,
  onError?: (err: any) => void
): (() => void) | null {
  const db = getDb();
  if (!db) {
    console.warn('subscribeToFirestoreDays: Firestore is not initialized');
    return null;
  }

  try {
    const campaignRef = doc(db, 'campaigns', CAMPAIGN_ID);
    const daysCol = collection(db, 'campaigns', CAMPAIGN_ID, 'days');

    // 1. Primary channel: single document real-time stream (fast delta delivery)
    const unsubscribeDoc = onSnapshot(
      campaignRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.daysState && typeof data.daysState === 'object') {
            const state = data.daysState as Record<string, { isRecorded?: boolean; isReviewed?: boolean; isPublished?: boolean; notes?: string }>;
            const result: Record<number, { isRecorded: boolean; isReviewed: boolean; isPublished: boolean; notes: string }> = {};
            let count = 0;
            Object.keys(state).forEach((key) => {
              const numId = Number(key);
              if (!isNaN(numId)) {
                result[numId] = {
                  isRecorded: !!state[key]?.isRecorded,
                  isReviewed: !!state[key]?.isReviewed,
                  isPublished: !!state[key]?.isPublished,
                  notes: state[key]?.notes || '',
                };
                count++;
              }
            });
            if (count > 0) {
              onData(result, count);
            }
          }
        }
      },
      (error) => {
        console.warn('[Firestore] Aviso en canal de campaña:', error);
        onError?.(error);
      }
    );

    // 2. Secondary channel: subcollection listener for complete data consistency
    const unsubscribeCol = onSnapshot(
      daysCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const result: Record<number, { isRecorded: boolean; isReviewed: boolean; isPublished: boolean; notes: string }> = {};
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && typeof data.id === 'number') {
              result[data.id] = {
                isRecorded: !!data.isRecorded,
                isReviewed: !!data.isReviewed,
                isPublished: !!data.isPublished,
                notes: data.notes || '',
              };
            }
          });
          onData(result, snapshot.size);
        } else {
          // If empty, notify with count 0 so consumer knows the collection exists but is unseeded
          onData({}, 0);
        }
      },
      (error) => {
        console.error('[Firestore] Error en snapshot de colección:', error);
        onError?.(error);
      }
    );

    return () => {
      unsubscribeDoc();
      unsubscribeCol();
    };
  } catch (error: any) {
    console.error('[Firestore] Error al configurar listener:', error);
    onError?.(error);
    return null;
  }
}

// ==========================================
// B-Roll & Archivo Vault Real-Time Synchronization
// ==========================================

export interface VaultSyncPayload {
  vaultChecked: Record<string, boolean>;
  customItems?: Array<{
    id: string;
    category: string;
    name: string;
    tip: string;
    format: string;
    shotAngle?: string;
  }>;
  vaultNotes?: string;
}

export async function syncVaultToFirestore(payload: VaultSyncPayload): Promise<boolean> {
  const db = getDb();
  if (!db) {
    console.warn('[Firestore] Firestore no está inicializado para el Vault');
    return false;
  }

  try {
    const campaignRef = doc(db, 'campaigns', CAMPAIGN_ID);
    const vaultRef = doc(db, 'campaigns', CAMPAIGN_ID, 'vault', 'broll_vault');

    const updateData = {
      vaultChecked: payload.vaultChecked || {},
      customVaultItems: payload.customItems || [],
      vaultNotes: payload.vaultNotes || '',
      vaultUpdatedAt: new Date().toISOString(),
    };

    // Parallel dual-write for rapid propagation to all devices
    await Promise.all([
      setDoc(campaignRef, updateData, { merge: true }),
      setDoc(vaultRef, updateData, { merge: true }),
    ]);

    return true;
  } catch (err: any) {
    console.error('[Firestore] Error al sincronizar el Vault de B-Roll en Firestore:', err);
    if (onSyncErrorCallback) {
      onSyncErrorCallback(err);
    }
    return false;
  }
}

export function subscribeToFirestoreVault(
  onData: (payload: VaultSyncPayload) => void,
  onError?: (err: any) => void
): (() => void) | null {
  const db = getDb();
  if (!db) {
    console.warn('subscribeToFirestoreVault: Firestore no está inicializado');
    return null;
  }

  try {
    const campaignRef = doc(db, 'campaigns', CAMPAIGN_ID);
    const vaultRef = doc(db, 'campaigns', CAMPAIGN_ID, 'vault', 'broll_vault');

    // 1. Primary channel: Campaign document
    const unsubCampaign = onSnapshot(
      campaignRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && (data.vaultChecked || data.customVaultItems || data.vaultNotes !== undefined)) {
            onData({
              vaultChecked: (data.vaultChecked as Record<string, boolean>) || {},
              customItems: data.customVaultItems || [],
              vaultNotes: data.vaultNotes || '',
            });
          }
        }
      },
      (error) => {
        console.warn('[Firestore] Aviso en listener de campaña para Vault:', error);
        onError?.(error);
      }
    );

    // 2. Secondary channel: Vault sub-document
    const unsubVault = onSnapshot(
      vaultRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && (data.vaultChecked || data.customVaultItems || data.vaultNotes !== undefined)) {
            onData({
              vaultChecked: (data.vaultChecked as Record<string, boolean>) || {},
              customItems: data.customVaultItems || [],
              vaultNotes: data.vaultNotes || '',
            });
          }
        }
      },
      (error) => {
        console.warn('[Firestore] Aviso en listener de subdocumento Vault:', error);
        onError?.(error);
      }
    );

    return () => {
      unsubCampaign();
      unsubVault();
    };
  } catch (error: any) {
    console.error('[Firestore] Error al suscribir a Firestore Vault:', error);
    onError?.(error);
    return null;
  }
}
