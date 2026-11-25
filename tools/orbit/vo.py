"""Generate ORBIT voice-over lines (Kokoro am_michael). usage: vo.py <out_dir> [speed]
Writes one wav per line + lines.json with start time & duration, checks each fits its slot."""
import json, sys, soundfile as sf
from kokoro_onnx import Kokoro

LAUNCH = [
    (1.0, 8.2, "Every minute, hundreds of new coins are born on Solana."),
    (8.4, 12.0, "Most of them are built to fall."),
    (12.6, 17.0, "Introducing ORBIT. Solana coin intelligence."),
    (17.4, 24.0, "One app to find, check, and understand every coin, before you buy."),
    (24.2, 28.0, "See every new pair. Trending, new, and top volume."),
    (28.2, 32.0, "Score the risk. Zero to one hundred, in seconds."),
    (32.2, 36.0, "Follow the wallets. What they buy, sell, and earn."),
    (36.2, 40.0, "Read the chart. The high, the low, and the volume zone."),
    (40.2, 44.0, "Practise without risk. Ten fake SOL, real prices."),
    (44.2, 49.0, "Two hundred pairs per list. Refreshed every thirty seconds."),
    (52.6, 56.0, "ORBIT. Now live on Solana."),
    (56.2, 60.0, "Not financial advice. Always do your own research."),
]
TUTORIAL = [
    (0.4, 4.0, "Here is how to install and use ORBIT."),
    (4.4, 12.5, "On iPhone, open the link in Safari. Tap Share, then Add to Home Screen, and tap Add."),
    (12.9, 19.5, "On Android, open the link in Chrome. Open the menu, choose Install app, then tap Install."),
    (19.9, 28.5, "In Discover, All pairs shows every trending and new Solana pair. Use the filters, then tap any coin."),
    (28.9, 36.5, "The ORBIT Report gives a safety score from zero to one hundred. Read every warning before you buy."),
    (36.9, 43.5, "The chart marks the high, the low, and the volume zone, where most people bought and sold."),
    (43.9, 51.5, "Tap any top holder to trace the wallet: what it buys, what it sells, and how much it made."),
    (51.9, 58.5, "Practise first. Trade with ten fake SOL at real prices, with no real money at risk."),
    (58.9, 67.0, "To unlock everything, open the Subscribe tab and pay with Phantom or Solflare. Pro turns on automatically."),
    (67.4, 72.0, "ORBIT. Your guide to every Solana coin."),
]

out = sys.argv[1]
speed = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
k = Kokoro("/home/user/tts/kokoro-v1.0.onnx", "/home/user/tts/voices-v1.0.bin")
meta = {}
for name, lines in (("launch", LAUNCH), ("tutorial", TUTORIAL)):
    meta[name] = []
    for i, (at, end, text) in enumerate(lines):
        sp = speed
        while True:
            a, sr = k.create(text, voice="am_michael", speed=sp, lang="en-us")
            d = len(a) / sr
            if d <= end - at - 0.15 or sp >= 1.1:
                break
            sp = round(sp + 0.05, 2)
        f = f"{name}_{i:02d}.wav"
        sf.write(f"{out}/{f}", a, sr)
        meta[name].append({"at": at, "end": end, "dur": round(d, 2), "speed": sp, "file": f, "text": text})
        flag = "" if d <= end - at else "  <-- OVER"
        print(f"{name} {i:02d} {at:5.1f}-{end:5.1f} slot {end-at:4.1f} dur {d:4.1f} sp {sp}{flag}")
json.dump(meta, open(f"{out}/lines.json", "w"), indent=1)
