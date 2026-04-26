# Stat Guess Result Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current separate Stat Guess result list with a morphing slider-to-stat-bar reveal that keeps the existing three-column row layout.

**Architecture:** Keep the Stat Guess page flow intact. Extend the shared `Slider` component just enough to support the thicker Stat Guess slider track, evolve `StatSliderRow` into a dual-state row, move the overall result percentage into `PokemonReveal`, and simplify `ResultPanel` so it only handles next/countdown controls.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4 with `tw:` prefix, Radix Slider, i18next locales, pnpm workspaces.

---

## File Structure

- Modify: `frontend/src/components/ui/Slider.tsx`
  - Add optional style/class hooks for track, range, and thumb so Stat Guess can make the slider track 14px without changing every slider in the app.

- Modify: `frontend/src/pages/StatGuess/components/StatSliderRow.tsx`
  - Keep the existing guess input behavior.
  - Add optional `result` prop for submitted/result state.
  - Render either the input slider or the stat-bar reveal inside the same three-column row.
  - Format bubble values like `150 (↓20)`.
  - Add accessible text for result rows.

- Modify: `frontend/src/pages/StatGuess/components/PokemonReveal.tsx`
  - Add optional `accuracyPercent` prop.
  - When present, show the percentage inline in the Pokemon reveal area instead of using the giant centered headline.

- Modify: `frontend/src/pages/StatGuess/components/ResultPanel.tsx`
  - Remove the per-stat result cards and giant accuracy headline.
  - Keep countdown/next behavior only.

- Modify: `frontend/src/pages/StatGuess/index.tsx`
  - Pass per-stat breakdowns into `StatSliderRow` during result phase.
  - Pass `score.overallPercent` into `PokemonReveal` during result phase.
  - Continue using `ResultPanel` for the next/countdown button.

- Modify: `frontend/public/locales/statGuess/en.json`
  - Add result accessibility strings.

- Modify: `frontend/public/locales/statGuess/zh-Hans.json`
  - Add matching Simplified Chinese result accessibility strings.

- Modify: `frontend/public/locales/statGuess/zh-Hant.json`
  - Add matching Traditional Chinese result accessibility strings.

## Task 1: Add Slider Styling Hooks

**Files:**
- Modify: `frontend/src/components/ui/Slider.tsx`

- [ ] **Step 1: Update `SliderProps`**

Add optional class names for Radix subparts. Keep `fillColor` unchanged so existing callers continue working.

```tsx
type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  fillColor?: string;
  rangeClassName?: string;
  thumbClassName?: string;
  trackClassName?: string;
};
```

- [ ] **Step 2: Apply those class names with existing defaults**

Replace the current component body with this shape:

```tsx
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      fillColor,
      rangeClassName,
      thumbClassName,
      trackClassName,
      ...props
    },
    ref,
  ) => (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "tw:relative tw:flex tw:w-full tw:touch-none tw:select-none tw:items-center",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "tw:relative tw:h-1.5 tw:w-full tw:grow tw:overflow-hidden tw:rounded-full tw:bg-primary/20",
          trackClassName,
        )}
      >
        <SliderPrimitive.Range
          className={cn(
            "tw:absolute tw:h-full tw:bg-primary tw:transition-colors",
            rangeClassName,
          )}
          style={fillColor ? { backgroundColor: fillColor } : undefined}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "tw:block tw:h-4 tw:w-4 tw:rounded-full tw:border tw:border-primary/50 tw:bg-background tw:shadow tw:transition-colors tw:focus-visible:outline-hidden tw:focus-visible:ring-1 tw:focus-visible:ring-ring tw:disabled:pointer-events-none tw:disabled:opacity-50 tw:cursor-grab tw:active:cursor-grabbing",
          thumbClassName,
        )}
        style={fillColor ? { borderColor: fillColor } : undefined}
      />
    </SliderPrimitive.Root>
  ),
);
```

- [ ] **Step 3: Verify TypeScript import needs**

`cn` is already imported in this file, so no new imports are needed.

- [ ] **Step 4: Run lint for the changed file**

