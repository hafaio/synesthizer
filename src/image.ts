/** This file has utilities for turning an image into notes. */
import { Chord } from "../components/player";
import { xmeans } from "./kmeans";

export type ColorChoice = "mean" | "hsl-mean" | "mode" | "comp-mode" | "xmeans";
export type TempoMethod = "manual" | "mean-key";
type Color = readonly [number, number, number];

// TODO alternate transparent color instead of white?
function applyAlpha(c: number, alpha: number): number {
  return Math.round(((c - 255) * alpha) / 255) + 255;
}

function rgba2rgb(rgba: readonly [number, number, number, number]): Color {
  const [ri, gi, bi, a] = rgba;
  return [ri, gi, bi].map((c) => applyAlpha(c, a)) as [number, number, number];
}

export function rgb2hsl(rgb: Color): Color {
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
      : chroma / 255 / (1 - Math.abs(2 * lightness - 1));
  return [hue * 60, saturation, lightness];
}

export function hsl2rgb(hsl: Color): Color {
  const [h, s, l] = hsl;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let res;
  if (h < 60) {
    res = [c + m, x + m, m];
  } else if (h < 120) {
    res = [x + m, c + m, m];
  } else if (h < 180) {
    res = [m, c + m, x + m];
  } else if (h < 240) {
    res = [m, x + m, c + m];
  } else if (h < 300) {
    res = [x + m, m, c + m];
  } else {
    res = [c + m, m, x + m];
  }
  return res.map((v) => Math.round(v * 255)) as unknown as Color;
}

