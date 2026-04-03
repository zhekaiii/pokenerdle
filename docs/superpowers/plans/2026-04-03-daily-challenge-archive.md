# Daily Challenge Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to browse a calendar of past daily challenges and play ones they haven't attempted yet.

**Architecture:** Date-parameterized daily challenge — the existing `/daily` route gains a `?date=` search param. A calendar drawer (Vaul bottom sheet) lets users pick past dates. Server is sole source of truth for guesses (localStorage persistence removed). Archive plays are flagged with `isArchive` to keep stats separate.

**Tech Stack:** Prisma (PostgreSQL), Express.js, React, TanStack Router, Jotai, Vaul (Drawer), Tailwind CSS with `tw:` prefix, shadcn components, Zod, date-fns with `@date-fns/tz`.

**Spec:** `docs/superpowers/specs/2026-04-03-daily-challenge-archive-design.md`

---

## File Structure

### Backend — Modified
- `backend/prisma-pg/schema.prisma` — add `isArchive` field to `UserDailyGuess`
- `backend/src/repositories/daily.repository.ts` — add `isArchive` param to `saveUserGuess`, add `getCalendarData` query, update `getUserDailyStatsData` SQL to filter `isArchive`
- `backend/src/services/daily.service.ts` — add `isArchive` param to `submitGuess`, add `getCalendarDataService`, add archive date validation
- `backend/src/controllers/daily.controllers.ts` — add `getCalendarController`, update `submitDailyPokemonGuessController` for archive validation
- `backend/src/routes/daily.routes.ts` — add calendar route

### Backend — New
(No new files — all changes fit in existing files following the layered pattern)

### Shared — Modified
- `shared/src/daily/index.ts` — add `DailyChallengeCalendarRequestSchema`, `DailyChallengeCalendarEntry` type, `DailyChallengeCalendarResponse` type

### Frontend — Modified
- `frontend/src/routes/daily.tsx` — add `validateSearch` for `date` param, update loader to use selected date, remove localStorage hydration fallback
- `frontend/src/pages/DailyChallenge/hooks/useData.tsx` — change `guessesAtom` from `atomWithStorage` to plain `atom`, accept `date` param, remove `isNewDay` logic
- `frontend/src/pages/DailyChallenge/components/Gameplay/index.tsx` — hide share/copy buttons for archive, show archive banner, add calendar trigger button
- `frontend/src/pages/DailyChallenge/components/IntroCard.tsx` — accept and display archive date/challenge number
- `frontend/src/pages/DailyChallenge/constants.ts` — add `getChallengeNumber(date)` helper
- `frontend/src/api/daily/index.ts` — parameterize `submitGuess` and `getAnswer` by date, add `getCalendar` method

### Frontend — New
- `frontend/src/pages/DailyChallenge/components/CalendarDrawer/index.tsx` — calendar drawer component
- `frontend/src/pages/DailyChallenge/components/ArchiveBanner.tsx` — archive banner with "Back to Today" button

---

## Task 1: Add `isArchive` field to Prisma schema and regenerate

**Files:**
- Modify: `backend/prisma-pg/schema.prisma:23-41`

- [ ] **Step 1: Add `isArchive` field to `UserDailyGuess` model**

In `backend/prisma-pg/schema.prisma`, add `isArchive` after `colorCorrectness`:

```prisma
model UserDailyGuess {
  userId            String
  dailyChallengeId  String
  pokemonId         Int
  guessNumber       Int // 1st guess, 2nd guess, etc.
  isCorrect         Boolean
  type1Correctness  String // 0.25, 0.5, 0.75, 1.0, "NA"
  type2Correctness  String // 0.25, 0.5, 0.75, 1.0, "NA"
  genCorrectness    String // "=", ">", "<"
  heightCorrectness String // "=", ">", "<"
  colorCorrectness  Boolean
  isArchive         Boolean  @default(false)
  createdAt         DateTime @default(now())

  // Relations
  dailyChallenge DailyChallenge @relation(fields: [dailyChallengeId], references: [date], onDelete: Cascade)

  @@id([userId, dailyChallengeId, guessNumber])
  @@map("user_daily_guesses")
}
```

- [ ] **Step 2: Create and apply migration**

Run:
```bash
cd backend && npx prisma migrate dev --name add-is-archive-to-user-daily-guess --schema=prisma-pg/schema.prisma
```

Expected: Migration created and applied. New `isArchive` column added with default `false`.

- [ ] **Step 3: Regenerate Prisma client**

Run:
```bash
cd backend && npx prisma generate --schema=prisma-pg/schema.prisma
```

Expected: Prisma client regenerated with `isArchive` field on `UserDailyGuess`.

- [ ] **Step 4: Commit**

```bash
git add backend/prisma-pg/
git commit -m "feat: add isArchive field to UserDailyGuess schema"
```

---

## Task 2: Add shared types for calendar endpoint

**Files:**
- Modify: `shared/src/daily/index.ts`

- [ ] **Step 1: Add calendar types to shared daily module**

At the end of `shared/src/daily/index.ts`, add:

```typescript
export const DailyChallengeCalendarRequestSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

export type DailyChallengeCalendarRequest = z.infer<
  typeof DailyChallengeCalendarRequestSchema
>;

export type DailyChallengeCalendarEntry = {
  date: string;
  solved: boolean;
  pokemonId: number;
};

export type DailyChallengeCalendarResponse = {
  entries: DailyChallengeCalendarEntry[];
};
```

- [ ] **Step 2: Build shared package**

Run:
```bash
pnpm shared-build
```

Expected: Build succeeds with new types exported.

- [ ] **Step 3: Commit**

```bash
git add shared/
git commit -m "feat: add calendar types to shared daily module"
```

---

## Task 3: Backend repository — add `isArchive` param and calendar query

**Files:**
- Modify: `backend/src/repositories/daily.repository.ts`

