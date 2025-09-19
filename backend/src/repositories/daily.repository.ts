import { DAILY_CHALLENGE_GUESS_LIMIT } from "../constants/game.js";
import { Prisma } from "../generated/prisma-pg/client.js";
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

export const saveUserGuess = async ({
  userId,
  date,
  pokemonId,
  guessNumber,
  isCorrect,
  type1Correctness,
  type2Correctness,
  genCorrectness,
  heightCorrectness,
  colorCorrectness,
}: {
  userId: string;
  date: string;
  pokemonId: number;
  guessNumber: number;
  isCorrect: boolean;
  type1Correctness: string;
  type2Correctness: string;
  genCorrectness: string;
  heightCorrectness: string;
  colorCorrectness: boolean;
}) => {
  return await pgClient.userDailyGuess.create({
    data: {
      userId,
      dailyChallengeId: date,
      pokemonId,
      guessNumber,
      isCorrect,
      type1Correctness,
      type2Correctness,
      genCorrectness,
      heightCorrectness,
      colorCorrectness,
    },
  });
};

export const getUserGuessesForDate = async (userId: string, date: string) => {
  return pgClient.userDailyGuess.findMany({
    where: {
      userId,
      dailyChallengeId: date,
    },
    orderBy: {
      guessNumber: "asc",
    },
  });
};

export const deleteUserGuessesForDate = async (
  userId: string,
  date: string
) => {
  return pgClient.userDailyGuess.deleteMany({
    where: {
      userId,
      dailyChallengeId: date,
    },
  });
};

export const migrateUserGuesses = async (
  oldUserId: string,
  newUserId: string
) => {
  await pgClient.$transaction(async (tx) => {
    // Find days where both user and posthog distinct id have guesses
    const oldUserGuessesDays = new Set(
      await tx.userDailyGuess
        .findMany({
          where: {
            userId: oldUserId,
          },
          distinct: ["dailyChallengeId"],
          select: {
            dailyChallengeId: true,
          },
        })
        .then((result) =>
          result.map(({ dailyChallengeId }) => dailyChallengeId)
        )
    );
    const newUserGuessesDays = new Set(
      await tx.userDailyGuess
        .findMany({
          where: {
            userId: newUserId,
          },
          distinct: ["dailyChallengeId"],
          select: {
            dailyChallengeId: true,
          },
        })
        .then((result) =>
          result.map(({ dailyChallengeId }) => dailyChallengeId)
        )
    );
    const daysToDelete = oldUserGuessesDays.intersection(newUserGuessesDays);
    await tx.userDailyGuess.deleteMany({
      where: {
        userId: oldUserId,
        dailyChallengeId: { in: Array.from(daysToDelete) },
      },
    });
    await tx.userDailyGuess.updateMany({
      where: {
        userId: oldUserId,
      },
      data: {
        userId: newUserId,
      },
    });
  });
};

export const getUserGuessCountForDate = async (
  userId: string,
  date: string
) => {
  const result = await pgClient.userDailyGuess.count({
    where: {
      userId,
      dailyChallengeId: date,
    },
  });
  return result;
};

export const getUserDailyStatsData = async (userId: string) => {
  return pgClient.$queryRaw<
    {
      dailyChallengeId: string;
      correct: boolean;
      count: number;
    }[]
  >`
    SELECT
      "dailyChallengeId",
      BOOL_OR("isCorrect") AS correct,
      count(1)
    FROM
      user_daily_guesses
    WHERE
      "userId" = ${userId}
    GROUP BY
      "dailyChallengeId"
    HAVING
      count(1) = ${DAILY_CHALLENGE_GUESS_LIMIT}
      OR BOOL_OR("isCorrect")
    ORDER BY
     "dailyChallengeId"
  `;
};
