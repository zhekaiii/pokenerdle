export const tryParseNum = (str: string) => {
  const parsed = +str;
  return isNaN(parsed) ? str : parsed;
};
