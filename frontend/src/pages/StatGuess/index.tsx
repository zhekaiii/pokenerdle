import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { STAT_KEYS } from "@pokenerdle/shared";
import { Link } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import FilterBar from "./components/FilterBar";
import PokemonReveal from "./components/PokemonReveal";
import ResultPanel from "./components/ResultPanel";
import SessionFooter from "./components/SessionFooter";
import StatSliderRow from "./components/StatSliderRow";
import { useStatGuess } from "./hooks/useStatGuess";
import { useStatGuessFilter } from "./hooks/useStatGuessFilter";
import classes from "./StatGuess.module.scss";

const StatGuessPage: React.FC = () => {
  const { t } = useTranslation("statGuess");
  const { filter, setScope, setFormat, toggleGeneration, reset } =
    useStatGuessFilter();
  const { state, setGuess, submit, next, session } = useStatGuess(filter);

  return (
    <div className={classes.StatGuess}>
      <Card className="tw:max-w-2xl tw:mx-auto tw:relative">
        <Button
          asChild
          className="tw:absolute tw:top-2 tw:end-2"
          variant="transparent"
          size="icon"
          aria-label={t("howToPlay")}
        >
          <Link to="/how-to-play/stat-guess">
            <HelpCircle className="tw:size-6" />
          </Link>
        </Button>
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
          {state.phase === "loading" && (
            <p className="tw:text-center">Loading…</p>
          )}
          {state.phase !== "loading" && (
            <>
              <PokemonReveal pokemonId={state.round.pokemonId} />
              <div className="tw:flex tw:flex-col tw:gap-3">
                {STAT_KEYS.map((stat) => (
                  <StatSliderRow
                    key={stat}
                    stat={stat}
                    value={state.guesses[stat]}
                    onChange={(v) => setGuess(stat, v)}
                    disabled={state.phase === "result"}
                  />
                ))}
                <div className="tw:text-right tw:text-sm">
                  {t("sliders.total", {
                    value: STAT_KEYS.reduce(
                      (sum, k) => sum + state.guesses[k],
                      0,
                    ),
                  })}
                </div>
              </div>
              {state.phase === "guessing" && (
                <div className="tw:flex tw:justify-center">
                  <Button onClick={submit}>{t("actions.submit")}</Button>
                </div>
              )}
              {state.phase === "result" && (
                <ResultPanel score={state.score} onAdvance={next} />
              )}
            </>
          )}
        </CardContent>
      </Card>
      <div className="tw:max-w-2xl tw:mx-auto">
        <SessionFooter {...session} />
      </div>
    </div>
  );
};

export default StatGuessPage;
