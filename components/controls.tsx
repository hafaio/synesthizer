"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { type Chord, type Dynamic } from "./player";
import { type ColorChoice, type TempoMethod } from "../src/image";

export default function Controls({
  song,
  image,
  setImage,
  tempoMethod,
  setTempoMethod,
  bpm,
  setBpm,
  duration,
  setDuration,
  dynamic,
  setDynamic,
  colorChoice,
  setColorChoice,
  playing,
  setPlaying,
}: {
  song: Chord[] | null;
  image: string | null;
  setImage: (img: string) => void;
  tempoMethod: TempoMethod;
  setTempoMethod: (method: TempoMethod) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  duration: number;
  setDuration: (dur: number) => void;
  dynamic: Dynamic;
  setDynamic: (dyn: Dynamic) => void;
  colorChoice: ColorChoice;
  setColorChoice: (choice: ColorChoice) => void;
  playing: number | null;
  setPlaying: (state: number | null) => void;
}): React.ReactNode {
  const onDrop = useCallback(
    ([file]: File[]) => {
      setImage(URL.createObjectURL(file));
      if (image) {
        URL.revokeObjectURL(image);
      }
    },
    [image, setImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: false,
  });
  const text = isDragActive ? "Drop here to Upload" : "Upload";

  const button =
    playing === null ? (
      <button
        disabled={song === null}
        onClick={() => setPlaying(0)}
        className="w-full p-2 text-white rounded bg-gradient-to-r from-rose-500 from-10% via-emerald-500 via-50% to-indigo-500 to-90% hover:from-rose-600 hover:via-emerald-600 hover:to-indigo-600 disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed font-bold"
      >
        Play
      </button>
    ) : (
      <button
        onClick={() => setPlaying(null)}
        className="w-full p-2 bg-red-500 hover:bg-red-600 text-white rounded font-bold"
      >
        Stop
      </button>
    );

  return (
    <div className="flex flex-col gap-y-2 w-sm">
      <div {...getRootProps()} className="w-full">
        <input {...getInputProps()} />
        <button className="p-2 text-white w-full rounded bg-gradient-to-r from-rose-500 from-10% via-emerald-500 via-50% to-indigo-500 to-90% hover:from-rose-600 hover:via-emerald-600 hover:to-indigo-600 font-bold">
          {text}
        </button>
      </div>
      <div>
        <label className="block font-bold" htmlFor="duration">
          Duration (seconds)
        </label>
        <input
          type="number"
          id="duration"
          min="1"
          value={duration}
          onChange={(evt) => {
            const parsed = parseInt(evt.target.value);
            if (!isNaN(parsed)) {
              setDuration(parsed);
            }
          }}
          className="p-1 outline-violet-800 bg-gray-50 border border-gray-300 rounded w-full"
        />
      </div>
      <div>
        <label className="block font-bold" htmlFor="duration">
          Tempo Method
        </label>
        <select
          id="tempo-method"
          className="bg-gray-50 outline-violet-800 border border-gray-300 rounded block w-full p-1"
          value={tempoMethod}
          onChange={(evt) => setTempoMethod(evt.target.value as TempoMethod)}
        >
          <option value="manual">Manual</option>
          <option value="mean-key">Mean Key</option>
        </select>
      </div>
      <div>
        <label className="block font-bold" htmlFor="bpm">
          Tempo (bpm)
        </label>
        <input
          type="number"
          id="bpm"
          min="25"
          max="500"
          disabled={tempoMethod !== "manual"}
          value={bpm}
          onChange={(evt) => {
            const parsed = parseInt(evt.target.value);
            if (!isNaN(parsed)) {
              setBpm(parsed);
            }
          }}
          className="p-1 outline-violet-800 bg-gray-50 border border-gray-300 rounded w-full disabled:text-gray-400"
        />
      </div>
      <div>
        <label className="block font-bold" htmlFor="duration">
          Dynamics
        </label>
        <select
          id="dynamics"
          className="bg-gray-50 outline-violet-800 border border-gray-300 rounded block w-full p-1"
          value={dynamic}
          onChange={(evt) => setDynamic(evt.target.value as Dynamic)}
        >
          <option value="pp">pp</option>
          <option value="mf">mf</option>
          <option value="ff">ff</option>
        </select>
      </div>
      <div>
        <label className="block font-bold" htmlFor="duration">
          Color Selection
        </label>
        <select
          id="color-selection"
          className="bg-gray-50 outline-violet-800 border border-gray-300 rounded block w-full p-1"
          value={colorChoice}
          onChange={(evt) => setColorChoice(evt.target.value as ColorChoice)}
        >
          <option value="mean">Mean (rgb)</option>
          <option value="hsl-mean">Mean (hsl)</option>
          <option value="mode">Mode</option>
          <option value="comp-mode">Component Mode</option>
          <option value="xmeans">X-Means</option>
        </select>
      </div>
      <div className="grow" />
      {button}
    </div>
  );
}
