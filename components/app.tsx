"use client";
import ImageRender from "./image-render";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getImageData } from "../src/utils";
import Player, { type Chord, type Dynamic } from "./player";
import {
  convert,
  meanKeyTempo,
  type ColorChoice,
  type TempoMethod,
} from "../src/image";
import Controls from "./controls";
import { addBasePath } from "next/dist/client/add-base-path";

export default function App(): React.ReactElement {
  const [tempoMethod, setTempoMethod] = useState<TempoMethod>("manual");
  const [bpm, setBpm] = useState<number>(80);
  const [duration, setDuration] = useState<number>(30); // how long should this range be?
  const [dynamic, setDynamic] = useState<Dynamic>("mf");
  const [colorChoice, setColorChoice] = useState<ColorChoice>("mean");
  const [image, setImage] = useState<string | null>(null);
  const [imgdata, setImgdata] = useState<ImageData | null>(null);
  // TODO we maybe want some aspect of the original color to be preset
  const [song, setSong] = useState<Chord[] | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);

  useEffect(() => {
    if (imgdata && tempoMethod === "mean-key") {
      // TODO make bpm undefined while calculating
      setBpm(meanKeyTempo(imgdata));
    }
  }, [imgdata, tempoMethod]);

  useEffect(() => {
    setPlaying(null);
    setImgdata(null);
    if (image) {
      (async () => {
        const data = await getImageData(image);
        setImgdata(data);
        const song = convert(data, bpm, duration, dynamic, colorChoice);
        setSong(song);
        // TODO better error handling
      })().catch((err) => console.error(err));
    }
  }, [image, bpm, duration, dynamic, colorChoice]);

  return (
    <div className="flex flex-col items-center gap-y-2 h-full">
      <header className="bg-slate-100 w-full p-2 flex gap-x-2">
        <Image
          src={addBasePath("/favicon.ico")}
          alt=""
          width="32"
          height="32"
        />
        <h1 className="font-bold text-3xl">Synesthizer</h1>
      </header>
      <div className="flex gap-x-2 w-full px-2 pb-2 grow">
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
          dynamic={dynamic}
          setDynamic={setDynamic}
          colorChoice={colorChoice}
          setColorChoice={setColorChoice}
          playing={playing}
          setPlaying={setPlaying}
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
