"""Voice-over for the ORBIT A–Z update tutorial (Kokoro am_michael, calm teaching pace).
usage: guide_vo.py <out_dir> -> gd_NN.wav + gd_lines.json (durations; scenes are timed from these)"""
import json, sys, soundfile as sf
from kokoro_onnx import Kokoro

LINES = [
    "Here's everything new in ORBIT, from A to Z.",
    "First, install ORBIT. On iPhone, open orbit on sol dot com in Safari, tap Share, then Add to Home Screen. On Android, tap Install app.",
    "Discover shows every Solana pair. ORBIT picks now lists only coins that are ORBIT Verified: real traders, no fake volume.",
    "ORBIT checks the last three hundred trades: organic volume, wash trading, bot patterns, the top five wallets, and the launch bundle. Coins that fail show the reason.",
    "Tap any coin. The new bar at the bottom works like a trading app: Info, Chart plus Txns, Chart, and Txns.",
    "The chart is now live. The last candle moves with the price every three seconds, and new candles open on time.",
    "Pick a timeframe, from one minute to one day. Tap refresh to reload, and switch ORBIT layers on or off: structure, levels, whales, and more.",
    "Want every single trade? Tap DexScreener at the top of the chart, for the original live chart.",
    "Txns shows every buy and sell as it happens. Filter by buys, sells, or whales. Dev and whale wallets are tagged, and you can tap any wallet to trace it.",
    "Info keeps every ORBIT check: the safety check, the ORBIT Report, RugCheck, the holders, and the dev wallet.",
    "Now, the demo. In the Demo tab, choose your starting balance, any amount from point one to one hundred thousand SOL, and tap Reset demo.",
    "Buy with the quick buttons, or type your own amount.",
    "Tap a position to open its live chart. Your buys and sells are marked, with your average entry and your break-even line.",
    "Set a take-profit or a stop-loss in one tap. When the price gets there, the demo sells for you.",
    "Your track record shows your win rate, and your best and worst trades. Prove it in demo before you use real money.",
    "Ultra members get ORBIT Scalp and Hold: coins that pass every check, with an entry, a target, and a stop.",
    "To get alerts, even with the app closed, open the Pro tab and connect Telegram.",
    "Switch on Whales on all ORBIT pairs, for whale buys and sells on every coin in All pairs. Keep Only ORBIT Verified on to skip fake volume, and choose your whale size.",
    "Each alert comes in two messages: the whale trade, then the contract address on its own, so you can tap it and copy.",
    "Tap Open in ORBIT, and the coin opens right inside Telegram, already signed in. Send slash picks any time for the current Scalp and Hold list.",
    "That's the new ORBIT. Try it free for seven days. Prove it in demo. Then trade with confidence.",
    "Link in bio. Not financial advice.",
]

out = sys.argv[1]
k = Kokoro("/home/user/tts/kokoro-v1.0.onnx", "/home/user/tts/voices-v1.0.bin")
meta = []
for i, text in enumerate(LINES):
    a, sr = k.create(text, voice="am_michael", speed=1.03, lang="en-us")
    f = f"gd_{i:02d}.wav"
    sf.write(f"{out}/{f}", a, sr)
    meta.append({"file": f, "dur": round(len(a) / sr, 2), "text": text})
    print(i, round(len(a) / sr, 2))
json.dump(meta, open(f"{out}/gd_lines.json", "w"), indent=1)
print("total", round(sum(m["dur"] for m in meta), 1))
