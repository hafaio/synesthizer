"use client";
import Image from "next/image";
import { Chord } from "./player";

export default function ImageRendering({
  image,
  imgdata,
}: {
  image: string | null;
  imgdata: ImageData | null;
  song: Chord[] | null;
  playing: number | null;
}): React.ReactNode {
  const svg = imgdata ? <svg className="absolute w-full h-full" /> : null;
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
