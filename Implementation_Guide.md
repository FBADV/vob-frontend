# Implementation_Guide.md

## Overview
This guide provides step‑by‑step instructions to implement the **Virtual Office Brazil (VOB) – Login & Splash** flow in three popular frameworks:
- **React (Vite)**
- **Flutter**
- **Next.js**

The goal is to achieve a consistent look‑and‑feel, animation timing, and functional behavior across all platforms.

---
### 1. Common Assets
- **Images**: `mountain.jpg` (high‑res), `office_window.png` (transparent PNG).
- **Colors**: Primary `#0A3D62`, Secondary `#1E8449`, Accent `#F1C40F`.
- **Typography**: Google Font **Inter** (weights 400, 500, 600).
- **Animation Timing** (seconds):
  - Scene 1 zoom/parallax: **1.5**
  - Scene 2 window reveal: **2**
  - Fade‑out mountain: **1**
  - Login overlay fade‑in: **0.8**

---
### 2. React (Vite) Implementation
#### 2.1 Project Setup
```bash
npm create vite@latest vob-login -- --template react-ts
cd vob-login
npm install
npm install framer-motion supabase-js
```
Add Inter font in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```
#### 2.2 Folder Structure
```
src/
 ├─ assets/          # images
 ├─ components/
 │   ├─ Splash.tsx   # animation component
 │   ├─ LoginForm.tsx
 │   └─ FirstAccessForm.tsx
 ├─ services/
 │   └─ auth.ts      # Supabase wrapper
 └─ App.tsx
```
#### 2.3 Splash Component (Framer Motion)
```tsx
import { motion } from "framer-motion";
import mountain from "../assets/mountain.jpg";
import windowImg from "../assets/office_window.png";

export const Splash = () => (
  <motion.div className="splash" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    {/* Scene 1 */}
    <motion.img src={mountain} alt="Mountain" className="scene1"
      animate={{ scale: [1, 1.05] }} transition={{ duration: 1.5 }} />
    {/* Scene 2 */}
    <motion.img src={windowImg} alt="Window" className="scene2"
      initial={{ opacity: 0 }} animate={{ opacity: 1, scale: [1.05, 0.9] }}
      transition={{ delay: 1.5, duration: 2 }} />
    {/* Scene 3 */}
    <motion.div className="fade"
      initial={{ opacity: 1 }} animate={{ opacity: 0.65 }}
      transition={{ delay: 3.5, duration: 1 }} />
    {/* Login overlay */}
    <motion.div className="loginOverlay"
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 4.5, duration: 0.8 }}>
      <LoginForm />
    </motion.div>
  </motion.div>
);
```
Add CSS variables for colors and fonts in `src/index.css`.
#### 2.4 Auth Service (Supabase)
```ts
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};
```
#### 2.5 First‑Access Flow
Create `/first-access` route, reuse `FirstAccessForm` component, call backend endpoint `/api/activate` (see Flutter/Next.js sections for API contract).

---
### 3. Flutter Implementation
#### 3.1 Project Setup
```bash
flutter create vob_login
cd vob_login
flutter pub add supabase_flutter lottie
```
Add Inter font in `pubspec.yaml` and assets.
#### 3.2 Folder Structure
```
lib/
 ├─ assets/
 │   ├─ mountain.jpg
 │   └─ office_window.png
 ├─ widgets/
 │   ├─ splash.dart
 │   ├─ login_form.dart
 │   └─ first_access_form.dart
 └─ main.dart
```
#### 3.3 Splash Widget (Lottie or AnimatedContainer)
```dart
class Splash extends StatefulWidget {
  @override
  _SplashState createState() => _SplashState();
}

class _SplashState extends State<Splash> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(seconds: 6))..forward();
  }
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Scene 1 – mountain zoom
        ScaleTransition(
          scale: Tween(begin: 1.0, end: 1.05).animate(CurvedAnimation(parent: _ctrl, curve: const Interval(0.0, 0.25))),
          child: Image.asset('assets/mountain.jpg', fit: BoxFit.cover, width: double.infinity, height: double.infinity),
        ),
        // Scene 2 – window reveal
        FadeTransition(
          opacity: Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _ctrl, curve: const Interval(0.25, 0.58))),
          child: Image.asset('assets/office_window.png', fit: BoxFit.cover),
        ),
        // Fade‑out mountain
        FadeTransition(
          opacity: Tween(begin: 1.0, end: 0.65).animate(CurvedAnimation(parent: _ctrl, curve: const Interval(0.58, 0.75))),
          child: Container(color: Colors.black.withOpacity(0.0)), // overlay handled by opacity
        ),
        // Login overlay
        FadeTransition(
          opacity: Tween(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _ctrl, curve: const Interval(0.75, 0.92))),
          child: const LoginForm(),
        ),
      ],
    );
  }
}
```
#### 3.4 Supabase Auth
Initialize in `main.dart`:
```dart
await Supabase.initialize(url: const String.fromEnvironment('SUPABASE_URL'),
    anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY'));
```
Use `supabase.auth.signIn` similar to the React example.
#### 3.5 First‑Access API
Call a REST endpoint `/api/activate` (same contract as React) via `http` package.

---
### 4. Next.js Implementation
#### 4.1 Project Setup
```bash
npx create-next-app@latest vob-login --ts
cd vob-login
npm install framer-motion @supabase/supabase-js
```
Add Inter font in `_app.tsx` using `next/font/google`.
#### 4.2 Pages Structure
```
pages/
 ├─ index.tsx          # splash + login
 ├─ first-access.tsx   # first‑access form
 └─ api/
     └─ activate.ts    # backend validation (Node)
components/
 ├─ Splash.tsx
 ├─ LoginForm.tsx
 └─ FirstAccessForm.tsx
```
#### 4.3 Splash Component
Same as React version; reuse the `motion` code.
#### 4.4 API Route (`pages/api/activate.ts`)
```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { code, cpf } = req.body;
  // Validate code – pseudo‑logic
  const { data, error } = await supabase.from('activation_codes').select('*').eq('code', code).single();
  if (error || !data) return res.status(400).json({ error: 'Invalid code' });
  // Additional checks (plan limits, period, cpf) omitted for brevity
  res.status(200).json({ ok: true, plan: data.plan });
}
```
#### 4.5 First‑Access Form
Submit to `/api/activate`, then on success show password creation UI.

---
## 5. Testing & Verification
- **Unit tests**: Verify that the activation endpoint returns proper errors for invalid codes.
- **E2E**: Use Cypress (React/Next) or integration tests for Flutter to ensure the splash sequence runs without jank.
- **Performance**: Measure first‑contentful‑paint < 2 s on 3G.

---
*Document version 1.0 – 2025‑11‑24*
