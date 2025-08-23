import battleBoardClasses from "@/components/PokeChain/BattleBoard.module.scss";
import LinkChip from "@/components/PokeChain/LinkChip";
import PokemonCard from "@/components/recyclables/PokemonCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PokemonWithAbilities } from "@pokenerdle/shared";
import clsx from "clsx";
import React from "react";
import { Link } from "react-router";

const BULBASAUR: PokemonWithAbilities = {
  id: 1,
  name: "bulbasaur",
  pokemon_species_id: 1,
  abilities: [
    {
      id: 65,
      name: "overgrow",
    },
    {
      id: 34,
      name: "chlorophyll",
    },
  ],
  speciesName: "bulbasaur",
  sprites: {
    front_default:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    front_shiny:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png",
  },
};

const TREECKO: PokemonWithAbilities = {
  id: 252,
  name: "treecko",
  pokemon_species_id: 252,
  abilities: [
    {
      id: 65,
      name: "overgrow",
    },
    {
      id: 34,
      name: "unburden",
    },
  ],
  speciesName: "treecko",
  sprites: {
    front_default:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/252.png",
    front_shiny:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/252.png",
  },
};

const SUNFLORA: PokemonWithAbilities = {
  id: 192,
  name: "sunflora",
  pokemon_species_id: 192,
  abilities: [
    {
      id: 34,
      name: "chlorophyll",
    },
    {
      id: 180,
      name: "solar-power",
    },
  ],
  speciesName: "sunflora",
  sprites: {
    front_default:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/192.png",
    front_shiny:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/192.png",
  },
};

const PathFinderRules: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="tw:text-3xl tw:text-center">
          Rules of Path Finder
        </CardTitle>
      </CardHeader>
      <CardContent className="tw:space-y-6">
        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-3">🔍 Objective</h2>
          <p>
            In <strong>Path Finder</strong>, your goal is to form a chain of
            Pokémon that connects a given Start Pokémon to a Target Pokémon,
            where each Pokémon in the path shares an ability with the previous
            one.
          </p>
        </section>

        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-3">
            🔗 How to Play
          </h2>
          <ol className="tw:list-decimal tw:ms-4 tw:space-y-2">
            <li>You are given a Start Pokémon and a Target Pokémon.</li>
            <li>
              Build a path of valid Pokémon where each Pokémon shares at least
              one ability with the previous Pokémon.
            </li>
            <li>You cannot reuse any Pokémon in the same path.</li>
            <li>The shorter the path, the better!</li>
          </ol>
        </section>

        <section>
          <h2 className="tw:text-xl tw:font-semibold tw:mb-3">🧪 Example</h2>
          <p>
            To connect <b>Treecko</b> to <b>Sunflora</b>:
          </p>
          <div className={clsx("tw:mt-2", battleBoardClasses["BattleBoard"])}>
            <PokemonCard pokemon={TREECKO} showAbility />
            <div className={battleBoardClasses["BattleBoard__Separator"]} />
            <LinkChip variant="ability" abilityName="overgrow" />
            <div className={battleBoardClasses["BattleBoard__Separator"]} />
            <PokemonCard pokemon={BULBASAUR} showAbility />
            <div className={battleBoardClasses["BattleBoard__Separator"]} />
            <LinkChip variant="ability" abilityName="chlorophyll" />
            <div className={battleBoardClasses["BattleBoard__Separator"]} />
            <PokemonCard pokemon={SUNFLORA} showAbility />
          </div>
          <p className="tw:mt-2">
            Both Treecko and Bulbasaur share the <b>Overgrow</b> ability, and
            both Bulbasaur and Sunflora share the <b>Chlorophyll</b> ability.
            This is a valid 2-step path.
          </p>
        </section>

        <Button asChild className="tw:flex">
          <Link to="/path-finder">Play Now</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export const Component = PathFinderRules;

Component.displayName = "PathFinderRules";

export default Component;
