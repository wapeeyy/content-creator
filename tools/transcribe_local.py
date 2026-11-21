"""Free, local transcription for video-use (no API key).

Drop-in replacement for video-use's helpers/transcribe.py (ElevenLabs Scribe).
Runs faster-whisper on CPU and writes a Scribe-shaped JSON
(`words` with type word/spacing, start, end, speaker_id) to
<edit_dir>/transcripts/<video_stem>.json, so pack_transcripts.py,
timeline_view.py and render.py work unchanged.

No speaker diarization or audio events: every word is speaker_0.

Usage:
    python tools/transcribe_local.py <video> [<video> ...]
    python tools/transcribe_local.py clip.mp4 --language ms --model small
    python tools/transcribe_local.py clip.mp4 --edit-dir /path/to/edit --force
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def transcribe(video: Path, model, language: str | None) -> dict:
    segments, info = model.transcribe(
        str(video),
        language=language,
        word_timestamps=True,
        vad_filter=False,  # keep pauses/fillers visible for cutting
        condition_on_previous_text=False,
    )
    words: list[dict] = []
    prev_end = 0.0
    for seg in segments:
        for w in seg.words or []:
            start, end = round(float(w.start), 3), round(float(w.end), 3)
            if words and start > prev_end:
                words.append({"text": " ", "start": prev_end, "end": start,
                              "type": "spacing", "speaker_id": "speaker_0"})
            words.append({"text": w.word.strip(), "start": start, "end": end,
                          "type": "word", "speaker_id": "speaker_0",
                          "logprob": round(float(w.probability), 4)})
            prev_end = end
    text = " ".join(w["text"] for w in words if w["type"] == "word")
    return {
        "language_code": info.language,
        "language_probability": round(float(info.language_probability), 4),
        "text": text,
        "words": words,
        "source": "faster-whisper",
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("videos", nargs="+", type=Path)
    ap.add_argument("--edit-dir", type=Path,
                    help="Default: <first video's folder>/edit")
    ap.add_argument("--language", default=None,
                    help="e.g. ms, en, id. Default: auto-detect")
    ap.add_argument("--model", default="small",
                    help="tiny, base, small, medium, large-v3 (default: small)")
    ap.add_argument("--force", action="store_true", help="Overwrite cached transcripts")
    args = ap.parse_args()

    from faster_whisper import WhisperModel

    edit_dir = args.edit_dir or args.videos[0].resolve().parent / "edit"
    out_dir = edit_dir / "transcripts"
    out_dir.mkdir(parents=True, exist_ok=True)

    model = None
    for video in args.videos:
        if not video.exists():
            sys.exit(f"not found: {video}")
        out = out_dir / f"{video.stem}.json"
        if out.exists() and not args.force:
            print(f"cached: {out}")
            continue
        if model is None:
            model = WhisperModel(args.model, device="cpu", compute_type="int8")
        print(f"transcribing {video.name} ...", flush=True)
        payload = transcribe(video, model, args.language)
        out.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
        n = sum(1 for w in payload["words"] if w["type"] == "word")
        print(f"  -> {out}  ({payload['language_code']}, {n} words)")


if __name__ == "__main__":
    main()
