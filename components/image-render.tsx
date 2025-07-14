"use client";
import Image from "next/image";
import { type Chord } from "./player";
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
    <>
      <Image
        src={image}
        alt="uploaded synth image"
        fill
        className="h-full object-contain"
      />
      {svg}
    </>
  ) : null;
  return <div className="grow self-stretch relative">{inner}</div>;
}
