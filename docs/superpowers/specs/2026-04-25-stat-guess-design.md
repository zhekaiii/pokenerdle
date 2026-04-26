# Stat Guess — Design Spec

**Date:** 2026-04-25
**Status:** Approved (pending implementation plan)

## Overview

Stat Guess is a new solo gamemode for Pokénerdle. The user is shown a Pokémon (sprite, name, dex number) and guesses its 6 base stats by adjusting sliders. After submitting, the user sees a percentage score and per-stat closeness feedback, then auto-advances to the next Pokémon. Endless / on-demand — no daily lock, no streaks, no leaderboards.

The reveal intentionally hides type and generation — the challenge is purely about recalling base stats from the Pokémon's identity, not deducing them from typing or era.

The mode complements the existing three modes (Daily Challenge, PokéChain, Path Finder) as a casual, replayable practice/trivia experience.

## Goals

- **Casual practice mode** — low pressure, replayable, no commitment
- **Reuses existing patterns** — stateless solo mode like Path Finder, layered backend like the rest of the app
- **Filterable pool** — by generation and by competitive metagame format (Pokémon Champions Reg M-A at launch)
- **Foundation for future formats** — schema and data shape generalize to additional formats (other VGC seasons, Smogon tiers) without rework

## Non-goals (v1)

- Daily / streak mechanics
- Server-side scoring or anti-cheat
- Persisted user history / leaderboards
- Sharing / social features
- Multiple difficulty modes (silhouette-only, no-types, etc.)

## User experience

### Entry

A new card on `HomePage.tsx`, alongside Daily Challenge / PokéChain / Path Finder. Subtitle: "Solo trivia". Icon and color TBD during implementation.

### Game flow

1. User lands on `/stat-guess`. A round loads.
2. The Pokémon's sprite, name, and dex number are revealed at the top. Type and generation are intentionally not shown — the challenge is recall, not deduction.
3. Six sliders below — HP, Attack, Defense, Sp. Atk, Sp. Def, Speed — each ranges 1–200, default 100 (the slider midpoint). A live "Total: N" displays the running sum. The default value is intentionally a neutral starting point; users can submit without adjusting (a "lazy guess"), and they'll occasionally luck into perfect closeness on stats that actually equal 100 — accepted behavior for a practice mode.
4. User adjusts sliders, clicks Submit.
5. Result panel replaces the submit button:
   - Big rounded percentage (e.g. "83%")
   - Per-stat rows: `HP · You: 80 · Actual: 76 · Δ4` with green/yellow/gray tint
   - "Next" button with an 8-second countdown ring
6. After 8s (or on click), the next Pokémon loads. Loop indefinitely.
7. Filter changes at any time discard the current round and load a new one matching the filters.

### Filters

Format and generation are **mutually exclusive** scoping mechanisms — both are alternative ways to narrow the Pokémon pool, and combining them produces awkwardly tiny intersections (e.g. "Reg M-A ∩ Gen 4" might be 5 Pokémon). The UI enforces the exclusivity, and the API rejects requests with both.

A segmented control at the top: **`[ All ]  [ By Generation ]  [ By Format ]`**.

- **All** — full default-form Pokémon pool (the same `DAILY_WHITELISTED_POKEMON_WHERE` base used elsewhere). Default selection.
- **By Generation** — reveals a row of generation chips (1–9, multi-select; at least one must stay selected).
- **By Format** — reveals a format dropdown ("Pokémon Champions · Reg M-A", and any future formats).

Switching segments discards the previous segment's sub-selection (i.e. switching from "By Format" to "By Generation" doesn't preserve a hidden format choice). A "Reset" link appears when the segment is not "All".

Filter selections persist in `localStorage` under the key `statGuess.filters`. Not synced to URL.

### Session footer

Below the gameplay area, a one-line summary: `Round 7 · Avg 71% · Best 92% on Empoleon`. Updates after every submit. Resets on page unmount (not persisted).

## Architecture

### Workspace layout

