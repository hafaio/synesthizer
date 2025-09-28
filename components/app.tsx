"use client";
import { addBasePath } from "next/dist/client/add-base-path";
import Image from "next/image";
import { useEffect, useState } from "react";
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

  return (
    <div className="flex flex-col items-center gap-y-2 md:h-full">
      <header className="bg-slate-100 w-full p-2 flex gap-x-2">
        <Image
          src={addBasePath("/favicon.ico")}
          alt=""
          width="32"
          height="32"
        />
        <h1 className="font-bold text-3xl">Synesthizer</h1>
      </header>
      <div className="flex flex-col md:flex-row gap-x-2 gap-y-2 w-full px-2 pb-2 grow">
        <Controls
          song={song}
          image={image}
          setImage={setImage}
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
        />
      </div>
      <Player song={song} playing={playing} setPlaying={setPlaying} />
    </div>
  );
}
