import { Prisma } from "@prisma-pg/client.js";
import { pgClient } from "../lib/pg.js";

export const getDailyPokemonFromDb = async (date: string) => {
  return pgClient.dailyChallenge.findUnique({
    where: { date },
  });
};

export const createDailyPokemon = async (date: string, pokemonId: number) => {
  try {
    return await pgClient.dailyChallenge.create({
      data: { date, pokemonId },
    });
  } catch (error) {
    // Prisma error code for unique constraint violation is 'P2002'
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // Already exists, fetch and return the existing record
      return await pgClient.dailyChallenge.findUniqueOrThrow({
        where: { date },
      });
    }
    throw error;
  }
};
