import { TZDate } from "@date-fns/tz";
import { SINGAPORE_TIMEZONE } from "@pokenerdle/shared/date";
import { formatDate, subMonths } from "date-fns";
import seedrandom from "seedrandom";
import { DAILY_CHALLENGE_GUESS_LIMIT } from "../constants/game.js";
import { Prisma } from "../generated/prisma-pg/client.js";
import { pgClient } from "../lib/pg.js";

export const getDailyPokemonFromDb = async (date: string) => {
  return pgClient.dailyChallenge.findUnique({
    where: { date },
  });
};

export const dailyChallengeExists = async (date: string): Promise<boolean> => {
  return (
    (await pgClient.dailyChallenge.count({
      where: { date },
    })) > 0
  );
};

export const createDailyPokemon = async (
  date: string,
  pokemonId: number,
  rngState: string,
) => {
  try {
    return await pgClient.dailyChallenge.create({
      data: { date, pokemonId, rngState },
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
  isArchive,
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
  isArchive?: boolean;
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
      isArchive: isArchive ?? false,
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

export const migrateUserGuesses = async (
  oldUserId: string,
  newUserId: string,
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
          result.map(({ dailyChallengeId }) => dailyChallengeId),
        ),
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
          result.map(({ dailyChallengeId }) => dailyChallengeId),
        ),
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
  date: string,
) => {
  const result = await pgClient.userDailyGuess.count({
    where: {
      userId,
      dailyChallengeId: date,
    },
  });
  return result;
};

export const hasUserSubmittedAnyDailyChallengeGuess = async (
  userId: string,
) => {
  const result = await pgClient.userDailyGuess.findFirst({
    where: { userId },
    select: { userId: true },
  });
  return result !== null;
};

export const getUserDailyChallengeByDay = async (
  userId: string,
  {
    startInclusive,
    endExclusive,
    includeArchive = false,
  }: {
    startInclusive?: string;
    endExclusive?: string;
    includeArchive?: boolean;
  } = {},
) => {
  const whereClause = Prisma.sql`
    WHERE
      "userId" = ${userId}
      ${includeArchive ? Prisma.sql`` : Prisma.sql`AND "isArchive" = false`}
      ${startInclusive ? Prisma.sql`AND "dailyChallengeId" >= ${startInclusive}` : Prisma.sql``}
      ${endExclusive ? Prisma.sql`AND "dailyChallengeId" < ${endExclusive}` : Prisma.sql``}
  `;
  return pgClient.$queryRaw<
    {
      dailyChallengeId: string;
      correct: boolean;
      count: bigint;
    }[]
  >`
    SELECT
      "dailyChallengeId",
      BOOL_OR("isCorrect") AS correct,
      count(1)
    FROM
      user_daily_guesses
    ${whereClause}
    GROUP BY
      "dailyChallengeId"
    HAVING
      count(1) = ${DAILY_CHALLENGE_GUESS_LIMIT}
      OR BOOL_OR("isCorrect")
    ORDER BY
     "dailyChallengeId"
  `;
};

export const hasPokemonAppearedInLastMonth = async (
  pokemonId: number,
  date: string,
) => {
  const oneMonthAgo = subMonths(new Date(date), 1);
  const result = await pgClient.dailyChallenge.findFirst({
    where: {
      pokemonId,
      date: {
        gte: formatDate(oneMonthAgo, "yyyy-MM-dd"),
        lt: date,
      },
    },
  });
  return result !== null;
};

export const getLastRngState = async (date: string) => {
  const result = await pgClient.dailyChallenge.findFirst({
    where: {
      date: {
        lt: date,
      },
    },
    orderBy: {
      date: "desc",
    },
    select: {
      rngState: true,
      date: true,
    },
  });
  if (result?.rngState) {
    return {
      state: JSON.parse(result.rngState) as seedrandom.State.Alea,
      date: result.date,
    };
  }
  return null;
};

export const getCalendarData = async (userId: string, month: string) => {
  const startDate = `${month}-01`;
  const [year, monthNum] = month.split("-").map(Number);
  const nextMonth =
    monthNum === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(monthNum + 1).padStart(2, "0")}-01`;

  const guesses = await getUserDailyChallengeByDay(userId, {
    startInclusive: startDate,
    endExclusive: nextMonth,
    includeArchive: true,
  });

  if (guesses.length === 0) return [];

  const challenges = await pgClient.dailyChallenge.findMany({
    where: {
      date: {
        in: guesses.map((g) => g.dailyChallengeId),
      },
    },
    select: {
      date: true,
      pokemonId: true,
    },
  });

  const challengeMap = new Map(challenges.map((c) => [c.date, c.pokemonId]));

  return guesses.map((g) => ({
    date: g.dailyChallengeId,
    solved: g.correct ?? false,
    pokemonId: challengeMap.get(g.dailyChallengeId) ?? 0,
    attempts: Number(g.count),
  }));
};

export const hasUserCompletedToday = async (userId: string) => {
  const today = formatDate(TZDate.tz(SINGAPORE_TIMEZONE), "yyyy-MM-dd");
  const result = await pgClient.userDailyGuess.findMany({
    where: {
      userId,
      dailyChallengeId: today,
    },
  });
  return (
    result.length === DAILY_CHALLENGE_GUESS_LIMIT ||
    result.some((guess) => guess.isCorrect)
  );
};
