import { usePokemonNames } from "@/hooks/usePokemonNames";
import React from "react";
import { useTranslation } from "react-i18next";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- prefer type aliases
type SessionFooterProps = {
  completed: number;
  sumPercent: number;
  bestPercent: number;
  bestPokemonId: number | null;
};

const SessionFooter: React.FC<SessionFooterProps> = ({
  completed,
  sumPercent,
  bestPercent,
  bestPokemonId,
}) => {
  const { t } = useTranslation("statGuess");
  const pokemonNames = usePokemonNames();

  if (completed === 0) return null;

  const avgPercent = Math.round(sumPercent / completed);
  const bestEntry = bestPokemonId ? pokemonNames[bestPokemonId] : undefined;
  const bestName = bestEntry?.name || bestEntry?.speciesName || "";

  return (
    <div className="tw:text-center tw:text-sm tw:text-muted-foreground tw:py-2">
      {t("session.round", { n: completed })} ·{" "}
      {t("session.average", { percent: avgPercent })}
      {bestPokemonId !== null && (
        <>
          {" · "}
          {t("session.best", { percent: bestPercent, name: bestName })}
        </>
      )}
    </div>
  );
};

export default SessionFooter;
