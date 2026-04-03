# Daily Challenge Archive — Design Spec

## Overview

Allow users to access and play old daily challenges via a calendar drawer on the daily challenge page. Users can browse past challenges since launch (Aug 9, 2025), play ones they haven't attempted, and view their previous results for completed ones.

## Key Decisions

- **Access**: Open to all users (authenticated and unauthenticated)
- **Date range**: All past challenges since DAY_1 (Aug 9, 2025) through yesterday
- **Stats**: Archive plays are tracked separately — they do not affect the main stats (win rate, streaks, histogram)
- **Replay**: One-and-done — once a challenge is completed (solved or failed), it cannot be replayed
- **Sharing**: Disabled for archive challenges — share button hidden when viewing a non-today date
- **localStorage removal**: `guessesAtom` will no longer use `atomWithStorage` — server is the sole source of truth for all guess data

## Data Model

### Schema Change

Add `isArchive` field to `UserDailyGuess` in `backend/prisma-pg/schema.prisma`:

```prisma
model UserDailyGuess {
  // ... existing fields ...
  isArchive         Boolean  @default(false)
}
```

This field distinguishes archive plays from same-day plays. The existing `getUserStats` query filters to `isArchive = false` to preserve current stat behavior.

### No New Tables

The existing `DailyChallenge` and `UserDailyGuess` tables already support arbitrary dates. The backend's `getDailyPokemon(date)` already generates challenges for any date via seeded RNG chaining.

## API Changes

### Modified Endpoints

**`POST /v1/daily/challenge/submit`**
- Already accepts `date` parameter
- New validation: reject if `date < DAY_1` or `date > today`
- If `date !== today`, set `isArchive: true` on the saved guess
- If user already completed that date (solved or reached guess limit), reject with 409 Conflict

**`GET /v1/daily/challenge/answer`**
- Already accepts required `date` query param
- For archive dates (any date before today), always return the answer regardless of game state — the challenge day is over

### New Endpoint

**`GET /v1/daily/challenge/calendar?month=2025-09`**

Returns calendar data for a given month. Only includes dates the user has attempted.

```ts
// Response
{
  entries: Array<{
    date: string;        // "2025-09-01"
    solved: boolean;
    pokemonId: number;   // answer Pokemon ID (for sprite URL)
  }>
}
```

### Unchanged Endpoints

- `GET /v1/daily/challenge/guesses` — already accepts `date`, works as-is
- `GET /v1/daily/challenge/stats` — continues to show only same-day stats
- `POST /v1/daily/challenge/sync` — unchanged
- `POST /v1/daily/challenge/migrate` — unchanged

## Frontend State Management

### `guessesAtom` — Remove localStorage Persistence

Change from `atomWithStorage` to a plain Jotai atom. Server is the sole source of truth. Hydrated from route loader data on page load and date switches.

### `selectedDateAtom` — New

Stores the currently active date string. Defaults to `FROZEN_DATE` (today). Updated when user picks a date from the calendar.

### URL as Source of Truth

- No `date` param (`/daily`) = today's challenge
- `?date=2025-09-15` (`/daily?date=2025-09-15`) = archive challenge
- TanStack Router `searchParams` validation handles parsing
- If `date` equals today, normalize by removing the param (redirect to `/daily`)

### Date Switching Flow

1. User opens calendar drawer, picks a date
2. URL updates to `/daily?date=YYYY-MM-DD`
3. Route loader fires, fetches guesses for that date from server
4. `guessesAtom` hydrated from loader response
5. Gameplay UI renders with that date's state

### `isNewDay` Logic — Removed

The current code detects date changes to reset localStorage. With server-side data as the sole source of truth, this is unnecessary. The loader always fetches fresh data for the requested date.

### Guess Submission

`onGuess` passes the selected date (from `selectedDateAtom`) to `submitGuess`. Server validates and returns the result. Atom updated from the response.

## Calendar Drawer UI

### Trigger

A button in the daily challenge header area. Uses the existing shadcn `Button` component (secondary variant) with a calendar icon and "Past Challenges" label.

### Drawer Component

Uses the existing Vaul-based `Drawer` component (bottom sheet). Contains:

- **Month navigation** — left/right arrows to move between months
- **Calendar grid** — standard 7-column calendar layout
- **Date cells** show three states:
  - **Solved**: Pokemon sprite (answer) with day number in top-right corner
  - **Failed**: Pokemon sprite dimmed (reduced opacity) with a red X icon overlaid, day number in top-right
  - **Not attempted**: Just the day number centered
- **Date range**: DAY_1 through yesterday. Dates before DAY_1 and future dates are grayed out / not clickable. Today is not shown in the calendar (user accesses today's challenge normally).

### On Date Selection

Drawer closes, URL updates to `/daily?date=YYYY-MM-DD`, page loads that challenge.

### Calendar Data

Fetched from `GET /v1/daily/challenge/calendar?month=YYYY-MM`. Lightweight — only attempted dates with solved status and Pokemon ID for sprites.

## Archive Banner

When viewing a non-today date, a subtle banner appears above the gameplay area:

- Shows: "Challenge #N — MMM DD, YYYY"
- Includes a "Back to Today" button
- When the challenge is already completed (solved): green border, shows sprite + "Solved in N guesses"
- When the challenge is already completed (failed): shows the result in read-only mode

## Completed Archive Challenges

When a user navigates to a date they've already completed, same UI as current, no change.

## Edge Cases

- **URL shareability**: `/daily?date=2025-09-15` is shareable — loads that date's challenge for any visitor
- **Today normalization**: `/daily?date=<today>` redirects to `/daily` (no archive banner)
- **PostHog analytics**: Archive guess submissions include `isArchive: true` property to distinguish from same-day plays in analytics

## Mockups

Visual mockups are available in `.superpowers/brainstorm/` — see `calendar-drawer-v4.html` for the final version showing the calendar with sprites and the archive banner.
