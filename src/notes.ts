import { type RGB, rgb2hsl } from "./colors";

export type NoteConversion = "hslc";

/** convert a string with sharps in it to flats */
export function sharp2flat(sharp: string): string {
  return sharp.replaceAll(/[ACDFG]#/gi, (mat) =>
    String.fromCharCode(mat.charCodeAt(0) + 1, 98),
  );
}

/** convert a string with flats in it to sharps */
export function flat2sharp(flat: string): string {
  return flat.replaceAll(/[ABDEG]b/gi, (mat) =>
    String.fromCharCode(mat.charCodeAt(0) - 1, 35),
  );
}

export const orderedNotes = [
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
type Note = (typeof orderedNotes)[number];

export function hslc2note(color: RGB): [Note, number] {
  const [h, , l] = rgb2hsl(color);
  const octave = Math.min(Math.floor(l * 7), 6) + 1;
  const note = orderedNotes[Math.floor(h / 30) % 12];
  return [note, octave];
}

export function color2note(color: RGB, method: NoteConversion): [Note, number] {
  if (method === "hslc") {
    return hslc2note(color);
  } else {
    throw new Error(`unknown note conversion method ${method}`);
  }
}
