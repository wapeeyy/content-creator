// Combined TikTok + Instagram Reels safe zone for 1080x1920.
// TikTok: top ~160 (tabs), right ~140 (like/comment/share), bottom ~480 (caption, music, nav).
// Reels:  top ~220 (header), bottom ~420.
// Take the stricter of the two on every side.
export const SAFE = {
  top: 220,
  bottom: 480,
  left: 60,
  right: 140,
};
export const SAFE_W = 1080 - SAFE.left - SAFE.right; // 880
export const SAFE_BOTTOM_Y = 1920 - SAFE.bottom; // 1440

// Layout bands inside the safe zone (face sits roughly y 480-1300)
export const TITLE_Y = SAFE.top + 30; // 250
export const CAPTION_Y = 1250; // caption block top; stays above 1440
export const CTA_Y = 1060;
