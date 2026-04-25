import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Link } from "@tanstack/react-router";
import React from "react";

const StatGuessRules: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="tw:text-3xl tw:text-center">
          Rules of Stat Guess
        </CardTitle>
      </CardHeader>
      <CardContent className="tw:space-y-6">
        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-3">🎯 Objective</h2>
          <p>
            In <strong>Stat Guess</strong>, your goal is to recall a Pokémon’s
            six base stats — HP, Attack, Defense, Sp. Atk, Sp. Def, and Speed —
            as accurately as you can.
          </p>
        </section>

        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-3">
            🎮 How to Play
          </h2>
          <ol className="tw:list-decimal tw:ms-4 tw:space-y-2">
            <li>A random Pokémon is revealed (sprite, name, dex number).</li>
            <li>
              Move each slider (1–200) to your guess for that stat. The total
              updates live as you adjust.
            </li>
            <li>Click <em>Submit</em> to score your round.</li>
            <li>
              You’ll see your accuracy as a percentage and per-stat colour
              feedback (green = very close, yellow = close, gray = far).
            </li>
            <li>
              The next round loads automatically after 8 seconds, or click
              the play button to skip ahead.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-3">🔍 Filters</h2>
          <p>
            Use the filter bar to narrow the pool to a specific generation
            range or to a competitive metagame format like Pokémon Champions
            Reg M-A.
          </p>
        </section>

        <Button asChild className="tw:flex">
          <Link to="/stat-guess">Play Now</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export const Component = StatGuessRules;
Component.displayName = "StatGuessRules";

export default Component;
