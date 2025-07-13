"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Chord } from "./player";

export default function Controls({
  song,
  image,
  setImage,
  bpm,
  setBpm,
  duration,
  setDuration,
  dynamic,
  setDynamic,
  playing,
  setPlaying,
}: {
  song: Chord[] | null;
  image: string | null;
  setImage: (img: string) => void;
  bpm: number;
  setBpm: (bpm: number) => void;
  duration: number;
  setDuration: (dur: number) => void;
  dynamic: "pp" | "mf" | "ff";
  setDynamic: (dyn: "pp" | "mf" | "ff") => void;
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
        {/* FIXME pull out as component */}
        <label className="block font-bold" htmlFor="bpm">
          BPM
        </label>
        <input
          type="number"
          id="bpm"
          min="40"
          max="400"
          value={bpm}
          onChange={(evt) => {
            const parsed = parseInt(evt.target.value);
            if (!isNaN(parsed)) {
              setBpm(parsed);
            }
          }}
          className="p-1 outline-violet-800 bg-gray-50 border border-gray-300 rounded w-full"
        />
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
          Dynamics
        </label>
        <select
          id="dynamics"
          className="bg-gray-50 outline-violet-800 border border-gray-300 rounded block w-full p-1"
          value={dynamic}
          onChange={(evt) => setDynamic(evt.target.value as "pp" | "mf" | "ff")}
        >
          <option value="pp">pp</option>
          <option value="mf">mf</option>
          <option value="ff">ff</option>
        </select>
      </div>
      <div className="h-16" />
      {button}
    </div>
  );
}
