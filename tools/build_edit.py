"""Tighten pauses and prepare caption/anchor data for the Remotion edit.

Reads  edit/source.mp4 + edit/medium/transcripts/source.json
Writes remotion/public/cut.mp4  (dead air shortened, 30 ms audio fades at cuts)
       remotion/src/data/edit.json  (words + anchors on the cut timeline)
"""

import json
import re
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "edit/source.mp4"
TRANSCRIPT = ROOT / "edit/medium/transcripts/source.json"
OUT_VIDEO = ROOT / "remotion/public/cut.mp4"
OUT_JSON = ROOT / "remotion/src/data/edit.json"

MAX_GAP = 0.5     # gaps longer than this get shortened
PAD_BEFORE = 0.12
PAD_AFTER = 0.18
HEAD, TAIL = 1.60, 113.95

# Whisper mishearings, fixed by hand (lowercase key -> replacement)
FIX = {
    "merungkalkan": "merungkaikan", "track,": "trend,", "track.": "trend.",
    "pesangan": "pasangan", "nomor": "nombor", "pakayan": "pakaian",
    "-pakayan": "-pakaian", "figurah": "figura", "-figurah": "-figura",
    "chao": "ciao", "sahaja?": "sahaja.", "obses": "obses",
    "kepamis": "kepamist", "-kepamis": "-kepamist", "pamis": "pamist", "pamis.": "pamist.",
}

# (key, word to find, nth occurrence) -> time on the cut timeline
ANCHORS = [
    ("first", "first", 0), ("matcha", "matcha", 0),
    ("second", "second", 0), ("trend", "trend", 0),
    ("lelaki1", "lelaki", 0), ("lelaki2", "lelaki", 1),
    ("pasangan", "pasangan", 0), ("nombor3", "nombor", 0), ("leher", "leher", 0),
    ("bermoral", "bermoral", 0), ("itu3ciri", "jumpai", 0),
    ("komen", "komen", 0), ("tinggalkan1", "tinggalkanlah", 0),
    ("ibu", "ibu", 0), ("tinggalkan2", "tinggalkanlah", 1),
    ("merosakkan", "merosakkan", 0), ("punca", "punca", 0),
    ("selamatkan", "selamatkan", 0), ("ciao", "ciao", 0),
]


def fix_word(text: str) -> str:
    out = []
    for part in re.split(r"(\s+)", text):
        key = part.lower()
        rep = FIX.get(key)
        if rep is None:
            out.append(part)
            continue
        out.append(rep.capitalize() if part[:1].isupper() else rep)
    return "".join(out)


def loudness_db(path: Path, hop=0.05):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
        capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.int16).astype(float) / 32768
    win = int(16000 * hop)
    n = len(a) // win
    rms = np.sqrt((a[: n * win].reshape(n, win) ** 2).mean(1))
    return 20 * np.log10(rms + 1e-9), hop


def main():
    data = json.loads(TRANSCRIPT.read_text())
    words = [dict(w, text=fix_word(w["text"])) for w in data["words"] if w["type"] == "word"]
    # re-join words Whisper split: "ke" + "pamist" -> "kepamist", "x" + "-x" -> "x-x"
    merged = []
    for w in words:
        prev = merged[-1] if merged else None
        if prev and (w["text"].startswith("-") or (prev["text"].lower() == "ke" and w["text"].lower().startswith("pamist"))):
            prev["text"] = prev["text"] + w["text"]
            prev["end"] = w["end"]
            continue
        merged.append(dict(w))
    words = merged
    db, hop = loudness_db(SRC)

    def first_loud(s, e, thr=-32):
        for i in range(int(s / hop), int(e / hop)):
            if db[i] > thr:
                return i * hop
        return None

    # keep-segments in source time
    segs = []
    cur_s = HEAD
    for a, b in zip(words, words[1:]):
        gap = b["start"] - a["end"]
        if gap <= MAX_GAP:
            continue
        onset = first_loud(a["end"] + 0.1, b["start"])
        nxt = min(b["start"], onset) if onset else b["start"]
        if nxt - a["end"] <= MAX_GAP:
            continue
        segs.append((cur_s, a["end"] + PAD_AFTER))
        cur_s = nxt - PAD_BEFORE
    segs.append((cur_s, TAIL))

    # source -> cut timeline
    out_segs, t = [], 0.0
    for s, e in segs:
        out_segs.append({"srcStart": round(s, 3), "srcEnd": round(e, 3), "outStart": round(t, 3)})
        t += e - s
    duration = t

    def remap(x):
        for sg in out_segs:
            if sg["srcStart"] - 0.2 <= x <= sg["srcEnd"] + 0.2:
                return round(min(max(x, sg["srcStart"]), sg["srcEnd"]) - sg["srcStart"] + sg["outStart"], 3)
        return None

    cut_words = []
    for w in words:
        s, e = remap(w["start"]), remap(w["end"])
        if s is None or e is None:
            continue
        cut_words.append({"text": w["text"], "start": s, "end": min(e, s + 1.0)})

    anchors = {}
    for key, needle, nth in ANCHORS:
        hits = [w for w in cut_words if needle in w["text"].lower()]
        if len(hits) <= nth:
            raise SystemExit(f"anchor not found: {key} ({needle} #{nth})")
        anchors[key] = hits[nth]["start"]

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(
        {"duration": round(duration, 3), "segments": out_segs, "words": cut_words, "anchors": anchors},
        indent=1, ensure_ascii=False))

    # render the tightened video with short audio fades at each cut
    parts, labels = [], []
    for i, sg in enumerate(out_segs):
        d = sg["srcEnd"] - sg["srcStart"]
        parts.append(
            f"[0:v]trim={sg['srcStart']}:{sg['srcEnd']},setpts=PTS-STARTPTS[v{i}];"
            f"[0:a]atrim={sg['srcStart']}:{sg['srcEnd']},asetpts=PTS-STARTPTS,"
            f"afade=t=in:d=0.03,afade=t=out:st={max(d - 0.03, 0):.3f}:d=0.03[a{i}]")
        labels.append(f"[v{i}][a{i}]")
    fc = ";".join(parts) + ";" + "".join(labels) + f"concat=n={len(out_segs)}:v=1:a=1[v][a]"
    OUT_VIDEO.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(SRC), "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
         "-c:v", "libx264", "-preset", "fast", "-crf", "17", "-pix_fmt", "yuv420p", "-r", "30",
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", str(OUT_VIDEO)],
        check=True)

    print(f"segments: {len(out_segs)}  source {TAIL - HEAD:.1f}s -> cut {duration:.1f}s")
    for k, v in anchors.items():
        print(f"  {k:12s} {v:6.2f}")


if __name__ == "__main__":
    main()