- [ ] **Step 1: Add `isArchive` parameter to `saveUserGuess`**

In `backend/src/repositories/daily.repository.ts`, update the `saveUserGuess` function (lines 45-82). Add `isArchive` to the parameter type and the `create` data:

Change the parameter type (add after `colorCorrectness: boolean;`):
```typescript
  isArchive?: boolean;
```

Change the `pgClient.userDailyGuess.create` data object (add after `colorCorrectness,`):
```typescript
      isArchive: isArchive ?? false,
```

- [ ] **Step 2: Update `getUserDailyStatsData` to exclude archive guesses**

In `backend/src/repositories/daily.repository.ts`, update the raw SQL query in `getUserDailyStatsData` (lines 175-199). Add a `WHERE` clause filter for `isArchive`:

Change:
```sql
    WHERE
      "userId" = ${userId}
```

To:
```sql
    WHERE
      "userId" = ${userId}
      AND "isArchive" = false
```

- [ ] **Step 3: Add `getCalendarData` repository function**

At the end of `backend/src/repositories/daily.repository.ts`, add:

```typescript
export const getCalendarData = async (userId: string, month: string) => {
  const startDate = `${month}-01`;
  const [year, monthNum] = month.split("-").map(Number);
  const nextMonth = monthNum === 12 ? `${year + 1}-01-01` : `${year}-${String(monthNum + 1).padStart(2, "0")}-01`;

  const guesses = await pgClient.userDailyGuess.groupBy({
    by: ["dailyChallengeId"],
    where: {
      userId,
      dailyChallengeId: {
        gte: startDate,
        lt: nextMonth,
      },
    },
    _max: {
      isCorrect: true,
    },
  });

  if (guesses.length === 0) return [];

  const challenges = await pgClient.dailyChallenge.findMany({
    where: {
      date: {
        in: guesses.map((g) => g.dailyChallengeId),
      },
    },
    select: {
      date: true,
      pokemonId: true,
    },
  });

  const challengeMap = new Map(challenges.map((c) => [c.date, c.pokemonId]));

  return guesses.map((g) => ({
    date: g.dailyChallengeId,
    solved: g._max.isCorrect ?? false,
    pokemonId: challengeMap.get(g.dailyChallengeId) ?? 0,
  }));
};
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/repositories/daily.repository.ts
git commit -m "feat: add isArchive to saveUserGuess and calendar query"
```

---

## Task 4: Backend service — archive validation and calendar service

**Files:**
- Modify: `backend/src/services/daily.service.ts`

- [ ] **Step 1: Add archive date validation and `isArchive` to `submitGuess`**

In `backend/src/services/daily.service.ts`, update the `submitGuess` function (lines 120-172).

Add these imports at the top of the file (alongside existing `date-fns` imports):
```typescript
import { format } from "date-fns";
```

Note: `format` may already be imported — check and skip if so.

Add the following at the top of the `submitGuess` function body, before the `getUserGuessCountForDate` call (after line 125):

```typescript
  // Archive validation
  const today = format(TZDate.tz(SINGAPORE_TIMEZONE), "yyyy-MM-dd");
  const isArchive = date !== today;

  if (isArchive) {
    if (date > today) {
      throw new Error("cannot play future challenges");
    }
    // Check if user already completed this archive challenge
    const existingGuesses = await getUserGuessesForDate(userId, date);
    const alreadySolved = existingGuesses.some((g) => g.isCorrect);
    const alreadyMaxed = existingGuesses.length >= DAILY_CHALLENGE_GUESS_LIMIT;
    if (alreadySolved || alreadyMaxed) {
      throw new Error("archive challenge already completed");
    }
  }
```

Then update both `saveUserGuess` calls in the function to pass `isArchive`. For the correct guess save (around line 141):

Change:
```typescript
    await saveUserGuess({
      userId,
      date,
      pokemonId,
      guessNumber,
      isCorrect: true,
      type1Correctness: "=",
      type2Correctness: "=",
      genCorrectness: "=",
      heightCorrectness: "=",
      colorCorrectness: true,
    });
```

To:
```typescript
    await saveUserGuess({
      userId,
      date,
      pokemonId,
      guessNumber,
      isCorrect: true,
      type1Correctness: "=",
      type2Correctness: "=",
      genCorrectness: "=",
      heightCorrectness: "=",
      colorCorrectness: true,
      isArchive,
    });
```

Do the same for the incorrect guess save (around line 158):

Change:
```typescript
  await saveUserGuess({
    userId,
    date,
    pokemonId,
    guessNumber,
    isCorrect: false,
    type1Correctness: result.type1Correctness.toString(),
    type2Correctness: result.type2Correctness.toString(),
    genCorrectness: result.genCorrectness,
    heightCorrectness: result.heightCorrectness,
    colorCorrectness: result.colorCorrectness,
  });
```

To:
```typescript
  await saveUserGuess({
    userId,
    date,
    pokemonId,
    guessNumber,
    isCorrect: false,
    type1Correctness: result.type1Correctness.toString(),
    type2Correctness: result.type2Correctness.toString(),
    genCorrectness: result.genCorrectness,
    heightCorrectness: result.heightCorrectness,
    colorCorrectness: result.colorCorrectness,
    isArchive,
  });
```

- [ ] **Step 2: Add `getCalendarDataService`**

First, add `getCalendarData` to the existing import block at the top of the file (lines 11-22):

```typescript
import {
  createDailyPokemon,
  dailyChallengeExists,
  deleteUserGuessesForDate,
  getCalendarData,
  getDailyPokemonFromDb,
  getLastRngState,
  getUserDailyStatsData,
  getUserGuessCountForDate,
  getUserGuessesForDate,
  hasPokemonAppearedInLastMonth,
  migrateUserGuesses,
  saveUserGuess,
} from "../repositories/daily.repository.js";
```