**Backend:**
- `backend/data/metagame-formats/champions-reg-ma.json` — curated source data (one file per format)
- `backend/scripts/buildMetagameFormats.ts` — build-time loader: creates SQLite tables, validates Pokémon IDs, inserts data
- `backend/build-db.sh` — extended with the new build step and `prisma db pull`
- `backend/prisma-sqlite/schema.prisma` — gains `metagame_format` and `metagame_format_pokemon` models via `db pull` (NOT hand-edited)
- `backend/src/routes/statGuess.routes.ts`
- `backend/src/controllers/statGuess.controllers.ts`
- `backend/src/services/statGuess.service.ts`
- `backend/src/repositories/pokemon.repository.ts` — extended with `getRandomPokemonWithStats` and `getMetagameFormats`

**Frontend:**
- `frontend/src/routes/stat-guess.tsx` — TanStack file route
- `frontend/src/pages/StatGuess/index.tsx` — main page component
- `frontend/src/pages/StatGuess/components/{StatSlider, ResultPanel, FilterBar, PokemonReveal, CountdownButton}.tsx`
- `frontend/src/pages/StatGuess/hooks/useStatGuess.ts` — state machine
- `frontend/src/pages/StatGuess/scoring.ts` — pure scoring functions (testable in isolation)
- `frontend/src/pages/StatGuess/StatGuess.module.scss`
- `frontend/src/api/statGuess/index.ts`
- `frontend/src/pages/HowToPlay/StatGuessRules.tsx` + matching route entry
- `frontend/public/locales/statGuess/{en,zh-Hans,zh-Hant}.json`
- `HomePage.tsx` updated with a new mode card

**Shared:**
- `shared/src/statGuess.ts` — types and Zod schemas for request/response

### Data layer (SQLite)

Two new tables, created by the build script via raw SQL:

```sql
CREATE TABLE IF NOT EXISTS metagame_format (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS metagame_format_pokemon (
  format_id TEXT NOT NULL,
  pokemon_id INTEGER NOT NULL,
  PRIMARY KEY (format_id, pokemon_id),
  FOREIGN KEY (format_id) REFERENCES metagame_format(id),
  FOREIGN KEY (pokemon_id) REFERENCES pokemon_v2_pokemon(id)
);

CREATE INDEX IF NOT EXISTS metagame_format_pokemon_format_id_idx
  ON metagame_format_pokemon (format_id);
```

Naming: `metagame_format` (not `stat_guess_format`) so the table is reusable across any future feature that needs format/tier data.

After `buildMetagameFormats.ts` runs, `prisma db pull` introspects these tables and regenerates `schema.prisma` with the corresponding models. The regenerated `schema.prisma` is committed.

### Build pipeline

Updated `build-db.sh`:

```bash
cd pokeapi
source .venv/bin/activate
make migrate
make build-db
mv db.sqlite3 ../prisma-sqlite
cd ../prisma-sqlite
sqlite3 db.sqlite3 < preprocess.sql
cd ..
bun run ./scripts/buildMetagameFormats.ts
pnpm prisma db pull --schema=./prisma-sqlite/schema.prisma
pnpm prisma generate --schema=./prisma-sqlite/schema.prisma
bun run ./src/refreshGraph.ts
```

`buildMetagameFormats.ts` responsibilities:
1. Read every `*.json` in `backend/data/metagame-formats/`
2. Open the freshly-built SQLite (`prisma-sqlite/db.sqlite3`)
3. Create the two tables (idempotent — `CREATE TABLE IF NOT EXISTS`)
4. For each JSON file, validate that every `pokemonIds` entry exists in `pokemon_v2_pokemon` — abort with a clear error if any ID is missing
5. Insert the format row and all format-pokemon link rows (use `INSERT OR REPLACE` for idempotency on re-runs)

JSON file shape:
```json
{
  "id": "champions-reg-ma",
  "displayName": "Pokémon Champions · Reg M-A",
  "pokemonIds": [1, 4, 7, ...]
}
```

