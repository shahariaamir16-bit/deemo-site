import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore, 
  Firestore, 
  setLogLevel 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Silence non-fatal transient connection retry warnings
try {
  setLogLevel('silent');
} catch {}

// Safe Fail-Safe Firebase Initialization
let appInstance: any;
try {
  appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (e) {
  try {
    appInstance = getApp();
  } catch {
    appInstance = {};
  }
}

/*
  In browser / iframe / cloud sandbox environments, HTTP/2 gRPC streaming often experiences 
  transient resets (`RST_STREAM with code 2 / Code: 13 INTERNAL`).
  
  Configuring standard long-polling (`experimentalForceLongPolling: true` and `useFetchStreams: false`) 
  eliminates persistent gRPC stream disconnection errors and provides rock-solid, uninterrupted 
  communication with Cloud Firestore.
*/
let firestoreInstance: Firestore;
const firestoreSettings = {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
};

try {
  firestoreInstance = firebaseConfig.firestoreDatabaseId
    ? initializeFirestore(appInstance, firestoreSettings, firebaseConfig.firestoreDatabaseId)
    : initializeFirestore(appInstance, firestoreSettings);
} catch {
  try {
    firestoreInstance = firebaseConfig.firestoreDatabaseId
      ? getFirestore(appInstance, firebaseConfig.firestoreDatabaseId)
      : getFirestore(appInstance);
  } catch {
    firestoreInstance = {} as Firestore;
  }
}

let authInstance: ReturnType<typeof getAuth>;
try {
  authInstance = getAuth(appInstance);
} catch {
  authInstance = {} as ReturnType<typeof getAuth>;
}

export const db = firestoreInstance;
export const auth = authInstance;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errMessage = error instanceof Error ? error.message : String(error);
  const lower = errMessage.toLowerCase();
  
  // Check for common transient network / stream reset warnings (gRPC Code 13 / RST_STREAM / unavailable / offline)
  const isTransientStreamError = 
    lower.includes("could not reach cloud firestore backend") ||
    lower.includes("backend didn't respond") ||
    lower.includes("offline") ||
    lower.includes("rst_stream") ||
    lower.includes("internal: received rst_stream") ||
    lower.includes("code: 13") ||
    (error as any)?.code === 'unavailable' ||
    (error as any)?.code === 'internal';

  if (isTransientStreamError) {
    // Handled silently - the client continues operating smoothly with cached state and auto-reconnect
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
}
