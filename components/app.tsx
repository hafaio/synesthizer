"use client";
import ImageRender from "./image_render";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getImageData } from "../src/utils";
import Player, { type Chord } from "./player";
import { gridsl } from "../src/image";
import Controls from "./controls";

export default function App(): React.ReactElement {
  const [bpm, setBpm] = useState<number>(80); // 40 - 200
  const [duration, setDuration] = useState<number>(30); // how long should this range be?
  const [dynamic, setDynamic] = useState<"pp" | "mf" | "ff">("mf");
  const [image, setImage] = useState<string | null>(null);
  const [imgdata, setImgdata] = useState<ImageData | null>(null);
  // TODO we maybe want some aspect of the original color to be preset
  const [song, setSong] = useState<Chord[] | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);

  useEffect(() => {
    setPlaying(null);
    setImgdata(null);
    if (image) {
      (async () => {
        const data = await getImageData(image);
        setImgdata(data);
        // const song = naive(data);
        const song = gridsl(data, bpm, duration, dynamic);
        setSong(song);
        // TODO better error handling
      })().catch((err) => console.error(err));
    }
  }, [image, bpm, duration, dynamic]);

  return (
    <div className="flex flex-col items-center gap-y-2">
      <header className="bg-slate-100 w-full p-2 flex gap-x-2">
        <Image src="/favicon.ico" alt="" width="32" height="32" />
        <h1 className="font-bold text-3xl">Synesthizer</h1>
      </header>
      <div className="flex gap-x-2 w-full px-2">
        <Controls
          song={song}
          image={image}
          setImage={setImage}
          bpm={bpm}
          setBpm={setBpm}
          duration={duration}
          setDuration={setDuration}
          dynamic={dynamic}
          setDynamic={setDynamic}
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
