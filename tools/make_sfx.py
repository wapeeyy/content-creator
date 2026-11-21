"""Generate royalty-free sound effects procedurally (no downloads, no API).

Usage: python tools/make_sfx.py OUT_DIR
Writes the SFX library (see SFX_MOODS in remotion/src/template/sfx.ts for how they are used)
"""

import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, a=0.005, r=None, curve=4.0):
    x = np.ones(n)
    na = max(1, int(SR * a))
    x[:na] = np.linspace(0, 1, na)
    tail = np.linspace(1, 0, n - na) ** curve if r is None else np.exp(-np.arange(n - na) / (SR * r))
    x[na:] *= tail
    return x


def lowpass(x, cutoff):
    # one-pole, cutoff may be an array (sweep)
    cutoff = np.broadcast_to(cutoff, x.shape)
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    prev = 0.0
    for i in range(len(x)):
        prev = (1 - a[i]) * x[i] + a[i] * prev
        y[i] = prev
    return y


def norm(x, peak=0.8):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def whoosh(d=0.45):
    n = int(SR * d)
    noise = rng.standard_normal(n)
    sweep = np.concatenate([np.geomspace(300, 6000, n // 2), np.geomspace(6000, 400, n - n // 2)])
    x = lowpass(noise, sweep) - lowpass(noise, sweep * 0.25)
    shape = np.sin(np.linspace(0, np.pi, n)) ** 2
    return norm(x * shape, 0.6)


def swipe(d=0.22):
    n = int(SR * d)
    x = lowpass(rng.standard_normal(n), np.geomspace(8000, 1500, n))
    return norm(x * env(n, 0.01, curve=2), 0.5)


def pop(d=0.12):
    tt = t(d)
    f = 900 * np.exp(-tt * 30) + 250
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return norm(x * env(len(tt), 0.002, curve=3), 0.8)


def click(d=0.05):
    tt = t(d)
    x = np.sin(2 * np.pi * 2200 * tt) * np.exp(-tt * 120)
    return norm(x, 0.6)


def ding(d=1.2):
    tt = t(d)
    x = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * k)
            for f, a, k in [(1320, 1, 3), (2640, .4, 5), (3960, .2, 7), (1980, .25, 4)])
    return norm(x * env(len(tt), 0.002, r=10), 0.55)


def impact(d=1.0):
    tt = t(d)
    f = 120 * np.exp(-tt * 6) + 40
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 4)
    crack = lowpass(rng.standard_normal(len(tt)), 3000) * np.exp(-tt * 25)
    return norm(np.tanh(2.5 * (body + 0.5 * crack)), 0.9)


def riser(d=1.0):
    n = int(SR * d)
    tt = t(d)
    tone = np.sin(2 * np.pi * np.cumsum(np.geomspace(200, 1200, n)) / SR)
    noise = lowpass(rng.standard_normal(n), np.geomspace(500, 8000, n))
    shape = np.linspace(0, 1, n) ** 2
    shape[-int(SR * 0.02):] *= np.linspace(1, 0, int(SR * 0.02))
    return norm((0.4 * tone + noise) * shape, 0.5)


def tone(freq, d, kind="sine"):
    tt = t(d)
    ph = 2 * np.pi * np.cumsum(np.broadcast_to(freq, tt.shape)) / SR
    if kind == "square":
        return np.sign(np.sin(ph))
    if kind == "saw":
        return 2 * ((ph / (2 * np.pi)) % 1) - 1
    return np.sin(ph)


def whoosh_fast():
    return whoosh(0.25)


