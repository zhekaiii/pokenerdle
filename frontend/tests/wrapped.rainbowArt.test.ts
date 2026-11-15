import { describe, expect, test } from "bun:test";
import { shadeArtwork } from "../src/pages/Wrapped/rainbowArt";

describe("shadeArtwork", () => {
  test("turns pixels grey with the CSS contrast and brightness, and keeps alpha", () => {
    // Mid-grey is almost untouched by contrast 1.1 (0.5022), so brightness 1.5 gives about 0.753.
    const data = new Uint8ClampedArray([128, 128, 128, 77]);
    shadeArtwork(data, 1.5);
    expect([...data]).toEqual([192, 192, 192, 77]);
  });

  test("weights the channels by luma before shading", () => {
    // Pure green is the brightest channel (0.7152), pure blue the darkest (0.0722).
    const data = new Uint8ClampedArray([0, 255, 0, 255, 0, 0, 255, 255]);
    shadeArtwork(data, 1, 1);
    expect(data[0]).toBe(Math.round(0.7152 * 255));
    expect([data[0], data[1], data[2]]).toEqual([data[0], data[0], data[0]]);
    expect(data[4]).toBe(Math.round(0.0722 * 255));
  });

  test("clamps to the colour range", () => {
    const data = new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255]);
    shadeArtwork(data, 3);
    expect(data[0]).toBe(255);
    expect(data[4]).toBe(0);
  });
});
