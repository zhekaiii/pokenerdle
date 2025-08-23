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

type Props = {
  correctAnswer: CorrectAnswer | null;
};

const CorrectAnswerCard: React.FC<Props> = ({ correctAnswer }) => {
  const { hasSolved, guesses } = useDailyChallengeData();
  const { getPokemonIcon } = usePokemonIcons();
  const pokemonNames = usePokemonNames();
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
      <Card responsive>
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
