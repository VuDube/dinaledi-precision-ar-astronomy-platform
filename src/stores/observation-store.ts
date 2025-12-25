import { create } from 'zustand';
import { Observation } from '@shared/types';
import { saveObservation, getAllObservations, markAsSynced } from '@/lib/db';
interface ObservationState {
  observations: Observation[];
  isSyncing: boolean;
  loadObservations: () => Promise<void>;
  addObservation: (obs: Observation) => Promise<void>;
  syncPending: () => Promise<void>;
}
export const useObservationStore = create<ObservationState>((set, get) => ({
  observations: [],
  isSyncing: false,
  loadObservations: async () => {
    const data = await getAllObservations();
    set({ observations: data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) });
  },
  addObservation: async (obs: Observation) => {
    // 1. Save to Local IDB
    await saveObservation(obs);
    set(state => ({ observations: [obs, ...state.observations] }));
    // 2. Attempt Sync
    try {
      const response = await fetch('/api/obs/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obs),
      });
      if (response.ok) {
        await markAsSynced(obs.id);
        const updatedObs = { ...obs, syncStatus: 'synced' as const };
        set(state => ({
          observations: state.observations.map(o => o.id === obs.id ? updatedObs : o)
        }));
      }
    } catch (e) {
      console.warn('Sync failed, will retry later', e);
    }
  },
  syncPending: async () => {
    const { observations, isSyncing } = get();
    if (isSyncing) return;
    const pending = observations.filter(o => o.syncStatus === 'local');
    if (pending.length === 0) return;
    set({ isSyncing: true });
    for (const obs of pending) {
      try {
        const response = await fetch('/api/obs/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(obs),
        });
        if (response.ok) {
          await markAsSynced(obs.id);
          set(state => ({
            observations: state.observations.map(o => o.id === obs.id ? { ...o, syncStatus: 'synced' } : o)
          }));
        }
      } catch (e) {
        console.error('Retry sync failed for', obs.id, e);
      }
    }
    set({ isSyncing: false });
  }
}));