import { LanguageId } from "../lib/constants.js";

export const getLanguageId = (lang: string) => {
  return lang === "zh-Hant"
    ? LanguageId.TraditionalChinese
    : lang === "zh-Hans"
    ? LanguageId.SimplifiedChinese
    : LanguageId.English;
};
