import TypeChip from "@/components/recyclables/TypeChip";
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
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import React from "react";
import { Link } from "react-router";
import EffectivenessIcon from "../DailyChallenge/components/EffectivenessIcon";
import { COLUMNS } from "../DailyChallenge/components/Gameplay";
import PokeInfoPopover from "../DailyChallenge/components/Gameplay/components/PokeInfoPopover";

const SQUARE_CLASS_POSITIVE =
  "tw:rounded-xs tw:bg-positive tw:size-6 tw:[&_svg]:m-auto tw:flex";
const SQUARE_CLASS_AMBER =
  "tw:rounded-xs tw:bg-amber-500 tw:size-6 tw:[&_svg]:m-auto tw:flex";
const ICON_EXPLANATION_TABLE_CLASS =
  "tw:grid tw:grid-cols-[max-content_max-content_auto] tw:items-start tw:mt-2 tw:gap-2";

const DailyChallengeRules: React.FC = () => {
  const { getPokemonIcon } = usePokemonIcons();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="tw:text-3xl tw:text-center">
          Rules of Daily Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="tw:space-y-6">
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
          <p>After each guess, you'll get feedback based on 5 categories:</p>

          <Card className="tw:bg-muted tw:gap-3">
            <CardHeader>
              <CardTitle>🍃💧🔥 Type 1 & Type 2</CardTitle>
            </CardHeader>
            <CardContent>
              How effective would your guess' types be when attacking the target
              Pokémon?
              <CardDescription>
                If types match exactly, you'll see a checkmark! ✅ Otherwise,
                you may see different icons depending on how effective the type
                is!
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
                  Normal effectiveness, or if your guessed Pokemon has no
                  secondary typing
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
                <div className={SQUARE_CLASS_POSITIVE}>
                  <Check />
                </div>
                <b>Match:</b>{" "}
                <span className="tw:text-muted-foreground">
                  Your guessed Pokémon's type matches the target's. If both
                  Pokémon are monotypes, Type 2 will be a match
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
              How effective would your guess' types be against the target
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

        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-2">
            💡 Example Guesses
          </h2>
          <p className="tw:mb-2">
            Let's say the mystery Pokémon is Gyarados (Water/Flying, Gen 1,
            Blue, 6.5m tall), and you make the following 2 guesses:
          </p>

          <Card className="tw:py-2">
            <CardHeader>
              <div className="tw:flex tw:justify-center tw:items-center">
                <img src={getPokemonIcon(6)} className="tw:me-1" />
                <div>
                  <div className="tw:font-bold">#6 Charizard</div>
                  <div className="tw:text-muted-foreground tw:text-sm">
                    Guess #1
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PokeInfoPopover
                guessOrder={1}
                guess={{
                  pokemon: {
                    type1: "Fire",
                    type2: "Flying",
                    height: 17,
                    color: "Red",
                    generationId: 1,
                  },
                  pokemonId: 6,
                  type1Correctness: 0.5,
                  type2Correctness: "=",
                  genCorrectness: "=",
                  heightCorrectness: ">",
                  colorCorrectness: false,
                }}
              >
                <div className="tw:grid tw:grid-cols-5 tw:gap-2 tw:mx-auto tw:max-w-md tw:transition-transform tw:hover:scale-105 tw:cursor-pointer">
                  {COLUMNS.map((col) => (
                    <div className="tw:text-center">{col.label}</div>
                  ))}
                  <div
                    className={cn(
                      SQUARE_CLASS_AMBER,
                      "tw:size-full tw:aspect-square"
                    )}
                  >
                    <EffectivenessIcon value={0.5} />
                  </div>
                  <div
                    className={cn(
                      SQUARE_CLASS_POSITIVE,
                      "tw:size-full tw:aspect-square"
                    )}
                  >
                    <Check />
                  </div>
                  <div
                    className={cn(
                      SQUARE_CLASS_POSITIVE,
                      "tw:size-full tw:aspect-square"
                    )}
                  >
                    <Check />
                  </div>
                  <div
                    className={cn(
                      SQUARE_CLASS_AMBER,
                      "tw:size-full tw:aspect-square"
                    )}
                  >
                    <X />
                  </div>
                  <div
                    className={cn(
                      SQUARE_CLASS_AMBER,
                      "tw:size-full tw:aspect-square"
                    )}
                  >
                    <ChevronUp />
                  </div>
                </div>
              </PokeInfoPopover>
              <hr className="tw:my-4" />
              <b>What this tells us:</b>
              <ul className="tw:list-disc tw:ps-6 tw:text-muted-foreground">
                <li>
                  Fire deals 0.5x damage to the target Pokémon (Gyarados in this
                  example).
                </li>
                <li>
                  The target is a{" "}
                  <TypeChip
                    className="tw:text-foreground tw:align-middle"
                    type="Flying"
                  />{" "}
                  type!
                </li>
                <li>Target is from the same generation.</li>
                <li>Target is not red.</li>
                <li>Target is taller than 1.7m.</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="tw:py-2 tw:mt-4">
            <CardHeader>
              <div className="tw:flex tw:justify-center tw:items-center">
                <img src={getPokemonIcon(158)} className="tw:me-1" />
                <div>
                  <div className="tw:font-bold">#158 Totodile</div>
                  <div className="tw:text-muted-foreground tw:text-sm">
                    Guess #2
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PokeInfoPopover
                guessOrder={1}
                guess={{
                  pokemon: {
                    type1: "Water",
                    type2: null,
                    height: 6,
                    color: "Blue",
                    generationId: 2,
                  },
                  pokemonId: 158,
                  type1Correctness: "=",
                  type2Correctness: "NA",
                  genCorrectness: "<",
                  heightCorrectness: ">",
                  colorCorrectness: true,
                }}
              >
                <div className="tw:grid tw:grid-cols-5 tw:gap-2 tw:mx-auto tw:max-w-md tw:transition-transform tw:hover:scale-105 tw:cursor-pointer">
                  {COLUMNS.map((col) => (
                    <div className="tw:text-center">{col.label}</div>
                  ))}
                  <div
                    className={cn(
                      SQUARE_CLASS_POSITIVE,
                      "tw:size-full tw:aspect-square"
                    )}
                  >
                    <Check />
                  </div>
                  <div
                    className={cn(
                      SQUARE_CLASS_AMBER,
                      "tw:size-full tw:aspect-square"
                    )}
                  >
                    <EffectivenessIcon value="NA" />
                  </div>
                  <div
                    className={cn(
                      SQUARE_CLASS_AMBER,
                      "tw:size-full tw:aspect-square"
                    )}
                  >
                    <ChevronDown />
                  </div>
                  <div
                    className={cn(
                      SQUARE_CLASS_POSITIVE,
                      "tw:size-full tw:aspect-square"
                    )}
                  >
                    <Check />
                  </div>
                  <div
                    className={cn(
                      SQUARE_CLASS_AMBER,
                      "tw:size-full tw:aspect-square"
                    )}
                  >
                    <ChevronUp />
                  </div>
                </div>
              </PokeInfoPopover>
              <hr className="tw:my-4" />
              <b>What this tells us:</b>
              <ul className="tw:list-disc tw:ps-6 tw:text-muted-foreground">
                <li>Target's Type 1 matches (Water)!</li>
                <li>
                  Totodile has no secondary type, but it's not a match, so
                  target is a dual-type Pokémon
                </li>
                <li>Target is from an older generation (Gen 1)</li>
                <li>Both are blue in color!</li>
                <li>Target is taller than 0.6 m</li>
              </ul>
            </CardContent>
          </Card>
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

export default DailyChallengeRules;
