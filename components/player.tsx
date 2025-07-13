import { useEffect, useState } from "react";

export interface Chord {
  // sequence of notes and octive like "Ab4"
  notes: string[];
  // duration in ms
  duration: number;
  // volume in [0, 1]
  volume: number;
  dynamic: "pp" | "mf" | "ff";
  color: string;
}

export default function Player({
  song,
  playing,
  setPlaying,
}: {
  song: Chord[] | null;
  playing: number | null;
  setPlaying: (state: number | null) => void;
}): React.ReactNode {
  const [keys, setKeys] = useState<Map<string, HTMLAudioElement> | null>(null);

  useEffect(() => {
    if (song === null) {
      setKeys(null);
    } else {
      let valid = true;
      const keys = new Map<string, HTMLAudioElement>();
      const names = new Set<string>();
      for (const { notes, dynamic } of song) {
        for (const note of notes) {
          names.add(`${dynamic}.${note}`);
        }
      }

      let num = names.size;
      for (const name of names) {
        const audio = new Audio(`/Piano.${name}.mp3`);
        audio.addEventListener("error", (err) => {
          // FIXME handle better
          valid = false;
          console.error(name, err);
        });
        audio.addEventListener("canplaythrough", () => {
          // setKeys once all are loaded
          if (!--num && valid) setKeys(keys);
        });
        keys.set(name, audio);
      }
      // if song changes, don't set keys
      return () => {
        valid = false;
      };
    }
  }, [song]);

  // FIXME maybe instead of this approach, we can generate a wav file and track
  // where we are? To do that  we may need sample piano notes of every length,
  // so maybe this is "easier"

  useEffect(() => {
    if (playing !== null && keys && song) {
      const chord = song[playing];
      const notes = song[playing].notes.map(
        (note) => keys.get(`${chord.dynamic}.${note}`)!
      );

      // if we have a chord, play
      for (const note of notes) {
        note.currentTime = 0;
        note.volume = chord.volume;
        note.play();
      }

      const final = playing + 1 === song.length;
      // NOTE don't stop final note early
      const duration = final
        ? Math.max(chord.duration, ...notes.map((note) => note.duration * 1000))
        : chord.duration;
      const num = setTimeout(() => {
        if (final) {
          setPlaying(null);
        } else {
          setPlaying(playing + 1);
        }
      }, duration);

      // cleanup if playblack is interrupted
      return () => {
        // FIXME should we keep the notes playing always?
        for (const note of notes) {
          note.pause();
        }
        clearTimeout(num);
      };
    }
  }, [playing, keys, song, setPlaying]);

  if (!keys || !song) return null;

  // FIXME State for controlling playback? potentially by notes?

  const rendNotes = song.map(({ notes, color }, i) => {
    const text = notes.join(",") || "-";
    const style = i === playing ? { backgroundColor: color } : { color };
    return (
      <div key={i} style={style}>
        <div className="p-1 font-bold min-w-8 text-center">{text}</div>
      </div>
    );
  });
  return (
    <div className="flex flex-wrap gap-x-2 px-2 select-none">{rendNotes}</div>
  );
}
