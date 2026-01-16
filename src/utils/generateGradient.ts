import seedrandom from "seedrandom";
import Gradient from "javascript-color-gradient";

type Colour = [number, number, number];

const hexToRgb = (hex: string): Colour => [
  parseInt(hex.slice(0, 2), 16),
  parseInt(hex.slice(2, 4), 16),
  parseInt(hex.slice(4, 6), 16),
];
const rgbToHex = (rgb: Colour) =>
  rgb
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const colourLerp = (c1: Colour, c2: Colour, t: number): Colour => [
  Math.round(lerp(c1[0], c2[0], t)),
  Math.round(lerp(c1[1], c2[1], t)),
  Math.round(lerp(c1[2], c2[2], t)),
];

function createRandomColour(seedAddition?: string) {
  const hexVal = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];

  const d = new Date();
  let dailySeed = d.toDateString() + seedAddition;
  let num = "";

  for (let i = 0; i < 6; i++) {
    dailySeed += i;
    let numberByDay = seedrandom(dailySeed);
    let randNum = Math.floor(numberByDay() * hexVal.length);
    num += hexVal[randNum];
  }
  return num;
}

function generateGradient(seedAddition?: string) {
  const d = new Date();
  let dailySeed = d.toDateString() + seedAddition;
  const rand = seedrandom(dailySeed);

  const hex = () =>
    Array.from({ length: 6 }, () => Math.floor(rand() * 16).toString(16))
      .join("")
      .toUpperCase();

  return new Gradient().setColorGradient(`#${hex()}`, `#${hex()}`).getColors();
}

function generateGrid() {
  const grid: string[] = [];
  const d = new Date();
  let dailySeed = d.toDateString();
  const rand = seedrandom(dailySeed);

  const hex = () =>
    Array.from({ length: 6 }, () => Math.floor(rand() * 16).toString(16))
      .join("")
      .toUpperCase();

  const tl = hexToRgb(hex());
  const tr = hexToRgb(hex());
  const bl = hexToRgb(hex());
  const br = hexToRgb(hex());

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const x = col / 3;
      const y = row / 3;

      const top = colourLerp(tl, tr, x);
      const bottom = colourLerp(bl, br, x);
      const final = colourLerp(top, bottom, y);
      grid.push(rgbToHex(final));
    }
  }
  return grid;
}

export { createRandomColour, generateGradient, generateGrid };
