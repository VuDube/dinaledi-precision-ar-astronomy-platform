import { Hono } from "hono";
import { Env } from './core-utils';
import { seedAll } from '@shared/seed-utils';
import { MOCK_ITEMS } from '@shared/mock-data';
import type { DemoItem, ApiResponse, Observation } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CF Workers Demo' }}));
    app.post('/api/seed', async (c) => {
        const results = await seedAll(c.env);
        return c.json({ success: true, data: results });
    });
    app.get('/api/demo', async (c) => {
        const items = await c.env.KVStore.get('demo_items');
        const data: DemoItem[] = items ? JSON.parse(items) : MOCK_ITEMS;
        return c.json({ success: true, data } satisfies ApiResponse<DemoItem[]>);
    });
    // Observation Sync Endpoints
    app.get('/api/obs', async (c) => {
        const stored = await c.env.KVStore.get('user_obs_global');
        const data: Observation[] = stored ? JSON.parse(stored) : [];
        return c.json({ success: true, data } satisfies ApiResponse<Observation[]>);
    });
    app.post('/api/obs/sync', async (c) => {
        const newObs = await c.req.json<Observation>();
        const stored = await c.env.KVStore.get('user_obs_global');
        const list: Observation[] = stored ? JSON.parse(stored) : [];
        // Check for duplicates
        if (!list.find(o => o.id === newObs.id)) {
            list.push({ ...newObs, syncStatus: 'synced' });
            await c.env.KVStore.put('user_obs_global', JSON.stringify(list));
        }
        return c.json({ success: true, data: newObs } satisfies ApiResponse<Observation>);
    });
    // Counter
    app.get('/api/counter', async (c) => {
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.getCounterValue() as number;
        return c.json({ success: true, data } satisfies ApiResponse<number>);
    });
    app.post('/api/counter/increment', async (c) => {
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.increment() as number;
        return c.json({ success: true, data } satisfies ApiResponse<number>);
    });
}