Then add the service function at the end of the file:

```typescript
export const getCalendarDataService = async (userId: string, month: string) => {
  return { entries: await getCalendarData(userId, month) };
};
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/services/daily.service.ts
git commit -m "feat: add archive validation to submitGuess and calendar service"
```

---

## Task 5: Backend controller and route for calendar

**Files:**
- Modify: `backend/src/controllers/daily.controllers.ts`
- Modify: `backend/src/routes/daily.routes.ts`

- [ ] **Step 1: Add `getCalendarController` to controllers**

In `backend/src/controllers/daily.controllers.ts`, add the import for the calendar schema at the top (update the existing import from `@pokenerdle/shared/daily`):

```typescript
import {
  DailyChallengeCalendarRequestSchema,
  DailyChallengeSubmitGuessRequestSchema,
  DailyChallengeSyncGuessesRequestSchema,
} from "@pokenerdle/shared/daily";
```

Add the import for the new service (update the existing import from `../services/daily.service.js`):

```typescript
import {
  getCalendarDataService,
  getDailyPokemonAnswer,
  getUserGuessesForDateService,
  getUserStats,
  submitGuess,
  syncUserGuesses,
} from "../services/daily.service.js";
```

Then add the controller function at the end of the file, before the closing:

```typescript
export const getCalendarController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const parsed = DailyChallengeCalendarRequestSchema.safeParse(req.query);
  if (parsed.error) {
    res.status(StatusCode.BAD_REQUEST).json(z.treeifyError(parsed.error));
    return;
  }

  const userId = getUserId(req)!;
  const { month } = parsed.data;

  try {
    const result = await getCalendarDataService(userId, month);
    res.json(result);
  } catch (error) {
    console.error("Error getting calendar data:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      error: "Failed to get calendar data",
    });
  }
};
```

- [ ] **Step 2: Update `submitDailyPokemonGuessController` error handling**

In `backend/src/controllers/daily.controllers.ts`, update the catch block in `submitDailyPokemonGuessController` (lines 38-43) to return specific status codes for archive errors:

Change:
```typescript
  } catch (error) {
    console.error("Error submitting guess:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      error: "Failed to submit guess",
    });
  }
```

To:
```typescript
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "archive challenge already completed") {
        res.status(409).json({ error: error.message });
        return;
      }
      if (error.message === "cannot play future challenges") {
        res.status(StatusCode.BAD_REQUEST).json({ error: error.message });
        return;
      }
      if (error.message === "hit limit") {
        res.status(StatusCode.BAD_REQUEST).json({ error: error.message });
        return;
      }
    }
    console.error("Error submitting guess:", error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      error: "Failed to submit guess",
    });
  }
```

- [ ] **Step 3: Add calendar route**

In `backend/src/routes/daily.routes.ts`, add the import for the new controller:

Update the import block:
```typescript
import {
  getCalendarController,
  getDailyPokemonAnswerController,
  getUserGuessesController,
  getUserStatsController,
  migrateUserGuessesController,
  submitDailyPokemonGuessController,
  syncUserGuessesController,
} from "../controllers/daily.controllers.js";
```

Add the route (after the existing `dailyRouter.get("/challenge/answer", ...)` line):

```typescript
dailyRouter.get(
  "/challenge/calendar",
  authenticateUser,
  getCalendarController
);
```

- [ ] **Step 4: Verify backend compiles**

Run:
```bash
cd backend && pnpm build
```

Expected: Build succeeds with no type errors.

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/daily.controllers.ts backend/src/routes/daily.routes.ts
git commit -m "feat: add calendar endpoint and archive error handling"
```

---

## Task 6: Frontend API client — parameterize by date, add calendar

**Files:**
- Modify: `frontend/src/api/daily/index.ts`

- [ ] **Step 1: Update API client functions**

Replace the entire contents of `frontend/src/api/daily/index.ts`:

```typescript
import { FROZEN_DATE } from "@/pages/DailyChallenge/constants";
import {
  type DailyChallengeCalendarResponse,
  type DailyChallengeGuessResponse,
  type DailyChallengeStatsResponse,
  type DailyChallengeSyncGuessesResponse,
} from "@pokenerdle/shared/daily";
import { AxiosInstance } from "axios";

export default (axiosInstance: AxiosInstance) => ({
  submitGuess: async (id: number, date?: string) => {
    const { data } = await axiosInstance.post<DailyChallengeGuessResponse>(
      "/v1/daily/challenge/submit",
      {
        pokemon_id: id,
        date: date ?? FROZEN_DATE,
      }
    );
    return data;
  },
  getUserGuesses: async (date?: string) => {
    const { data } = await axiosInstance.get<DailyChallengeGuessResponse[]>(
      "/v1/daily/challenge/guesses",
      {
        params: {
          date: date || FROZEN_DATE,
        },
      }
    );
    return data;
  },
  syncGuesses: async (guesses: DailyChallengeGuessResponse[], date: string) => {
    try {
      const { data } =
        await axiosInstance.post<DailyChallengeSyncGuessesResponse>(
          "/v1/daily/challenge/sync",
          {
            guesses: guesses.map((guess) => ({ pokemonId: guess.pokemonId })),
            date,
          }
        );
      return data;
    } catch (error) {
      console.error("Failed to sync guesses:", error);
      throw error;
    }
  },
  getAnswer: async (date?: string) => {
    const { data } = await axiosInstance.get<{
      pokemonId: number;
      pokemon: {
        type1: string;
        type2: string | null;
        height: number | null;
        generationId: number;
        color: string;
      };
    }>("/v1/daily/challenge/answer", {
      params: {
        date: date ?? FROZEN_DATE,
      },
    });
    return data;
  },
  getStats: async () => {
    const { data } = await axiosInstance.get<DailyChallengeStatsResponse>(
      "/v1/daily/challenge/stats"
    );
    return data;
  },
  getCalendar: async (month: string) => {
    const { data } = await axiosInstance.get<DailyChallengeCalendarResponse>(
      "/v1/daily/challenge/calendar",
      {
        params: { month },
      }
    );
    return data;
  },
});
```

- [ ] **Step 2: Rebuild shared (if not already done)**

Run:
```bash
pnpm shared-build
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/daily/index.ts
git commit -m "feat: parameterize daily API client by date, add calendar endpoint"
```

---

## Task 7: Frontend constants — add `getChallengeNumber` helper

**Files:**
- Modify: `frontend/src/pages/DailyChallenge/constants.ts`

- [ ] **Step 1: Add `getChallengeNumber` function**

In `frontend/src/pages/DailyChallenge/constants.ts`, add after the existing `challengeNumber` export:

```typescript
export const getChallengeNumber = (date: string) =>
  differenceInCalendarDays(new TZDate(date, SINGAPORE_TIMEZONE), DAY_1) + 1;
