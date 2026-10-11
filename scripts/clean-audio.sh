#!/bin/sh
# Turn the raw recordings in public/ into mp3s: every one in full in samples/,
# and the ones the app plays again in static/, cut to 10 seconds.
#
# Each file is cut 4 ms before its first sound and faded in over 3 ms, so it
# never begins mid-wave with a click. "First sound" is 40 dB below the file's
# own peak, because the soft recordings never reach a fixed threshold.
#
# The app holds every note it plays in memory uncompressed, and by 10 seconds
# a note has faded into the recording's hiss, so the rest is cut off with a
# half-second fade.
for file in public/*.aiff; do
  name=$(basename "$file" .aiff)
  peak=$(ffmpeg -i "$file" -af volumedetect -f null - 2>&1 |
    sed -n 's/.*max_volume: \(.*\) dB/\1/p')
  threshold=$(echo "$peak - 40" | bc)
  start="silenceremove=start_periods=1:start_duration=0:start_threshold=${threshold}dB:start_silence=0.004,afade=t=in:st=0:d=0.003"
  ffmpeg -v error -y -i "$file" -af "$start" "samples/$name.mp3"
  case $name in
    *.mf.*)
      ffmpeg -v error -y -i "$file" \
        -af "$start,atrim=end=10,afade=t=out:st=9.5:d=0.5" "static/$name.mp3"
      ;;
  esac
done