Run:

```bash
pnpm --filter @pokenerdle/frontend lint
```

Expected: lint passes. Fix any new lint errors in `Slider.tsx` before continuing.

## Task 2: Add Result Row Rendering To `StatSliderRow`

**Files:**
- Modify: `frontend/src/pages/StatGuess/components/StatSliderRow.tsx`
- Modify: `frontend/public/locales/statGuess/en.json`
- Modify: `frontend/public/locales/statGuess/zh-Hans.json`
- Modify: `frontend/public/locales/statGuess/zh-Hant.json`

- [ ] **Step 1: Add imports and prop type**

Keep the existing shared imports and add `StatBreakdown` as a type from the local scoring module.

```tsx
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import {
  SLIDER_MAX,
  SLIDER_MIN,
  StatKey,
  statRankColor,
} from "@pokenerdle/shared";
import React from "react";
import { useTranslation } from "react-i18next";

import type { StatBreakdown } from "../scoring";
```

Update props:

```tsx
type StatSliderRowProps = {
  stat: StatKey;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  result?: StatBreakdown;
};
```

- [ ] **Step 2: Add local helpers above the component**

Keep these helpers local to this component; they only serve the display.

```tsx
const percentForValue = (value: number): number => {
  const clamped = Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, value));
  return ((clamped - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
};

const deltaBubbleText = (guess: number, actual: number): string => {
  const delta = Math.abs(actual - guess);
  if (delta === 0) return `${guess} (=)`;
  const arrow = guess < actual ? "↑" : "↓";
  return `${guess} (${arrow}${delta})`;
};

type DeltaAriaKey =
  | "result.statAriaExact"
  | "result.statAriaTooHigh"
  | "result.statAriaTooLow";

const deltaAriaKey = (guess: number, actual: number): DeltaAriaKey => {
  if (guess === actual) return "result.statAriaExact";
  return guess < actual ? "result.statAriaTooLow" : "result.statAriaTooHigh";
};
```

- [ ] **Step 3: Accept `result` and compute shared values**

Inside the component:

```tsx
const StatSliderRow: React.FC<StatSliderRowProps> = ({
  stat,
  value,
  onChange,
  disabled,
  result,
}) => {
  const { t } = useTranslation("statGuess");
  const label = t(`sliders.${stat}`);
  const ariaLabel = t("sliders.ariaLabel", { stat: label });
  const inputAriaLabel = t("sliders.inputAriaLabel", { stat: label });
  const isResult = Boolean(result);
```

After `commit`, add:

```tsx
  const actualValue = result?.actual ?? value;
  const guessPercent = percentForValue(value);
  const actualPercent = percentForValue(actualValue);
  const bubbleText = result ? deltaBubbleText(result.guess, result.actual) : "";
  const statAria =
    result &&
    t(deltaAriaKey(result.guess, result.actual), {
      actual: result.actual,
      delta: result.delta,
      guess: result.guess,
      stat: label,
    });
```

- [ ] **Step 4: Replace the return markup**

Use the same three-column structure in both phases.

