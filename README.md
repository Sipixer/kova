# Kova

Kova is a **context memory for your AI**. A lightweight agent runs on your
machines, captures what you work on (documents, web pages) and makes it
searchable by meaning — so the AI you already use (ChatGPT, Claude) can answer
from your real work.

## Stack

- **TanStack Start** (React, SSR) — web dashboard
- **Hono** on **Bun** — server, exposing **oRPC** over HTTP (`/rpc`) and WebSocket (`/ws`)
- **oRPC** — end-to-end type-safe APIs (HTTP + WebSocket, live queries)
- **shadcn/ui** (Base UI) + **Tailwind v4** — UI
- **Turborepo** + **Bun workspaces** — monorepo
- **TypeScript 7** (native compiler)

## Architecture

```
apps/agent (Bun)  ──── oRPC over WebSocket ────▶  apps/server (Hono on Bun)
   register / heartbeat                              /ws   → presence hub (in-memory)
                                                     /rpc  → oRPC HTTP + live queries
apps/web (TanStack Start)  ── oRPC HTTP + live query ──▶  apps/server
   live list of connected machines (React Query)
```

- The **agent** opens a WebSocket to the server and registers itself over oRPC.
  When it stops, the socket closes and the server removes it from presence.
- The **server** keeps an in-memory registry of connected machines and exposes
  a live `machines` stream (oRPC event iterator).
- The **web** dashboard subscribes to that stream with React Query
  (`experimental_liveOptions`) and shows connected machines in real time.

## Getting started

```bash
bun install
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env

bun run dev        # web (:3001) + server (:3000)
```

Then, in separate terminals, start one or more agents:

```bash
bun run agent      # run it again for a second machine
```

Open http://localhost:3001 — connected agents appear live under **Machines**.

## Scripts

- `bun run dev` — web + server in watch mode
- `bun run agent` — start an agent (run multiple times for multiple machines)
- `bun run build` — build web (Vite) and server (`bun build`)
- `bun run check-types` — typecheck everything (native `tsc`)

## Structure

```
kova/
├── apps/
│   ├── web/      # TanStack Start dashboard (shadcn UI)
│   ├── server/   # Hono on Bun — oRPC over HTTP (/rpc) + WebSocket (/ws)
│   └── agent/    # Bun agent — connects over oRPC/WS, compilable to a binary
└── packages/
    ├── api/      # shared oRPC routers + presence
    ├── env/      # typed environment variables (t3-env)
    └── config/   # shared tsconfig
```
