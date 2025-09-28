/** This file has utilities for turning an image into notes. */
import type { Chord, Message, Result } from "./worker-interface";

/** convert rgb to hsl */
export async function convert(
  img: ImageData,
  options: Omit<Message, "img">,
): Promise<Chord[]> {
  const message: Message = { img, ...options };
  const worker = new Worker(new URL("./worker.ts", import.meta.url));
  const res = await new Promise<Result>((resolve) => {
    worker.addEventListener("message", (event: MessageEvent<Result>) => {
      resolve(event.data);
      worker.terminate();
    });
    worker.postMessage(message);
  });
  if (res.typ === "err") {
    throw new Error(res.err);
  } else {
    return res.chords;
  }
}
