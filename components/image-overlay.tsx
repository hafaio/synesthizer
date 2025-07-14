import { type Chord } from "./player";

function polyArea(points: [number, number][]): number {
  let area = 0;
  for (const [i, [xe, ye]] of points.slice(1).entries()) {
    const [xs, ys] = points[i];
    area += xs * ye - xe * ys;
  }
  return Math.abs(area) / 2;
}

export default function ImageRendering({
  imgdata,
  song,
  playing,
}: {
  imgdata: ImageData;
  song: Chord[] | null;
  playing: number | null;
}): React.ReactNode {
  let points = null;
  if (song) {
    let avgSize = 0;
    for (const [i, chord] of song.entries()) {
      const width = Math.sqrt(polyArea(chord.poly));
      avgSize += (width - avgSize) / (i + 1);
    }
    const fontSize = avgSize / 4;
    points = song.map((chord, i) => {
      const points = chord.poly.map(([x, y]) => `${x},${y}`).join(" ");
      const name = chord.notes.join(",").replaceAll("b", "♭");
      const active = i === playing;
      const [cx, cy] = chord.center;
      return (
        <g key={i}>
          <polygon
            points={points}
            className="transition-all stroke-black/10 stroke-1 fill-none"
          />
          <g
            className={`${
              active ? "opacity-100" : "opacity-0"
            } hover:opacity-100 transition`}
          >
            <polygon
              points={points}
              className="stroke-black/10 stroke-1"
              style={{
                fill: chord.color,
              }}
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fontSize}
              fill="black"
            >
              {name}
            </text>
          </g>
        </g>
      );
    });
  }
  return (
    <svg
      viewBox={`0 0 ${imgdata.width} ${imgdata.height}`}
      className="absolute w-full h-full"
    >
      {points}
    </svg>
  );
}