```tsx
  return (
    <div className="tw:grid tw:grid-cols-[6rem_1fr_3.5rem] tw:items-center tw:gap-3 tw:my-4">
      <div className="tw:text-sm tw:font-medium">{label}</div>
      {isResult && result ? (
        <div
          className="tw:relative tw:h-3.5 tw:rounded-[3px] tw:bg-primary/20"
          role="img"
          aria-label={statAria || undefined}
        >
          <div
            className="tw:h-full tw:rounded-[3px] tw:transition-[width,background-color] tw:duration-300 tw:motion-reduce:transition-none"
            style={{
              backgroundColor: statRankColor(result.actual),
              width: `${actualPercent}%`,
            }}
          />
          <div
            className="tw:absolute tw:top-1/2 tw:h-5 tw:w-[3px] tw:-translate-x-1/2 tw:-translate-y-1/2 tw:rounded-full tw:bg-white tw:shadow-[0_0_0_1.5px_rgba(0,0,0,0.7)] tw:transition-[left] tw:duration-300 tw:motion-reduce:transition-none"
            style={{ left: `${guessPercent}%` }}
            aria-hidden
          >
            <div className="tw:absolute tw:bottom-6 tw:left-1/2 tw:-translate-x-1/2 tw:whitespace-nowrap tw:rounded-md tw:border tw:border-white/15 tw:bg-background tw:px-2 tw:py-0.5 tw:text-xs tw:font-semibold tw:tabular-nums tw:text-foreground tw:shadow-md">
              {bubbleText}
              <span className="tw:absolute tw:left-1/2 tw:top-full tw:-translate-x-1/2 tw:border-4 tw:border-transparent tw:border-t-background" />
            </div>
          </div>
        </div>
      ) : (
        <Slider
          className="tw:flex-1"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={1}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          disabled={disabled}
          aria-label={ariaLabel}
          fillColor={statRankColor(value)}
          trackClassName="tw:h-3.5 tw:rounded-[3px] tw:bg-primary/20"
          rangeClassName="tw:transition-[width,background-color] tw:duration-300 tw:motion-reduce:transition-none"
          thumbClassName="tw:h-4 tw:w-4"
        />
      )}
      {isResult && result ? (
        <div className="tw:text-right tw:text-sm tw:font-semibold tw:tabular-nums">
          {result.actual}
        </div>
      ) : (
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={text}
          onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={commit}
          onFocus={(e) => e.currentTarget.select()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commit();
              e.currentTarget.blur();
            }
          }}
          disabled={disabled}
          aria-label={inputAriaLabel}
          className="tw:h-7 tw:w-14 tw:px-2 tw:text-right tw:tabular-nums"
        />
      )}
    </div>
  );
```

- [ ] **Step 5: Add English locale strings**

In `frontend/public/locales/statGuess/en.json`, add these keys inside `result` while keeping existing `accuracy` and `perStat` for backwards compatibility during the change:

```json
"statAriaTooLow": "{{stat}}: actual {{actual}}, your guess {{guess}}, {{delta}} too low.",
"statAriaTooHigh": "{{stat}}: actual {{actual}}, your guess {{guess}}, {{delta}} too high.",
"statAriaExact": "{{stat}}: actual {{actual}}, your guess was exact."
```

- [ ] **Step 6: Add Simplified Chinese locale strings**

In `frontend/public/locales/statGuess/zh-Hans.json`, add these keys inside `result`:

```json
"statAriaTooLow": "{{stat}}: 实际 {{actual}}, 你猜 {{guess}}, 低了 {{delta}}。",
"statAriaTooHigh": "{{stat}}: 实际 {{actual}}, 你猜 {{guess}}, 高了 {{delta}}。",
"statAriaExact": "{{stat}}: 实际 {{actual}}, 你猜中了。"
```

- [ ] **Step 7: Add Traditional Chinese locale strings**

In `frontend/public/locales/statGuess/zh-Hant.json`, add these keys inside `result`:

```json
"statAriaTooLow": "{{stat}}: 實際 {{actual}}, 你猜 {{guess}}, 低了 {{delta}}。",
"statAriaTooHigh": "{{stat}}: 實際 {{actual}}, 你猜 {{guess}}, 高了 {{delta}}。",
"statAriaExact": "{{stat}}: 實際 {{actual}}, 你猜中了。"
```

- [ ] **Step 8: Verify lint**

Run:

```bash
pnpm --filter @pokenerdle/frontend lint
```

Expected: pass.

## Task 3: Move Overall Percent Into The Pokemon Header

**Files:**
- Modify: `frontend/src/pages/StatGuess/components/PokemonReveal.tsx`

- [ ] **Step 1: Extend props**

```tsx
type PokemonRevealProps = {
  pokemonId: number;
  accuracyPercent?: number;
};
```

- [ ] **Step 2: Accept the new prop**

```tsx
const PokemonReveal: React.FC<PokemonRevealProps> = ({
  pokemonId,
  accuracyPercent,
}) => {
```

- [ ] **Step 3: Replace the returned layout**

