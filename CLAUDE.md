# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation

- `README.md` — project overview, setup instructions, and how the game works (human-readable)
- `CLAUDE.md` — this file; architecture, conventions, and implementation details for Claude Code
- `docs/VTES_RULES.md` — comprehensive VTES card game rules reference covering card types, turn structure, combat, political actions, and victory conditions. Consult this when implementing game mechanics.

## Commands

- `npm run dev` — start dev server (requires Redis running, see below)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run lint:prettier` — Prettier check
- `npm run lint:typescript` — TypeScript type check (`tsc --noEmit`)
- `npm run format` — auto-fix ESLint + Prettier
- `npm run seed` — seed Redis with test game data
- `npm run seed:flush` — flush Redis and re-seed

No test framework is configured yet.

## Infrastructure

Redis is the sole data store (no SQL database). Start it with `docker compose up -d redis`. The app connects to `REDIS_URL` (default `redis://localhost:6379`). For production, `docker compose --profile app up` runs both Redis and the standalone Next.js container.

## Architecture

Next.js 16 App Router with React 19 and MUI Material v7. React Compiler is enabled (`reactCompiler: true` in `next.config.ts`). Do not use manual `useMemo`, `useCallback`, or `React.memo` — the compiler handles memoization automatically.

### Data flow

Game action lifecycle:

1. **Client dispatches** — player triggers a `GameAction` (e.g. `drawFromLibrary`, `toggleLock`) which is sent to the server via a Next.js Server Action (`performGameAction` in `src/actions/game-actions.ts`)
2. **Server applies mutation** — the action handler `structuredClone`s the `GameState`, applies the mutation, persists the new state to Redis, and appends an `ActionLogEntry` to the capped log
3. **SSE broadcasts** — the server publishes to the `game:{gameId}:events` Redis Pub/Sub channel; connected clients receive the updated `GameView` (player-specific, hides opponents' hidden cards) or `GameSummary` (public spectator view) via SSE
4. **Client updates** — `useGameEventStream` replaces local state with the incoming view and the action log entry appears in the action log panel

Key files:

- `src/actions/` — Server Actions (`'use server'`). All mutations go through here. Each action returns `ActionResult<T>` (discriminated union: `{ success: true, data: T } | { success: false, error: string }`).
- `src/lib/redis.ts` — singleton ioredis client (cached on `globalThis` in dev)
- `src/lib/game-views.ts` — pure projection functions that transform authoritative `GameState` into `GameView` or `GameSummary`

### Real-time updates

SSE endpoint at `/api/game/[gameId]/events` using Redis Pub/Sub. Server subscribes to `game:{gameId}:events` channel; mutations publish to that channel after writing state. Client-side `useGameEventStream` hook (in `src/components/game/GameEventStream.tsx`) connects via `EventSource` and falls back to `router.refresh()` polling on error.

### Game engine

Game actions use a discriminated union (`GameAction` in `src/types/game-actions.ts`). The dispatcher `applyGameAction` in `src/actions/game-action-handlers.ts` pattern-matches on `action.type` and applies mutations to a `structuredClone`'d `GameState`. Action log entries are stored in a capped Redis list (`game:{gameId}:log`, 200 entries).

### Key data types

- `src/types/game.ts` — `GameState` (authoritative server state), `GameView` (per-player view), `PlayerState`, turn state machine (`TurnPhase`, `ActionState`, `CombatState`)
- `src/types/card.ts` — `CryptCard`, `LibraryCard`, `Card` union; discipline casing convention: lowercase = inferior, UPPERCASE = superior
- `src/types/user.ts` — `User`, `Deck`, `DeckCardEntry`
- `src/data/cards.ts` — parses `crypt.json` / `library.json` into typed card arrays; card images served from `/cards/`

### Game route — parallel routes

The game page (`/game/[gameId]`) uses Next.js parallel routes to render three independent slots in a single layout:

- `@public` — public game board (spectator view, visible to all)
- `@player` — player-specific hand and controls (renders `null` for spectators at `/game/[gameId]`)
- `@log` — action log

The layout (`GameLayoutShell.tsx`) arranges these slots responsively. Each slot has both `/game/[gameId]/page.tsx` (spectator) and `/game/[gameId]/[userId]/page.tsx` (player) variants with matching `default.tsx` files.

There is also a standalone 3D spectator view at `/game-3d/[gameId]` using Three.js (`@react-three/fiber` + `@react-three/drei`).

### Redis key patterns

- `game:{gameId}` — JSON-serialized `GameState`
- `game:{gameId}:log` — capped list of `ActionLogEntry` JSON (200 entries, newest first via `LPUSH`)
- `game:{gameId}:players` — set of player IDs
- `game:{gameId}:events` — Pub/Sub channel for SSE notifications

### Adding a new game action

1. Add the action type to the `GameAction` discriminated union in `src/types/game-actions.ts`
2. Write a handler function in `src/actions/game-action-handlers.ts` returning `HandlerResult`
3. Add the `case` to the `applyGameAction` switch in the same file

## Conventions

- **Path alias**: `$/` maps to `src/` (e.g., `import ThemeRegistry from '$/components/ThemeRegistry'`)
- **MUI imports**: individual paths — `import Button from '@mui/material/Button'`, never destructured barrel imports
- **No semicolons**, single quotes, 120 char print width, es5 trailing commas
- **Import order** (enforced by prettier plugin): third-party → blank line → `$/` aliased → relative
- **`'use server'` files can only export functions** — `export type` causes Turbopack build errors. Keep shared types in `src/types/` and import them into action files.

## MCP

Use the mui-mcp server to answer any MUI questions --

- 1. call the "useMuiDocs" tool to fetch the docs of the package relevant in the question
- 2. call the "fetchDocs" tool to fetch any additional docs if needed using ONLY the URLs present in the returned content.
- 3. repeat steps 1-2 until you have fetched all relevant docs for the given question
- 4. use the fetched content to answer the question