function rgb2hex(rgb: Color): string {
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

function* patch(
  img: ImageData,
  xMin: number,
  yMin: number,
  xMax: number,
  yMax: number
): IterableIterator<Color> {
  for (let j = yMin; j < yMax; ++j) {
    for (let i = xMin; i < xMax; ++i) {
      const ind = (j * img.width + i) * 4;
      // @ts-expect-error slice to array
      yield rgba2rgb(img.data.slice(ind, ind + 4));
    }
  }
}

function rgbMean(colors: Iterable<Color>): Color {
  let c = 0,
    rm = 0,
    gm = 0,
    bm = 0;
  for (const [r, g, b] of colors) {
    c += 1;
    rm += (r - rm) / c;
    gm += (g - gm) / c;
    bm += (b - bm) / c;
  }
  return [rm, gm, bm];
}

function hslMean(colors: Iterable<Color>): Color {
  let c = 0,
    hxm = 0,
    hym = 0,
    sm = 0,
    lm = 0;
  for (const color of colors) {
    c += 1;
    const [h, s, l] = rgb2hsl(color);
    const hrad = (h * Math.PI) / 180;
    const hx = Math.cos(hrad);
    const hy = Math.sin(hrad);

    // we compute the mean hue in 2d space to avoid issues around the periodic nature
    hxm += (hx - hxm) / c;
    hym += (hy - hym) / c;
    sm += (s - sm) / c;
    lm += (l - lm) / c;
  }
  const hm = (Math.atan2(hym, hxm) * 180) / Math.PI;
  return hsl2rgb([hm, sm, lm]);
}

function rgbMode(colors: Iterable<Color>): Color {
  const counts = new Map<number, number>();
  let max = 0;
  for (const [r, g, b] of colors) {
    const num = (r << 16) + (g << 8) + b;
    const count = (counts.get(num) ?? 0) + 1;
    max = Math.max(count, max);
    counts.set(num, count);
  }
  const modes = Iterator.from(counts.entries())
    .filter(([, count]) => count === max)
    .map(([num]) => [num >> 16, (num >> 8) % 256, num % 256] as Color);
  return rgbMean(modes);
}

function rgbComponentMode(colors: Iterable<Color>): Color {
  const reds = new Map<number, number>();
  let redMax = 0;
  const greens = new Map<number, number>();
  let greenMax = 0;
  const blues = new Map<number, number>();
  let blueMax = 0;
  for (const [r, g, b] of colors) {
    const redCount = (reds.get(r) ?? 0) + 1;
    redMax = Math.max(redCount, redMax);
    reds.set(r, redCount);

    const greenCount = (greens.get(g) ?? 0) + 1;
    greenMax = Math.max(greenCount, greenMax);
    greens.set(g, greenCount);

    const blueCount = (blues.get(b) ?? 0) + 1;
    blueMax = Math.max(blueCount, blueMax);
    blues.set(b, blueCount);
  }
  const inits = [
    [reds, redMax],
    [greens, greenMax],
    [blues, blueMax],
  ] as const;
  return inits.map(([counts, max]) => {
    let t = 0;
    let mean = 0;
    for (const [val, count] of counts) {
      if (count === max) {
        mean += (val - mean) / ++t;
      }
    }
    return mean;
  }) as unknown as Color;
}

function xmeansMode(colors: Iterable<Color>, num: number): [Color, number][] {
  const data = new Float64Array(num * 3);
  let i = 0;
  for (const [r, g, b] of colors) {
    data[i++] = r;
    data[i++] = g;
    data[i++] = b;
  }
  const [clusters, assigns] = xmeans(data, 3, {
    initClusters: 1,
  });
  const numClusters = clusters.length / 3;
  const counts = new Uint32Array(numClusters);
  for (const ind of assigns) {
    counts[ind] += 1;
  }
  const res: [Color, number][] = [];
  for (let i = 0; i < numClusters; ++i) {
    res.push([
      [...clusters.subarray(i * 3, i * 3 + 3)] as unknown as Color,
      counts[i],
    ]);
  }
  res.sort(([, a], [, b]) => b - a);
  return res;
}

// TODO we may want to put this in a web worker, but right now it's "okay"
export function convert(
  img: ImageData,
  bpm: number,
  duration: number,
  dynamic: "pp" | "mf" | "ff",
  mode: ColorChoice
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
      const ilim = Math.min(img.width, i + swidth);
      const jlim = Math.min(img.height, j + sheight);
      const iter = patch(img, i, j, ilim, jlim);
      const num = (ilim - i) * (jlim - j);
      let color: Color;
      if (mode === "mean") {
        color = rgbMean(iter);
      } else if (mode === "hsl-mean") {
        color = hslMean(iter);
      } else if (mode === "mode") {
        color = rgbMode(iter);
      } else if (mode === "comp-mode") {
        color = rgbComponentMode(iter);
      } else if (mode === "xmeans") {
        // FIXME we probably want this to run in constant time, so maybe we downsample first
        const allColors = xmeansMode(iter, num);
        [[color]] = allColors;
      } else {
        // FIXME add hsl-mean, do to mean hue, we should mean cos(h), sin(h) amd them do atan2
        throw new Error(`invalid color selection mode: ${mode}`);
      }

      // NOTE not currently using saturation / chroma
      const [h, , l] = rgb2hsl(color);
      const octive = Math.min(Math.floor(l * 7), 6) + 1;
      const note = orderedNotes[Math.floor(h / 30) % 12];

      chords.push({
        notes: [`${note}${octive}`],
        duration: 60000 / bpm,
        color: rgb2hex(color),
        dynamic,
        volume: 1,
        poly: [
          [i, j],
          [ilim, j],
          [ilim, jlim],
          [i, jlim],
        ],
        center: [i + (ilim - i) / 2, j + (jlim - j) / 2],
      });
    }
  }

  return chords;
}

export function meanKeyTempo(
  img: ImageData,
  low: number = 25,
  high: number = 450
): number {
  const iter = patch(img, 0, 0, img.width, img.height);
  const color = rgbMean(iter);
  const [h, , l] = rgb2hsl(color);
  const octive = Math.min(Math.floor(l * 7), 6);
  const noteNum = Math.floor(h / 30) % 12;
  const keyNum = noteNum + octive * 12; // [0, 72)
  // place it from low to high on log-scalw
  return Math.round(
    Math.exp(((Math.log(high) - Math.log(low)) / 72) * keyNum + Math.log(low))
  );
}
