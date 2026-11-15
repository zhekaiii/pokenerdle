import { toBlob } from "html-to-image";

// The share image is always this size, whatever the device (spec section 6).
export const SHARE_IMAGE_WIDTH = 1080;
export const SHARE_IMAGE_HEIGHT = 1920;
export const SHARE_IMAGE_NAME = "pokenerdle-wrapped-2026.png";

const toFile = (blob: Blob) =>
  new File([blob], SHARE_IMAGE_NAME, { type: "image/png" });

// Whether this browser can hand a PNG file to the share sheet. Where it cannot (most
// desktop browsers), the page hides Share and keeps Save.
export const canShareFiles = (
  nav: Partial<Pick<Navigator, "canShare">> | undefined = typeof navigator ===
  "undefined"
    ? undefined
    : navigator,
): boolean => {
  try {
    // A throwaway file: canShare only looks at the type, never at the contents.
    return nav?.canShare?.({ files: [toFile(new Blob(["x"]))] }) === true;
  } catch {
    return false;
  }
};

// Whether a @font-face unicode-range (for example "U+0000-00FF, U+4??") covers any
// character of `text`. An empty range means the face covers everything.
export const unicodeRangeCovers = (range: string, text: string): boolean => {
  if (!range.trim()) return true;
  const spans = range.split(",").map((token) => {
    const [from, to] = token.trim().replace(/^u\+/i, "").split("-");
    if (from.includes("?")) {
      return [
        parseInt(from.replace(/\?/g, "0"), 16),
        parseInt(from.replace(/\?/g, "f"), 16),
      ];
    }
    return [parseInt(from, 16), parseInt(to ?? from, 16)];
  });
  for (const char of text) {
    const point = char.codePointAt(0) as number;
    if (spans.some(([lo, hi]) => point >= lo && point <= hi)) return true;
  }
  return false;
};

