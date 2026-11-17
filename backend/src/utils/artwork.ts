// Official artwork first, then the HOME render, else null. A row whose JSON cannot be
// read gives null, so one bad row does not fail the whole request.
export const pickArtwork = (spritesJson: string | undefined): string | null => {
  if (!spritesJson) return null;
  try {
    const other = JSON.parse(spritesJson)?.other;
    return other?.["official-artwork"]?.front_default ?? other?.home?.front_default ?? null;
  } catch {
    return null;
  }
};