```

This function accepts any `YYYY-MM-DD` date string and returns the challenge number for that date. The existing `challengeNumber` constant remains for backward compatibility.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/DailyChallenge/constants.ts
git commit -m "feat: add getChallengeNumber helper for archive dates"
```

---

## Task 8: Frontend state — remove localStorage, parameterize by date

**Files:**
- Modify: `frontend/src/pages/DailyChallenge/hooks/useData.tsx`

- [ ] **Step 1: Rewrite `useData.tsx`**

Replace the entire contents of `frontend/src/pages/DailyChallenge/hooks/useData.tsx`:

```typescript
import api from "@/api";
import { DAILY_CHALLENGE_GUESS_LIMIT, FROZEN_DATE } from "../constants";

import { useAuth } from "@/hooks/useAuth";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { atom, useAtom } from "jotai";
import posthog from "posthog-js";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export interface DailyChallenge {
  date: string;
  guesses: DailyChallengeGuessResponse[];
}

export interface CorrectAnswer {
  pokemonId: number;
  pokemon: {
    type1: string;
    type2: string | null;
    height: number | null;
    generationId: number;
    color: string;
  };
}

export const guessesAtom = atom<DailyChallenge | null>(null);

export const useDailyChallengeData = (date?: string) => {
  const { isAuthenticated } = useAuth();
  const [guesses, setGuesses] = useAtom(guessesAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<CorrectAnswer | null>(
    null
  );
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const { t } = useTranslation("daily");

  const activeDate = date ?? FROZEN_DATE;
  const isArchive = activeDate !== FROZEN_DATE;

  const hasSolved = useMemo(
    () =>
      Boolean(
        guesses &&
          guesses.guesses.length &&
          guesses.guesses[guesses.guesses.length - 1].correct
      ),
    [guesses]
  );
  const hasReachedLimit = Boolean(
    guesses && guesses.guesses.length === DAILY_CHALLENGE_GUESS_LIMIT
  );
  const isGameFinished = hasReachedLimit || hasSolved;

  // Fetch correct answer when game is over and user hasn't solved it
  useEffect(() => {
    const fetchCorrectAnswer = async () => {
      if (hasReachedLimit && !hasSolved && !correctAnswer && !isLoadingAnswer) {
        try {
          setIsLoadingAnswer(true);
          const answer = await api.daily.getAnswer(activeDate);
          setCorrectAnswer(answer);
        } catch (error) {
          console.error("Failed to fetch correct answer:", error);
        } finally {
          setIsLoadingAnswer(false);
        }
      }
    };

    fetchCorrectAnswer();
  }, [hasReachedLimit, hasSolved, correctAnswer, isLoadingAnswer, activeDate]);

  const onGuess = async ({ id }: PokemonNamesResponse) => {
    const numGuesses = (guesses?.guesses.length ?? 0) + 1;
    try {
      setIsLoading(true);
      const response = await api.daily.submitGuess(id, activeDate);
      setGuesses(() => {
        const guess = {
          ...response,
          pokemonId: id,
        };
        if (guesses) {
          return {
            ...guesses,
            guesses: guesses.guesses.concat(guess),
          };
        }
        return {
          date: activeDate,
          guesses: [guess],
        };
      });
      if (response.correct) {
        toast.success(`${t("toast.correctGuess")}`);
        posthog.capture("daily_challenge_solved", {
          num_guesses: numGuesses,
          isArchive,
        });
      } else if (numGuesses === DAILY_CHALLENGE_GUESS_LIMIT) {
        toast.error(t("toast.gameOver"));
        posthog.capture("daily_challenge_gameover", { isArchive });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    guesses,
    onGuess,
    isLoading,
    hasSolved,
    hasReachedLimit,
    isGameFinished,
    correctAnswer,
    isLoadingAnswer,
    isArchive,
    activeDate,
  };
};
```

Key changes:
- `guessesAtom` is now `atom<DailyChallenge | null>(null)` — no localStorage
- `useDailyChallengeData` accepts optional `date` parameter
- Removed `isNewDay` logic entirely
- Added `isArchive` and `activeDate` to return value
- `onGuess` passes `activeDate` to `submitGuess`
- `getAnswer` passes `activeDate`
- PostHog events include `isArchive` flag

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/DailyChallenge/hooks/useData.tsx
git commit -m "feat: remove localStorage persistence, parameterize useData by date"
```

---

## Task 9: Frontend route — add `date` search param and update loader

**Files:**
- Modify: `frontend/src/routes/daily.tsx`

- [ ] **Step 1: Rewrite the daily route**

Replace the entire contents of `frontend/src/routes/daily.tsx`:

```typescript
import { createApi } from "@/api";
import DailyChallengeGameplay from "@/pages/DailyChallenge/components/Gameplay";
import DailyChallengeIntroCard from "@/pages/DailyChallenge/components/IntroCard";
import { FROZEN_DATE } from "@/pages/DailyChallenge/constants";
import {
  DailyChallenge,
  guessesAtom,
} from "@/pages/DailyChallenge/hooks/useData";
import { TZDate } from "@date-fns/tz";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { format } from "date-fns";
import { atom, useAtom, useStore } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

