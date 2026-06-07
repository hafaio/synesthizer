"use client";
import type { ColorChoice } from "../src/extraction";
import type { NoteConversion } from "../src/notes";
import type { RefineMethod } from "../src/refine";
import type { RegionMethod } from "../src/regions";
import type { TempoMethod } from "../src/tempo";
import type { Chord } from "../src/worker-interface";
import NumericSelector from "./numeric-selector";
import TypedSelector from "./typed-selector";

export default function Controls({
  song,
  hasImage,
  onUpload,
  tempoMethod,
  setTempoMethod,
  bpm,
  setBpm,
  duration,
  setDuration,
  region,
  setRegion,
  colorChoice,
  setColorChoice,
  minStd,
  setMinStd,
  noteMethod,
  setNoteMethod,
  refineMethod,
  setRefineMethod,
  minWeight,
  setMinWeight,
  maxNotes,
  setMaxNotes,
  playing,
  setPlaying,
  processing,
  error,
}: {
  song: Chord[] | null;
  hasImage: boolean;
  onUpload: () => void;
  tempoMethod: TempoMethod;
  setTempoMethod: (method: TempoMethod) => void;
  bpm: number | null;
  setBpm: (bpm: number | null) => void;
  duration: number | null;
  setDuration: (dur: number | null) => void;
  region: RegionMethod;
  setRegion: (region: RegionMethod) => void;
  colorChoice: ColorChoice;
  setColorChoice: (choice: ColorChoice) => void;
  minStd: number | null;
  setMinStd: (std: number | null) => void;
  noteMethod: NoteConversion;
  setNoteMethod: (method: NoteConversion) => void;
  refineMethod: RefineMethod;
  setRefineMethod: (method: RefineMethod) => void;
  minWeight: number | null;
  setMinWeight: (weight: number | null) => void;
  maxNotes: number | null;
  setMaxNotes: (notes: number | null) => void;
  playing: number | null;
  setPlaying: (state: number | null) => void;
  processing: boolean;
  error: string | null;
}): React.ReactNode {
  const button = processing ? (
    <button
      type="button"
      disabled
      className="w-full animate-pulse cursor-not-allowed rounded bg-gray-400 p-2 font-bold text-gray-200"
    >
      Processing…
    </button>
  ) : playing === null ? (
    <button
      type="button"
      disabled={song === null}
      onClick={() => setPlaying(0)}
      className="w-full rounded bg-gradient-to-r from-rose-500 from-10% via-emerald-500 via-50% to-indigo-500 to-90% p-2 font-bold text-white hover:from-rose-600 hover:via-emerald-600 hover:to-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:bg-none disabled:text-gray-200 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
    >
      Play
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setPlaying(null)}
      className="w-full rounded bg-red-500 p-2 font-bold text-white hover:bg-red-600"
    >
      Stop
    </button>
  );
  const err = error ? (
    <div
      className="w-full rounded border border-red-400 bg-red-100 p-2 text-red-700 dark:border-red-500/50 dark:bg-red-950/50 dark:text-red-300"
      role="alert"
    >
      {error}
    </div>
  ) : null;

  return (
    <div className="order-2 flex shrink-0 flex-col gap-y-2 md:order-1 md:w-sm">
      {hasImage ? (
        <button
          type="button"
          onClick={onUpload}
          className="w-full rounded bg-gradient-to-r from-rose-500 from-10% via-emerald-500 via-50% to-indigo-500 to-90% p-2 font-bold text-white hover:from-rose-600 hover:via-emerald-600 hover:to-indigo-600"
        >
          Replace image
        </button>
      ) : null}
      <NumericSelector
        title="Duration (seconds)"
        min="1"
        value={duration}
        set={setDuration}
      />
      <TypedSelector
        title="Tempo Method"
        value={tempoMethod}
        set={setTempoMethod}
        values={[
          ["manual", "Manual"],
          ["mean-key", "Mean Key"],
        ]}
      />
      <NumericSelector
        title="Tempo (bpm)"
        min="25"
        max="500"
        disabled={tempoMethod !== "manual"}
        value={bpm}
        set={setBpm}
      />
      <TypedSelector
        title="Color Selection"
        value={colorChoice}
        set={setColorChoice}
        values={[
          ["mean", "Mean"],
          ["xmeans", "X-Means"],
          ["proportional", "Proportional"],
        ]}
      />
      <NumericSelector
        title="X-Means Min Deviation"
        min="0"
        max="1"
        step="0.01"
        value={minStd}
        set={setMinStd}
      />
      <NumericSelector
        title="Minimum Note Proportion"
        min="0"
        max="1"
        step="0.05"
        value={minWeight}
        set={setMinWeight}
      />
      <NumericSelector
        title="Maximum Simultaneous Notes"
        min="1"
        max="12"
        value={maxNotes}
        set={setMaxNotes}
      />
      <TypedSelector
        title="Region Selection"
        value={region}
        set={setRegion}
        values={[["grid", "Grid"]]}
      />
      <TypedSelector
        title="Note Conversion"
        value={noteMethod}
        set={setNoteMethod}
        values={[["hslc", "HSL Cone"]]}
      />
      <TypedSelector
        title="Refine Method"
        value={refineMethod}
        set={setRefineMethod}
        values={[["trim", "Trim"]]}
      />
      {err}
      <div className="grow" />
      {button}
    </div>
  );
}
