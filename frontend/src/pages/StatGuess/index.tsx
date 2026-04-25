import api from "@/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  STAT_KEYS,
  SLIDER_DEFAULT,
  StatGuessRoundResponse,
  StatGuessStats,
} from "@pokenerdle/shared";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import FilterBar from "./components/FilterBar";
import PokemonReveal from "./components/PokemonReveal";
import StatSliderRow from "./components/StatSliderRow";
import { useStatGuessFilter } from "./hooks/useStatGuessFilter";
import classes from "./StatGuess.module.scss";

const initialGuesses = (): StatGuessStats => ({
  hp: SLIDER_DEFAULT,
  attack: SLIDER_DEFAULT,
  defense: SLIDER_DEFAULT,
  specialAttack: SLIDER_DEFAULT,
  specialDefense: SLIDER_DEFAULT,
  speed: SLIDER_DEFAULT,
});

const StatGuessPage: React.FC = () => {
  const { t } = useTranslation("statGuess");
  const { filter, setScope, setFormat, toggleGeneration, reset } =
    useStatGuessFilter();
  const [roundIndex, setRoundIndex] = useState(0);
  const [guesses, setGuesses] = useState<StatGuessStats>(initialGuesses);

  const { data, isLoading } = useQuery<StatGuessRoundResponse>({
    queryKey: ["statGuess", "round", filter, roundIndex],
    queryFn: () => api.statGuess.getRound(filter, []),
    staleTime: 0,
  });

  useEffect(() => {
    if (data) setGuesses(initialGuesses());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on pokemonId only
  }, [data?.pokemonId]);

  const total = STAT_KEYS.reduce((sum, k) => sum + guesses[k], 0);

  return (
    <div className={classes.StatGuess}>
      <Card className="tw:max-w-2xl tw:mx-auto">
        <CardHeader>
          <CardTitle className="tw:text-center">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="tw:space-y-4">
          <FilterBar
            filter={filter}
            onScopeChange={setScope}
            onFormatChange={setFormat}
            onGenerationToggle={toggleGeneration}
            onReset={reset}
          />
          {isLoading || !data ? (
            <p className="tw:text-center">Loading…</p>
          ) : (
            <>
              <PokemonReveal pokemonId={data.pokemonId} />
              <div className="tw:flex tw:flex-col tw:gap-3">
                {STAT_KEYS.map((stat) => (
                  <StatSliderRow
                    key={stat}
                    stat={stat}
                    value={guesses[stat]}
                    onChange={(v) =>
                      setGuesses((g) => ({ ...g, [stat]: v }))
                    }
                  />
                ))}
                <div className="tw:text-right tw:text-sm">
                  {t("sliders.total", { value: total })}
                </div>
              </div>
              <div className="tw:flex tw:justify-center">
                <Button onClick={() => setRoundIndex((i) => i + 1)}>
                  {t("actions.submit")}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatGuessPage;