def whoosh_heavy():
    n = int(SR * 0.8)
    noise = rng.standard_normal(n)
    sweep = np.concatenate([np.geomspace(120, 2500, n // 2), np.geomspace(2500, 150, n - n // 2)])
    x = lowpass(noise, sweep)
    sub = tone(np.geomspace(90, 45, n), 0.8) * 0.6
    return norm((x + sub) * np.sin(np.linspace(0, np.pi, n)) ** 1.5, 0.7)


def pop2():  # bubble pop, higher
    tt = t(0.09)
    f = 1800 * np.exp(-tt * 45) + 500
    return norm(tone(f, 0.09) * env(len(tt), 0.001, curve=3), 0.7)


def boing():
    d = 0.7
    tt = t(d)
    f = 180 + 120 * np.exp(-tt * 3) * np.sin(2 * np.pi * 9 * tt) + 80 * np.exp(-tt * 2)
    return norm(tone(f, d) * np.exp(-tt * 4), 0.7)


def scratch():
    d = 0.55
    tt = t(d)
    rate = np.sin(2 * np.pi * 3.2 * tt)  # forward/back motion
    noise = rng.standard_normal(len(tt))
    x = lowpass(noise, 600 + 3500 * np.abs(rate)) * np.abs(rate)
    x += 0.4 * tone(250 + 400 * np.abs(rate), d, "saw") * np.abs(rate)
    return norm(x * env(len(tt), 0.005, curve=1.5), 0.7)


def boom():  # meme-style deep bass hit
    d = 1.6
    tt = t(d)
    f = 70 * np.exp(-tt * 1.5) + 38
    x = np.tanh(3 * tone(f, d) * np.exp(-tt * 2.2))
    return norm(x, 0.95)


def buzzer():
    d = 0.6
    x = tone(140, d, "square") + tone(147, d, "square")
    x = lowpass(x, 2500)
    return norm(x * env(int(SR * d), 0.005, curve=0.6), 0.45)


def chime():
    a = tone(1046.5, 0.9) * np.exp(-t(0.9) * 4)
    b = tone(1318.5, 0.9) * np.exp(-t(0.9) * 4)
    x = np.zeros(int(SR * 1.05))
    x[: len(a)] += a
    off = int(SR * 0.12)
    x[off: off + len(b)] += b
    return norm(x, 0.5)


def sparkle():
    d = 1.0
    x = np.zeros(int(SR * d))
    for i in range(14):
        st = int(SR * (i * 0.05 + rng.uniform(0, 0.02)))
        f = rng.uniform(2500, 6000)
        bl = tone(f, 0.25) * np.exp(-t(0.25) * 18)
        x[st: st + len(bl)] += bl[: len(x) - st] * (1 - i / 16)
    return norm(x, 0.4)


def heartbeat():
    d = 1.6
    x = np.zeros(int(SR * d))
    for st, g in [(0.0, 1), (0.22, 0.7), (0.8, 1), (1.02, 0.7)]:
        bt = tone(55 * np.exp(-t(0.25) * 3) + 30, 0.25) * np.exp(-t(0.25) * 14) * g
        i = int(SR * st)
        x[i: i + len(bt)] += bt
    return norm(np.tanh(2 * x), 0.9)


def drone():
    d = 2.5
    x = tone(55, d, "saw") + tone(55.6, d, "saw") + 0.5 * tone(82.4, d, "saw")
    x = lowpass(x, np.geomspace(200, 900, int(SR * d)))
    shape = np.minimum(np.linspace(0, 1, len(x)) * 3, 1) * np.minimum(np.linspace(1, 0, len(x)) * 4, 1)
    return norm(x * shape, 0.45)


def glitch():
    d = 0.45
    n = int(SR * d)
    x = np.zeros(n)
    i = 0
    while i < n:
        ln = int(SR * rng.uniform(0.01, 0.05))
        kind = rng.integers(3)
        seg = (rng.standard_normal(ln) if kind == 0 else tone(rng.uniform(200, 2000), ln / SR, "square"))
        if kind == 2:
            seg = np.zeros(ln)
        x[i: i + ln] = seg[: n - i]
        i += ln
    x = np.round(x * 6) / 6  # bitcrush
    return norm(x, 0.4)


def bassdrop():
    d = 1.4
    tt = t(d)
    f = np.geomspace(140, 32, len(tt))
    x = np.tanh(2.5 * tone(f, d)) * np.exp(-tt * 1.6)
    return norm(x, 0.9)


def tick():
    tt = t(0.03)
    return norm(lowpass(rng.standard_normal(len(tt)), 6000) * np.exp(-tt * 300), 0.6)


def typewriter():
    x = np.zeros(int(SR * 0.6))
    for k in range(6):
        c = tick()
        i = int(SR * (k * 0.09 + rng.uniform(0, 0.02)))
        x[i: i + len(c)] += c * rng.uniform(0.6, 1)
    return norm(x, 0.6)


def shutter():
    x = np.zeros(int(SR * 0.25))
    for st in (0.0, 0.08):
        n = int(SR * 0.05)
        c = lowpass(rng.standard_normal(n), 4000) * np.exp(-np.arange(n) / (SR * 0.01))
        i = int(SR * st)
        x[i: i + n] += c
    return norm(x, 0.7)


def notif():
    a = tone(1568, 0.25) * np.exp(-t(0.25) * 10)
    b = tone(2093, 0.4) * np.exp(-t(0.4) * 8)
    x = np.zeros(int(SR * 0.55))
    x[: len(a)] += a
    off = int(SR * 0.11)
    x[off: off + len(b)] += b
    return norm(x, 0.55)


def write(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    stereo = np.repeat(pcm[:, None], 2, axis=1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(stereo.tobytes())


if __name__ == "__main__":
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "sfx")
    out.mkdir(parents=True, exist_ok=True)
    for name, fn in dict(whoosh=whoosh, whoosh_fast=whoosh_fast, whoosh_heavy=whoosh_heavy, swipe=swipe,
                         pop=pop, pop2=pop2, click=click, ding=ding, impact=impact, riser=riser,
                         boing=boing, scratch=scratch, boom=boom, buzzer=buzzer, chime=chime,
                         sparkle=sparkle, heartbeat=heartbeat, drone=drone, glitch=glitch,
                         bassdrop=bassdrop, tick=tick, typewriter=typewriter, shutter=shutter,
                         notif=notif).items():
        write(out / f"{name}.wav", fn())
        print("wrote", out / f"{name}.wav")
