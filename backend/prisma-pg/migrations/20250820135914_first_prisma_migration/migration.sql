-- CreateTable
CREATE TABLE "public"."daily_challenges" (
    "date" TEXT NOT NULL,
    "pokemonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_challenges_pkey" PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "public"."user_daily_guesses" (
    "userId" TEXT NOT NULL,
    "dailyChallengeId" TEXT NOT NULL,
    "pokemonId" INTEGER NOT NULL,
    "guessNumber" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "type1Correctness" TEXT NOT NULL,
    "type2Correctness" TEXT NOT NULL,
    "genCorrectness" TEXT NOT NULL,
    "heightCorrectness" TEXT NOT NULL,
    "colorCorrectness" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_daily_guesses_pkey" PRIMARY KEY ("userId","dailyChallengeId","guessNumber")
);

-- AddForeignKey
ALTER TABLE "public"."user_daily_guesses" ADD CONSTRAINT "user_daily_guesses_dailyChallengeId_fkey" FOREIGN KEY ("dailyChallengeId") REFERENCES "public"."daily_challenges"("date") ON DELETE CASCADE ON UPDATE CASCADE;
