/** extract ordered regions from an image to turn into notes */

import type { RGB } from "./colors";

export type RegionMethod = "grid";

export interface Region {
  colors: Iterable<RGB>;
  num: number;
  poly: [number, number][];
  center: [number, number];
}

// TODO custom ordering
// TODO voronoi regions
// TODO regions based off of segment anything

// TODO alternate transparent color instead of white?
function applyAlpha(c: number, alpha: number): number {
  return Math.round(((c - 255) * alpha) / 255) + 255;
}

function rgba2rgb(rgba: readonly [number, number, number, number]): RGB {
  const [ri, gi, bi, a] = rgba;
  return [ri, gi, bi].map((c) => applyAlpha(c, a)) as [number, number, number];
}

function* patch(
  img: ImageData,
  xMin: number,
  yMin: number,
  xMax: number,
  yMax: number,
): Generator<RGB> {
  for (let j = yMin; j < yMax; ++j) {
    for (let i = xMin; i < xMax; ++i) {
      const ind = (j * img.width + i) * 4;
      // @ts-expect-error slice to array
      yield rgba2rgb(img.data.slice(ind, ind + 4));
    }
  }
}

/** a single region */
export function* single(img: ImageData): Generator<Region> {
  const colors = patch(img, 0, 0, img.width, img.height);
  const num = img.width * img.height;
  const poly: [number, number][] = [
    [0, 0],
    [img.width, 0],
    [img.width, img.height],
    [0, img.height],
  ];
  const center: [number, number] = [img.width / 2, img.height / 2];
  yield { colors, num, poly, center };
}

/** an ordered set of apprximately square patches */
export function* orderedGrid(img: ImageData, notes: number): Generator<Region> {
  const scale = Math.sqrt(notes / (img.width * img.height));
  const nwidth = Math.round(img.width * scale);
  const swidth = Math.ceil(img.width / nwidth);
  const nheight = Math.round(img.height * scale);
  const sheight = Math.ceil(img.height / nheight);

  const winit = Math.floor((img.width - swidth * nwidth) / 2);
  const hinit = Math.floor((img.height - sheight * nheight) / 2);

  for (let j = hinit; j < img.height; j += sheight) {
    for (let i = winit; i < img.width; i += swidth) {
      const imin = Math.max(0, i);
      const jmin = Math.max(0, j);
      const imax = Math.min(img.width, i + swidth);
      const jmax = Math.min(img.height, j + sheight);

      const colors = patch(img, imin, jmin, imax, jmax);
      const num = (imax - imin) * (jmax - jmin);
      const poly: [number, number][] = [
        [imin, jmin],
        [imax, jmin],
        [imax, jmax],
        [imin, jmax],
      ];
      const center: [number, number] = [
        imin + (imax - imin) / 2,
        jmin + (jmax - jmin) / 2,
      ];

      yield { colors, num, poly, center };
    }
  }
}

export function regions(
  img: ImageData,
  method: RegionMethod,
  noted: number,
): Generator<Region> {
  if (method === "grid") {
    return orderedGrid(img, noted);
  } else {
    throw new Error(`unknown region method ${method}`);
  }
}
