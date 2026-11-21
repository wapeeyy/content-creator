# content-creator — panduan untuk Claude

Repo ni untuk edit video TikTok (9:16, 1080x1920) pemilik repo. Bahasa: Melayu santai.
Platform sekarang: **TikTok sahaja** (IG/YouTube belum — jangan buat SRT/setup IG/YT kecuali diminta).

## Aliran kerja setiap video baru

1. `python tools/prep_source.py <projek> "<link Drive / TikTok / fail>"`
   - muat turun, tukar ke 1080x1920 30fps, colour grade `warm_punch` (lalai), transkrip Whisper `medium` (ms)
   - baca `projects/<projek>/takes_packed.md` untuk faham isi
2. **Tanya pengguna dulu** sebelum render, dalam satu mesej:
   - 2–3 pilihan **hook** (ayat cold open + teks hook). Hook = ayat paling kuat/kontroversi/lucu dari video.
   - ejaan istilah/slang yang Whisper tak pasti
3. Tulis `projects/<projek>/video.json` (contoh lengkap: `projects/kepamist/video.json`).
4. `tools/render_video.sh <projek> --preview` → semak gambar pegun (safe zone merah mesti kosong) + `cover.png`
5. `tools/render_video.sh <projek>` → `out/<projek>/final.mp4`, `<projek>_tiktok.mp4` (~45 MB untuk phone), `cover.png`
6. Hantar `<projek>_tiktok.mp4` + `cover.png` dengan SendUserFile (pengguna guna app phone — fail besar gagal dimuat turun).
7. Commit `projects/<projek>/video.json` + transkrip. Video/mp4 tak masuk git.

## Gaya rumah (template) — kekalkan konsisten

- **Hook 0–3 s**: cold open ayat terkuat → teks hook (2 baris: kecil putih + besar kuning) + sticker + tag merah. Frame pertama mesti sudah ada teks (tiada frame kosong). Kilatan putih + whoosh berat bila masuk cerita.
- Potong salam/intro yang lambat (`cut`). Potong jeda > 0.5 s.
- **Loop ending**: tamat sejurus selepas ayat penutup yang kuat (`loop.endAfter`), tiada "ciao/end card" — frame akhir melarut ke frame 0.
- Caption 1–3 perkataan, Montserrat 900 huruf besar, perkataan semasa kuning, y=1250.
- Kad tajuk/banner di atas (y≈250), stamp di tengah, CTA komen y≈1060.
- Bar progres kuning nipis di bawah safe zone.
- Warna: kuning #FFE14D, merah #FF3B30, hijau #8BC34A, hitam #111 (`remotion/src/template/theme.ts`).
- Safe zone TikTok+IG: atas 220, bawah 480, kiri 60, kanan 140 (`template/safe.ts`). Semua teks/grafik mesti di dalam.
- **SFX ikut situasi** (`template/sfx.ts`), jangan ulang bunyi sama berturut:
  lucu → boing/scratch/boom · salah → buzzer · betul → chime/sparkle · drama/amaran → heartbeat/drone ·
  pendedahan → reveal (riser+impact) · hentakan → impact/bassdrop · senarai → tick · komen → notif · peralihan → whoosh/swipe
- Sticker: `template/stickers.tsx` (redflag, matcha, trend, hijab, question, check, cross, fire, eyes, heart, brokenheart,
  warning, laugh, thinking, ring, house, shield, wave, comment, follow, money, clock). Meme sebenar: letak PNG di
  `remotion/public/stickers/` dan guna `"img:nama.png"`.
- Tiada muzik latar (pengguna tak mahu).
- **Animasi app**: bila pengguna sebut buka/guna Threads, TikTok, X/Twitter atau Instagram (prep_source.py senaraikan
  "app mentions"), WAJIB cadang overlay `app`: telefon naik → splash app → taip ayat yang disebut (bunyi keytap) →
  tekan Post/Cari → notifikasi. `at` = bila sebut nama app; `typeStart`/`typeEnd` = perkataan pertama/akhir ayat yang ditaip
  supaya taipan selari dengan suara. Ikon/skrin ialah lukisan gaya serupa, bukan logo rasmi.
  Demo semua app: komposisi `AppDemo` (`remotion/src/AppDemo.tsx`).

## video.json — jenis overlay

Rujukan masa guna perkataan: `["perkataan", n]` atau `["perkataan", n, offsetSaat]` (n = kejadian ke-n, mula 0).

| type | medan |
|---|---|
| `title` | `at`, `until`, `n`, `title`, `sticker`, `color` — kad bernombor di atas |
| `banner` | `at`, `until`, `text`, `style` (white/yellow/green/red/blue/warning), `sticker` |
| `recap` | `at`, `until`, `title`, `items[]`, `mark` |
| `stamp` | `at`, `text`, `color`, `dur`, `shake`, `rotate` — cop besar tengah + zoom |
| `sticker` | `at`, `sticker`, `pos` (left/right/center/low), `size`, `text`, `shake`, `dur` |
| `cta` | `at`, `text`, `sticker` (comment/follow) |
| `zoom` | `at`, `dur`, `amount`, `shake` |
| `end` | `at`, `text`, `sticker` (hanya jika tiada loop) |
| `app` | `at`, `app` (threads/x/instagram/tiktok), `text` (ayat ditaip), `action` (post/search; tiktok lalai search), `typeStart`/`typeEnd` (ref, pilihan), `cps`, `until`, `name`, `handle` |

Mana-mana overlay boleh ada `"mood"` untuk tukar SFX (atau `"none"`). `sfx: [{"at": ref, "mood": "..."}]` untuk bunyi tambahan.

## Persekitaran

- Remotion perlukan `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt` (skrip render dah set).
- Fon tempatan di `remotion/public/fonts` (Chrome Remotion tak percaya sijil proxy untuk Google Fonts).
- YouTube sekat IP cloud (perlu cookies); TikTok & Google Drive OK.
- Transkrip: Whisper tempatan percuma. ElevenLabs hanya jika pengguna bagi API key.
