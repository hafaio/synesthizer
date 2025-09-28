"use client";
import Image from "next/image";
import type { Chord } from "../src/worker-interface";
import ImageOverlay from "./image-overlay";

export default function ImageRendering({
  image,
  imgdata,
  song,
  playing,
}: {
  image: string | null;
  imgdata: ImageData | null;
  song: Chord[] | null;
  playing: number | null;
}): React.ReactNode {
  const svg = imgdata ? (
    <ImageOverlay imgdata={imgdata} song={song} playing={playing} />
  ) : null;
  const inner = image ? (
    <div className="h-screen md:h-full">
      <Image
        src={image}
        alt="uploaded synth image"
        fill
        className="h-full object-contain"
      />
      {svg}
    </div>
  ) : null;
  return <div className="grow self-stretch relative">{inner}</div>;
}
