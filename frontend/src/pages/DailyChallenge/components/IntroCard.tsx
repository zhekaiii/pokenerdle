import api from "@/api";
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
import { usePokemonIcons } from "@/hooks/usePokemonIcons";
import { useTriggerOnce } from "@/hooks/useTriggerOnce";
import clsx from "clsx";
import { randomInt } from "es-toolkit";
import { HelpCircle } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link } from "react-router";
import { challengeNumber } from "../constants";
import { useDailyChallengeData } from "../hooks/useData";

type Props = {
  onStart: () => void;
};

const DailyChallengeIntroCard: React.FC<Props> = ({ onStart }) => {
  const pokemonIds = Object.keys(usePokemonIcons().pokemonIcons ?? {});
  const pokemonId = useMemo(
    () =>
      pokemonIds.length
        ? pokemonIds[randomInt(0, pokemonIds.length - 1)]
        : null,
    [pokemonIds]
  );
  const [pokemonSprite, setPokemonSprite] = useState<string | null>(null);
  const { guesses, isGameFinished } = useDailyChallengeData();

  useTriggerOnce(
    !!pokemonId,
    () => {
      api.data.getPokemonWithAbilities(+pokemonId!).then((res) => {
        const spriteUrl = res.sprites.front_default?.toString() ?? null;
        if (spriteUrl) {
          const img = new Image();
          img.src = spriteUrl;
          img.onload = () => {
            setPokemonSprite(spriteUrl);
          };
        }
      });
    },
    [pokemonId]
  );

  return (
    <Card className="tw:relative tw:w-[300px] tw:my-auto">
      <CardHeader className="tw:text-center">
        <CardTitle className="tw:text-2xl">PokéNerdle Daily</CardTitle>
        <CardDescription>Daily Challenge #{challengeNumber}</CardDescription>
        <Button
          className="tw:absolute tw:top-2 tw:end-2"
          variant="transparent"
          size="icon"
        >
          <Link to="/how-to-play/daily">
            <HelpCircle className="tw:size-6" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="tw:flex tw:flex-col tw:items-center">
        <img
          className={clsx(
            !!pokemonSprite &&
              "tw:grayscale tw:brightness-0 tw:scale-150 tw:select-none tw:pointer-events-none"
          )}
          src={pokemonSprite ?? questionMarkIcon}
        />
      </CardContent>
      <CardFooter>
        <Button className="tw:w-full" onClick={onStart}>
          {isGameFinished
            ? "View Stats"
            : !guesses?.guesses.length
            ? "Start Guessing"
            : "Continue Guessing"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DailyChallengeIntroCard;
