/** module for extracting appropriate tempo from an image */
import { hslcMean } from "./extraction";
import { hslc2note, orderedNotes } from "./notes";
import { single } from "./regions";

export type TempoMethod = "manual" | "mean-key";

// TODO set based on more than the mean color, but number of colors, or texture?

export function meanKeyTempo(
  img: ImageData,
  low: number = 25,
  high: number = 450,
): number {
  const [{ colors }] = single(img);
  const [[color]] = hslcMean(colors);
  const [note, octave] = hslc2note(color);
  const noteNum = orderedNotes.indexOf(note);
  const keyNum = noteNum + octave * 12; // [0, 72)
  // place it from low to high on log-scale
  return Math.round(
    Math.exp(((Math.log(high) - Math.log(low)) / 72) * keyNum + Math.log(low)),
  );
}
