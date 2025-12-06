# Figma_Prototype_Description.md

## Overview
This document outlines the components, layout, color palette, typography, and interaction notes required to build a high‑fidelity Figma prototype for the **VOB – Login & Splash** experience.

## 1. Pages / Frames
- **Splash Screen** – Full‑screen frame (1920 × 1080) showing the mountain animation placeholder.
- **Login Overlay** – Centered login form overlay on top of the splash background.
- **First‑Access Form** – Separate frame linked from the "Primeiro acesso" link.

## 2. Layout & Grid
- 12‑column grid, 8 px gutter, 24 px margins.
- Login form width: 360 px (mobile) → 420 px (desktop).
- Vertical spacing between fields: 16 px.

## 3. Color Palette (Branding)
| Role | Hex |
|------|-----|
| Primary | #0A3D62 |
| Secondary | #1E8449 |
| Accent | #F1C40F |
| Background (dark) | #F5F7FA |
| Text (primary) | #212529 |
| Text (secondary) | #6C757D |

## 4. Typography
- **Font Family**: *Inter* – Google Fonts (weights 400, 500, 600).
- **Headings**: 24 px, weight 600.
- **Labels / Inputs**: 16 px, weight 400.
- **Buttons**: 16 px, weight 500, uppercase.

## 5. Components
- **Input Field** – Rounded rectangle (4 px radius), border #CED4DA, focus border #0A3D62.
- **Primary Button** – Background #0A3D62, white text, hover darken 10%.
- **Link Text** – Color #1E8449, underline on hover.
- **Error Message** – Red #E74C3C, 14 px.

## 6. Interaction Notes
- **Hover**: Buttons and links change opacity (0.9).
- **Focus**: Input outlines animate to primary color.
- **Form Validation**: Inline error messages appear below each field.
- **Animation Placeholder**: Use a rectangle with a “video placeholder” overlay to indicate where the splash animation will be.

## 7. Assets
- Provide the mountain image (high‑res PNG) and office window mockup as separate layers.
- Export icons (eye‑toggle for password) as SVG.

## 8. Export Settings
- Export frames as PDF for stakeholder review.
- Export individual components as SVG for developers.

---
*Document version 1.0 – 2025‑11‑24*
