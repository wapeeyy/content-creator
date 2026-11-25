"""Voice-over for the ORBIT Pro / Ultra package videos (Kokoro am_michael).
usage: pkg_vo.py <out_dir>  -> <name>_NN.wav + pkg_lines.json (durations; scenes are timed from these)"""
import json, sys, soundfile as sf
from kokoro_onnx import Kokoro

SCRIPTS = {
    "pro": [
        "ORBIT Pro. Read the chart, and avoid the rugs.",
        "Every chart is marked for you. Higher highs, lower lows, breaks of structure, support and resistance, and the volume profile.",
        "The ORBIT Read gives you the bias, the key levels, and exactly what to watch next.",
        "The ORBIT Report scores every coin from zero to one hundred, and flags the dev and insider wallets.",
        "Trace any wallet, practise with ten fake SOL, and set alerts on the levels that matter.",
        "ORBIT Pro. Twenty three dollars a month. Start today at orbit on sol dot com.",
    ],
    "ultra": [
        "ORBIT Ultra. See what the whales do, first.",
        "Every big buy and every big sell is pinned to the chart. Tap a whale, and trace the wallet behind it.",
        "Read every timeframe at once. Five minutes, one hour, four hours, and the daily, on one screen.",
        "Unlimited price alerts, and everything in Pro.",
        "Coming next for Ultra: a smart money watchlist, alerts even when the app is closed, and trading from your own wallet.",
        "Plus a private Ultra group. ORBIT Ultra. Fifty nine dollars a month, at orbit on sol dot com.",
    ],
}

out = sys.argv[1]
k = Kokoro("/home/user/tts/kokoro-v1.0.onnx", "/home/user/tts/voices-v1.0.bin")
meta = {}
for name, lines in SCRIPTS.items():
    meta[name] = []
    for i, text in enumerate(lines):
        a, sr = k.create(text, voice="am_michael", speed=1.0, lang="en-us")
        f = f"pkg_{name}_{i:02d}.wav"
        sf.write(f"{out}/{f}", a, sr)
        meta[name].append({"file": f, "dur": round(len(a) / sr, 2), "text": text})
        print(name, i, round(len(a) / sr, 2))
json.dump(meta, open(f"{out}/pkg_lines.json", "w"), indent=1)
