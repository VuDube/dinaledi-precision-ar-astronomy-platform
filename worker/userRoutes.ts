import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, Observation } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Core Observation API
    app.get('/api/obs', async (c) => {
        const stored = await c.env.KVStore.get('user_obs_global');
        const data: Observation[] = stored ? JSON.parse(stored) : [];
        return c.json({ success: true, data } satisfies ApiResponse<Observation[]>);
    });
    app.post('/api/obs/sync', async (c) => {
        const newObs = await c.req.json<Observation>();
        const stored = await c.env.KVStore.get('user_obs_global');
        const list: Observation[] = stored ? JSON.parse(stored) : [];
        // Idempotent Sync
        if (!list.find(o => o.id === newObs.id)) {
            list.push({ ...newObs, syncStatus: 'synced' });
            await c.env.KVStore.put('user_obs_global', JSON.stringify(list));
        }
        return c.json({ success: true, data: newObs } satisfies ApiResponse<Observation>);
    });
    // Durable Object Heartbeat (System Monitoring)
    app.get('/api/system/heartbeat', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const value = await stub.getCounterValue() as number;
        return c.json({ success: true, data: { heartbeat: value, region: "edge" } });
    });
}