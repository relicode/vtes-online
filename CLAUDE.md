# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run lint:prettier` — Prettier check
- `npm run lint:typescript` — TypeScript type check (`tsc --noEmit`)
- `npm run format` — auto-fix ESLint + Prettier

No test framework is configured yet.

## Architecture

Next.js 16 App Router with React 19 and MUI Material v7. React Compiler is enabled (`reactCompiler: true` in `next.config.ts`). Do not use manual `useMemo`, `useCallback`, or `React.memo` — the compiler handles memoization automatically.

- `src/app/` — App Router pages and layouts (server components by default)
- `src/components/` — shared components
- `src/theme.ts` — MUI theme config (CSS variables, light/dark color schemes, Inter font)
- `src/components/ThemeRegistry.tsx` — client component wrapping `AppRouterCacheProvider` + `ThemeProvider` + `CssBaseline` + `GlobalStyles`

## Conventions

- **Path alias**: `$/` maps to `src/` (e.g., `import ThemeRegistry from '$/components/ThemeRegistry'`)
- **MUI imports**: individual paths — `import Button from '@mui/material/Button'`, never destructured barrel imports
- **No semicolons**, single quotes, 120 char print width, es5 trailing commas
- **Import order** (enforced by prettier plugin): third-party → blank line → `$/` aliased → relative
