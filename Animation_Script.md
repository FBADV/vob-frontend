# Animation_Script.md

## Overview
The animation consists of four sequential scenes that transition smoothly to introduce the login form.

### Scene 1 – Mountain (0 s – 1.5 s)
- Full‑screen high‑resolution image of a snow‑covered Alaskan mountain.
- Subtle **zoom‑in** (scale 1.0 → 1.05) or **parallax** effect to add depth.
- Duration: **1.5 seconds**.

### Scene 2 – Office Window Reveal (1.5 s – 3.5 s)
- A large, modern office window frame fades in from the edges, revealing the mountain through the glass.
- Camera **zoom‑out** (scale 1.05 → 0.9) or **fade‑out of edges** to transition.
- Duration: **2 seconds**.

### Scene 3 – Fade‑Out Mountain (3.5 s – 4.5 s)
- The mountain view opacity reduces to **60‑70 %** while the window stays fully opaque.
- Optional slight **blur** to emphasize focus shift.
- Duration: **1 second**.

### Scene 4 – Login Overlay (4.5 s – 5.3 s)
- Central login form fades in (opacity 0 → 1) and slides up **8 px** for a subtle entrance.
- Duration: **0.8 seconds**.

## Technical Notes
- **React**: Use **Framer Motion** (`motion.div`) with `animate` and `transition` props.
- **Flutter**: Use **Lottie** JSON exported from After Effects or **AnimatedContainer**.
- **Next.js**: Same as React – Framer Motion or CSS keyframes.
- All assets must be pre‑loaded to avoid jank; consider using `preload` link tags.
- Ensure the total animation size < 2 MB for fast mobile load.

---
*Document version 1.0 – 2025‑11‑24*
