/** get image data from a url */
export async function getImageData(url: string): Promise<ImageData> {
  const resp = await fetch(url);
  const blob = await resp.blob();
  const bmp = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bmp.width, bmp.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0);
  return ctx.getImageData(0, 0, bmp.width, bmp.height, {
    colorSpace: "srgb",
    // pixedFormat: "rgba-unorm8", enforce clampeduint8array
  });
}

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export class ArrayMean<V extends readonly number[] = readonly number[]> {
  #count = 0;
  #mean: Writeable<V> | null = null;

  push(arr: Readonly<V>): this {
    this.#count++;
    if (this.#mean === null) {
      this.#mean = [...arr] as Writeable<V>;
    } else if (this.#mean.length !== arr.length) {
      throw new Error(
        `mismatched lengths for mean: ${this.#mean.length} vs ${arr.length}`,
      );
    } else {
      for (let i = 0; i < arr.length; ++i) {
        this.#mean[i] += (arr[i] - this.#mean[i]) / this.#count;
      }
    }
    return this;
  }

  get mean(): V {
    if (this.#mean === null) {
      throw new Error("no values have been added yet");
    } else {
      return [...this.#mean] as unknown as V;
    }
  }
}

export class ArrayVariance<V extends readonly number[] = readonly number[]> {
  #count = 0;
  #mean: number[] | null = null;
  #sumSq: number[] | null = null; // running sum of squared deviations per dim

  push(arr: Readonly<V>): this {
    this.#count++;
    if (this.#mean === null || this.#sumSq === null) {
      this.#mean = [...arr];
      this.#sumSq = arr.map(() => 0);
    } else if (this.#mean.length !== arr.length) {
      throw new Error(
        `mismatched lengths for variance: ${this.#mean.length} vs ${arr.length}`,
      );
    } else {
      for (let i = 0; i < arr.length; ++i) {
        const delta = arr[i] - this.#mean[i];
        this.#mean[i] += delta / this.#count;
        this.#sumSq[i] += delta * (arr[i] - this.#mean[i]);
      }
    }
    return this;
  }

  /** population variance summed across every component, or null if empty */
  get total(): number | null {
    if (this.#sumSq === null || this.#count === 0) {
      return null;
    } else {
      let total = 0;
      for (const sumSq of this.#sumSq) {
        total += sumSq / this.#count;
      }
      return total;
    }
  }
}

export class MaxBy<V> {
  #best: { weight: number; val: V } | null = null;

  push(val: V, weight: number): this {
    if (this.#best === null) {
      this.#best = { weight, val };
    } else if (this.#best.weight < weight) {
      this.#best = { weight, val };
    }
    return this;
  }

  get max(): V {
    if (this.#best === null) {
      throw new Error("no values have been added yet");
    } else {
      return this.#best.val;
    }
  }
}