For v1, `champions-reg-ma.json` is hand-curated from the published Reg M-A rules (272 Pokémon).

### API contract

Both endpoints unauthenticated, both stateless.

**`GET /stat-guess/formats`**

Returns the list of available metagame formats.

```typescript
{
  formats: Array<{
    id: string;          // "champions-reg-ma"
    displayName: string; // "Pokémon Champions · Reg M-A"
    pokemonCount: number;// 272
  }>;
}
```

Cacheable: `Cache-Control: public, max-age=3600`. Format display names are stored as English-only in the table for v1; localizing them is deferred (see "Out of scope").

**`GET /stat-guess/round?format=champions-reg-ma&excludeIds=395,400`**
**`GET /stat-guess/round?gen=1,4,9&excludeIds=395,400`**
**`GET /stat-guess/round?excludeIds=395,400`**

Returns one random Pokémon respecting the filter (if any).

Query params:
- `format` — format id (mutually exclusive with `gen`)
- `gen` — comma-separated generation ids (mutually exclusive with `format`)
- `excludeIds` — comma-separated Pokémon IDs to exclude (the frontend tracks the last 3 to prevent immediate duplicates)

All optional, but `format` and `gen` cannot both be present in the same request.

Note: no `lang` param. The response only carries the Pokémon ID; the frontend renders the localized name and sprite via existing hooks (`usePokemonNames`, `usePokemonIcons`).

Response:
```typescript
{
  pokemonId: number;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
}
```

