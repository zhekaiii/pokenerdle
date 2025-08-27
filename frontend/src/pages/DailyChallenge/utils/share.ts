import { toast } from "@/hooks/useToast";
import { DailyChallengeGuessResponse } from "@pokenerdle/shared/daily";
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

export const generateShareText = (guesses: DailyChallengeGuessResponse[]) => {
  const attempts = `${guesses.length}/${DAILY_CHALLENGE_GUESS_LIMIT}`;
  const solved = guesses[guesses.length - 1].correct;
  const grid = generateGridEmojis(guesses);
  let text = `PokeNerdle Daily #${challengeNumber}\n\n`;
  if (solved) {
    text +=
      guesses.length == 1
        ? "Got it on the first try! So lucky!\n\n"
        : `Guessed in ${attempts} tries!\n\n`;
  }
  text += `${grid}\n\nCan you guess 'em all? https://pokenerdle.app`;
  return text;
};

export const shareResults = async (guesses: DailyChallengeGuessResponse[]) => {
  const shareText = generateShareText(guesses);
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
      description:
        "Your browser doesn't support sharing. Results copied to clipboard!",
    });
  }
};
