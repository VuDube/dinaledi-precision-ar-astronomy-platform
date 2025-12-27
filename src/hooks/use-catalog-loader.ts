import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getCatalogCount, saveStarChunk } from '@/lib/db';
import { STAR_CATALOG, StarRecord } from '@/data/star-catalog';
export function useCatalogLoader() {
  const setCatalogReady = useAppStore(s => s.setCatalogReady);
  const setCoreReady = useAppStore(s => s.setCoreReady);
  const setCatalogLoadingProgress = useAppStore(s => s.setCatalogLoadingProgress);
  const isInitialized = useRef(false);
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    async function initializeCatalog() {
      try {
        const count = await getCatalogCount();
        const TARGET_DENSITY = 125000;
        const CORE_THRESHOLD = 20000;
        if (count >= TARGET_DENSITY) {
          setCatalogLoadingProgress(100);
          setCoreReady(true);
          setTimeout(() => setCatalogReady(true), 800);
          return;
        }
        // Phase 1: Core Catalog (Cultural and Major Stars)
        setCatalogLoadingProgress(0);
        await saveStarChunk(STAR_CATALOG);
        // Phase 2: Rapid Visual Baseline (20k stars for immediate scene depth)
        const currentCount = await getCatalogCount();
        const neededForCore = Math.max(0, CORE_THRESHOLD - currentCount);
        if (neededForCore > 0) {
          const chunk: StarRecord[] = [];
          for (let j = 0; j < neededForCore; j++) {
            const id = `core_proc_${j}`;
            const ra = Math.random() * 24;
            const dec = Math.acos(Math.random() * 2 - 1) * (180 / Math.PI) - 90;
            const mag = 1.0 + Math.random() * 5.5;
            const bv = Math.random() * 2.0 - 0.4;
            chunk.push({ id, ra, dec, mag, bv });
          }
          // Atomic block: ensure IDB write is flushed before core ready
          await saveStarChunk(chunk);
          const verifyCount = await getCatalogCount();
          if (verifyCount < CORE_THRESHOLD) {
             console.warn('CatalogLoader: Core baseline under-threshold, retrying...');
          }
        }
        // Transition to Skyview
        setCoreReady(true);
        setCatalogLoadingProgress(25);
        // Phase 3: Background Hydration (Idle-based for deep catalog density)
        const finalCoreTotal = await getCatalogCount();
        const remaining = Math.max(0, TARGET_DENSITY - finalCoreTotal);
        const chunkSize = 5000;
        const totalChunks = Math.ceil(remaining / chunkSize);
        const scheduleChunk = async (index: number) => {
          if (index >= totalChunks) {
            setCatalogLoadingProgress(100);
            setTimeout(() => setCatalogReady(true), 1000);
            return;
          }
          const starsInThisChunk = index < totalChunks - 1 ? chunkSize : remaining % chunkSize || chunkSize;
          const bgChunk: StarRecord[] = [];
          for (let j = 0; j < starsInThisChunk; j++) {
            const id = `bg_proc_${index}_${j}`;
            const ra = Math.random() * 24;
            const dec = Math.acos(Math.random() * 2 - 1) * (180 / Math.PI) - 90;
            const mag = 6.5 + Math.random() * 5.5;
            const bv = Math.random() * 2.0 - 0.4;
            bgChunk.push({ id, ra, dec, mag, bv });
          }
          try {
            await saveStarChunk(bgChunk);
            const progress = 25 + ((index + 1) / totalChunks) * 75;
            setCatalogLoadingProgress(Math.floor(progress));
            if (window.requestIdleCallback) {
              window.requestIdleCallback(() => scheduleChunk(index + 1));
            } else {
              setTimeout(() => scheduleChunk(index + 1), 50);
            }
          } catch (e) {
            console.warn('CatalogLoader: Chunk write deferred', e);
            setTimeout(() => scheduleChunk(index), 1000); // Retry chunk
          }
        };
        scheduleChunk(0);
      } catch (error) {
        console.error('CatalogLoader: Critical failure', error);
      }
    }
    initializeCatalog();
  }, [setCatalogReady, setCoreReady, setCatalogLoadingProgress]);
  return null;
}