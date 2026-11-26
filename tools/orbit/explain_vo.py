"""Voice-over for the ORBIT promo / explainer video (Kokoro am_michael, promo pace).
usage: explain_vo.py <out_dir> -> exp_NN.wav + exp_lines.json (durations; scenes are timed from these)"""
import json, sys, soundfile as sf
from kokoro_onnx import Kokoro

LINES = [
    "Stop guessing on Solana coins you don't understand.",
    "This is ORBIT. Solana coin intelligence, in one app.",
    "Here's the smart way to start. Try ORBIT Pro free for seven days. No card. Just connect your wallet.",
    "Your trial includes demo trading. Ten practice SOL, on real coins, at real live prices.",
    "Buy, sell, and track your profit and loss, without risking a single dollar of your own.",
    "Test the reads. Test your strategy. When your demo is profitable, then consider trading with real money.",
    "Here's how it works. Discover shows every trending and new Solana pair, plus the ORBIT picks.",
    "Tap any coin, or paste a contract address, for the price, liquidity, top holders, and the story behind it.",
    "The Pro chart marks the structure for you. Highs, lows, breaks of structure, support, resistance, and the volume profile.",
    "The ORBIT Read gives you the bias, the key levels, and exactly what to watch next.",
    "Before you buy, run the safety check. Can you sell? Is the liquidity locked? Is the dev dumping?",
    "That's ORBIT Pro. Twenty three dollars a month, after your free week.",
    "Want the full edge? ORBIT Ultra puts every whale trade on the chart, with the wallet behind it.",
    "See holder flow, catch launch bundles, and check how the Read has performed on every coin.",
    "Get Scalp and Hold picks. Only coins that pass every ORBIT check, with an entry, a target, and a stop.",
    "Plus live Telegram alerts, even with the app closed, and trading right from your own wallet.",
    "ORBIT Ultra is fifty nine dollars a month. During your trial, your first Ultra month is just five dollars.",
    "Getting started is easy. Open orbit on sol dot com, tap Start free trial, and connect Phantom or Solflare.",
    "To upgrade, open the Subscribe tab, choose Pro or Ultra, and pay with USDC or SOL.",
    "ORBIT. Try it free. Prove it in demo. Then trade with confidence.",
    "Link in bio. Not financial advice.",
]

out = sys.argv[1]
k = Kokoro("/home/user/tts/kokoro-v1.0.onnx", "/home/user/tts/voices-v1.0.bin")
meta = []
for i, text in enumerate(LINES):
    a, sr = k.create(text, voice="am_michael", speed=1.05, lang="en-us")
    f = f"exp_{i:02d}.wav"
    sf.write(f"{out}/{f}", a, sr)
    meta.append({"file": f, "dur": round(len(a) / sr, 2), "text": text})
    print(i, round(len(a) / sr, 2))
json.dump(meta, open(f"{out}/exp_lines.json", "w"), indent=1)
print("total", round(sum(m["dur"] for m in meta), 1))
