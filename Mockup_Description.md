# Mockup_Description.md

## Microphone Button Mockup

- **Placement**: Header, to the right of existing icons (Notifications, New Atendimento, New Cliente, New Processo, New Tarefa, New Agendamento).
- **Icon**: Simple line‑style microphone.
  - *Default state*: outlined microphone (`<svg>` with stroke only).
  - *Active state*: filled microphone with a subtle pulsating halo (scale 1 → 1.2 → 1, opacity 0.8 → 1 → 0.8) to indicate listening.
- **Tooltip**: When active, a small tooltip appears below the icon with the text **"Ouvindo…"** in the secondary brand color.
- **Interaction**:
  1. Hover – icon changes to primary color (`#0A3D62`).
  2. Click – triggers the listening animation and opens the browser permission dialog if needed.
  3. After command execution – animation stops, tooltip fades out.

## Visual Design Tokens (to be added to the design system)
| Token | Value |
|-------|-------|
| `--icon-color-default` | `#6C757D` |
| `--icon-color-active` | `#0A3D62` |
| `--tooltip-bg` | `rgba(0, 0, 0, 0.75)` |
| `--tooltip-text` | `#FFFFFF` |
| `--pulse-color` | `#0A3D62` |
| `--pulse-duration` | `1.2s` |

## Figma Instructions
- Create a **Component** named `VoiceButton`.
- Add two **Variants**: `Default` and `Listening`.
- In the `Listening` variant, add a **Auto‑Layout** circle behind the microphone icon with the pulsating effect (use Figma's smart animate on prototype).
- Attach a **Prototype Interaction**: on click → toggle variant → after 2 s → back to `Default`.
- Add a **Text Layer** for the tooltip, set its visibility to `Hidden` in the `Default` variant and `Visible` in `Listening`.
- Export the component as SVG for the web implementation.

---
*Document version 1.0 – 2025‑11‑24*
