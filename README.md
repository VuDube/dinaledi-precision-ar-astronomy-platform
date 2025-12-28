# Dinaledi PWA

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/VuDube/dinaledi-precision-ar-astronomy-platform)

A full-stack Progressive Web App (PWA) built with React and Tailwind CSS, powered by Cloudflare Workers. Features a modern UI with shadcn/ui components, API backend with Hono, Durable Objects for stateful logic, and KV storage for persistence.

## Features

- **Modern React Frontend**: Vite + React 18 with TypeScript, TanStack Query for data fetching, and React Router.
- **Beautiful UI**: shadcn/ui components, Tailwind CSS with custom design system, dark mode support, and smooth animations.
- **Cloudflare Backend**: Hono API routes with CORS, logging, error handling. Includes Durable Objects for counters and KV for data storage.
- **PWA Ready**: Optimized for mobile, offline-capable with service worker support via Vite PWA plugin (configurable).
- **Demo Endpoints**: Health checks, seeding, KV demo data, Durable Object counter.
- **Development Tools**: Hot reload, error reporting, theme toggle, responsive design.
- **Production-Ready**: Type-safe, ESLint, Tailwind JIT, optimized builds for Cloudflare Pages/Workers.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide icons, TanStack Query, Zustand, Framer Motion, Sonner (toasts)
- **Backend**: Cloudflare Workers, Hono, Durable Objects, KV Namespace
- **Styling**: Tailwind CSS, Tailwind Animate, CSS Variables (light/dark mode)
- **Utilities**: clsx, tw-merge, Zod (validation), Immer, UUID
- **Dev Tools**: Bun, Wrangler, ESLint, TypeScript
- **UI Primitives**: Radix UI (all shadcn components pre-installed)

## Quick Start

1. **Install Dependencies**
   ```bash
   bun install
   ```

2. **Generate Worker Types** (one-time)
   ```bash
   bun run cf-typegen
   ```

3. **Run Locally**
   ```bash
   bun dev
   ```
   Opens at `http://localhost:3000` (or `$PORT`). API at `/api/*`.

4. **Seed Demo Data** (optional)
   ```bash
   curl -X POST https://your-worker.workers.dev/api/seed
   ```

## Local Development

- **Frontend**: `bun dev` (Vite dev server with HMR).
- **API Routes**: Automatically handled by Worker. Test with `curl` or browser:
  - `GET /api/health` – Health check
  - `GET /api/demo` – KV data (seeded or mock)
  - `GET /api/counter` – Durable Object counter
  - `POST /api/counter/increment` – Increment counter
- **Edit UI**: Replace `src/pages/HomePage.tsx`. Use shadcn components from `@/components/ui/*`.
- **Custom Routes**: Add to `worker/userRoutes.ts`, reloads automatically.
- **Theme**: Toggle dark/light mode via `ThemeToggle`.
- **Linting**: `bun lint`
- **Build**: `bun build` (generates `dist/` for Pages).

**Customization Tips**:
- Sidebar: Edit `src/components/app-sidebar.tsx` or use `AppLayout`.
- Error Handling: Uses `ErrorBoundary` and client error reporting to `/api/client-errors`.
- Queries: Use TanStack Query for API calls (e.g., `useQuery({ queryKey: ['demo'], queryFn: () => fetch('/api/demo').then(res => res.json()) })`).

## Deployment

Deploy to Cloudflare Workers with Pages integration (SPA + API):

1. **Configure Wrangler** (edit `wrangler.jsonc`):
   - Set `kv_namespaces` ID (create KV via Wrangler dashboard).
   - Update `name` if needed.

2. **Build & Deploy**
   ```bash
   bun deploy
   ```
   Deploys Worker + static assets automatically.

3. **One-Click Deploy**
   [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/VuDube/dinaledi-precision-ar-astronomy-platform)

**Post-Deploy**:
- Bind KV namespace in Workers dashboard.
- SPA routes handled via `assets.not_found_handling: "single-page-application"`.
- Access API at `https://your-worker.your-subdomain.workers.dev/api/*`.
- Custom domain: Configure in Cloudflare dashboard.

## Project Structure

```
├── src/              # React app (pages, components, hooks)
├── worker/           # Hono API + Durable Objects (edit userRoutes.ts)
├── shared/           # Shared types/mock data
├── public/           # Static assets
├── tailwind.config.js # Custom theme/design system
└── wrangler.jsonc    # Cloudflare config
```

## Scripts

| Script | Description |
|--------|-------------|
| `bun dev` | Start dev server |
| `bun build` | Production build |
| `bun lint` | Lint codebase |
| `bun preview` | Local preview of build |
| `bun deploy` | Build + deploy to Cloudflare |
| `bun cf-typegen` | Generate Worker types |

## Environment Variables

Handled via Wrangler bindings:
- `KVStore`: KV Namespace
- `GlobalDurableObject`: Durable Object Namespace

## Contributing

1. Fork & clone.
2. `bun install`.
3. Make changes in `src/` or `worker/userRoutes.ts`.
4. Test locally: `bun dev`.
5. PR with clear description.

## License

MIT License. See [LICENSE](LICENSE) for details.