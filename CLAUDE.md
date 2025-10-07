# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tiny Gratitude** is a privacy-focused, local-only daily gratitude journal PWA built with vanilla TypeScript, Vite, and Tailwind CSS. All data is stored locally in IndexedDB using Dexie.js with no backend or tracking.

## Development Commands

```bash
# Development server with hot reload
npm run dev

# Production build (TypeScript compilation + Vite build)
npm run build

# Preview production build locally
npm run preview

# Serve production build on specific port
PORT=3000 npm run start
```

## Architecture

### Core Design Patterns

**1. Router-Based SPA**
- Hash-based routing in `src/lib/router.ts`
- Single `Router` class handles all navigation
- Pages registered in `src/main.ts` with route handlers
- Each page returns a cleanup function for proper lifecycle management
- Router automatically calls cleanup when navigating away

**2. Reactive State Management**
- Custom `Store` class in `src/lib/store.ts` (subscribe/notify pattern)
- Stores provide reactive state with `get()`, `set()`, `update()`, `subscribe()`
- `derived()` function creates computed stores from multiple sources
- Global settings store in `src/lib/settings.ts` reacts to DB changes

**3. Component Lifecycle Pattern**
All pages follow this pattern:
```typescript
export function createPage(container: HTMLElement): () => void {
  let disposed = false;
  const cleanupFns: Array<() => void> = [];

  // Render logic
  function render() {
    if (disposed) return;
    // ... render to container
  }

  // Return cleanup function
  return () => {
    disposed = true;
    cleanupFns.forEach(fn => fn());
  };
}
```

**4. Database Layer**
- Dexie.js wrapper in `src/lib/db.ts`
- Two tables: `greats` (gratitude entries) and `settings`
- `ymd` format: 'YYYY-MM-DD' in local timezone
- All DB operations are async
- Great entries have unique `ymd` constraint (one per day)

### Key Technical Details

**Routing:**
- Routes registered in `src/main.ts:44-80`
- Root route `/` always navigates to home page (src/main.ts:82-86)
- Dynamic routes like `/day/:ymd` use parameter extraction
- Wildcard `*` route catches 404s and redirects to home

**Page Structure:**
- Layout created once in `src/components/layout.ts` (header + nav + content area)
- Pages render into `#app-content` container
- Navigation uses hash links: `#/calendar`, `#/gallery`, etc.

**Data Types:**
- `Great` type in `src/lib/types.ts` represents gratitude entries
- 280 character limit on entries
- Optional mood emoji
- Optional encryption support (iv field)

**Styling:**
- Tailwind CSS with custom glassmorphism utilities
- Two typeface pairs: 'pairA' (Inter + Fraunces) and 'pairB'
- Typeface applied via class on layout root
- Google Fonts loaded in `index.html`

**Animations:**
- Motion library for animations in `src/lib/animations.ts`
- `addFocusBloom()` - focus ring animation
- `addClickPulse()` - button click feedback
- `bloomElement()` - success state bloom effect

**Icons:**
- Lucide icons via `lucide` package
- Helper `iconToSVG()` in `src/lib/icons.ts` converts to SVG elements

### Important Constraints

- **No frameworks**: Pure TypeScript + DOM manipulation
- **Path aliasing**: Use `@/` for `src/` imports (configured in `vite.config.ts`)
- **One entry per day**: Enforced by unique `ymd` index in DB
- **Local-only**: No network requests, no analytics, no tracking
- **Cleanup required**: Always return cleanup function from page creators

### Pages

- **Home** (`/`): Daily gratitude entry form with emoji picker
- **Calendar** (`/calendar`): Month view of all entries
- **Day** (`/day/:ymd`): View/edit specific day's entry
- **Gallery** (`/gallery`): Visual grid of all entries
- **Search** (`/search`): Full-text search across entries
- **Settings** (`/settings`): App preferences and data export