enum DailyChallengeState {
  Intro,
  Gameplay,
}

const dailyChallengeStateAtom = atom<DailyChallengeState>(
  DailyChallengeState.Intro
);

interface DailySearchParams {
  date?: string;
}

const DailyChallengePage: React.FC = () => {
  const loadedData = Route.useLoaderData();
  const { date } = Route.useSearch();
  useHydrateAtoms([[guessesAtom, loadedData]]);
  useHydrateAtoms([
    [
      dailyChallengeStateAtom,
      loadedData?.guesses?.length
        ? DailyChallengeState.Gameplay
        : DailyChallengeState.Intro,
    ],
  ]);
  const [state, setState] = useAtom(dailyChallengeStateAtom);
  const onStart = () => {
    setState(DailyChallengeState.Gameplay);
  };
  return (
    <>
      {state === DailyChallengeState.Intro ? (
        <DailyChallengeIntroCard onStart={onStart} date={date} />
      ) : (
        <DailyChallengeGameplay date={date} />
      )}
    </>
  );
};

export const Route = createFileRoute("/daily")({
  component: DailyChallengePage,
  context: () => ({
    shouldShowRuleButton: true,
  }),
  validateSearch: (search: Record<string, unknown>): DailySearchParams => {
    const date = search.date;
    if (date && typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { date };
    }
    return {};
  },
  beforeLoad: ({ search }) => {
    // Normalize: if date param equals today, redirect without it
    const today = import.meta.env.SSR
      ? format(TZDate.tz(SINGAPORE_TIMEZONE), "yyyy-MM-dd")
      : FROZEN_DATE;
    if (search.date === today) {
      throw redirect({ to: "/daily", search: {}, replace: true });
    }
  },
  loader: async ({ context: { store }, search }): Promise<DailyChallenge | null> => {
    try {
      const today = import.meta.env.SSR
        ? format(TZDate.tz(SINGAPORE_TIMEZONE), "yyyy-MM-dd")
        : FROZEN_DATE;
      const date = search?.date ?? today;
      const api = createApi(store);
      const userGuesses = await api.daily.getUserGuesses(date);
      if (!userGuesses.length) return null;
      return {
        date,
        guesses: userGuesses,
      };
    } catch (error) {
      console.error("Error getting user guesses:", error);
      return null;
    }
  },
  head: async ({ match }) => {
    await match.context.i18n.loadNamespaces("metadata");
    return {
      meta: [
        { title: match.context.i18n.t("metadata:title.daily") },
        {
          property: "og:title",
          content: match.context.i18n.t("metadata:title.daily"),
        },
        {
          name: "description",
          content: match.context.i18n.t("metadata:description.daily"),
        },
        {
          property: "og:description",
          content: match.context.i18n.t("metadata:description.daily"),
        },
      ],
    };
  },
});
```

Key changes:
- Added `validateSearch` for `date` param
- Added `beforeLoad` to normalize today's date (redirect `/daily?date=<today>` to `/daily`)
- Loader uses `search?.date` to determine which date to fetch
- Removed `store.get(guessesAtom)` fallback — hydrate directly from loader data
- Pass `date` prop to `DailyChallengeIntroCard` and `DailyChallengeGameplay`

- [ ] **Step 2: Commit**

```bash
git add frontend/src/routes/daily.tsx
git commit -m "feat: add date search param to daily route with archive support"
```

---

## Task 10: Frontend — ArchiveBanner component

**Files:**
- Create: `frontend/src/pages/DailyChallenge/components/ArchiveBanner.tsx`

- [ ] **Step 1: Create the ArchiveBanner component**

```typescript
import { Button } from "@/components/ui/Button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { getChallengeNumber } from "../constants";

interface Props {
  date: string;
}

const ArchiveBanner: React.FC<Props> = ({ date }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("daily");
  const challengeNum = getChallengeNumber(date);
  const displayDate = new Date(date + "T00:00:00").toLocaleDateString(
    undefined,
    { year: "numeric", month: "short", day: "numeric" }
  );

  return (
    <div className="tw:bg-card tw:border tw:border-border tw:rounded-lg tw:px-4 tw:py-2.5 tw:mb-3 tw:flex tw:justify-between tw:items-center tw:w-full tw:max-w-[400px]">
      <div className="tw:text-sm">
        <span className="tw:font-medium">
          {t("challengeNumber", { number: challengeNum })}
        </span>
        <span className="tw:text-muted-foreground tw:mx-1.5">&mdash;</span>
        <span className="tw:text-muted-foreground">{displayDate}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate({ to: "/daily", search: {} })}
      >
        <ArrowLeft className="tw:size-3.5" />
        {t("buttons.backToToday")}
      </Button>
    </div>
  );
};

export default ArchiveBanner;
```

Note: `t("buttons.backToToday")` requires an i18n key. If using the project's i18n files, add this key. Alternatively, hardcode "Back to Today" for now and add i18n in a follow-up. The pattern for this project uses `useTranslation("daily")`, so add the key to the daily namespace translation files.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/DailyChallenge/components/ArchiveBanner.tsx
git commit -m "feat: add ArchiveBanner component for archive challenge view"
```

---

## Task 11: Frontend — CalendarDrawer component

**Files:**
- Create: `frontend/src/pages/DailyChallenge/components/CalendarDrawer/index.tsx`

- [ ] **Step 1: Create the CalendarDrawer component**

