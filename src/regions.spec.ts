import { expect, test } from "bun:test";
import { orderedGrid } from "./regions";

function blank(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  return { width, height, data, colorSpace: "srgb" } as unknown as ImageData;
}

test("orderedGrid yields non-empty patches at an extreme aspect ratio", () => {
  // a tall sliver with few notes previously rounded nwidth to 0 (Infinity/NaN)
  const regions = [...orderedGrid(blank(4, 400), 10)];
  expect(regions.length).toBeGreaterThan(0);
  for (const { num } of regions) {
    expect(num).toBeGreaterThan(0);
  }
});

test("orderedGrid yields at most one region per pixel for tiny images", () => {
  // more notes than pixels previously produced empty patches
  const regions = [...orderedGrid(blank(2, 2), 40)];
  expect(regions.length).toBe(4);
  for (const { num } of regions) {
    expect(num).toBe(1);
  }
});
