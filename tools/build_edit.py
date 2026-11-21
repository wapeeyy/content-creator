"""Step 2 of the template: turn projects/<p>/video.json into a cut video + Remotion data.

Usage: python tools/build_edit.py <project>

Reads   projects/<p>/source.mp4, projects/<p>/transcripts/source.json, projects/<p>/video.json
Writes  remotion/public/cut.mp4         cold open + tightened body (30 ms audio fades at cuts)
        remotion/src/data/project.json  words, overlays, sfx, cover, all on the cut timeline

Word references in video.json are ["needle", nth] or ["needle", nth, offsetSec]:
the nth word (0-based) whose text contains needle (case-insensitive), in source order.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT_VIDEO = ROOT / "remotion/public/cut.mp4"
OUT_JSON = ROOT / "remotion/src/data/project.json"

PAD_BEFORE = 0.12
PAD_AFTER = 0.18


def loudness_db(path: Path, hop=0.05):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
        capture_output=True, check=True).stdout
    a = np.frombuffer(raw, dtype=np.int16).astype(float) / 32768
    win = int(16000 * hop)
    n = len(a) // win
    rms = np.sqrt((a[: n * win].reshape(n, win) ** 2).mean(1))
    return 20 * np.log10(rms + 1e-9), hop


def apply_fixes(words, fix):
    fix = {k.lower(): v for k, v in fix.items()}
    out = []
    for w in words:
        key = w["text"].lower()
        stripped = key.rstrip(".,?!")
        trail = key[len(stripped):]
        rep = fix.get(key) or (fix[stripped] + trail if stripped in fix else None)
        if rep is not None:
            rep = rep.capitalize() if w["text"][:1].isupper() else rep
            w = dict(w, text=rep)
        out.append(dict(w))
    # rejoin hyphenated repeats Whisper split ("kepamist" + "-kepamist")
    merged = []
    for w in out:
        if merged and w["text"].startswith("-"):
            merged[-1]["text"] += w["text"]
            merged[-1]["end"] = w["end"]
            continue
        merged.append(w)
    # explicit joins: [["ke", "pamist"], ...]
    return merged


def apply_joins(words, joins):
    for a, b in joins:
        res = []
        for w in words:
            if res and res[-1]["text"].lower() == a.lower() and w["text"].lower().startswith(b.lower()):
                res[-1]["text"] += w["text"]
                res[-1]["end"] = w["end"]
                continue
            res.append(w)
        words = res
    return words


class Refs:
    def __init__(self, words):
        self.words = words

    def word(self, ref):
        needle, nth = ref[0].lower(), ref[1] if len(ref) > 1 else 0
        hits = [w for w in self.words if needle in w["text"].lower()]
        if len(hits) <= nth:
            sys.exit(f"word ref not found: {ref} (only {len(hits)} matches)")
        return hits[nth]

    def start(self, ref):
        return self.word(ref)["start"] + (ref[2] if len(ref) > 2 else 0)

    def end(self, ref):
        return self.word(ref)["end"] + (ref[2] if len(ref) > 2 else 0)


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    pdir = ROOT / "projects" / sys.argv[1]
    cfg = json.loads((pdir / "video.json").read_text())
    src = pdir / "source.mp4"
    data = json.loads((pdir / "transcripts/source.json").read_text())

    words = [w for w in data["words"] if w["type"] == "word"]
    words = apply_joins(apply_fixes(words, cfg.get("fix", {})), cfg.get("join", []))
    refs = Refs(words)
    db, hop = loudness_db(src)
    max_gap = cfg.get("maxGap", 0.5)

    head = cfg.get("head", max(words[0]["start"] - 0.15, 0))
    tail = cfg.get("tail", words[-1]["end"] + 0.3)
    if cfg.get("loop", {}).get("endAfter"):
        tail = refs.end(cfg["loop"]["endAfter"]) + cfg["loop"].get("hold", 0.15)

    # source ranges removed on purpose (e.g. a slow greeting)
    removed = [(refs.start(c["from"]) - 0.05, refs.end(c["to"]) + 0.05) for c in cfg.get("cut", [])]

    def is_removed(w):
        return any(s <= w["start"] and w["end"] <= e for s, e in removed)

    body = [w for w in words if head <= w["start"] and w["end"] <= tail + 0.01 and not is_removed(w)]

    def first_loud(s, e, thr=-32):
        for i in range(int(s / hop), int(e / hop)):
            if db[i] > thr:
                return i * hop
        return None

    segs, cur = [], max(head, body[0]["start"] - PAD_BEFORE)
    for a, b in zip(body, body[1:]):
        forced = any(a["end"] <= s and e <= b["start"] + 0.06 for s, e in removed)
        gap = b["start"] - a["end"]
        if not forced and gap <= max_gap:
            continue
        onset = first_loud(a["end"] + 0.1, b["start"]) if not forced else None
        nxt = min(b["start"], onset) if onset else b["start"]
        if not forced and nxt - a["end"] <= max_gap:
            continue
        segs.append((cur, a["end"] + PAD_AFTER))
        cur = nxt - PAD_BEFORE
    segs.append((cur, min(tail, body[-1]["end"] + PAD_AFTER + 0.3)))

    # cold open: a punchy line moved to the very start
    hook = cfg.get("hook", {})
    cold = None
    if hook.get("coldOpen"):
        co = hook["coldOpen"]
        cold = (refs.start(co["from"]) - 0.08, refs.end(co["to"]) + co.get("hold", 0.25))

    timeline = []  # (srcStart, srcEnd, outStart, isCold)
    t = 0.0
    if cold:
        timeline.append((cold[0], cold[1], 0.0, True))
        t = cold[1] - cold[0]
    hook_end = t
    for s, e in segs:
        timeline.append((s, e, t, False))
        t += e - s
    duration = t

    def remap(x, cold_part=False):
        for s, e, o, c in timeline:
            if c != cold_part:
                continue
            if s - 0.2 <= x <= e + 0.2:
                return round(min(max(x, s), e) - s + o, 3)
        return None

    out_words = []
    if cold:
        for w in words:
            if cold[0] <= w["start"] and w["end"] <= cold[1] + 0.05:
                out_words.append({"text": w["text"], "start": remap(w["start"], True),
                                  "end": remap(w["end"], True), "cold": True})
    for w in body:
        s, e = remap(w["start"]), remap(w["end"])
        if s is not None and e is not None:
            out_words.append({"text": w["text"], "start": s, "end": min(e, s + 1.0)})

    def at(ref, which="start"):
        if isinstance(ref, (int, float)):
            return float(ref)
        x = refs.start(ref) if which == "start" else refs.end(ref)
        y = remap(x)
        if y is None:
            sys.exit(f"ref {ref} falls in a removed part of the video")
        return y

    overlays = []
    for ov in cfg.get("overlays", []):
        o = dict(ov)
        for key in ("at", "until", "typeStart", "typeEnd"):
            if key in ov:
                o[key] = at(ov[key], "end" if key == "typeEnd" else "start")
        overlays.append(o)
    sfx = [dict(s, at=at(s["at"])) for s in cfg.get("sfx", [])]
    cover = dict(cfg.get("cover", {}))
    if "at" in cover:
        # cover frame is taken from the cut video
        cover["at"] = at(cover["at"])

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps({
        "project": sys.argv[1],
        "duration": round(duration, 3),
        "hookEnd": round(hook_end, 3),
        "hook": {**{k: v for k, v in hook.items() if k != "coldOpen"},
                 **({"until": at(hook["until"])} if "until" in hook else {})},
        "loop": bool(cfg.get("loop")),
        "segments": [{"srcStart": round(s, 3), "srcEnd": round(e, 3), "outStart": round(o, 3), "cold": c}
                     for s, e, o, c in timeline],
        "words": out_words,
        "overlays": overlays,
        "sfx": sfx,
        "cover": cover,
    }, indent=1, ensure_ascii=False))

    parts, labels = [], []
    for i, (s, e, _, _) in enumerate(timeline):
        d = e - s
        parts.append(
            f"[0:v]trim={s:.3f}:{e:.3f},setpts=PTS-STARTPTS[v{i}];"
            f"[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS,"
            f"afade=t=in:d=0.03,afade=t=out:st={max(d - 0.03, 0):.3f}:d=0.03[a{i}]")
        labels.append(f"[v{i}][a{i}]")
    fc = (";".join(parts) + ";" + "".join(labels) + f"concat=n={len(timeline)}:v=1:a=1[v][araw];"
          # voice polish: cut rumble, even out level so SFX never bury the voice
          "[araw]highpass=f=80,afftdn=nf=-30:nr=12,acompressor=threshold=-24dB:ratio=3:attack=5:release=120:makeup=4[a]")
    OUT_VIDEO.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(src), "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
         "-c:v", "libx264", "-preset", "fast", "-crf", "17", "-pix_fmt", "yuv420p", "-r", "30",
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", str(OUT_VIDEO)],
        check=True)

    print(f"{len(timeline)} segments, cold open {hook_end:.1f}s, total {duration:.1f}s")
    for o in overlays:
        print(f"  {o['at']:6.2f}  {o['type']:8s} {o.get('text') or o.get('title') or o.get('sticker') or ''}")


if __name__ == "__main__":
    main()
