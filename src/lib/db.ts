import { openDB, IDBPDatabase } from 'idb';
import { Observation } from '@shared/types';
import { StarRecord } from '@/data/star-catalog';
const DB_NAME = 'dinaledi-db';
const OBSERVATIONS_STORE = 'observations';
const STAR_CATALOG_STORE = 'star_catalog';
const VERSION = 2;
export async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(OBSERVATIONS_STORE)) {
        db.createObjectStore(OBSERVATIONS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STAR_CATALOG_STORE)) {
        const starStore = db.createObjectStore(STAR_CATALOG_STORE, { keyPath: 'id' });
        starStore.createIndex('mag', 'mag');
      }
    },
  });
}
export async function saveObservation(obs: Observation): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(OBSERVATIONS_STORE, 'readwrite');
  await tx.store.put(obs);
  await tx.done;
}
export async function getAllObservations(): Promise<Observation[]> {
  const db = await getDB();
  const tx = db.transaction(OBSERVATIONS_STORE, 'readonly');
  return tx.store.getAll();
}
export async function markAsSynced(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(OBSERVATIONS_STORE, 'readwrite');
  const obs = await tx.store.get(id);
  if (obs) {
    obs.synced = true;
    await tx.store.put(obs);
  }
  await tx.done;
}
/**
 * Star Catalog Bulk Operations
 */
export async function saveStarChunk(stars: StarRecord[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STAR_CATALOG_STORE, 'readwrite');
  const store = tx.objectStore(STAR_CATALOG_STORE);
  for (const star of stars) {
    store.put(star);
  }
  await tx.done;
}
export async function getStarsByMagnitude(maxMag: number, limit: number = 30000): Promise<StarRecord[]> {
  const db = await getDB();
  const index = db.transaction(STAR_CATALOG_STORE, 'readonly').objectStore(STAR_CATALOG_STORE).index('mag');
  const range = IDBKeyRange.upperBound(maxMag + 1e-6);
  return index.getAll(range, limit);
}
export async function getCatalogCount(): Promise<number> {
  const db = await getDB();
  return db.transaction(STAR_CATALOG_STORE, 'readonly').store.count();
}