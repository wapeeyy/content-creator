# Workflow edit video KEPAMIST (Remotion)

Semua langkah yang digunakan untuk hasilkan `out/final.mp4`.

## Struktur

```
tools/transcribe_local.py   Transkrip percuma (faster-whisper), format sama macam ElevenLabs Scribe
tools/build_edit.py         Betulkan ejaan, potong jeda senyap, kira masa anchor, hasilkan cut.mp4 + edit.json
tools/make_sfx.py           Jana sound effect sendiri (whoosh, pop, swipe, click, ding, impact, riser)
remotion/src/Main.tsx       Komposisi: zoom, caption, kad tajuk, stamp, CTA, end card, SFX
remotion/src/safe.ts        Safe zone TikTok + IG Reels (atas 220, bawah 480, kiri 60, kanan 140)
remotion/src/fonts.ts       Fon tempatan (Anton, Montserrat) dari remotion/public/fonts
remotion/src/Root.tsx       Komposisi 1080x1920 @ 30fps
remotion/src/data/edit.json Data dijana build_edit.py (perkataan, segmen, anchor)
```

## Langkah

```bash
# 0. Muat turun video (Google Drive)
pip install gdown
gdown <FILE_ID> -O raw/

# 1. Tukar ke 1080x1920 H.264 (iPhone HEVC -> H.264, potret)
mkdir -p edit
ffmpeg -i raw/IMG_8576.MOV -map 0:v:0 -map 0:a:0 \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30" \
  -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 \
  -movflags +faststart edit/source.mp4

# 2. Transkrip (model medium, Bahasa Melayu)
python tools/transcribe_local.py edit/source.mp4 --edit-dir edit/medium --model medium --language ms

# 3. Potong jeda + data caption/anchor -> remotion/public/cut.mp4, remotion/src/data/edit.json
python tools/build_edit.py

# 4. Sound effect -> remotion/public/sfx/*.wav
python tools/make_sfx.py remotion/public/sfx

# 5. Render Remotion
cd remotion
npm install
export NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt   # hanya dalam cloud session ni
npx remotion studio src/index.ts                                          # preview (pilihan)
npx remotion still src/index.ts Main check.png --frame=30 --props='{"showSafeZone":true}'  # semak safe zone
npx remotion render src/index.ts Main ../out/remotion_raw.mp4 --crf=18
cd ..

# 6. Seragamkan kelantangan (-14 LUFS)
ffmpeg -i out/remotion_raw.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart out/final.mp4

# 7. Versi kecil untuk phone (~47 MB)
ffmpeg -i out/final.mp4 -c:v libx264 -preset slow -crf 23 -maxrate 3.5M -bufsize 7M \
  -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart out/KEPAMIST_tiktok.mp4
```

## Nak ubah apa?

| Nak ubah | Di mana |
|---|---|
| Ejaan salah dalam caption | `FIX` dalam `tools/build_edit.py`, kemudian jalankan semula langkah 3 |
| Panjang jeda yang dipotong | `MAX_GAP`, `PAD_BEFORE`, `PAD_AFTER` dalam `tools/build_edit.py` |
| Bila grafik muncul | `ANCHORS` dalam `tools/build_edit.py` (perkataan pencetus) |
| Teks / warna grafik | `Main.tsx` (pemalar `YELLOW`, `RED`, `MATCHA`, dan komponen `<TopBand>`) |
| Saiz / kedudukan caption | `Captions` dalam `Main.tsx`, `CAPTION_Y` dalam `safe.ts` |
| Sound effect & kelantangan | senarai `SFX` dalam `Main.tsx` |
