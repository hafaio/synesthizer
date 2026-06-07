"use client";
import { CloudUpload } from "lucide-react";
import Image from "next/image";
import type { Chord } from "../src/worker-interface";
import ImageOverlay from "./image-overlay";

export default function ImageRendering({
  image,
  imgdata,
  song,
  playing,
  onUpload,
}: {
  image: string | null;
  imgdata: ImageData | null;
  song: Chord[] | null;
  playing: number | null;
  onUpload: () => void;
}): React.ReactNode {
  const svg = imgdata ? (
    <ImageOverlay imgdata={imgdata} song={song} playing={playing} />
  ) : null;
  const inner = image ? (
    <div className="relative h-screen md:h-full">
      <Image
        src={image}
        alt="uploaded synth image"
        fill
        className="h-full object-contain"
      />
      {svg}
    </div>
  ) : (
    <button
      type="button"
      onClick={onUpload}
      className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-6 text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-500 dark:border-gray-700 dark:text-gray-400 dark:hover:border-indigo-500"
    >
      <CloudUpload aria-hidden="true" className="h-12 w-12 shrink-0" />
      <span className="max-w-full text-center text-lg font-semibold text-balance">
        Drop an image here, or click to upload
      </span>
      <span className="max-w-full text-center text-sm text-balance">
        It will be transcribed into a piano piece
      </span>
    </button>
  );
  return (
    <div className="relative order-1 grow self-stretch md:order-2">{inner}</div>
  );
}