Keep the current centered look while guessing. When `accuracyPercent` is present, render a more compact row with the percentage inline to the right.

```tsx
  if (typeof accuracyPercent === "number") {
    return (
      <div className="tw:flex tw:items-center tw:gap-3 tw:py-4">
        <img
          src={spriteUrl}
          alt={displayName}
          className="tw:h-20 tw:w-20 tw:object-contain"
          loading="eager"
        />
        <div className="tw:min-w-0">
          <div className="tw:truncate tw:text-2xl tw:font-semibold tw:capitalize">
            {displayName}
          </div>
          <div className="tw:text-sm tw:text-muted-foreground">
            #
            {(pokemon?.pokemon_species_id ?? pokemonId)
              .toString()
              .padStart(4, "0")}
          </div>
        </div>
        <div className="tw:ms-auto tw:text-2xl tw:font-bold tw:tabular-nums">
          {accuracyPercent}%
        </div>
      </div>
    );
  }

  return (
    <div className="tw:flex tw:flex-col tw:items-center tw:gap-2 tw:py-4">
      <img
        src={spriteUrl}
        alt={displayName}
        className="tw:h-32 tw:w-32 tw:object-contain"
        loading="eager"
      />
      <div className="tw:text-2xl tw:font-semibold tw:capitalize">
        {displayName}
      </div>
      <div className="tw:text-sm tw:text-muted-foreground">
        #{(pokemon?.pokemon_species_id ?? pokemonId).toString().padStart(4, "0")}
      </div>
    </div>
  );
```

- [ ] **Step 4: Verify no locale change is needed**

The percentage uses the existing raw number format. If the implementation prefers `t("result.accuracy", { percent: accuracyPercent })`, keep `useTranslation("statGuess")` in this component and use the existing `result.accuracy` key.

## Task 4: Wire Result State Through The Page

**Files:**
- Modify: `frontend/src/pages/StatGuess/index.tsx`
- Modify: `frontend/src/pages/StatGuess/components/ResultPanel.tsx`

- [ ] **Step 1: Build a per-stat result lookup**

Inside `StatGuessPage`, after the hook calls:

```tsx
  const scoreByStat = React.useMemo(() => {
    if (state.phase !== "result") return undefined;
    return new Map(state.score.perStat.map((s) => [s.stat, s]));
  }, [state]);
```

- [ ] **Step 2: Pass the inline accuracy to `PokemonReveal`**

Replace:

```tsx
<PokemonReveal pokemonId={state.round.pokemonId} />
```

with:

```tsx
<PokemonReveal
  pokemonId={state.round.pokemonId}
  accuracyPercent={
    state.phase === "result" ? state.score.overallPercent : undefined
  }
/>
```

- [ ] **Step 3: Pass result breakdowns into stat rows**

Replace the `StatSliderRow` call with:

```tsx
<StatSliderRow
  key={stat}
  stat={stat}
  value={state.guesses[stat]}
  onChange={(v) => setGuess(stat, v)}
  disabled={state.phase === "result"}
  result={scoreByStat?.get(stat)}
/>
```

- [ ] **Step 4: Keep total visible only during guessing**

Replace:

```tsx
<div className="tw:text-right tw:text-sm">
  {t("sliders.total", {
    value: STAT_KEYS.reduce(
      (sum, k) => sum + state.guesses[k],
      0,
    ),
  })}
</div>
```

with:

```tsx
{state.phase === "guessing" && (
  <div className="tw:text-right tw:text-sm">
    {t("sliders.total", {
      value: STAT_KEYS.reduce((sum, k) => sum + state.guesses[k], 0),
    })}
  </div>
)}
```

- [ ] **Step 5: Simplify `ResultPanel` props**

In `ResultPanel.tsx`, remove `StatGuessScore`, `colorClass`, and the `score` prop. Use:

```tsx
type ResultPanelProps = {
  onAdvance: () => void;
};
```

Update the component signature:

```tsx
const ResultPanel: React.FC<ResultPanelProps> = ({ onAdvance }) => {
```

Keep the countdown hook and return only the button container:

