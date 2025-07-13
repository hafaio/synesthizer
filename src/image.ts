/** This file has utilities for turning an image into notes. */
import { Chord } from "../components/player";

// TODO alternate transparent color instead of white?
function applyAlpha(c: number, alpha: number): number {
  return Math.round(((c - 255) * alpha) / 255) + 255;
}

function rgba2rgb(
  rgba: readonly [number, number, number, number]
): [number, number, number] {
  const [ri, gi, bi, a] = rgba;
  return [ri, gi, bi].map((c) => applyAlpha(c, a)) as [number, number, number];
}

function rgb2hsl(
  rgb: readonly [number, number, number]
): [number, number, number] {
  const maxval = Math.max(...rgb);
  const minval = Math.min(...rgb);
  const chroma = maxval - minval;
  const [r, g, b] = rgb;
  const hue =
    chroma === 0
      ? 0
      : maxval === r
      ? ((g - b) / chroma + 6) % 6
      : maxval === g
      ? (b - r) / chroma + 2
      : (r - g) / chroma + 4;
  const lightness = (minval + chroma / 2) / 255;
  const saturation =
    lightness === 0 || lightness === 1
      ? 0
      : chroma / (1 - Math.abs(2 * lightness - 1));
  return [hue * 60, saturation, lightness];
}

function rgb2hex(rgb: readonly [number, number, number]): string {
  const base = rgb
    .map((n) => Math.round(n).toString(16).padStart(2, "0"))
    .join("");
  return `#${base}`;
}

const orderedNotes = [
  "C",
  "D",
  "Db",
  "E",
  "Eb",
  "F",
  "G",
  "Gb",
  "A",
  "Ab",
  "B",
  "Bb",
] as const;

const colorIndex = [
  [0, 0, 0],
  [112, 54, 157],
  [92, 54, 157],
  [75, 60, 164],
  [73, 99, 204],
  [81, 138, 193],
  [108, 176, 78],
  [156, 206, 29],
  [227, 228, 48],
  [252, 210, 34],
  [255, 171, 5],
  [245, 99, 10],
  [232, 20, 22],
];

const noteIndex: string[][] = [[], ...orderedNotes.map((n) => [`${n}4`])];

// 40 - purple
// 56 - red

// FIXME delete eventually
export function naive(img: ImageData): Chord[] {
  const notes: Chord[] = [];

  let lr = -1,
    lg = -1,
    lb = -1,
    li = -1;
  for (let i = 0; i < img.data.length; i += 4) {
    // @ts-expect-error treating slice as array
    const [r, g, b] = rgba2rgb(img.data.slice(i, i + 4));
    if (r === lr && g === lg && b === lb) continue;
    lr = r;
    lg = g;
    lb = b;

    let best_i = 0;
    let best_cost = Infinity;
    for (const [i, [ri, gi, bi]] of colorIndex.entries()) {
      const cost =
        (r - ri) * (r - ri) + (g - gi) * (g - gi) + (b - bi) * (b - bi);
      if (cost < best_cost) {
        best_cost = cost;
        best_i = i;
      }
    }

    // current extraction is bad, so we make sure the note changes each time,
    // specially since we can't pick duration
    if (best_i === li) continue;
    li = best_i;

    notes.push({
      // zero is black for rest, not sure how to handle
      notes: noteIndex[best_i],
      duration: 1000,
      volume: 1,
      dynamic: "mf",
      color: rgb2hex([r, g, b]),
    });
    if (notes.length >= 10) break;
  }
  return notes;
}

export function gridsl(
  img: ImageData,
  bpm: number,
  duration: number,
  dynamic: "pp" | "mf" | "ff"
): Chord[] {
  const approxBeats = (bpm * duration) / 60;
  const scale = Math.sqrt(approxBeats / (img.width * img.height));
  const nwidth = Math.round(img.width * scale);
  const swidth = Math.ceil(img.width / nwidth);
  const nheight = Math.round(img.height * scale);
  const sheight = Math.ceil(img.height / nheight);

  // FIXME custom order
  const chords: Chord[] = [];
  for (let j = 0; j < img.height; j += sheight) {
    for (let i = 0; i < img.width; i += swidth) {
      // FIXME maybe clustering or something instead of mean? Or maybe even mode,
      // maybe mode in hsl space?
      let c = 0,
        rm = 0,
        gm = 0,
        bm = 0;
      const ilim = Math.min(img.width, i + swidth);
      const jlim = Math.min(img.height, j + sheight);
      for (let jj = j; jj < jlim; ++jj) {
        for (let ii = i; ii < ilim; ++ii) {
          ++c;
          const ind = (jj * img.width + ii) * 4;
          // @ts-expect-error slice to array
          const [r, g, b] = rgba2rgb(img.data.slice(ind, ind + 4));
          rm += (r - rm) / c;
          gm += (g - gm) / c;
          bm += (b - bm) / c;
        }
      }

      // NOTE not currently using saturation / chroma
      const [h, , l] = rgb2hsl([rm, gm, bm]);
      const octive = Math.min(Math.floor(l * 7), 6) + 1;
      const note = orderedNotes[Math.floor(h / 30) % 12];

      chords.push({
        notes: [`${note}${octive}`],
        duration: 60000 / bpm,
        color: rgb2hex([rm, gm, bm]),
        dynamic,
        volume: 1,
      });
    }
  }

  return chords;
}
