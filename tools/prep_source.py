"""Step 1 of the template: fetch, convert to 1080x1920, colour grade, transcribe.

Usage:
    python tools/prep_source.py <project> <url-or-path> [--grade warm_punch] [--language ms] [--model medium]

<url-or-path> may be a Google Drive link, a TikTok/YouTube/etc. URL (yt-dlp), or a local file.
Creates:
    projects/<project>/raw/<original file>
    projects/<project>/source.mp4                 1080x1920, 30 fps, H.264, graded
    projects/<project>/transcripts/source.json    word-level (faster-whisper)
    projects/<project>/takes_packed.md            readable transcript with timestamps
"""

import argparse
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

GRADES = {
    "none": "null",
    "warm_punch": "eq=contrast=1.07:saturation=1.18:gamma=0.97,"
                  "colorbalance=rs=0.03:bs=-0.03:rm=0.02:bm=-0.02:rh=0.01:bh=-0.02,unsharp=5:5:0.35",
    "clean_bright": "eq=contrast=1.05:brightness=0.02:saturation=1.10,colorbalance=rm=0.01:bm=-0.01,unsharp=5:5:0.3",
    "moody": "eq=contrast=1.12:saturation=0.95:gamma=0.95,"
             "colorbalance=rs=-0.02:bs=0.03:rh=0.03:bh=-0.03,vignette=PI/5",
}


def run(cmd, **kw):
    print("+", " ".join(str(c) for c in cmd)[:200], flush=True)
    subprocess.run(cmd, check=True, **kw)


def fetch(src: str, raw_dir: Path) -> Path:
    raw_dir.mkdir(parents=True, exist_ok=True)
    existing = [p for p in raw_dir.iterdir() if p.is_file()]
    if existing:
        print(f"raw already present: {existing[0].name}")
        return existing[0]
    if Path(src).exists():
        dst = raw_dir / Path(src).name
        dst.write_bytes(Path(src).read_bytes())
        return dst
    m = re.search(r"drive\.google\.com/.*?(?:/d/|id=)([\w-]{20,})", src)
    if m:
        run(["gdown", m.group(1), "-O", str(raw_dir) + "/"])
    else:
        run(["yt-dlp", "-f", "bv*+ba/b", "--merge-output-format", "mp4",
             "-o", str(raw_dir / "%(id)s.%(ext)s"), src])
    files = [p for p in raw_dir.iterdir() if p.is_file()]
    if not files:
        sys.exit("download failed")
    return files[0]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("source")
    ap.add_argument("--grade", default="none", choices=GRADES)  # user prefers the original look
    ap.add_argument("--language", default="ms")
    ap.add_argument("--model", default="medium")
    args = ap.parse_args()

    pdir = ROOT / "projects" / args.project
    raw = fetch(args.source, pdir / "raw")
    out = pdir / "source.mp4"
    if not out.exists():
        vf = (f"scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,"
              f"{GRADES[args.grade]}")
        run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-map", "0:v:0", "-map", "0:a:0",
             "-vf", vf, "-c:v", "libx264", "-preset", "fast", "-crf", "17", "-pix_fmt", "yuv420p",
             "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", str(out)])
    run([sys.executable, str(ROOT / "tools/transcribe_local.py"), str(out), "--edit-dir", str(pdir),
         "--model", args.model, "--language", args.language])
    run([sys.executable, str(Path.home() / "Developer/video-use/helpers/pack_transcripts.py"),
         "--edit-dir", str(pdir), "-o", str(pdir / "takes_packed.md")])
    # flag places where the speaker mentions an app, so an "app" overlay can be proposed
    import json as _json
    words = [w for w in _json.loads((pdir / "transcripts/source.json").read_text())["words"] if w["type"] == "word"]
    apps = {"threads": "threads", "thread": "threads", "tiktok": "tiktok", "tik": "tiktok", "twitter": "x",
            "x": "x", "instagram": "instagram", "ig": "instagram", "insta": "instagram"}
    hits = []
    for i, w in enumerate(words):
        key = w["text"].lower().strip(".,?!")
        if key in apps and (key != "x" or any(v in " ".join(x["text"].lower() for x in words[max(0, i - 3):i]) for v in ("buka", "bukak", "app", "dekat", "kat"))):
            ctx = " ".join(x["text"] for x in words[max(0, i - 4): i + 10])
            hits.append(f"  {w['start']:7.2f}s  [{apps[key]}]  ...{ctx}...")
    if hits:
        print("\napp mentions (propose an \"app\" overlay):")
        print("\n".join(hits))
    print(f"\nready: {pdir}\nnext: write {pdir / 'video.json'} then run tools/build_edit.py {args.project}")


if __name__ == "__main__":
    main()
