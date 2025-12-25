import { openDB, IDBPDatabase } from 'idb';
import { Observation } from '@shared/types';
const DB_NAME = 'dinaledi-db';
const STORE_NAME = 'observations';
const VERSION = 1;
export async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}
export async function saveObservation(obs: Observation): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, obs);
}
export async function getAllObservations(): Promise<Observation[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}
export async function markAsSynced(id: string): Promise<void> {
  const db = await getDB();
  const obs = await db.get(STORE_NAME, id);
  if (obs) {
    obs.syncStatus = 'synced';
    await db.put(STORE_NAME, obs);
  }
}