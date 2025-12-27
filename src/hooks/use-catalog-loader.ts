import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getCatalogCount, saveStarChunk } from '@/lib/db';
import { STAR_CATALOG, StarRecord } from '@/data/star-catalog';
export function useCatalogLoader() {
  const setCatalogReady = useAppStore(s => s.setCatalogReady);
  const setCoreReady = useAppStore(s => s.setCoreReady);
  const setCatalogLoadingProgress = useAppStore(s => s.setCatalogLoadingProgress);
  const isInitialized = useRef(false);
  const controllerRef = useRef({ timeout: 0 as any, cancelled: false });
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    controllerRef.current = { timeout: 0 as any, cancelled: false };
    async function initializeCatalog() {
      // Production Safety: 10s hard-timeout for core readiness
      controllerRef.current.timeout = setTimeout(() => {
        if (!useAppStore.getState().isCoreReady && !controllerRef.current.cancelled) {
          console.warn('CatalogLoader: Initialization timeout, forcing CoreReady for UI access.');
          setCoreReady(true);
        }
      }, 10000);
      try {
        const count = await getCatalogCount();
        console.log('Catalog count:', count);
        const TARGET_DENSITY = 125000;
        const CORE_THRESHOLD = 5000;
        if (count >= TARGET_DENSITY) {
          setCatalogLoadingProgress(100);
          setCoreReady(true);
          setCatalogReady(true);
          controllerRef.current.cancelled = true;
          clearTimeout(controllerRef.current.timeout);
          return;
        }
        // Phase 1: Native Data Hydration (Major Cultural Stars)
        setCatalogLoadingProgress(0);
        try {
          await saveStarChunk(STAR_CATALOG);
        } catch (e) {
          console.warn('CatalogLoader: Initial chunk write failure', e);
        }
        // Phase 2: Rapid Procedural Pre-hydration
        const currentCount = await getCatalogCount();
        const needed = Math.max(0, CORE_THRESHOLD - currentCount);
        if (needed > 0) {
          const chunk: StarRecord[] = [];
          for (let j = 0; j < needed; j++) {
            chunk.push({
              id: `pre_proc_${j}`,
              ra: Math.random() * 24,
              dec: Math.acos(Math.random() * 2 - 1) * (180 / Math.PI) - 90,
              mag: 1.0 + Math.random() * 5.5,
              bv: Math.random() * 2.0 - 0.4
            });
          }
          await saveStarChunk(chunk);
        }
        // Core visual baseline achieved
        console.log('Setting coreReady=true after initial hydration');
        setCoreReady(true);
        setCatalogLoadingProgress(25);
        // Phase 3: Background Deep-Hydration
        const remaining = TARGET_DENSITY - (await getCatalogCount());
        const chunkSize = 2500;
        const totalChunks = Math.ceil(remaining / chunkSize);
        const scheduleChunk = async (index: number) => {
            if (index >= totalChunks) {
              setCatalogLoadingProgress(100);
              setCatalogReady(true);
              console.log('Catalog fully ready');
              controllerRef.current.cancelled = true;
              clearTimeout(controllerRef.current.timeout);
              return;
            }
          console.log(`Scheduling bg chunk ${index+1}/${totalChunks}`);
          const bgChunk: StarRecord[] = [];
          for (let j = 0; j < chunkSize; j++) {
            bgChunk.push({
              id: `bg_proc_${index}_${j}`,
              ra: Math.random() * 24,
              dec: Math.acos(Math.random() * 2 - 1) * (180 / Math.PI) - 90,
              mag: 6.5 + Math.random() * 5.5,
              bv: Math.random() * 2.0 - 0.4
            });
          }
          try {
            await saveStarChunk(bgChunk);
            const progress = 25 + ((index + 1) / totalChunks) * 75;
            setCatalogLoadingProgress(Math.floor(progress));
            if (window.requestIdleCallback) {
              window.requestIdleCallback(() => scheduleChunk(index + 1));
            } else {
              setTimeout(() => scheduleChunk(index + 1), 100);
            }
          } catch (e) {
            console.error('CatalogLoader: Hydration deferred', e);
            setTimeout(() => scheduleChunk(index + 1), 1000);
          }
        };
        scheduleChunk(0);
      } catch (error) {
        console.error('CatalogLoader: Fatal failure', error);
        setCoreReady(true);
      }
    }
    initializeCatalog();
  }, [setCatalogReady, setCoreReady, setCatalogLoadingProgress]);
  return null;
}