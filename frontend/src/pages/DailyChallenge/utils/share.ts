import { toast } from "@/hooks/useToast";
import { TZDate } from "@date-fns/tz";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
import { formatDate } from "date-fns";
import { TFunction } from "i18next";
import {
  challengeNumber,
  COLUMNS,
  DAILY_CHALLENGE_GUESS_LIMIT,
} from "../constants";

const generateGridEmojis = (guesses: DailyChallengeGuessResponse[]) => {
  return guesses
    .map((guess) => {
      if (guess.correct) {
        return COLUMNS.map(() => "🟩").join("");
      }
      return COLUMNS.map((column) =>
        guess[column.key] === true || guess[column.key] === "=" ? "🟩" : "🟧"
      ).join("");
    })
    .join("\n");
};

export const generateShareText = (
  guesses: DailyChallengeGuessResponse[],
  autoInferLastUsed: string | null,
  t: TFunction
) => {
  const solved = guesses[guesses.length - 1].correct;
  const usedAutoInfer =
    autoInferLastUsed === formatDate(TZDate.tz("Asia/Singapore"), "yyyy-MM-dd");
  const grid = generateGridEmojis(guesses);
  let text = `${t("daily:share.title", { number: challengeNumber })}\n\n`;
  if (solved) {
    text +=
      guesses.length == 1
        ? `${t("daily:share.firstTry")}\n\n`
        : usedAutoInfer
        ? `${t("daily:share.attempts_with_auto_infer", {
            count: guesses.length,
            total: DAILY_CHALLENGE_GUESS_LIMIT,
          })}\n\n`
        : `${t("daily:share.attempts", {
            count: guesses.length,
            total: DAILY_CHALLENGE_GUESS_LIMIT,
          })}\n\n`;
  } else {
    text += `${t("daily:share.challengeFailed")}\n\n`;
  }
  text += `${grid}\n\n${t(
    "daily:share.challengePrompt"
  )} https://pokenerdle.app/daily`;
  return text;
};

export const shareResults = async (
  guesses: DailyChallengeGuessResponse[],
  autoInferLastUsed: string | null,
  t: TFunction
) => {
  const shareText = generateShareText(guesses, autoInferLastUsed, t);
  if (navigator.share) {
    // Native mobile sharing
    await navigator.share({
      text: shareText,
    });
  } else {
    // Fallback to clipboard
    await navigator.clipboard.writeText(shareText);
    toast({
      variant: "positive",
      description: t("daily:share.unsupported"),
    });
  }
};
