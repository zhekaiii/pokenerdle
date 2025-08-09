import battleBoardClasses from "@/components/PokeChain/BattleBoard.module.scss";
import GameSettings from "@/components/PokeChain/GameSettings";
import LinkChip from "@/components/PokeChain/LinkChip";
import PokemonCard from "@/components/recyclables/PokemonCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PokemonWithAbilities } from "@pokenerdle/shared";
import clsx from "clsx";
import React, { useState } from "react";
import { Link } from "react-router";

const PIKACHU: PokemonWithAbilities = {
  id: 25,
  name: "pikachu",
  order: 35,
  height: 4,
  weight: 60,
  is_default: true,
  pokemon_species_id: 25,
  base_experience: 112,
  abilities: [
    {
      id: 9,
      is_main_series: true,
      generation_id: 3,
      name: "static",
    },
    {
      id: 31,
      is_main_series: true,
      generation_id: 3,
      name: "lightning-rod",
    },
  ],
  speciesName: "pikachu",
  sprites: {
    front_default:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    front_shiny:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png",
  },
};

const RAICHU: PokemonWithAbilities = {
  id: 26,
  name: "raichu",
  order: 36,
  height: 4,
  weight: 60,
  is_default: true,
  pokemon_species_id: 26,
  base_experience: 112,
  abilities: [
    {
      id: 9,
      is_main_series: true,
      generation_id: 3,
      name: "static",
    },
    {
      id: 31,
      is_main_series: true,
      generation_id: 3,
      name: "lightning-rod",
    },
  ],
  speciesName: "raichu",
  sprites: {
    front_default:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png",
    front_shiny:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/26.png",
  },
};

const MAREEP: PokemonWithAbilities = {
  id: 179,
  name: "mareep",
  order: 273,
  height: 6,
  weight: 78,
  is_default: true,
  pokemon_species_id: 179,
  base_experience: 56,
  abilities: [
    {
      id: 9,
      is_main_series: true,
      generation_id: 3,
      name: "static",
    },
    {
      id: 57,
      is_main_series: true,
      generation_id: 3,
      name: "plus",
    },
  ],
  speciesName: "mareep",
  sprites: {
    front_default:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/179.png",
    front_shiny:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/179.png",
  },
};

const PokeChainRules: React.FC = () => {
  const [timer, setTimer] = useState(20);
  const [showAbility, setShowAbility] = useState(true);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="tw:text-3xl tw:text-center">
          Rules of PokéChain
        </CardTitle>
      </CardHeader>
      <CardContent className="tw:space-y-6">
        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-3">
            🎯 Game Overview
          </h2>
          <p>
            Pokénerdle is a multiplayer Pokémon battle game where you and your
            opponent take turns linking Pokémon through shared abilities.
          </p>
        </section>

        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-3">
            ⚙️ Game Settings
          </h2>
          <div className="tw:mb-2">
            When you create a new room, you can adjust the following settings
            using the following menu:
          </div>
          <div className="tw:my-4 tw:flex tw:flex-col tw:items-center">
            <GameSettings
              settings={{ showAbility, timer }}
              setShowAbility={setShowAbility}
              setTimer={setTimer}
            />
            <div className="tw:text-muted-foreground">
              Try adjusting the settings!
            </div>
          </div>
          <section>
            <ol className="tw:list-decimal tw:ms-4 tw:space-y-2">
              <li>
                <b>Timer:</b> Set the time limit for each guess.
              </li>
              <li>
                <b>Show Abilities:</b> Toggle this setting to display Pokémon
                abilities.
              </li>
            </ol>
          </section>
        </section>

        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-3">
            ⚔️ Match Mechanics
          </h2>
          <div>
            <p>
              Each player takes turns to name a Pokémon. The time limit for each
              guess is determined by the game settings.
            </p>
            <p>
              Each Pokémon named must share at least one ability as the one
              previously named. For example, if the first Pokémon named is
              Pikachu, the second Pokémon must have <b>Static</b> or{" "}
              <b>Lightning Rod</b> as one of its abilities.
            </p>
            <div className={clsx("tw:mt-2", battleBoardClasses["BattleBoard"])}>
              <PokemonCard pokemon={PIKACHU} showAbility={showAbility} />
              <div className={battleBoardClasses["BattleBoard__Separator"]} />
              <LinkChip variant="ability" abilityName="Static" count={1} />
              <div className={battleBoardClasses["BattleBoard__Separator"]} />
              <PokemonCard
                pokemon={MAREEP}
                showAbility={showAbility}
                sharedLinks={{
                  static: 1,
                }}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-3">
            📌 Limitations
          </h2>
          <ol className="tw:list-decimal tw:space-y-2 tw:ms-4">
            <li>
              Each ability can only be used up to 3 times across all players.{" "}
              This chip{" "}
              <LinkChip
                className="tw:align-middle"
                variant="ability"
                abilityName="Static"
                count={1}
              />{" "}
              tells you how many times an ability has been used.
              <div
                className={clsx("tw:mt-2", battleBoardClasses["BattleBoard"])}
              >
                <PokemonCard pokemon={PIKACHU} showAbility={showAbility} />
                <div className={battleBoardClasses["BattleBoard__Separator"]} />
                <LinkChip variant="ability" abilityName="Static" count={1} />
                <div className={battleBoardClasses["BattleBoard__Separator"]} />
                <PokemonCard
                  pokemon={MAREEP}
                  showAbility={showAbility}
                  sharedLinks={{
                    static: 1,
                  }}
                />
                <div className={battleBoardClasses["BattleBoard__Separator"]} />
                <LinkChip variant="ability" abilityName="Static" count={2} />
                <div className={battleBoardClasses["BattleBoard__Separator"]} />
                <PokemonCard
                  pokemon={RAICHU}
                  showAbility={showAbility}
                  sharedLinks={{
                    static: 2,
                  }}
                />
              </div>
            </li>
            <li>
              <div>
                You can only name Pokémon from the same evolution line as the
                one previously named up to 3 times per match. This limit is per
                player.
              </div>

              <div
                className={clsx("tw:mt-2", battleBoardClasses["BattleBoard"])}
              >
                <PokemonCard pokemon={PIKACHU} showAbility={showAbility} />
                <div className={battleBoardClasses["BattleBoard__Separator"]} />
                <LinkChip variant="evolution" count={1} />
                <LinkChip variant="ability" abilityName="Static" count={1} />
                <LinkChip
                  variant="ability"
                  abilityName="Lightning Rod"
                  count={1}
                />
                <div className={battleBoardClasses["BattleBoard__Separator"]} />
                <PokemonCard
                  pokemon={RAICHU}
                  showAbility={showAbility}
                  sharedLinks={{
                    static: 1,
                    "lightning-rod": 1,
                  }}
                />
              </div>
            </li>
          </ol>
        </section>
        <Button asChild className="tw:flex">
          <Link to="/pokechain">Play Now</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default PokeChainRules;
