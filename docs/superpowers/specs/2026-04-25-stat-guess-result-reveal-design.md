# Stat Guess Result Reveal Redesign

Date: 2026-04-25

## Goal

Make the Stat Guess result reveal more intuitive by keeping the result in the same spatial layout as the guessing UI. The player should be able to understand each row at a glance:

- what the actual stat is
- where their guess was
- whether their guess needed to move up or down
- how far away it was

The redesign should avoid a second stacked result list. The result should feel like the submitted sliders transform into the answer.

## Chosen Direction

Use a PokemonDB-style horizontal stat bar reveal with a morph from the existing slider row.

The existing three-column row layout is preserved:

```text
Stat name | slider / stat bar | number
```

During guessing:

```text
HP | thick slider track with draggable knob | 100
```

After submit:

```text
HP | stat bar filled to actual value, plus guess tick + bubble | 108
```

The right-side number switches from the submitted guess to the actual stat value. The user's original guess moves into a bubble attached to the tick on the bar.

## Result Row Anatomy

Each result row contains:

- Left label: unchanged stat name, e.g. `HP`, `Attack`, `Sp. Atk`.
- Middle lane: a 14px horizontal bar scaled from `SLIDER_MIN` to `SLIDER_MAX`.
- Actual fill: the bar fills from the left edge to the actual stat value.
- Fill color: `statRankColor(actual)` using the existing red-to-teal stat rank palette.
- Guess tick: a white vertical tick at the user's submitted guess position.
- Bubble: a compact monochrome bubble above the tick.
- Right value: the actual stat value.

Bubble format:

```text
150 (↓20)
100 (↑8)
```

Arrow convention:

- `↑N`: the guess was too low; it needed to move up by `N` to reach the actual value.
- `↓N`: the guess was too high; it needed to move down by `N` to reach the actual value.
- Exact matches use `100 (=)` so the bubble still confirms the submitted guess without implying movement.

The bubble should not use green/yellow/red accuracy colors. It should be monochrome, with the delta optionally rendered in muted text. This keeps the stat-rank bar colors as the only strong color language in the row.

## Layout And Spacing

Keep the layout visually close to the existing `StatSliderRow`:

- left label width remains close to the current fixed label column
- middle lane remains the dominant flexible column
- right number remains a compact tabular numeric column
- row spacing should be around the mocked 16px vertical margin

The result bubble may slightly overlap the vertical space of the row above. That is acceptable as long as it remains legible and does not visually collide with the previous bar.

The slider track should become thicker during guessing, matching the result bar height. Target height: 14px. This makes the reveal feel like a true morph rather than replacing a thin slider with a new component.

## Pokemon Header And Overall Score

Move the overall accuracy percentage out of the giant centered headline. Show it inline in the Pokemon reveal/header area, aligned to the right of the Pokemon name and ID.

The result screen should make the stat bars the main focal point. The overall percent remains visible but should not dominate the reveal.

## Motion

On submit, each row should animate from the guessing state to the result state:

- slider track remains in place
- slider fill animates from the guessed value to the actual value
- fill color changes to `statRankColor(actual)`
- round knob morphs/fades into the white tick
- right-side number changes from guess to actual
- bubble appears above the tick

The animation should be short and readable, not flashy. A stagger is optional, but all rows should settle quickly enough that the player can scan the result without waiting.

Respect reduced motion preferences. If reduced motion is enabled, switch states without transform animation.

## Accessibility

The result row should expose a clear text equivalent for assistive technologies, for example:

```text
Attack: actual 130, your guess 150, 20 too high.
```

The visual arrow must not be the only accessible indication of direction. Screen-reader labels should use words like `too high`, `too low`, or `exact`.

The bubble is visual decoration plus visible text. It should not create a separate focus target unless the final implementation makes it interactive.

## Implementation Boundaries

This is a frontend-only visual redesign. It should not change scoring, stat selection, backend APIs, or session behavior.

Likely implementation shape:

- Evolve `StatSliderRow` or add a sibling result-capable row component that shares the same row layout.
- Replace the separate per-stat cards in `ResultPanel` with result state rendered in the stat rows.
- Keep `ResultPanel` responsible for next/countdown behavior, but no longer use it as the per-stat breakdown list.
- Reuse `statRankColor` for both guessing fill and result fill.
- Add localized strings for the bubble/accessibility text if needed.

## Open Implementation Details

- Bubble collision at very low or very high guess values may need edge clamping so labels do not overflow the card.
- Mobile layout should be checked because longer labels like `Sp. Def` plus bubbles can become tight.

