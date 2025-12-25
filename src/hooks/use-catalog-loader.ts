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
    const controller = controllerRef.current;
    async function initializeCatalog() {
      controller.timeout = setTimeout(() => {
        if (!controller.cancelled && !useAppStore.getState().isCoreReady) {
          console.warn('CatalogLoader: Safety timeout reached. Forcing CoreReady.');
          useAppStore.getState().setCoreReady(true);
          useAppStore.getState().setCatalogReady(true);
          useAppStore.getState().setCatalogLoadingProgress(100);
        }
      }, 10000);
      if (location.hostname.includes('.workers.dev') || location.hostname.includes('build-preview.cloudflare.dev')) {
        controller.cancelled = true;
        if (controller.timeout) clearTimeout(controller.timeout);
        setCatalogLoadingProgress(100);
        setCoreReady(true);
        setCatalogReady(true);
        return;
      }
      try {
        const count = await getCatalogCount();
        const TARGET_DENSITY = 50000;
        const CORE_THRESHOLD = 5000;
        if (count >= TARGET_DENSITY) {
          setCatalogLoadingProgress(100);
          setCoreReady(true);
          setCatalogReady(true);
          controller.cancelled = true;
          if (controller.timeout) clearTimeout(controller.timeout);
          return;
        }
        setCatalogLoadingProgress(0);
        try {
          await saveStarChunk(STAR_CATALOG);
        } catch (e) {
          console.error('CatalogLoader: Chunk write failed', e);
        }
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
        setCoreReady(true);
        setCatalogReady(true);
        setCatalogLoadingProgress(25);
        const remaining = TARGET_DENSITY - (await getCatalogCount());
        const chunkSize = 2000;
        const totalChunks = Math.ceil(remaining / chunkSize);
        const scheduleChunk = async (index: number) => {
          if (index >= totalChunks || controller.cancelled) return;
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
            if (!controller.cancelled) {
              const progress = 25 + ((index + 1) / totalChunks) * 75;
              useAppStore.getState().setCatalogLoadingProgress(Math.floor(progress));
            }
            if (!controller.cancelled) {
              if (window.requestIdleCallback) {
                window.requestIdleCallback(() => scheduleChunk(index + 1), { timeout: 1000 });
              } else {
                setTimeout(() => scheduleChunk(index + 1), 150);
              }
            }
          } catch (e) {
            if (!controller.cancelled) setTimeout(() => scheduleChunk(index + 1), 1000);
          }
        };
        scheduleChunk(0);
      } catch (error) {
        setCoreReady(true);
        setCatalogReady(true);
        controller.cancelled = true;
        if (controller.timeout) clearTimeout(controller.timeout);
      }
    }
    initializeCatalog();
    return () => {
      controller.cancelled = true;
      if (controller.timeout) clearTimeout(controller.timeout);
    };
  }, [setCatalogReady, setCoreReady, setCatalogLoadingProgress]);
  return null;
}