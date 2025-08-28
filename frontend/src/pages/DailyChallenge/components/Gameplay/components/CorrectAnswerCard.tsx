import TypeChip from "@/components/recyclables/TypeChip";
import { Card, CardContent } from "@/components/ui/Card";
import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import { usePokemonNames } from "@/hooks/usePokemonNames";
import { DAILY_CHALLENGE_GUESS_LIMIT } from "@/pages/DailyChallenge/constants";
import {
  CorrectAnswer,
  useDailyChallengeData,
} from "@/pages/DailyChallenge/hooks/useData";
import {
  formatPokemonHeight,
  getFormattedPokemonName,
} from "@/utils/formatters";
import { useMemo } from "react";
import classes from "./CorrectAnswerCard.module.scss";

// These colours are not very strong i.e. quite neutral tone and in a gradient
// will be overpowered by the other colours.
const NEUTRAL_COLOURS = ["normal", "dark", "rock"];

interface Props {
  correctAnswer: CorrectAnswer | null;
}

const CorrectAnswerCard: React.FC<Props> = ({ correctAnswer }) => {
  const { hasSolved, guesses } = useDailyChallengeData();
  const { getPokemonIcon } = usePokemonIcons();
  const pokemonNames = usePokemonNames();

  const borderStyles = useMemo(() => {
    if (!correctAnswer) return undefined;

    const type1 = correctAnswer.pokemon.type1.toLowerCase();
    const type2 = correctAnswer.pokemon.type2?.toLowerCase();

    const isType1Neutral = NEUTRAL_COLOURS.includes(type1);
    const isType2Neutral = NEUTRAL_COLOURS.includes(type2 ?? type1);

    // To avoid the neutral colours being overpowered by the other colours,
    // we need to make sure they occupy more space in the gradient.
    const type2StartPercentage =
      isType1Neutral !== isType2Neutral && isType2Neutral ? "25% 50%" : "50%";
    const type2EndPercentage =
      isType1Neutral !== isType2Neutral && isType1Neutral ? "75% 100%" : "100%";

    const type1Color = `var(--${type1}-type)`;
    const type2Color = `var(--${type2 ?? type1}-type)`;

    return {
      "--type1-color": type1Color,
      "--type2-color": type2Color,
      "--type2-start-percentage": type2StartPercentage,
      "--type2-end-percentage": type2EndPercentage,
      ...(type1 === type2 ? { animation: "none" } : {}),
    } as React.CSSProperties;
  }, [correctAnswer]);

  const pokemonName = useMemo(() => {
    const pokemonName = pokemonNames.find(
      (pokemon) => pokemon.id === correctAnswer?.pokemonId
    );
    return pokemonName && getFormattedPokemonName(pokemonName);
  }, [correctAnswer?.pokemonId, pokemonNames]);
  const attempts = guesses?.guesses.length ?? 0;

  const subtitle = useMemo(() => {
    if (hasSolved) {
      return attempts === 1
        ? "Incredible! You got it on your first guess!"
        : `You found the mystery Pokémon in ${attempts}/${DAILY_CHALLENGE_GUESS_LIMIT} tries!`;
    }
    return `You've used all ${DAILY_CHALLENGE_GUESS_LIMIT} attempts. Better luck tomorrow!`;
  }, [hasSolved, attempts]);

  if (!correctAnswer) {
    return null;
  }

  return (
    <div>
      <div className="tw:text-center tw:mb-2 tw:text-sm tw:text-muted-foreground">
        {subtitle}
      </div>
      <Card responsive className={classes.Card} style={borderStyles}>
        <CardContent>
          <div className="tw:text-center tw:mb-3">
            <div className="tw:flex tw:items-center tw:justify-center tw:gap-3">
              <img
                src={getPokemonIcon(correctAnswer.pokemonId)}
                alt={pokemonName}
                className="tw:w-17 tw:h-14 tw:object-none"
              />
              <div className="tw:text-left">
                <div className="tw:font-medium">{pokemonName}</div>
                <div className="tw:text-sm tw:text-muted-foreground">
                  Gen {correctAnswer.pokemon.generationId} •{" "}
                  {formatPokemonHeight(correctAnswer.pokemon.height)} •{" "}
                  {correctAnswer.pokemon.color}
                </div>
              </div>
            </div>
            <div className="tw:flex tw:justify-center tw:gap-2 tw:mt-3">
              <TypeChip type={correctAnswer.pokemon.type1} />
              {correctAnswer.pokemon.type2 && (
                <TypeChip type={correctAnswer.pokemon.type2} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CorrectAnswerCard;