```typescript
import api from "@/api";
import { Button } from "@/components/ui/Button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/Drawer";
import { cn } from "@/lib/utils";
import { DailyChallengeCalendarEntry } from "@pokenerdle/shared/daily";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DAY_1, FROZEN_DATE } from "../../constants";
import { TZDate } from "@date-fns/tz";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isBefore,
  isAfter,
  isSameDay,
} from "date-fns";

const SPRITE_BASE_URL =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons";

interface Props {
  currentDate?: string;
}

const CalendarDrawer: React.FC<Props> = ({ currentDate }) => {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = currentDate ? new Date(currentDate + "T00:00:00") : new Date();
    return startOfMonth(d);
  });
  const [entries, setEntries] = useState<DailyChallengeCalendarEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation("daily");

  const fetchCalendar = useCallback(async (month: Date) => {
    try {
      setLoading(true);
      const monthStr = format(month, "yyyy-MM");
      const result = await api.daily.getCalendar(monthStr);
      setEntries(result.entries);
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchCalendar(viewMonth);
    }
  }, [open, viewMonth, fetchCalendar]);

  const today = new TZDate(FROZEN_DATE, SINGAPORE_TIMEZONE);
  const day1Date = DAY_1;

  const canGoBack = isAfter(startOfMonth(viewMonth), startOfMonth(day1Date));
  const canGoForward = isBefore(startOfMonth(viewMonth), startOfMonth(today));

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0=Sun

  const entryMap = new Map(entries.map((e) => [e.date, e]));

  const onSelectDate = (date: string) => {
    setOpen(false);
    const activeDate = currentDate ?? FROZEN_DATE;
    if (date === activeDate) return;
    if (date === FROZEN_DATE) {
      navigate({ to: "/daily", search: {} });
    } else {
      navigate({ to: "/daily", search: { date } });
    }
  };

  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="secondary" size="sm">
          <Calendar className="tw:size-4" />
          {t("buttons.pastChallenges")}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("calendar.title")}</DrawerTitle>
          <DrawerDescription>{t("calendar.description")}</DrawerDescription>
        </DrawerHeader>
        <div className="tw:px-5 tw:pb-6">
          {/* Month navigation */}
          <div className="tw:flex tw:justify-between tw:items-center tw:mb-3">
            <Button
              variant="ghost"
              size="icon"
              disabled={!canGoBack}
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
            >
              <ChevronLeft className="tw:size-4" />
            </Button>
            <span className="tw:font-semibold tw:text-sm">
              {format(viewMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={!canGoForward}
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
            >
              <ChevronRight className="tw:size-4" />
            </Button>
          </div>

          {/* Day headers */}
          <div className="tw:grid tw:grid-cols-7 tw:gap-1 tw:text-center tw:mb-2">
            {dayHeaders.map((d) => (
              <div
                key={d}
                className="tw:text-xs tw:text-muted-foreground tw:font-medium tw:py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="tw:grid tw:grid-cols-7 tw:gap-1">
            {/* Empty cells before month starts */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const entry = entryMap.get(dateStr);
              const isBeforeDay1 = isBefore(day, day1Date);
              const isFutureOrToday =
                isAfter(day, today) || isSameDay(day, today);
              const isDisabled = isBeforeDay1 || isFutureOrToday;
              const isSelected = dateStr === (currentDate ?? FROZEN_DATE);

              return (
                <button
                  key={dateStr}
                  disabled={isDisabled}
                  onClick={() => onSelectDate(dateStr)}
                  className={cn(
                    "tw:relative tw:flex tw:flex-col tw:items-center tw:justify-center tw:min-h-[48px] tw:rounded-md tw:transition-colors",
                    isDisabled
                      ? "tw:opacity-30 tw:cursor-not-allowed"
                      : "tw:bg-secondary tw:hover:bg-accent tw:cursor-pointer",
                    isSelected && "tw:ring-2 tw:ring-ring"
                  )}
                >
                  {entry ? (
                    <>
                      <span className="tw:absolute tw:top-0.5 tw:right-1.5 tw:text-[10px] tw:text-muted-foreground">
                        {day.getDate()}
                      </span>
                      <div className="tw:relative tw:mt-1">
                        <img
                          src={`${SPRITE_BASE_URL}/${entry.pokemonId}.png`}
                          alt=""
                          className={cn(
                            "tw:w-[30px] tw:h-[30px]",
                            !entry.solved && "tw:opacity-40"
                          )}
                          style={{ imageRendering: "pixelated" }}
                        />
                        {!entry.solved && (
                          <svg
                            className="tw:absolute tw:inset-0 tw:w-full tw:h-full tw:text-destructive"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          >
                            <line x1="6" y1="6" x2="18" y2="18" />
                            <line x1="18" y1="6" x2="6" y2="18" />
                          </svg>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="tw:text-sm">{day.getDate()}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CalendarDrawer;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/DailyChallenge/components/CalendarDrawer/
git commit -m "feat: add CalendarDrawer component for browsing past challenges"
```

---

## Task 12: Frontend — update Gameplay component for archive mode

**Files:**
- Modify: `frontend/src/pages/DailyChallenge/components/Gameplay/index.tsx`

- [ ] **Step 1: Update Gameplay to accept `date` prop and integrate archive features**

The key changes to `frontend/src/pages/DailyChallenge/components/Gameplay/index.tsx`:

1. Accept `date` prop and pass to `useDailyChallengeData`
2. Import and render `ArchiveBanner` when `isArchive`
3. Import and render `CalendarDrawer`
4. Hide share/copy buttons when `isArchive`
5. Use `getChallengeNumber` instead of static `challengeNumber`

Replace the entire file:

