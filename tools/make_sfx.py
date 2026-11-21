"""Generate royalty-free sound effects procedurally (no downloads, no API).

Usage: python tools/make_sfx.py OUT_DIR
Writes whoosh.wav, pop.wav, ding.wav, impact.wav, swipe.wav, click.wav, riser.wav
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
    for name, fn in dict(whoosh=whoosh, swipe=swipe, pop=pop, click=click,
                         ding=ding, impact=impact, riser=riser).items():
        write(out / f"{name}.wav", fn())
        print("wrote", out / f"{name}.wav")
