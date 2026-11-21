#!/usr/bin/env bash
# Step 3 of the template: build + render + loudness + phone copy + cover.
#
#   tools/render_video.sh <project>            full render
#   tools/render_video.sh <project> --preview  only stills with the safe-zone guide + cover
#   tools/render_video.sh <project> --hook     only the first 12 s (check the hook)
#
# Output: out/<project>/{final.mp4, <project>_tiktok.mp4, cover.png, preview/*.png}
set -euo pipefail
cd "$(dirname "$0")/.."
P="$1"; MODE="${2:-full}"
OUT="out/$P"; mkdir -p "$OUT/preview"

# Remotion's Node needs the session proxy to reach the network (harmless elsewhere)
export NODE_USE_ENV_PROXY=1
[ -f /root/.ccr/ca-bundle.crt ] && export NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt

python3 tools/build_edit.py "$P"
cd remotion
[ -d node_modules ] || npm install -s
npx tsc
R="npx remotion"
quiet() { grep -v -E "EHPA|trace-warnings|^\s*at " || true; }

$R still src/index.ts Cover "../$OUT/cover.png" --log=error 2>&1 | quiet

if [ "$MODE" = "--preview" ]; then
  python3 - "$P" <<'EOF' > /tmp/frames.txt
import json, sys
d = json.load(open("src/data/project.json"))
pts = {"00_hook": 0.0, "01_hook": 0.8}
for i, o in enumerate(d["overlays"]):
    pts[f"{i+2:02d}_{o['type']}"] = o["at"] + 0.5
for k, v in pts.items():
    print(k, int(v * 30))
EOF
  while read -r name fr; do
    $R still src/index.ts Main "../$OUT/preview/$name.png" --frame="$fr" --props='{"showSafeZone":true}' --scale=0.5 --log=error 2>&1 | quiet
  done < /tmp/frames.txt
  echo "preview stills in $OUT/preview, cover in $OUT/cover.png"
  exit 0
fi

if [ "$MODE" = "--hook" ]; then
  $R render src/index.ts Main "../$OUT/hook_raw.mp4" --frames=0-359 --crf=18 --log=error 2>&1 | quiet
  cd ..
  ffmpeg -v error -y -i "$OUT/hook_raw.mp4" -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a aac -b:a 160k "$OUT/hook_preview.mp4"
  rm -f "$OUT/hook_raw.mp4"
  echo "hook preview: $OUT/hook_preview.mp4"
  exit 0
fi

$R render src/index.ts Main "../$OUT/remotion_raw.mp4" --crf=18 --log=error 2>&1 | quiet
cd ..
ffmpeg -v error -y -i "$OUT/remotion_raw.mp4" -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT/final.mp4"
ffmpeg -v error -y -i "$OUT/final.mp4" -c:v libx264 -preset slow -crf 23 -maxrate 3.5M -bufsize 7M \
  -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "$OUT/${P}_tiktok.mp4"
rm -f "$OUT/remotion_raw.mp4"
ls -la "$OUT"
