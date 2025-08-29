import { LanguageId } from "../lib/constants.js";

export const getLanguageId = (lang: string) => {
  return lang === "zh" ? LanguageId.Chinese : LanguageId.English;
};
