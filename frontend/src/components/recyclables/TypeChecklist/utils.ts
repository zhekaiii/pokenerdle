import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { POKEMON_TYPES } from "@pokenerdle/shared/pokemon";
import { uniq } from "es-toolkit";

export const MONO_TYPE_ID = 69;
export const DUAL_TYPE_ID = 70;

const generateTypeKey = (type1: string, type2: string) => {
  type1 = type1.toLowerCase();
  type2 = type2.toLowerCase();
  if (type1 === type2) return type1;
  const sortedTypes = [type1, type2].sort();
  return sortedTypes.join("-");
};

export const eliminateTypesFromGuesses = async (
  guesses: DailyChallengeGuessResponse[]
) => {
  const ALL_POSSIBLE_MATCHUPS = (await import(
    "./matchupsByAttacker.json"
  )) as Record<string, Record<number, string[]>>;

  const confirmedTypes = new Set<number>(
    guesses
      .filter((guess) => guess.correct || guess.type1Correctness === "=")
      .map(
        (guess) =>
          POKEMON_TYPES.find(
            (type) => type.name === guess.pokemon.type1.toLowerCase()
          )!.id
      )
      .concat(
        guesses
          .filter(
            (guess) =>
              guess.correct ||
              (guess.pokemon.type2 && guess.type2Correctness === "=")
          )
          .map(
            (guess) =>
              POKEMON_TYPES.find(
                (type) => type.name === guess.pokemon.type2!.toLowerCase()
              )!.id
          )
      )
  );
  if (confirmedTypes.size === 2) {
    return POKEMON_TYPES.filter((type) => !confirmedTypes.has(type.id))
      .map((type) => type.id)
      .concat(MONO_TYPE_ID);
  }
  let confirmMonotype = guesses.some(
    (guess) =>
      guess.pokemon.type2 === null &&
      (guess.correct || guess.type2Correctness === "=")
  );
  if (confirmMonotype && confirmedTypes.size === 1) {
    return POKEMON_TYPES.filter((type) => confirmedTypes.has(type.id))
      .map((type) => type.id)
      .concat(DUAL_TYPE_ID);
  }
  let confirmDualtype =
    !confirmMonotype &&
    guesses.some(
      (guess) =>
        (guess.pokemon.type2 !== null && guess.correct) ||
        (guess.pokemon.type2 === null &&
          !guess.correct &&
          guess.type2Correctness === "NA")
    );

  let possibleCombinations = (
    !confirmDualtype ? POKEMON_TYPES.map((type) => type.name) : []
  ).concat(
    !confirmMonotype
      ? POKEMON_TYPES.flatMap((type1) =>
          POKEMON_TYPES.map((type2) => generateTypeKey(type1.name, type2.name))
        )
      : []
  );
  for (const guess of guesses) {
    // By right, this should never happen because we would've already returned
    if (guess.correct) return [];
    // Guess' Type 1 is correct
    if (guess.type1Correctness === "=") {
      possibleCombinations = possibleCombinations.filter((combination) =>
        POKEMON_TYPES.map((type) =>
          generateTypeKey(type.name, guess.pokemon.type1)
        ).includes(combination)
      );
    } else {
      // Guess' Type 1 is incorrect
      possibleCombinations = possibleCombinations.filter(
        (combination) =>
          !combination.includes(guess.pokemon.type1.toLowerCase()) &&
          ALL_POSSIBLE_MATCHUPS[guess.pokemon.type1.toLowerCase()][
            guess.type1Correctness as number
          ].includes(combination)
      );
    }
    // Guess' Type 2 is correct
    if (guess.type2Correctness === "=") {
      // Guess and target are monotype
      if (guess.pokemon.type2 === null) {
        possibleCombinations = possibleCombinations.filter((combination) =>
          POKEMON_TYPES.map((type) => type.name).includes(combination)
        );
      } else {
        // Target has Guess' Type 2
        possibleCombinations = possibleCombinations.filter((combination) =>
          POKEMON_TYPES.map((type) =>
            generateTypeKey(type.name, guess.pokemon.type2!)
          ).includes(combination)
        );
      }
    } else if (guess.type2Correctness === "NA") {
      // Guess is monotype but target is not
      possibleCombinations = possibleCombinations.filter(
        (combination) => !combination.includes("-")
      );
    } else {
      // Guess type 2 is incorrect
      possibleCombinations = possibleCombinations.filter(
        (combination) =>
          !combination.includes(guess.pokemon.type2!.toLowerCase()) &&
          ALL_POSSIBLE_MATCHUPS[guess.pokemon.type2!.toLowerCase()][
            guess.type2Correctness as number
          ].includes(combination)
      );
    }
  }

  const possibleTypes = uniq(
    possibleCombinations.flatMap((typePossibility) =>
      typePossibility.split("-")
    )
  );

  confirmMonotype = possibleCombinations.every((type) => !type.includes("-"));
  confirmDualtype = possibleCombinations.every((type) => type.includes("-"));

  const eliminatedTypes = POKEMON_TYPES.filter(
    (type) => !possibleTypes.includes(type.name)
  ).map((type) => type.id);

  return eliminatedTypes.concat(
    confirmMonotype ? [DUAL_TYPE_ID] : [],
    confirmDualtype ? [MONO_TYPE_ID] : []
  );
};
