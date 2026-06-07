"use client";
import { addBasePath } from "next/dist/client/add-base-path";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { ColorChoice } from "../src/extraction";
import { convert } from "../src/image";
import type { NoteConversion } from "../src/notes";
import type { RefineMethod } from "../src/refine";
import type { RegionMethod } from "../src/regions";
import { meanKeyTempo, type TempoMethod } from "../src/tempo";
import { getImageData } from "../src/utils";
import type { Chord } from "../src/worker-interface";
import Controls from "./controls";
import ImageRender from "./image-render";
import Player from "./player";

export default function App(): React.ReactElement {
  const [tempoMethod, setTempoMethod] = useState<TempoMethod>("mean-key");
  const [bpm, setBpm] = useState<number | null>(80);
  const [duration, setDuration] = useState<number | null>(30); // how long should this range be?
  const [region, setRegion] = useState<RegionMethod>("grid");
  const [colorChoice, setColorChoice] = useState<ColorChoice>("proportional");
  const [minStd, setMinStd] = useState<number | null>(0.04);
  const [noteMethod, setNoteMethod] = useState<NoteConversion>("hslc");
  const [refineMethod, setRefineMethod] = useState<RefineMethod>("trim");
  const [minWeight, setMinWeight] = useState<number | null>(0.05);
  const [maxNotes, setMaxNotes] = useState<number | null>(4);
  const [image, setImage] = useState<string | null>(null);
  const [imgdata, setImgdata] = useState<ImageData | null>(null);
  const [song, setSong] = useState<Chord[] | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);

  // a dropped/selected file becomes the new working image, releasing the old url
  const onDrop = useCallback(([file]: File[]) => {
    if (!file) return;
    setImage((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  // if we upload a new image, parse it into data
  useEffect(() => {
    setPlaying(null);
    setImgdata(null);
    setExtracting(true);
    if (image) {
      let cancelled = false;
      getImageData(image).then(
        (imgdata) => {
          if (!cancelled) {
            setImgdata(imgdata);
          }
        },
        (err) => {
          console.error(err);
          if (!cancelled) {
            setError(`${err}`);
          }
        },
      );
      return () => {
        cancelled = true;
      };
    }
  }, [image]);

  // if tempo method is set, look at the image to extract tempo
  useEffect(() => {
    setPlaying(null);
    if (imgdata && tempoMethod === "mean-key") {
      setSong(null); // clear song while we extract new tempo
      setBpm(null);
      setBpm(meanKeyTempo(imgdata));
      setExtracting(false);
    }
  }, [imgdata, tempoMethod]);

  // based on configs, convert image to song
  useEffect(() => {
    setPlaying(null);
    setSong(null);
    if (
      imgdata &&
      bpm !== null &&
      duration !== null &&
      minWeight !== null &&
      maxNotes !== null &&
      minStd !== null &&
      (tempoMethod === "manual" || !extracting)
    ) {
      let cancelled = false;
      setProcessing(true);
      // wait half a second before computing in case there are more changes
      setTimeout(() => {
        if (!cancelled) {
          convert(imgdata, {
            bpm,
            duration,
            region,
            colorChoice,
            minStd,
            noteMethod,
            refineMethod,
            minWeight,
            maxNotes,
          }).then(
            (song) => {
              if (!cancelled) {
                setSong(song);
                setProcessing(false);
                setError(null);
              }
            },
            (err) => {
              console.error(err);
              if (!cancelled) {
                setProcessing(false);
                setError(`${err}`);
              }
            },
          );
        }
      }, 500);
      return () => {
        cancelled = true;
      };
    }
  }, [
    imgdata,
    bpm,
    duration,
    region,
    colorChoice,
    refineMethod,
    minWeight,
    maxNotes,
    noteMethod,
    tempoMethod,
    extracting,
    minStd,
  ]);

  const progress =
    song && song.length > 0 && playing !== null
      ? ((playing + 1) / song.length) * 100
      : 0;

  return (
    <div className="flex flex-col items-center md:h-full">
      <header className="sticky top-0 z-20 w-full border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
        <div className="flex items-center gap-3 px-4 py-3">
          <Image
            src={addBasePath("/favicon.ico")}
            alt=""
            width={32}
            height={32}
            className="rounded"
          />
          <div className="leading-tight">
            <h1 className="bg-gradient-to-r from-rose-500 via-emerald-500 to-indigo-500 bg-clip-text text-2xl font-bold text-transparent">
              Synesthizer
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Turn images into piano compositions
            </p>
          </div>
        </div>
      </header>
      <div
        {...getRootProps()}
        className="relative flex w-full grow flex-col gap-2 p-2 md:flex-row"
      >
        <input {...getInputProps()} />
        <Controls
          song={song}
          hasImage={image !== null}
          onUpload={open}
          tempoMethod={tempoMethod}
          setTempoMethod={setTempoMethod}
          bpm={bpm}
          setBpm={setBpm}
          duration={duration}
          setDuration={setDuration}
          region={region}
          setRegion={setRegion}
          colorChoice={colorChoice}
          setColorChoice={setColorChoice}
          minStd={minStd}
          setMinStd={setMinStd}
          noteMethod={noteMethod}
          setNoteMethod={setNoteMethod}
          refineMethod={refineMethod}
          setRefineMethod={setRefineMethod}
          minWeight={minWeight}
          setMinWeight={setMinWeight}
          maxNotes={maxNotes}
          setMaxNotes={setMaxNotes}
          playing={playing}
          setPlaying={setPlaying}
          processing={processing}
          error={error}
        />
        <ImageRender
          image={image}
          song={song}
          playing={playing}
          imgdata={imgdata}
          onUpload={open}
        />
        {isDragActive ? (
          <div className="pointer-events-none absolute inset-2 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-indigo-500 bg-indigo-500/10 backdrop-blur-sm">
            <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              Drop image to upload
            </p>
          </div>
        ) : null}
      </div>
      {song ? (
        <div
          className="h-1 w-full bg-gray-200 dark:bg-gray-800"
          role="progressbar"
          aria-label="playback progress"
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-emerald-500 to-indigo-500 transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
      <Player song={song} playing={playing} setPlaying={setPlaying} />
    </div>
  );
}