```typescript
import React, { useEffect, useState } from "react";

import { NoSsr } from "@/components/NoSsr";
import LoadingDialog from "@/components/recyclables/LoadingDialog";
import PokemonCombobox from "@/components/recyclables/PokemonCombobox";
import PokemonReferenceDialog from "@/components/recyclables/PokemonReferenceDialog";
import { TypeChecklist } from "@/components/recyclables/TypeChecklist/TypeChecklist";
import { Button } from "@/components/ui/Button";
import { GoogleSignInButton } from "@/components/ui/GoogleSignInButton";
import { useAuth } from "@/hooks/useAuth";
import { DailyChallengeGuessBox } from "@/pages/DailyChallenge/components/Gameplay/components/DailyChallengeGuessBox";
import { PokemonNamesResponse } from "@pokenerdle/shared";
import clsx from "clsx";
import {
  BookOpen,
  Clipboard,
  ClipboardCheck,
  Share2,
  TrendingUp,
} from "lucide-react";
import posthog from "posthog-js";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  challengeNumber,
  DAILY_CHALLENGE_GUESS_LIMIT,
  getChallengeNumber,
} from "../../constants";
import { useDailyChallengeData } from "../../hooks/useData";
import { generateShareText, shareResults } from "../../utils/share";
import ArchiveBanner from "../ArchiveBanner";
import CalendarDrawer from "../CalendarDrawer";
import CorrectAnswerCard from "./components/CorrectAnswerCard";
import StatsDialog from "./components/StatsDialog";
import styles from "./index.module.scss";

interface Props {
  date?: string;
}

const DailyChallengeGameplay: React.FC<Props> = ({ date }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    onGuess,
    guesses,
    isLoading,
    hasSolved,
    hasReachedLimit,
    isGameFinished,
    correctAnswer,
    isLoadingAnswer,
    isArchive,
    activeDate,
  } = useDailyChallengeData(date);
  const [input, setInput] = useState("");
  const [showPokemonReference, setShowPokemonReference] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const { t } = useTranslation("daily");
  const displayChallengeNumber = isArchive
    ? getChallengeNumber(activeDate)
    : challengeNumber;

  const onSelectPokemon = (pokemon: PokemonNamesResponse) => {
    onGuess(pokemon).finally(() => setInput(""));
  };

  useEffect(() => {
    if (!isGameFinished) {
      return;
    }
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 500);
  }, [isGameFinished]);

  return (
    <div className="tw:flex tw:flex-col tw:flex-auto tw:max-w-[400px] tw:w-full">
      <LoadingDialog open={isLoading || isLoadingAnswer} />

      {isArchive && <ArchiveBanner date={activeDate} />}

      <div className="tw:flex tw:items-center tw:justify-center tw:gap-2 tw:mb-1">
        <h2 className="tw:text-center tw:font-bold tw:text-lg">
          {t("challengeNumber", { number: displayChallengeNumber })}
        </h2>
      </div>

      <div className="tw:flex tw:justify-center tw:mb-2">
        <CalendarDrawer currentDate={date} />
      </div>

      <div className="tw:text-center tw:text-muted-foreground tw:mb-2">
        {hasSolved
          ? t("gameplay.foundPokemon")
          : hasReachedLimit
            ? t("gameplay.betterLuckTomorrow")
            : t("gameplay.guessPrompt", {
                count:
                  DAILY_CHALLENGE_GUESS_LIMIT - (guesses?.guesses.length ?? 0),
              })}
      </div>

      <div className="tw:grid tw:grid-flow-row tw:gap-2">
        {Array.from({
          length: isGameFinished
            ? (guesses?.guesses.length ?? 0)
            : (guesses?.guesses.length ?? 0) + 1,
        }).map((_, i) => {
          const guess = guesses?.guesses[i];
          return (
            <DailyChallengeGuessBox key={i} guess={guess} guessNumber={i + 1}>
              <div className={clsx(styles.DailyChallengeInputContainer)}>
                <PokemonCombobox
                  className="tw:bg-background"
                  disabled={isLoading}
                  input={input}
                  setInput={setInput}
                  side="bottom"
                  onSelect={(pokemon) => {
                    posthog.capture("daily_challenge_guess", {
                      from: "pokemon_combobox",
                      isArchive,
                    });
                    onSelectPokemon(pokemon);
                  }}
                  filter={
                    guesses
                      ? (p) =>
                          !guesses.guesses
                            .map(({ pokemonId }) => pokemonId)
                            .includes(p.id)
                      : undefined
                  }
                />
                <Button
                  size="icon"
                  className="tw:flex-shrink-0"
                  onClick={() => {
                    posthog.capture("daily_challenge_pokemon_reference_opened");
                    setShowPokemonReference(true);
                  }}
                >
                  <BookOpen />
                </Button>
              </div>
            </DailyChallengeGuessBox>
          );
        })}
      </div>
      {!hasReachedLimit && !hasSolved ? (
        <>
          <hr className="tw:my-4" />
          <TypeChecklist guesses={guesses?.guesses || []} />
        </>
      ) : (
        <>
          <hr className="tw:my-4" />
          <CorrectAnswerCard
            correctAnswer={
              hasSolved
                ? guesses!.guesses[guesses!.guesses.length - 1]
                : correctAnswer
            }
          />
          <div className="tw:flex tw:flex-col tw:gap-2 tw:mt-auto">
            {!isArchive && (
              <div className="tw:flex tw:gap-2 tw:mt-4">
                <Button
                  className="tw:flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      generateShareText(guesses?.guesses ?? [], t),
                    );
                    posthog.capture("daily_challenge_copy_clicked");
                    toast(t("share.success"), {
                      icon: <ClipboardCheck />,
                    });
                  }}
                >
                  <Clipboard /> {t("buttons.copy")}
                </Button>
                <NoSsr>
                  {"share" in navigator && (
                    <Button
                      className="tw:flex-1"
                      onClick={() => {
                        posthog.capture("daily_challenge_share_clicked", {
                          has_solved: hasSolved,
                          num_guesses: guesses?.guesses.length ?? 0,
                        });
                        shareResults(guesses?.guesses ?? [], t);
                      }}
                    >
                      <Share2 /> {t("buttons.share")}
                    </Button>
                  )}
                </NoSsr>
              </div>
            )}
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                className="tw:w-full"
                onClick={() => setShowStatsDialog(true)}
              >
                <TrendingUp />
                {t("gameplay.viewStats")}
              </Button>
            ) : (
              !authLoading && (
                <>
                  <GoogleSignInButton variant="outline" />
                  <p className="tw:text-sm tw:text-muted-foreground tw:text-center">
                    {t("gameplay.signInPrompt")}
                  </p>
                </>
              )
            )}
          </div>
        </>
      )}

      <StatsDialog open={showStatsDialog} onOpenChange={setShowStatsDialog} />

      <PokemonReferenceDialog
        open={showPokemonReference}
        onOpenChange={setShowPokemonReference}
        onGuess={(pokemon) => {
          posthog.capture("daily_challenge_guess", {
            from: "pokemon_reference",
          });
          onSelectPokemon(pokemon);
          setShowPokemonReference(false);
        }}
        disabled={
          new Set(guesses?.guesses.map(({ pokemonId }) => pokemonId) ?? [])
        }
      />
    </div>
  );
};

export default DailyChallengeGameplay;
```

