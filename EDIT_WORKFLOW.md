# Template edit video TikTok

## Cara guna (untuk kau)

1. Hantar link video (Google Drive / TikTok) kepada Claude.
2. Claude transkrip dan bagi **2–3 pilihan hook** + tanya ejaan perkataan yang tak pasti.
3. Kau pilih hook.
4. Claude render dan hantar:
   - `<projek>_tiktok.mp4` (~45 MB, sedia upload dari phone)
   - `cover.png` (pilih masa upload: **Edit cover → Upload** / pilih gambar)

## Apa yang template buat secara automatik

| Bahagian | Apa berlaku |
|---|---|
| **Hook** | Ayat paling kuat dimainkan dulu (cold open) + teks hook besar + sticker + tag merah dari frame pertama, kemudian kilatan putih masuk cerita |
| **Potongan** | Salam/intro lambat dibuang, jeda > 0.5 s dipendekkan, sudut kamera bertukar setiap potongan |
| **Colour grade** | `warm_punch`: kulit lebih hangat, gambar lebih tajam (pilihan lain: `clean_bright`, `moody`, `none`) |
| **Caption** | 1–3 perkataan, perkataan semasa kuning |
| **Grafik** | Kad bernombor, banner, ringkasan, stamp, sticker, butang komen |
| **SFX ikut situasi** | 24 bunyi — lucu, salah, betul, drama, pendedahan, senarai, komen, peralihan (tak berulang berturut) |
| **Suara** | Buang dengung, compressor, kelantangan -14 LUFS |
| **Bar progres** | Garisan kuning di bawah, tunjuk berapa lama lagi |
| **Loop ending** | Tamat terus selepas ayat penutup, frame akhir melarut ke frame pertama — penonton tak sedar video berulang |
| **Cover** | Gambar PNG dengan tajuk besar di tengah (selamat untuk grid profil) |
| **Safe zone** | Semua teks dalam kawasan selamat TikTok + IG |

## Arahan teknikal

```bash
python tools/prep_source.py <projek> "<link atau fail>" [--grade warm_punch]
# tulis projects/<projek>/video.json  (contoh: projects/kepamist/video.json, rujukan medan: CLAUDE.md)
tools/render_video.sh <projek> --preview   # gambar pegun + safe zone + cover
tools/render_video.sh <projek> --hook      # 12 s pertama sahaja
tools/render_video.sh <projek>             # video penuh -> out/<projek>/
```

Fail penting:

```
tools/prep_source.py            muat turun + 9:16 + colour grade + transkrip
tools/build_edit.py             video.json -> cut.mp4 + data Remotion
tools/render_video.sh           render + kelantangan + versi phone + cover
tools/make_sfx.py               jana 24 SFX (bebas hak cipta)
tools/transcribe_local.py       Whisper tempatan (percuma)
remotion/src/Main.tsx           susun video daripada data
remotion/src/Cover.tsx          gambar cover
remotion/src/template/          gaya tetap: theme, safe zone, komponen, sticker, SFX
projects/<projek>/video.json    tetapan satu video
```

Dengar semua SFX: `out/sfx_demo.mp4` (jana semula dengan `python tools/make_sfx.py remotion/public/sfx`).
