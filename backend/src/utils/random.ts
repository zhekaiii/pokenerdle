export const createRandomString = (length: number) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  randomArray.forEach((number) => {
    result += chars[number % chars.length];
  });
  return result;
};

export const randomChoice = <T>(array: T[]) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

export const randomChoiceWeighted = <T>(array: T[], weights: number[]) => {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const randomValue = Math.random() * totalWeight;
  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += weights[i];
    if (randomValue <= sum) {
      return array[i];
    }
  }
  return array[array.length - 1];
};
