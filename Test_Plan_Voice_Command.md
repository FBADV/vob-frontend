# Test_Plan_Voice_Command.md

## Scope
Verification of the **Voice Command** feature across the three supported front‑end frameworks (React, Flutter, Vue).

## Test Environment
- Modern browsers: Chrome 124+, Edge 124+, Safari 17+ (desktop & mobile)
- Mobile browsers on Android 13 and iOS 17
- Flutter app running on Android emulator / iOS simulator
- Network: offline, 3G, Wi‑Fi

## Test Cases
| ID | Description | Steps | Expected Result | Pass/Fail |
|----|-------------|-------|-----------------|----------|
| TC‑001 | Icon visibility | Load any page except Settings. | Microphone icon is present in the header, positioned after the last action icon. | |
| TC‑002 | Icon hidden on Settings | Navigate to Settings page. | No microphone icon displayed. | |
| TC‑003 | Permission request | Click the icon for the first time. | Browser prompts for microphone permission. | |
| TC‑004 | Permission denied handling | Deny permission when prompted. | Toast shows error *"Microphone permission denied"* and icon remains in default state. | |
| TC‑005 | Successful command – navigation | Click icon, grant permission, say "Ir para o dashboard". | Toast *"Abrindo Dashboard"* appears, URL changes to `/dashboard`. | |
| TC‑006 | Successful command – create entity | Say "Novo cliente". | Corresponding modal opens, toast *"Abrindo cadastro de cliente"* appears. | |
| TC‑007 | Unrecognized command | Say "Abrir portal" (not in dictionary). | Toast *"Comando não reconhecido"* appears, no navigation occurs. | |
| TC‑008 | Fade‑out after command | After any command, icon returns to default state within 1 s. | Icon animation stops, tooltip disappears. | |
| TC‑009 | Performance | Measure time from end of speech to action execution. | ≤ 2 seconds on 3G. | |
| TC‑010 | No audio persistence | Inspect dev tools/network; ensure no audio blobs are uploaded or stored. | No audio data sent to server. | |

## Acceptance Criteria
- All test cases TC‑001 – TC‑010 must pass.
- Voice button appears on every required page and is fully functional.
- No audio data is retained after command execution.
- The feature works consistently across React, Flutter, and Vue implementations.
- Accessibility: button is focusable via keyboard and has appropriate `aria-label`.

---
*Document version 1.0 – 2025‑11‑24*
