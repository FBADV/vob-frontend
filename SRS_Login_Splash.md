# SRS_Login_Splash.md

## 1. Introduction
This Software Requirements Specification (SRS) defines the functional and non‑functional requirements for the **Virtual Office Brazil (VOB) – Login & Splash** flow.

## 2. Scope
- Splash screen animation showing an Alaskan mountain, a modern office window, fade‑out effect, and overlay login form.
- Login UI with email/username, password, "Entrar", "Esqueci minha senha", and "Primeiro acesso" links.
- First‑access flow with activation‑code validation, user data collection, password creation, and redirection to the dashboard.

## 3. Functional Requirements
### 3.1 Splash Screen
1. **Scene 1 – Mountain**: Full‑screen high‑resolution image of a snow‑covered Alaskan mountain.
2. **Transition 1 – Zoom/Parallax**: Subtle camera zoom or parallax for depth (duration 1.5 s).
3. **Scene 2 – Office Window Reveal**: The mountain becomes visible through a large office window; camera zooms out or fades edges to reveal the window frame (duration 2 s).
4. **Fade‑out**: Mountain view opacity reduces to 60‑70 % (duration 1 s).
5. **Login Overlay**: Central login form fades in over the dimmed scene (duration 0.8 s).
### 3.2 Login Form
- **Fields**: Email/username, password.
- **Buttons/Links**: "Entrar" (primary), "Esqueci minha senha", "Primeiro acesso".
- **Validation**: Client‑side format checks; server‑side authentication via Supabase.
### 3.3 First‑Access Flow
1. User clicks **Primeiro acesso** → navigate to `/first‑access`.
2. Form fields: Nome completo, Nº OAB (UF), Endereço do escritório, CPF, Código de Ativação.
3. **Activation‑code validation** (backend):
   - Verify code exists and is active.
   - Check plan‑user limit, contract period, access level.
   - Ensure CPF not already linked to another active code.
4. On success: Prompt user to create a password, activate account, redirect to dashboard.

## 4. Non‑Functional Requirements
- **Performance**: Splash animation must load ≤ 2 s on 3G.
- **Responsiveness**: UI adapts to mobile (≤ 480 px) and desktop.
- **Accessibility**: WCAG AA compliance (focus order, ARIA labels).
- **Security**: HTTPS, password hashing (bcrypt), rate‑limit login attempts.
- **Branding**: Colors – primary #0A3D62, secondary #1E8449, accent #F1C40F; typography – "Inter" (Google Fonts).

## 5. Dependencies
- **Supabase** for auth & database.
- **Framer Motion** (React) or **Lottie** (Flutter/Next.js) for animation.
- **TailwindCSS** is *not* used – plain CSS with CSS variables.

## 6. Acceptance Criteria
- All animation steps occur in order with specified durations.
- Login form validates inputs and authenticates correctly.
- First‑access validates activation code and creates a new user.
- UI matches the visual mockups (provided separately).

---
*Document version 1.0 – 2025‑11‑24*
