import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import EffectivenessIcon from "../DailyChallenge/components/EffectivenessIcon";
import DailyChallengeGuessBox from "../DailyChallenge/components/Gameplay/components/DailyChallengeGuessBox";

const SQUARE_CLASS_POSITIVE =
  "tw:rounded-xs tw:bg-positive tw:size-6 tw:[&_svg]:m-auto tw:flex";
const SQUARE_CLASS_AMBER =
  "tw:rounded-xs tw:bg-amber-500 tw:size-6 tw:[&_svg]:m-auto tw:flex";
const ICON_EXPLANATION_TABLE_CLASS =
  "tw:grid tw:grid-cols-[max-content_max-content_auto] tw:items-start tw:mt-2 tw:gap-2";

const EXAMPLE_GUESSES: DailyChallengeGuessResponse[] = [
  {
    pokemon: {
      type1: "Fire",
      type2: "Flying",
      height: 17,
      color: "red",
      generationId: 1,
    },
    pokemonId: 6,
    type1Correctness: 0.5,
    type2Correctness: "=",
    genCorrectness: "=",
    heightCorrectness: ">",
    colorCorrectness: false,
  },
  {
    pokemon: {
      type1: "Water",
      type2: null,
      height: 6,
      color: "blue",
      generationId: 2,
    },
    pokemonId: 158,
    type1Correctness: "=",
    type2Correctness: "NA",
    genCorrectness: "<",
    heightCorrectness: ">",
    colorCorrectness: true,
  },
];

