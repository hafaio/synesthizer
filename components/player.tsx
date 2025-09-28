"use client";

import { addBasePath } from "next/dist/client/add-base-path";
import { connection } from "next/server";
import { useEffect, useState } from "react";
import { loaded, Sampler } from "tone";
import { orderedNotes } from "../src/notes";
import type { Chord } from "../src/worker-interface";

export type Dynamic = "pp" | "mf" | "ff";

export default function Player({
  song,
  playing,
  setPlaying,
}: {
  song: Chord[] | null;
  playing: number | null;
  setPlaying: (state: number | null) => void;
}): React.ReactNode {
  const [sampler, setSampler] = useState<Sampler | null>(null);
  useEffect(() => {
    // this prevents this from happening during pre-render since the prerender can't render audio
    connection()
      .then(loaded)
      .then(() => {
        const urls: Record<string, string> = {};
        for (const note of orderedNotes) {
          for (let octave = 1; octave < 8; ++octave) {
            urls[`${note}${octave}`] = `${note}${octave}.mp3`;
          }
        }
        setSampler(
          new Sampler({
            urls,
            baseUrl: addBasePath("/Piano.mf."),
          }).toDestination(),
        );
      });
  }, []);

  useEffect(() => {
    if (playing !== null && song && sampler) {
      const chord = song[playing];
      // NOTE don't stop final note early
      const final = playing + 1 === song.length;
      const duration = final ? chord.duration * 10 : chord.duration;
      sampler.triggerAttack(chord.notes);
      const num = setTimeout(() => {
        if (final) {
          setPlaying(null);
        } else {
          setPlaying(playing + 1);
        }
      }, duration);

      // cleanup if playblack is interrupted
      return () => {
        sampler.triggerRelease(chord.notes);
        clearTimeout(num);
      };
    }
  }, [playing, song, setPlaying, sampler]);
  return null;
}
