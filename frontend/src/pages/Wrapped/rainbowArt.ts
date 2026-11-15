// The rainbow Pokémon, composed on a canvas for the still card (the share image).
//
// The live card builds it from CSS: a rainbow gradient cut to the artwork with a mask, under
// a grey copy of the artwork that multiplies in (Card.module.scss, .Rainbow .Art). A masked
// layer and a blend mode do not survive html-to-image, which draws the card through an SVG
// picture: Chrome drops the mask and shows a rectangle of rainbow, Safari and Firefox drop
// the colour altogether. So the still card carries one plain <img> instead, made here from
// the same settings (spec section 5).

import { loadArtworkBitmap, RAINBOW_SHADING_BRIGHTNESS } from "./cardArt";

// The owner's rainbow settings. They match .Rainbow .Art in Card.module.scss.
const COLOUR_OPACITY = 0.5;
const BAND_WIDTH = 0.6; // of the card's width: one pass through the spectrum
const BAND_ANGLE = 70; // degrees, CSS convention: 0 is up, 90 is right
const SHADING_CONTRAST = 1.1;
const SHADING_OPACITY = 0.9;

// The bands of colour, as [position within one band, colour]. The first and last colour
// are the same, so the bands repeat without a seam.
const SPECTRUM: [number, string][] = [
  [0, "#ff0a7a"],
  [0.17, "#ff7a00"],
  [0.34, "#ffe600"],
  [0.5, "#00e060"],
  [0.67, "#00a8ff"],
  [0.84, "#8a2bff"],
  [1, "#ff0a7a"],
];

// On the live card the colours cycle through the spectrum every 3 s (hue-rotate). A still
// has to pick a moment, and takes the start of the cycle: the colours as listed above.

// Whether any pixel is not fully transparent. An artwork that read back as all zeros would
// make an empty composite (no Pokémon at all), so the plain artwork is better.
export const hasVisiblePixels = (data: Uint8ClampedArray) => {
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0) return true;
  }
  return false;
};

// Turns RGBA pixels (as from ImageData) into the grey shading, in place: what CSS
// grayscale(1) contrast(c) brightness(b) does. Alpha is left alone.
export const shadeArtwork = (
  data: Uint8ClampedArray,
  brightness: number,
  contrast: number = SHADING_CONTRAST,
) => {
  for (let i = 0; i < data.length; i += 4) {
    const grey = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    const shade = ((grey - 0.5) * contrast + 0.5) * brightness * 255;
    data[i] = shade; // a Uint8ClampedArray rounds and clamps
    data[i + 1] = shade;
    data[i + 2] = shade;
  }
};

// A repeating CSS linear-gradient is a gradient along a line through the middle of the box,
// as long as the box is at the angle, that starts at its first corner. This builds the same
// bands on a canvas, repeating the spectrum as often as the box needs.
const bandsGradient = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  period: number,
) => {
  const angle = (BAND_ANGLE * Math.PI) / 180;
  const dx = Math.sin(angle);
  const dy = -Math.cos(angle);
  const lineLength = Math.abs(width * dx) + Math.abs(height * dy);
  const repeats = Math.ceil(lineLength / period);
  const startX = width / 2 - (dx * lineLength) / 2;
  const startY = height / 2 - (dy * lineLength) / 2;
  const gradient = context.createLinearGradient(
    startX,
    startY,
    startX + dx * repeats * period,
    startY + dy * repeats * period,
  );
  for (let repeat = 0; repeat < repeats; repeat++) {
    for (const [position, colour] of SPECTRUM) {
      gradient.addColorStop((repeat + position) / repeats, colour);
    }
  }
  return gradient;
};

const newCanvas = (width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("No 2D canvas");
  return { canvas, context };
};

// The rainbow Pokémon as a PNG data URL, drawn to fill a box of `width` x `height` the way
// the artwork's own <img> fills it (object-fit: contain), or null when it cannot be made.
// `cardWidth` sizes the bands, `shading` is the brightness correction for how light the
// artwork is (1 for none). A failure is logged and is a null, never an error.
export const composeRainbowArtwork = async (
  src: string,
  width: number,
  height: number,
  cardWidth: number,
  shading = 1,
): Promise<string | null> => {
  try {
    if (width < 1 || height < 1) throw new Error("The artwork has no size yet");
    const w = Math.round(width);
    const h = Math.round(height);

    // Safari: the page's own <img>, drawn onto a canvas, read back empty, so the artwork is
    // fetched and decoded instead (loadArtworkBitmap).
    const bitmap = await loadArtworkBitmap(src);

    const fit = Math.min(w / bitmap.width, h / bitmap.height);
    const drawnWidth = bitmap.width * fit;
    const drawnHeight = bitmap.height * fit;
    const artwork = newCanvas(w, h);
    artwork.context.drawImage(
      bitmap,
      (w - drawnWidth) / 2,
      (h - drawnHeight) / 2,
      drawnWidth,
      drawnHeight,
    );

    // The rainbow, cut to the artwork's shape: kept only where the artwork has pixels.
    const colour = newCanvas(w, h);
    colour.context.fillStyle = bandsGradient(colour.context, w, h, cardWidth * BAND_WIDTH);
    colour.context.fillRect(0, 0, w, h);
    colour.context.globalCompositeOperation = "destination-in";
    colour.context.drawImage(artwork.canvas, 0, 0);

    // The grey shading, from the artwork's own pixels.
    const pixels = artwork.context.getImageData(0, 0, w, h);
    if (!hasVisiblePixels(pixels.data)) throw new Error("The artwork read back empty");
    shadeArtwork(pixels.data, RAINBOW_SHADING_BRIGHTNESS * shading);
    const grey = newCanvas(w, h);
    grey.context.putImageData(pixels, 0, 0);

    // The colour under, the shading multiplied over it.
    const out = newCanvas(w, h);
    out.context.globalAlpha = COLOUR_OPACITY;
    out.context.drawImage(colour.canvas, 0, 0);
    out.context.globalAlpha = SHADING_OPACITY;
    out.context.globalCompositeOperation = "multiply";
    out.context.drawImage(grey.canvas, 0, 0);
    return out.canvas.toDataURL("image/png");
  } catch (error) {
    console.warn("Wrapped share image: no rainbow Pokémon, the plain artwork stands in", error);
    return null;
  }
};
