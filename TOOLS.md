# Video editing toolkit (9:16, 1080x1920)

Installed by the `content-creator` cloud environment setup script.

| Tool | Use | Notes |
|---|---|---|
| FFmpeg | cut, scale/crop to 1080x1920, burn subtitles | `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920` |
| HyperFrames | HTML -> MP4 motion graphics | `hyperframes init NAME --resolution portrait` |
| Remotion | React -> MP4 motion graphics | Run with `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt` so it can download its browser |
| Video-Use | conversational editing skill (`~/Developer/video-use`) | grade, timeline_view, pack_transcripts, render |
| faster-whisper | free local transcription | `python tools/transcribe_local.py VIDEO --language ms` |
| yt-dlp | download sources | TikTok works; YouTube needs cookies (`--cookies cookies.txt`) |

`tools/transcribe_local.py` writes Scribe-shaped JSON to `<edit>/transcripts/`, so
Video-Use's helpers work without an ElevenLabs key. To switch to ElevenLabs later,
put `ELEVENLABS_API_KEY` in `~/Developer/video-use/.env` and use its `transcribe.py`.
