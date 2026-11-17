// How the card adapts to its artwork. Artwork varies in
// how much of its image the drawing fills and in how light it is, so gold and rainbow
// scale it to a common size and the rainbow shading is corrected for lightness.

export interface ArtworkMeasure {
  fill: number; // 0..1, side of the drawing's bounding box as a share of the image's side
  lightness: number; // 0..1, mean luma of the drawing's opaque pixels
}

export interface ArtworkFit {
  scale: number; // multiplies the artwork's size
  brightness: number; // multiplies the rainbow shading's brightness; 1 is no correction
}

export const NO_FIT: ArtworkFit = { scale: 1, brightness: 1 };

// Garchomp is the reference the finishes were tuned on. Measured with measureArtwork on
// its official artwork drawn at 128 px in Chrome.
export const ART_REFERENCE: ArtworkMeasure = { fill: 0.89, lightness: 0.389 };

const SCALE_RANGE = { min: 0.6, max: 1.15 };
// The rainbow shading is brightness(1.75) in CSS. The corrected value stays within
// 0.45 to 1.8, which as a multiplier of 1.75 is these bounds.
export const RAINBOW_SHADING_BRIGHTNESS = 1.75;
const BRIGHTNESS_RANGE = {
  min: 0.45 / RAINBOW_SHADING_BRIGHTNESS,
  max: 1.8 / RAINBOW_SHADING_BRIGHTNESS,
};

// Pixels at least this opaque (of 255) belong to the drawing.
const OPAQUE_MIN = 32;
// The artwork is read from a canvas this big, which is plenty for two averages.
const SAMPLE_SIZE = 128;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

// data is RGBA, as from ImageData. Null when no pixel is opaque.
export const measureArtwork = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
): ArtworkMeasure | null => {
  let minX = width;
  let maxX = -1;
  let minY = height;
  let maxY = -1;
  let lumaSum = 0;
  let count = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < OPAQUE_MIN) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      lumaSum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      count++;
    }
  }
  if (count === 0) return null;
  const boxWidth = (maxX - minX + 1) / width;
  const boxHeight = (maxY - minY + 1) / height;
  return {
    fill: Math.sqrt(boxWidth * boxHeight),
    lightness: lumaSum / count / 255,
  };
};

export const fitArtwork = (measure: ArtworkMeasure | null): ArtworkFit => {
  if (!measure) return NO_FIT;
  return {
    scale: clamp(ART_REFERENCE.fill / measure.fill, SCALE_RANGE.min, SCALE_RANGE.max),
    brightness: clamp(
      ART_REFERENCE.lightness / Math.max(measure.lightness, 0.001),
      BRIGHTNESS_RANGE.min,
      BRIGHTNESS_RANGE.max,
    ),
  };
};

// The artwork decoded from a CORS fetch, once per URL. Safari reads back empty pixels from
// the page's own <img> drawn onto a canvas, so every pixel read here and in rainbowArt.ts
// starts from this bitmap instead. The bitmap is shared, so callers must not close it.
const bitmaps = new Map<string, Promise<ImageBitmap>>();

export const loadArtworkBitmap = (src: string): Promise<ImageBitmap> => {
  let bitmap = bitmaps.get(src);
  if (!bitmap) {
    bitmap = (async () => {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`The artwork did not load: ${response.status}`);
      return createImageBitmap(await response.blob());
    })();
    bitmaps.set(src, bitmap);
    // A failure is not kept, so the next call tries again.
    bitmap.catch(() => bitmaps.delete(src));
  }
  return bitmap;
};

// Measures the artwork at `src`. Any failure (fetch, decode, canvas) means no adjustment,
// never an error, and is logged as a warning.
export const readArtworkFit = async (src: string): Promise<ArtworkFit> => {
  try {
    const bitmap = await loadArtworkBitmap(src);
    const canvas = document.createElement("canvas");
    canvas.width = SAMPLE_SIZE;
    canvas.height = SAMPLE_SIZE;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("No 2D canvas");
    context.drawImage(bitmap, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const { data } = context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    return fitArtwork(measureArtwork(data, SAMPLE_SIZE, SAMPLE_SIZE));
  } catch (error) {
    console.warn("Wrapped card: no artwork fit, the default size and shading stand in", error);
    return NO_FIT;
  }
};