const fontFamilies = (names: string) =>
  names.split(",").map((name) => name.trim().replace(/["']/g, ""));

const readAsDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

// One @font-face rule with its font file inlined as a data URL, so the picture carries
// the font with it. Only the woff2 file is fetched when the rule offers several formats.
const embedFontFace = async (rule: CSSFontFaceRule): Promise<string> => {
  const sources = rule.style.getPropertyValue("src").split(/,(?=\s*url\()/);
  const source =
    sources.find((candidate) => /format\(["']?woff2["']?\)/.test(candidate)) ??
    sources[0];
  const match = /url\(["']?([^"')]+)["']?\)/.exec(source);
  if (!match) throw new Error("A web font has no file to embed");
  const base = rule.parentStyleSheet?.href ?? document.baseURI;
  const response = await fetch(new URL(match[1], base));
  if (!response.ok) throw new Error(`A web font did not load: ${response.status}`);
  const file = await readAsDataUrl(await response.blob());
  const { style } = rule;
  return `@font-face { font-family: ${style.getPropertyValue("font-family")}; font-weight: ${
    style.getPropertyValue("font-weight") || "normal"
  }; font-style: ${style.getPropertyValue("font-style") || "normal"}; unicode-range: ${
    style.getPropertyValue("unicode-range") || "U+0-10FFFF"
  }; src: ${source.replace(match[0], `url(${file})`)}; }`;
};

// The @font-face CSS for the fonts `node` actually uses, for html-to-image's fontEmbedCSS.
// html-to-image would embed every face of every family the node names, and Noto Sans SC
// alone is over a hundred files split by unicode-range, tens of megabytes on a phone's
// data. Only the faces whose range covers a character in `node` are embedded here, which
// are the ones the browser downloads for it too.
const fontEmbedCSS = async (node: HTMLElement): Promise<string> => {
  const text = node.textContent ?? "";
  const families = new Set<string>();
  [node, ...node.querySelectorAll("*")].forEach((el) =>
    fontFamilies(getComputedStyle(el).fontFamily).forEach((name) => families.add(name)),
  );

  const faces: CSSFontFaceRule[] = [];
  for (const sheet of document.styleSheets) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // a cross-origin sheet cannot be read, and holds none of our fonts
    }
    for (const rule of rules) {
      if (
        rule instanceof CSSFontFaceRule &&
        families.has(fontFamilies(rule.style.getPropertyValue("font-family"))[0]) &&
        unicodeRangeCovers(rule.style.getPropertyValue("unicode-range"), text)
      ) {
        faces.push(rule);
      }
    }
  }
  // A face that cannot be fetched is left out, and its text falls back to a system font:
  // a plainer picture is better than no picture to save.
  const embedded = await Promise.all(
    faces.map((face) =>
      embedFontFace(face).catch((error: unknown) => {
        console.warn("Wrapped share image: a font was left out", error);
        return "";
      }),
    ),
  );
  return embedded.join("\n");
};

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const settled = (img: HTMLImageElement) =>
  img.complete
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });

// Waits until every image in `node` has loaded or failed. A failed artwork swaps its own
// src to the placeholder, which is a new load, so look again after a frame until nothing
// is left loading.
const imagesSettled = async (node: HTMLElement) => {
  for (let round = 0; round < 3; round++) {
    const pending = [...node.querySelectorAll("img")].filter((img) => !img.complete);
    if (pending.length === 0) return;
    await Promise.all(pending.map(settled));
    await nextFrame();
  }
};

// The still rainbow card composes its Pokémon on a canvas once the artwork has loaded
// (rainbowArt.ts), and marks itself data-art-pending until then. Drawing before that would
// leave the colour out of the picture. Waits, but not for ever: a card that never gets
// there is drawn with the plain artwork.
const ART_WAIT_MS = 5000;
const cardArtReady = async (node: HTMLElement) => {
  const giveUp = performance.now() + ART_WAIT_MS;
  while (node.querySelector("[data-art-pending]") && performance.now() < giveUp) {
    await nextFrame();
  }
};

// Draws `node`, an element laid out at 1080 × 1920 CSS pixels, to a PNG of exactly that
// size. The web fonts and the images in the node are embedded in the picture, so callers
// need not do anything about them beyond rendering them.
export const renderShareImage = async (node: HTMLElement): Promise<Blob> => {
  // Fonts and artwork that are still loading would be left out of the picture.
  await document.fonts.ready;
  await cardArtReady(node);
  await imagesSettled(node);
  // Text that fits itself to its box (useFitText) measures again when fonts finish
  // loading; give that a frame to land.
  await nextFrame();

  const options = {
    pixelRatio: 1,
    width: SHARE_IMAGE_WIDTH,
    height: SHARE_IMAGE_HEIGHT,
    fontEmbedCSS: await fontEmbedCSS(node),
    // html-to-image copies every computed property onto its clone. In recent WebKit, once
    // the corner-*-shape properties are copied, the clone's border-radius is dropped and
    // every rounded corner is drawn square. They are all "round" here, the default.
    includeStyleProperties: Array.from(
      getComputedStyle(document.documentElement),
    ).filter((name) => !name.startsWith("corner-")),
  };
  // Safari leaves images (sometimes fonts) out of the first picture; a second draw has them.
  await toBlob(node, options);
  const blob = await toBlob(node, options);
  if (!blob) throw new Error("The share image could not be drawn");
  return blob;
};

// Downloads the image.
export const saveImage = (blob: Blob): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = SHARE_IMAGE_NAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking at once can cancel the download in some browsers.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

// Opens the share sheet with the image. Must be called straight from a tap: browsers
// refuse a share that comes too long after the gesture. Closing the sheet is a cancel,
// not an error; any other failure is thrown.
export const shareImage = async (blob: Blob): Promise<"shared" | "cancelled"> => {
  try {
    await navigator.share({ files: [toFile(blob)] });
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "cancelled";
    }
    throw error;
  }
};
