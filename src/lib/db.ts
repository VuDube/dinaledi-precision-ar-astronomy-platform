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
  await db.put(OBSERVATIONS_STORE, obs);
}
export async function getAllObservations(): Promise<Observation[]> {
  const db = await getDB();
  return db.getAll(OBSERVATIONS_STORE);
}
export async function markAsSynced(id: string): Promise<void> {
  const db = await getDB();
  const obs = await db.get(OBSERVATIONS_STORE, id);
  if (obs) {
    obs.syncStatus = 'synced';
    await db.put(OBSERVATIONS_STORE, obs);
  }
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
export async function getStarsByMagnitude(maxMag: number): Promise<StarRecord[]> {
  const db = await getDB();
  const index = db.transaction(STAR_CATALOG_STORE).store.index('mag');
  const range = IDBKeyRange.upperBound(maxMag);
  return index.getAll(range);
}
export async function getCatalogCount(): Promise<number> {
  const db = await getDB();
  return db.count(STAR_CATALOG_STORE);
}