// Brand look shared by every video. Change here = every future video changes.
export const C = {
  yellow: "#FFE14D",
  red: "#FF3B30",
  green: "#8BC34A",
  purple: "#9C27B0",
  blue: "#2F80ED",
  ink: "#111111",
  white: "#FFFFFF",
};

export const colorOf = (name?: string) => (name && name in C ? C[name as keyof typeof C] : name) ?? C.yellow;

export const FPS = 30;
export const f = (s: number) => Math.round(s * FPS);

export const stroke = (px: number, color = C.ink) => ({
  WebkitTextStroke: `${px}px ${color}`,
  paintOrder: "stroke fill" as const,
});

// Words that get the yellow "hot" emphasis in captions (per-video words can be added in video.json -> hotWords)
export const BASE_HOT = ["tinggalkan", "punca", "jangan", "wajib", "rahsia", "penting", "bahaya", "terbaik", "free", "percuma"];
