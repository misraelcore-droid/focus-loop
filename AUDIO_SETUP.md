# Audio Setup (Focus Loop)

The app expects these files:

- `assets/audio/lofi.mp3`
- `assets/audio/rain.mp3`
- `assets/audio/brown-noise.mp3`

## Current status

These files are currently placeholders. Replace them with real MP3 files for playback.

## Recommended format

- File type: `.mp3`
- Length: 5–30 minutes loop-friendly tracks
- Bitrate: 96–192 kbps
- Channels: stereo or mono
- Keep each file reasonably small for mobile testing

## Where to get audio

Use royalty-free / properly licensed sources (or your own audio).

Before publishing publicly, confirm licensing terms allow redistribution in your repo/app.

## Verify quickly

From project root:

```bash
python - <<'PY'
from pathlib import Path
for p in [
    'assets/audio/lofi.mp3',
    'assets/audio/rain.mp3',
    'assets/audio/brown-noise.mp3',
]:
    s = Path(p).stat().st_size
    print(p, 'OK' if s > 0 else 'EMPTY', s)
PY
```

You should see `OK` and non-zero sizes for all 3 files.
