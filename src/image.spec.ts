import { expect, test } from "bun:test";
import { hsl2rgb, rgb2hsl } from "./image";

test("hsl2rgb transitivity", () => {
  const white = [255, 255, 255] as const;
  expect(hsl2rgb(rgb2hsl(white))).toEqual(white);

  const black = [0, 0, 0] as const;
  expect(hsl2rgb(rgb2hsl(black))).toEqual(black);

  const red = [250, 0, 10] as const;
  expect(hsl2rgb(rgb2hsl(red))).toEqual(red);
});
