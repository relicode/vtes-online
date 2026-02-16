# VTES Online

A web-based implementation of Vampire: The Eternal Struggle (VTES), the classic multiplayer card game. Players build decks, join games, and play in real time through their browser.

## Getting started

You need Node.js 18+ and Docker.

```bash
# Start Redis
docker compose up -d redis

# Install dependencies
npm install

# Seed the database with sample game data
npm run seed

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play.

To reset all game data and re-seed from scratch:

```bash
npm run seed:flush
```

## How it works

The game runs entirely on Redis — there is no SQL database. All game state lives in Redis as JSON, and real-time updates are pushed to players via Server-Sent Events (SSE) backed by Redis Pub/Sub.

When a player takes an action (draw a card, lock a minion, advance the turn phase, etc.), here's what happens:

1. The client sends the action to the server via a Next.js Server Action
2. The server clones the current game state, applies the mutation, and writes it back to Redis along with a log entry
3. Redis Pub/Sub notifies all connected clients via SSE
4. Each client receives an updated view of the game tailored to their perspective — opponents' hands and uncontrolled crypt cards stay hidden

If the SSE connection drops, the client automatically falls back to polling.

## Game views

The game page uses three parallel panels rendered simultaneously:

- **Game board** — the public view showing all players' controlled minions, pool, and visible cards. Append `?gfx=3d` for a 3D tabletop perspective.
- **Player hand** — your private hand and game controls (only visible to you)
- **Action log** — a scrolling feed of what's happened in the game

Each panel is also available as a standalone page (e.g. `/game/[gameId]/log`).

## Tech stack

- **Next.js 16** (App Router) with **React 19**
- **MUI Material v7** for the UI
- **Redis** (ioredis) for all data storage and real-time messaging
- **React Compiler** for automatic memoization
- **Three.js** (react-three-fiber) for the 3D spectator view

## Conventions

- **MUI imports**: use individual paths (`import Button from '@mui/material/Button'`), never destructured barrel imports
- **Use `<Stack>` instead of `<Box sx={{ display: 'flex', flexDirection: 'column' }}>`** — Stack is the semantic equivalent and keeps markup concise. Only use Box for flex columns when you need conditional `flexDirection` or other dynamic props.

## Production deployment

```bash
docker compose --profile app up
```

This builds the Next.js standalone container and runs it alongside Redis. The app listens on port 3000.

## AI-assisted development

This project includes two [MCP](https://modelcontextprotocol.io/) servers (configured in `.mcp.json`) for use with Claude Code and other AI coding tools:

- **MUI** (`@mui/mcp`) — fetches Material UI documentation on demand for component and styling questions
- **Next.js DevTools** (`next-devtools-mcp`) — connects to the running dev server for runtime diagnostics, route inspection, and error checking

## Scripts

| Command                   | Description                |
| ------------------------- | -------------------------- |
| `npm run dev`             | Start dev server           |
| `npm run build`           | Production build           |
| `npm run lint`            | Run ESLint                 |
| `npm run lint:prettier`   | Check Prettier formatting  |
| `npm run lint:typescript` | TypeScript type check      |
| `npm run format`          | Auto-fix ESLint + Prettier |
| `npm run seed`            | Seed Redis with test data  |
| `npm run seed:flush`      | Flush Redis and re-seed    |