Key changes from original:
- Accepts `date?: string` prop
- Passes `date` to `useDailyChallengeData(date)`
- Renders `ArchiveBanner` when `isArchive`
- Renders `CalendarDrawer` with `currentDate` prop
- Wraps share/copy buttons in `{!isArchive && ...}`
- Uses `getChallengeNumber(activeDate)` for archive display

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/DailyChallenge/components/Gameplay/index.tsx
git commit -m "feat: integrate archive banner, calendar drawer, hide sharing for archive"
```

---

## Task 13: Frontend — update IntroCard for archive dates

**Files:**
- Modify: `frontend/src/pages/DailyChallenge/components/IntroCard.tsx`

- [ ] **Step 1: Update IntroCard to accept and display archive date**

Replace the entire contents of `frontend/src/pages/DailyChallenge/components/IntroCard.tsx`:

```typescript
import questionMarkIcon from "@/assets/question_mark_big.png";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Link } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { challengeNumber, getChallengeNumber } from "../constants";
import { useDailyChallengeData } from "../hooks/useData";

interface Props {
  onStart: () => void;
  date?: string;
}

const DailyChallengeIntroCard: React.FC<Props> = ({ onStart, date }) => {
  const { guesses, isGameFinished } = useDailyChallengeData(date);
  const { t } = useTranslation("daily");
  const displayNumber = date ? getChallengeNumber(date) : challengeNumber;

  return (
    <Card className="tw:relative tw:w-[300px] tw:my-auto">
      <CardHeader className="tw:text-center">
        <CardTitle className="tw:text-2xl">{t("title")}</CardTitle>
        <CardDescription>
          {t("challengeNumber", { number: displayNumber })}
        </CardDescription>
      </CardHeader>
      <CardContent className="tw:flex tw:flex-col tw:items-center">
        <img src={questionMarkIcon} />
      </CardContent>
      <CardFooter className="tw:flex tw:flex-col tw:gap-2">
        <Button
          className="tw:w-full"
          onClick={onStart}
          suppressHydrationWarning
        >
          {isGameFinished
            ? t("buttons.viewStats")
            : !guesses?.guesses.length
            ? t("buttons.startGuessing")
            : t("buttons.continueGuessing")}
        </Button>
        <Button className="tw:w-full" variant="outline">
          <Link to="/how-to-play/daily">{t("nav:howToPlay")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DailyChallengeIntroCard;
```

Changes: accept `date` prop, pass it to `useDailyChallengeData(date)`, use `getChallengeNumber(date)` for display.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/DailyChallenge/components/IntroCard.tsx
git commit -m "feat: update IntroCard to display archive challenge number"
```

---

## Task 14: Add i18n keys for new UI text

**Files:**
- Modify: the daily namespace translation files (English at minimum)

- [ ] **Step 1: Find and update translation files**

Search for translation files:
```bash
find frontend -name "*.json" -path "*/daily/*" -o -name "*.json" | grep -i daily
```

Add these keys to the daily namespace (English file):
```json
{
  "buttons.pastChallenges": "Past Challenges",
  "buttons.backToToday": "Back to Today",
  "calendar.title": "Past Challenges",
  "calendar.description": "Pick a date to play an old challenge"
}
```

Adapt the file format and nesting to match the existing translation file structure.

- [ ] **Step 2: Commit**

```bash
git add frontend/
git commit -m "feat: add i18n keys for calendar drawer and archive banner"
```

---

## Task 15: Verify full build and test manually

- [ ] **Step 1: Build shared package**

Run:
```bash
pnpm shared-build
```

Expected: Succeeds.

- [ ] **Step 2: Build backend**

Run:
```bash
cd backend && pnpm build
```

Expected: Succeeds with no type errors.

- [ ] **Step 3: Build frontend**

Run:
```bash
cd frontend && pnpm build
```

Expected: Succeeds with no type errors.

- [ ] **Step 4: Run frontend lint**

Run:
```bash
cd frontend && pnpm lint
```

Expected: No new lint errors introduced.

- [ ] **Step 5: Manual smoke test**

Run:
```bash
pnpm dev
```

Test the following:
1. Navigate to `/daily` — today's challenge loads normally
2. Click "Past Challenges" button — calendar drawer opens
3. Navigate months in the calendar
4. Select a past date — URL updates to `/daily?date=YYYY-MM-DD`, archive banner appears
5. Submit guesses on archive challenge — they save correctly
6. Share/copy buttons are hidden on archive challenges
7. Click "Back to Today" — returns to today's challenge
8. Navigate to `/daily?date=<today>` — redirects to `/daily`
9. Completed archive challenges show sprites in calendar

- [ ] **Step 6: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address build/lint issues from archive feature"
```
