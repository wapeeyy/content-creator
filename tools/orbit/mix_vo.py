"""Mix the Michael voice-over (remotion/public/vo) onto the rendered ORBIT videos, ducking the SFX."""
import json, os, subprocess
V = '/home/user/content-creator/remotion/public/vo'; O = '/home/user/content-creator/out/orbit'
m = json.load(open(V + '/lines.json'))
for name, base, T in (("launch", "Launch", "60.0"), ("tutorial", "Tutorial", "72.0")):
    L = m[name]
    for ar in ("9x16", "16x9"):
        for dr in ("HDR", "SDR"):
            src = f"{O}/ORBIT-{base}-{ar}-{dr}.mp4"; out = f"{O}/vo/ORBIT-{base}-{ar}-{dr}-VO.mp4"
            ins = ['-i', src]; parts = []
            for i, l in enumerate(L):
                ins += ['-i', f"{V}/{l['file']}"]; ms = int(l['at'] * 1000)
                parts.append(f"[{i+1}:a]aresample=48000,adelay={ms}|{ms},volume=1.6[v{i}]")
            vo = ''.join(f"[v{i}]" for i in range(len(L)))
            fc = ';'.join(parts) + f";{vo}amix=inputs={len(L)}:normalize=0:duration=longest[vo];[vo]asplit[vo1][vo2];[0:a]aresample=48000,apad,volume=0.8[bg];[bg][vo1]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[duck];[duck][vo2]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5,aresample=48000[a]"
            tag = ['-tag:v', 'hvc1'] if dr == "HDR" else []
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *ins, '-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', *tag,
                            '-c:a', 'aac', '-b:a', '256k', '-t', T, '-movflags', '+faststart', out], check=True)
            print(os.path.basename(out))
