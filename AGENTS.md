# Repository Guidelines

Tiny Gratitude is an offline‑only, installable SvelteKit PWA. Keep it local, fast, and calm.

## Project Structure & Module Organization
- `src/routes/`: UI routes (`+page.svelte`). Key pages: `/` (Today), `/calendar`, `/day/[ymd]`, `/gallery`, `/search`, `/settings`.
- `src/lib/`: app logic and UI primitives (`db.ts`, `types.ts`, `storage.ts`, `crypto.ts`, `date.ts`, `ics.ts`, `animations.ts`, `components/*`).
- `src/service-worker.ts`: cache‑first, cross‑origin blocking.
- `static/`: `manifest.webmanifest`, icons, any local assets.
- `tests/`: add unit/e2e tests here (see Testing).

## Build, Test, and Development Commands
- `npm run dev`: Vite dev server. If CSP blocks HMR, temporarily add `ws:` to `connect-src` in `src/app.html` during development only.
- `npm run build`: Static production build (adapter‑static).
- `npm run preview`: Serve the production build locally.
- `npm run check`: TypeScript project check (`tsc`).
- `npm run typecheck`: Svelte semantic checks (non‑blocking).
- `npm test`: Run Vitest; add `-- --coverage` for coverage.
- `npm audit`: Security audit; fix deliberately with PRs (avoid `--force` unless reviewed).

## Coding Style & Naming Conventions
- Language: TypeScript (strict). Svelte 5 + Tailwind.
- Components: `PascalCase.svelte` in `src/lib/components/`; route files follow SvelteKit’s `+page.svelte` pattern.
- Variables `camelCase`; constants `UPPER_SNAKE_CASE`.
- Indentation: 2 spaces. Keep Tailwind classes ordered logically (layout → spacing → color → state).
- Format/Lint: Prettier/ESLint not configured yet; keep formatting consistent. Propose configs in a separate PR.

## Testing Guidelines
- Framework: Vitest for unit/property tests; Playwright for E2E (planned).
- Location: `tests/**/*.test.ts` (or colocated near source if clearer).
- Names: `*.test.ts`/`*.spec.ts`.
- Coverage: target ≥80% for new/changed code. Document any intentional gaps.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`). Imperative mood, scoped.
- PRs: clear description, linked issues (`Closes #123`), screenshots/GIFs for UI, test plan, and note any CSP/service‑worker impacts. Do not add network calls or third‑party scripts.

## Security & Offline Policy
- Offline‑only: CSP forbids network egress; service worker rejects cross‑origin. Don’t introduce external URLs, telemetry, or remote fonts.
- Secrets: none required; never commit credentials. All data stays in IndexedDB.
