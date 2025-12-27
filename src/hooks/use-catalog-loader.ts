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

    async function initializeCatalog() {
      // 10s PRODUCTION LOCK: Force readiness if DB is slow or stuck
      controllerRef.current.timeout = setTimeout(() => {
        if (!controllerRef.current.cancelled && !useAppStore.getState().isCoreReady) {
          console.warn('CatalogLoader: Safety timeout reached. Forcing CoreReady.');
          useAppStore.getState().setCoreReady(true);
          useAppStore.getState().setCatalogReady(true);
          useAppStore.getState().setCatalogLoadingProgress(100);
        }
      }, 10000);

      // Preview environment: Skip IDB for fast baseline loading
      if (location.hostname.includes('.workers.dev')) {
        controllerRef.current.cancelled = true;
        clearTimeout(controllerRef.current.timeout);
        setCatalogLoadingProgress(100);
        setCoreReady(true);
        setCatalogReady(true);
        return;
      }

      try {
        const count = await getCatalogCount();
        const TARGET_DENSITY = 30000;
        const CORE_THRESHOLD = 5000;
        if (count >= TARGET_DENSITY) {
          setCatalogLoadingProgress(100);
          setCoreReady(true);
          setCatalogReady(true);
          controllerRef.current.cancelled = true;
          clearTimeout(controllerRef.current.timeout);
          return;
        }

        // Phase 1: Native Cultural Core
        setCatalogLoadingProgress(0);
        try {
          await saveStarChunk(STAR_CATALOG);
        } catch (e) {
          console.error('CatalogLoader: Chunk write failed', e);
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
              mag: 1.0 + Math.random() * 6.0,
              bv: Math.random() * 2.0 - 0.4
            });
          }
          await saveStarChunk(chunk);
        }

        // Core visual baseline achieved - Viewport unblocked
        setCoreReady(true);
        setCatalogReady(true);
        setCatalogLoadingProgress(100);

        // Phase 3: Background Deep-Hydration (Optimized Chunk Size)
        const remaining = TARGET_DENSITY - (await getCatalogCount());
        const chunkSize = 1500;
        const totalChunks = Math.ceil(remaining / chunkSize);

        const scheduleChunk = async (index: number) => {
          if (index >= totalChunks || controllerRef.current.cancelled) {
            setCatalogLoadingProgress(100);
            setCatalogReady(true);
            controllerRef.current.cancelled = true;
            clearTimeout(controllerRef.current.timeout);
            return;
          }

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
            if (!controllerRef.current.cancelled) {
              // Progress already at 100% - Phase 3 is background only
              if (useAppStore.getState().catalogLoadingProgress < 100) {
                const progress = 25 + ((index + 1) / totalChunks) * 75;
                setCatalogLoadingProgress(Math.floor(progress));
              }
            }
            if (!controllerRef.current.cancelled) {
              if (window.requestIdleCallback) {
                window.requestIdleCallback(() => scheduleChunk(index + 1));
              } else {
                setTimeout(() => scheduleChunk(index + 1), 250);
              }
            }
          } catch (e) {
            if (!controllerRef.current.cancelled) {
              setTimeout(() => scheduleChunk(index + 1), 1000);
            }
          }
        };
        scheduleChunk(0);
      } catch (error) {
        setCoreReady(true);
        setCatalogReady(true);
      }
    }

    initializeCatalog();

    return () => {
      if (controllerRef.current.timeout) {
        clearTimeout(controllerRef.current.timeout);
      }
    };
  }, [setCatalogReady, setCoreReady, setCatalogLoadingProgress]);

  return null;
}
//