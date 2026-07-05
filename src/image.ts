/** This file has utilities for turning an image into notes. */
import type { Chord, Message, Result } from "./worker-interface";

/** convert an image into playable chords via a background worker */
export async function convert(
  img: ImageData,
  options: Omit<Message, "img">,
): Promise<Chord[]> {
  const message: Message = { img, ...options };
  const worker = new Worker(new URL("./worker.ts", import.meta.url));
  const res = await new Promise<Result>((resolve, reject) => {
    worker.addEventListener("message", (event: MessageEvent<Result>) => {
      resolve(event.data);
      worker.terminate();
    });
    // a load/parse failure or bad message clone posts no message; reject so we
    // don't hang forever
    worker.addEventListener("error", (event) => {
      worker.terminate();
      reject(new Error(event.message || "worker failed to load"));
    });
    worker.addEventListener("messageerror", () => {
      worker.terminate();
      reject(new Error("worker message could not be deserialized"));
    });
    worker.postMessage(message);
  });
  if (res.typ === "err") {
    throw new Error(res.err);
  } else {
    return res.chords;
  }
}