const DailyChallengeRules: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="tw:text-3xl tw:text-center">
          Rules of Daily Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="tw:space-y-6">
        <a
          href="#example"
          className="tw:text-muted-foreground tw:underline tw:mb-2 tw:block"
        >
          Jump to Examples
        </a>
        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-3">🎯 Objective</h2>
          <p>
            Guess the daily mystery Pokémon in <b>8 tries or less</b>!
          </p>
          <p>
            <ul className="tw:list-disc tw:ps-6 tw:text-muted-foreground">
              <li>Each day features a new mystery Pokémon</li>
              <li>Everyone gets the same Pokémon each day</li>
              <li>Use the clues from each guess to narrow down your options</li>
              <li>Share your results with friends!</li>
            </ul>
          </p>
        </section>

        <section className="tw:flex tw:flex-col tw:gap-4">
          <h2 className="tw:text-xl tw:font-semibold">🔍 How Clues Work</h2>
          <p>
            After each guess, you&apos;ll get feedback based on 5 categories:
          </p>

          <Card className="tw:bg-muted tw:gap-3">
            <CardHeader>
              <CardTitle>🍃💧🔥 Type 1 & Type 2</CardTitle>
            </CardHeader>
            <CardContent>
              How effective would your guess&apos; types be when attacking the
              target Pokémon?
              <CardDescription>
                If types match exactly, you&apos;ll see a checkmark! ✅
                Otherwise, you may see different icons depending on how
                effective the type is!
              </CardDescription>
              <div className={ICON_EXPLANATION_TABLE_CLASS}>
                <div className={SQUARE_CLASS_AMBER}>
                  <EffectivenessIcon value={4} />
                </div>
                <b>4x damage:</b>{" "}
                <span className="tw:text-muted-foreground">
                  Extremely effective (Ice vs Grass/Flying)
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <EffectivenessIcon value={2} />
                </div>
                <b>2x damage:</b>{" "}
                <span className="tw:text-muted-foreground">
                  Super effective (Fire vs Grass)
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <EffectivenessIcon value={1} />
                </div>
                <b>1x damage:</b>{" "}
                <span className="tw:text-muted-foreground">
                  Normal effectiveness (Normal vs Psychic)
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <EffectivenessIcon value={0.5} />
                </div>
                <b>0.5x damage:</b>{" "}
                <span className="tw:text-muted-foreground">
                  Not very effective (Water vs Fire)
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <EffectivenessIcon value={0.25} />
                </div>
                <b>0.25x damage:</b>{" "}
                <span className="tw:text-muted-foreground">
                  Mostly ineffective (Normal vs Rock/Steel)
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <EffectivenessIcon value={0} />
                </div>
                <b>0x damage:</b>{" "}
                <span className="tw:text-muted-foreground">
                  No effect (Normal vs Ghost)
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <EffectivenessIcon value="NA" />
                </div>
                <b>Not Applicable:</b>{" "}
                <span className="tw:text-muted-foreground">
                  Your Pokémon is a monotype, and the target is not.
                </span>
                <div className={SQUARE_CLASS_POSITIVE}>
                  <Check />
                </div>
                <b>Match:</b>{" "}
                <span className="tw:text-muted-foreground">
                  Your guessed Pokémon&apos;s type matches the target&apos;s. If
                  both Pokémon are monotypes, Type 2 will be a match
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="tw:bg-muted tw:gap-3">
            <CardHeader>
              <CardTitle>📅 Generation</CardTitle>
            </CardHeader>
            <CardContent>
              Is the target from the same generation as your guess?
              <CardDescription>
                Generations range from 1 (Kanto) to 9 (Paldea)
              </CardDescription>
              <div className={ICON_EXPLANATION_TABLE_CLASS}>
                <div className={SQUARE_CLASS_AMBER}>
                  <ChevronUp />
                </div>
                <b>Newer:</b>{" "}
                <span className="tw:text-muted-foreground">
                  Target is from a newer generation than your guess
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <ChevronDown />
                </div>
                <b>Older:</b>{" "}
                <span className="tw:text-muted-foreground">
                  Target is from an older generation than your guess
                </span>
                <div className={SQUARE_CLASS_POSITIVE}>
                  <Check />
                </div>
                <b>Match:</b>{" "}
                <span className="tw:text-muted-foreground">
                  You guess belongs to the same generation as your target!
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="tw:bg-muted tw:gap-3">
            <CardHeader>
              <CardTitle>🎨 Color</CardTitle>
            </CardHeader>
            <CardContent>
              Do both Pokémon share the same primary color?
              <CardDescription>
                Based on official Pokédex color classifications
              </CardDescription>
              <div className={ICON_EXPLANATION_TABLE_CLASS}>
                <div className={SQUARE_CLASS_POSITIVE}>
                  <Check />
                </div>
                <b>Match:</b>{" "}
                <span className="tw:text-muted-foreground">
                  Your guess shares the same primary color as the target Pokémon
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <X />
                </div>
                <b>Different:</b>{" "}
                <span className="tw:text-muted-foreground">
                  Your guess has a different primary color than the target
                  Pokémon
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="tw:bg-muted tw:gap-3">
            <CardHeader>
              <CardTitle>📏 Height</CardTitle>
            </CardHeader>
            <CardContent>
              How effective would your guess&apos; types be against the target
              Pokémon?
              <CardDescription>
                Measured in meters (e.g., Pikachu is 0.4m tall)
              </CardDescription>
              <div className={ICON_EXPLANATION_TABLE_CLASS}>
                <div className={SQUARE_CLASS_AMBER}>
                  <ChevronUp />
                </div>
                <b>Taller:</b>{" "}
                <span className="tw:text-muted-foreground">
                  Target is taller than your guess
                </span>
                <div className={SQUARE_CLASS_AMBER}>
                  <ChevronDown />
                </div>
                <b>Shorter:</b>{" "}
                <span className="tw:text-muted-foreground">
                  Target is shorter than your guess
                </span>
                <div className={SQUARE_CLASS_POSITIVE}>
                  <Check />
                </div>
                <b>Match:</b>{" "}
                <span className="tw:text-muted-foreground">
                  Your guess is the same height as the target!
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="example">
          <h2 className="tw:text-xl tw:font-semibold tw:mb-2">
            💡 Example Guesses
          </h2>
          <p className="tw:mb-2">
            Suppose the mystery Pokémon is Gyarados (Water/Flying, Gen 1, Blue,
            6.5m tall), and you make the following 2 guesses. You will receive
            the following feedback:
          </p>

          <div className="tw:flex tw:flex-col tw:gap-2 tw:mx-auto tw:max-w-[400px]">
            {EXAMPLE_GUESSES.map((guess) => (
              <DailyChallengeGuessBox
                key={guess.pokemonId}
                guess={guess}
                forceOpen
              />
            ))}
          </div>
        </section>
      </CardContent>
      <CardFooter>
        <Button asChild className="tw:flex-grow">
          <Link to="/daily">Play Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export const Component = DailyChallengeRules;

Component.displayName = "DailyChallengeRules";

export default Component;