```tsx
  return (
    <div className="tw:flex tw:justify-center tw:pt-2">
      <CountdownButton
        progress={progress}
        onClick={onAdvance}
        ariaLabel={t("actions.nextIn", {
          seconds: Math.ceil((1 - progress) * (COUNTDOWN_MS / 1000)),
        })}
      >
        <span aria-hidden>▶</span>
      </CountdownButton>
    </div>
  );
```

- [ ] **Step 6: Update the `ResultPanel` call**

Replace:

```tsx
<ResultPanel score={state.score} onAdvance={next} />
```

with:

```tsx
<ResultPanel onAdvance={next} />
```

- [ ] **Step 7: Run lint**

Run:

```bash
pnpm --filter @pokenerdle/frontend lint
```

Expected: pass. Common expected cleanup from this task: remove unused imports from `ResultPanel.tsx` and `index.tsx`.

## Task 5: Final Verification And Visual QA

**Files:**
- Verify: all modified frontend files

- [ ] **Step 1: Run frontend lint**

Run:

```bash
pnpm --filter @pokenerdle/frontend lint
```

Expected: pass.

- [ ] **Step 2: Build shared and frontend packages**

Run:

```bash
pnpm shared-build && pnpm --filter @pokenerdle/frontend build
```

Expected: TypeScript and Vite builds pass.

- [ ] **Step 3: Start the frontend dev server**

Run:

```bash
pnpm fe-dev
```

Expected: the frontend SSR dev server starts. Open the local URL printed by the command.

- [ ] **Step 4: Manually verify the guessing phase**

On the Stat Guess page:

- The stat rows still show `stat name | thick slider | input number`.
- Slider track height visually matches the future result bar height.
- Dragging sliders still updates the right-side input value.
- Typing a value in the input still clamps to `1..255` on blur/Enter.
- The total appears during guessing.

- [ ] **Step 5: Manually verify the result phase**

Submit a guess:

- Pokemon reveal shows the overall percentage inline to the right of the Pokemon name/ID.
- The giant centered percentage is gone.
- Each row keeps the same left/middle/right layout.
- The middle track is a stat bar filled to the actual value.
- The right number is the actual stat value.
- The white tick is at the submitted guess position.
- The bubble is monochrome and formatted like `150 (↓20)` or `100 (↑8)`.
- `↑` means the guess needed to move up to reach truth; `↓` means it needed to move down.
- The old per-stat result cards are gone.
- The countdown/next button still appears and advances to the next round.

- [ ] **Step 6: Manually verify edge cases**

Use typed inputs to create:

- a very low guess, e.g. `1`
- a very high guess, e.g. `255`
- an exact match if possible

Expected:

- Bubble remains readable near the card edges.
- Bubble overlap with the row above is acceptable and does not obscure the previous bar.
- Exact match shows `value (=)`.

- [ ] **Step 7: Check reduced motion**

In browser/devtools, enable reduced motion and submit another guess.

Expected:

- The UI changes to the result state without transform animation.
- No essential information depends on animation.

- [ ] **Step 8: Review mobile width**

Use responsive devtools around 360px wide.

Expected:

- Labels like `Sp. Def` remain readable.
- Bubbles do not overflow the card badly.
- Right-side actual values remain aligned.

- [ ] **Step 9: Commit when requested**

Only commit if explicitly asked. Suggested commit message:

```bash
git add frontend/src/components/ui/Slider.tsx \
  frontend/src/pages/StatGuess/components/StatSliderRow.tsx \
  frontend/src/pages/StatGuess/components/PokemonReveal.tsx \
  frontend/src/pages/StatGuess/components/ResultPanel.tsx \
  frontend/src/pages/StatGuess/index.tsx \
  frontend/public/locales/statGuess/en.json \
  frontend/public/locales/statGuess/zh-Hans.json \
  frontend/public/locales/statGuess/zh-Hant.json
git commit -m "$(cat <<'EOF'
Refine Stat Guess result reveal

Morph submitted stat sliders into result bars so players can compare guesses against actual stats in place.
EOF
)"
```

