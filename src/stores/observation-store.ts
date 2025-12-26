import { create } from 'zustand';
import { Observation } from '@shared/types';
import { saveObservation, getAllObservations, markAsSynced } from '@/lib/db';
import { useAppStore } from './app-store';
interface ObservationState {
  observations: Observation[];
  isSyncing: boolean;
  pendingCount: number;
  loadObservations: () => Promise<void>;
  addObservation: (obs: Observation) => Promise<void>;
  syncPending: () => Promise<void>;
}
export const useObservationStore = create<ObservationState>((set, get) => ({
  observations: [],
  isSyncing: false,
  pendingCount: 0,
  loadObservations: async () => {
    const data = await getAllObservations();
    const sorted = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const pending = sorted.filter(o => o.syncStatus === 'local').length;
    set({ observations: sorted, pendingCount: pending });
  },
  addObservation: async (obs: Observation) => {
    await saveObservation(obs);
    set(state => {
      const newObs = [obs, ...state.observations];
      return {
        observations: newObs,
        pendingCount: newObs.filter(o => o.syncStatus === 'local').length
      };
    });
    try {
      const response = await fetch('/api/obs/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obs),
      });
      if (response.ok) {
        await markAsSynced(obs.id);
        const updatedObs: Observation = { ...obs, syncStatus: 'synced' as const };
        set(state => {
          const mapped = state.observations.map(o => o.id === obs.id ? updatedObs : o);
          return {
            observations: mapped,
            pendingCount: mapped.filter(o => o.syncStatus === 'local').length
          };
        });
        useAppStore.getState().setLastSyncTime(new Date());
      }
    } catch (e) {
      console.warn('Sync failed, will retry later', e);
    }
  },
  syncPending: async () => {
    const { observations, isSyncing } = get();
    if (isSyncing) return;
    const pending = observations.filter(o => o.syncStatus === 'local');
    if (pending.length === 0) {
       set({ pendingCount: 0 });
       return;
    }
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
          set(state => {
            const mapped = state.observations.map(o => o.id === obs.id ? ({ ...o, syncStatus: 'synced' as const }) : o);
            return {
              observations: mapped,
              pendingCount: mapped.filter(o => o.syncStatus === 'local').length
            };
          });
          useAppStore.getState().setLastSyncTime(new Date());
        }
      } catch (e) {
        console.error('Retry sync failed for', obs.id, e);
      }
    }
    set({ isSyncing: false });
  }
}));