Errors:
- `400 invalid_format` — format id not in the table
- `400 invalid_query` — malformed `gen` or `excludeIds`, OR both `format` and `gen` were supplied
- `404 no_pokemon_match_filter` — the selected scope (a format with no rows yet, or a generation list that's empty) yields no Pokémon. With "All" or with the curated formats / valid gens, this should never trigger in practice. `excludeIds` never causes a 404 because the service retries without exclusions if the with-exclusions query returns nothing (see "Service" below).
- `500` — unexpected

Validation: Zod schemas in `shared/src/statGuess.ts`, used by both backend and frontend. The mutual-exclusion rule is encoded as a Zod `refine` on the request schema, so both the controller and any frontend client share the constraint.

### Backend internals

**Repository — `getRandomPokemonWithStats({ scope, excludeIds? })`:**

The `scope` parameter is a discriminated union enforcing the mutual exclusion at the type level:

```typescript
type StatGuessScope =
  | { kind: "all" }
  | { kind: "format"; formatId: string }
  | { kind: "generations"; generations: number[] };
```

Uses the same "count + random offset" trick as `getPokemonForDaily`. Builds a `where` clause that AND's together:
- The existing `DAILY_WHITELISTED_POKEMON_WHERE` base (default forms only)
- One scope filter:
  - `kind: "all"` → no extra filter
  - `kind: "format"` → `metagame_format_pokemon: { some: { format_id: scope.formatId } }`
  - `kind: "generations"` → `pokemon_v2_pokemonform: { some: { pokemon_v2_versiongroup: { generation_id: { in: scope.generations } } } }`
- `excludeIds`: `id: { notIn: excludeIds }` (when non-empty)

Returns `null` if `count === 0`. The service handles fallback retry logic before deciding whether to 404.

Selects only `id` plus `pokemon_v2_pokemonstat` (no need to include type/form/species since the response is just `pokemonId` + stats).

**Service — `getRound({ scope, excludeIds })`:**

1. Calls `getRandomPokemonWithStats({ scope, excludeIds })`.
2. If the result is null AND `excludeIds` was non-empty, retries once with `excludeIds = []` (so a small filtered pool — e.g. 3 Pokémon all in the exclude list — never 404s the user; we accept an immediate repeat instead).
3. If still null, throws `NoMatchingPokemonError` → controller maps to `404 no_pokemon_match_filter`.
4. Maps the Prisma result to the API response shape: just `pokemonId` plus the 6 stats extracted by `stat_id`. Name and sprite are rendered client-side via existing global hooks.

**Controller:**

Standard pattern matching `pathfinder.controllers.ts`. Validates query with Zod (the schema's `refine` rejects requests where both `format` and `gen` are present), constructs a `StatGuessScope` from the validated query, calls the service, sends the response. Maps domain errors to HTTP statuses.

**Routes:**

```typescript
router.get("/formats", getFormatsController);
router.get("/round", getRoundController);
```

Mounted in `index.ts` at `/stat-guess`.

### Frontend internals

**Filter model** (in `shared/src/statGuess.ts`, used by both UI and API client):

```typescript
type StatGuessFilter =
  | { kind: "all" }
  | { kind: "format"; formatId: string }
  | { kind: "generations"; generations: number[] };
```

The same shape is used as the local component state (the segmented control writes one of these), the `localStorage` payload, and the input to the API client (which serializes it into the appropriate query string). Mutual exclusion is enforced at the type level — there is no representable state where both `format` and `generations` are set.

**State machine** (in `useStatGuess.ts`):

```typescript
type StatGuessState =
  | { phase: "loading" }
  | { phase: "guessing"; round: StatGuessRound; guesses: StatGuesses }
  | { phase: "result"; round: StatGuessRound; guesses: StatGuesses; score: StatGuessScore };
```

Transitions:
- mount → `loading`
- round arrives → `guessing` (slider values default to 100, midpoint)
- Submit → compute score locally → `result` (kicks off 8s countdown timer)
- countdown end OR Next clicked → bump `roundIndex` → `loading` → next round arrives → `guessing`
- filter change → reset `roundIndex` to 0, bump `filterEpoch` → `loading`

**Data fetching (TanStack Query):**

- `useFormats()` — `queryKey: ["statGuess", "formats"]`, `staleTime: Infinity`. Locale-independent for v1 (display names are English-only).
- `useRandomRound(filter, roundIndex)` — `queryKey: ["statGuess", "round", filter, roundIndex]`, `staleTime: 0`. `filter` is the `StatGuessFilter` discriminated union; the API client serializes it into either `?format=…`, `?gen=…`, or no scope param.
  - Bumping `roundIndex` triggers refetch
  - Filter change resets `roundIndex` and changes the key
  - Locale-independent (response is just `pokemonId` + stats; rendering uses `usePokemonNames`/`usePokemonIcons` which already handle language).

The frontend tracks the last 3 Pokémon IDs shown in component state and passes them to the backend as `excludeIds` to avoid back-to-back duplicates.

**Sliders:**

Use Radix UI Slider (already in the codebase). Each slider:
- Range 1–200, step 1
- `aria-label` localized: "HP guess, 1 to 200"
- Keyboard: arrow keys ±1, Page Up/Down ±10, Home/End jump to bounds
- Touch: thumb min 24×24px

**Page sections (top to bottom):**
1. Title strip with How-to-Play link
2. Filter bar (collapsible on mobile)
3. Pokémon reveal card (sprite + name + dex no. — sourced from `usePokemonIcons`/`usePokemonNames`; no type chips, no gen badge by design)
4. Six stat slider rows + live total
5. Submit button OR result panel
6. Session footer (Round N · Avg X% · Best Y% on Z)

**Result panel:**

When `phase === "result"`:
- Rounded percentage (large, central)
- Six per-stat rows with `Δ` and color tint
- "Next" button with an 8-second SVG-ring countdown around it
- Click anytime to skip; auto-advances when ring fills
- Pauses when `document.visibilityState !== "visible"`

### Scoring

**Per-stat closeness:** `closeness = max(0, 1 - (Δ/60)²)`, where `Δ = |guessed - actual|`. TOLERANCE = 60 means a guess off by 60+ scores 0 for that stat; off by 0 scores 1.0.

**Overall score:** average of 6 closenesses, displayed as `round(overall * 100)` percent.

**Per-stat color:**
- `closeness ≥ 0.85` → green
- `closeness ≥ 0.50` → yellow
- below → gray

**No tier labels.** Just the percentage and the colored per-stat rows.

Scoring is purely client-side. Implemented in `frontend/src/pages/StatGuess/scoring.ts` as pure functions, easy to unit test.

### Internationalization

New namespace `statGuess` with three files. Keys (English):

```json
{
  "title": "Stat Guess",
  "howToPlay": "How to play",
  "filters": {
    "scope": {
      "all": "All",
      "byGeneration": "By Generation",
      "byFormat": "By Format"
    },
    "format": "Format",
    "generation": "Generation",
    "reset": "Reset"
  },
  "sliders": {
    "hp": "HP",
    "attack": "Attack",
    "defense": "Defense",
    "specialAttack": "Sp. Atk",
    "specialDefense": "Sp. Def",
    "speed": "Speed",
    "ariaLabel": "{{stat}} guess, 1 to 200",
    "total": "Total: {{value}}"
  },
  "actions": {
    "submit": "Submit",
    "next": "Next",
    "nextIn": "Next in {{seconds}}s"
  },
  "result": {
    "accuracy": "{{percent}}%",
    "perStat": "You: {{guess}} · Actual: {{actual}} · Δ{{delta}}"
  },
  "session": {
    "round": "Round {{n}}",
    "average": "Avg {{percent}}%",
    "best": "Best {{percent}}% on {{name}}"
  },
  "errors": {
    "noMatch": "No Pokémon match these filters.",
    "loadFailed": "Couldn't load the next Pokémon.",
    "retry": "Retry",
    "resetFilters": "Reset filters"
  }
}
```

Format `displayName` strings live in the `metagame_format` table (English). For v1, that is the only language for format names; `champions-reg-ma` displays as "Pokémon Champions · Reg M-A" in all locales. Translating format names is deferred — when we add another format it's easy to add an i18n indirection at that point.

### How-to-Play

New rules page: `frontend/src/pages/HowToPlay/StatGuessRules.tsx`. Registered in the existing how-to-play route tree. Content covers: the 6 stats, the slider scale (1–200), how scoring works, and the format/generation filters. Translations in the `statGuess` namespace.

## Edge cases

- **Empty scope** → shouldn't happen with curated formats and valid gen lists, but if it does (e.g. a format file with zero Pokémon), backend returns 404 → frontend shows "No Pokémon match these filters" with reset button
- **Backend error / network failure** → TanStack Query error state → "Couldn't load. [Retry]"
- **User submits without adjusting sliders** → allowed, treated as a (bad) guess
- **Page refresh mid-round** → restarts cleanly with a new round, session stats lost
- **Sprite missing** → fallback chain (Gen VIII icon → Gen VII icon → PokeSprite GitHub URL → generic placeholder)
- **Curated format references nonexistent Pokémon ID** → `buildMetagameFormats.ts` aborts the build with a clear error
- **Backend service crash** → frontend shows the standard network error UI
- **Same Pokémon picked twice in a row** → frontend passes the last 3 Pokémon IDs as `excludeIds`; backend honors them
- **Filtered pool smaller than the exclude list** (e.g. format with only 3 Pokémon and all 3 are excluded) → backend retries once with `excludeIds = []`, accepting an immediate repeat over a 404

## Out of scope (potential follow-ups)

- Additional formats (gen9vgc2026, Smogon tiers) — schema already supports them
- Server-side persistence of practice attempts → personal stats panel
- Daily Stat Guess variant (one shared Pokémon per day, streak)
- Difficulty modes (silhouette / no types / no name)
- Sharing results
- Translating format display names

## Open implementation details (decided during plan/build)

- Exact card color for the home page entry
- Exact icon (lucide-react) for the home card
- Mobile breakpoints for the filter bar (collapse vs always-visible)
- Whether to use Radix UI Slider directly or wrap it in a styled component matching the codebase's existing slider conventions (none in use yet — TBD)
