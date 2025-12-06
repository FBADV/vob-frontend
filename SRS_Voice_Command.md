# SRS_Voice_Command.md

## 1. Introduction
This Software Requirements Specification (SRS) defines the functional and non‑functional requirements for the **Voice Command** feature in the Virtual Office Brazil (VOB) application.

## 2. Scope
- A microphone button placed in the header of every module (except Settings).
- Speech‑to‑text conversion using the Web Speech API (fallback to external service if unavailable).
- Command parsing and execution for navigation, creation, search, and financial actions.
- Visual feedback (icon state, tooltip, toast notifications).
- Security: microphone activation only after explicit user click, permission handled by the browser.

## 3. Functional Requirements
### 3.1 UI Elements
1. **Microphone Icon** – placed to the right of the existing header icons (Notifications, New Atendimento, New Cliente, New Processo, New Tarefa, New Agendamento).
   - Default state: outlined microphone.
   - Active state: filled microphone with pulsating animation and optional tooltip "Ouvindo…".
2. **Tooltip / Toast** – brief message showing the recognized command and the action taken.

### 3.2 Voice Interaction Flow
1. User clicks the microphone icon.
2. Browser prompts for microphone permission (first use).
3. Audio stream is captured and sent to the Speech‑to‑Text engine.
4. Recognized text is passed to the **Command Parser**.
5. Parser matches the text against the command dictionary (see Section 4).
6. Corresponding action is dispatched (navigation, modal opening, search, etc.).
7. Microphone stops, icon returns to default state, toast displays result.

### 3.3 Command Dictionary
| Intent | Example Phrase | Action |
|--------|----------------|--------|
| Navigation | "Ir para o dashboard" | Open Dashboard page |
| Navigation | "Abrir meus processos" | Navigate to Processes module |
| Creation | "Novo cliente" | Open New Client modal |
| Search | "Pesquisar jurisprudência sobre licitações" | Open Jurisprudence search with pre‑filled query |
| Finance | "Cadastrar despesa" | Open New Expense modal |
| Complex | "Gerar relatório financeiro do mês" | Trigger report generation service |

### 3.4 Error Handling
- If speech is not recognized, show toast: "Comando não reconhecido, tente novamente."
- If command is recognized but action fails, show toast with error details.

## 4. Non‑Functional Requirements
- **Performance**: Voice activation to command execution ≤ 2 seconds after speech ends.
- **Reliability**: 95 % command recognition accuracy on typical Portuguese speech.
- **Security & Privacy**: Audio never stored; only transiently processed in memory. Permission revocation handled by browser.
- **Accessibility**: Icon must be focusable via keyboard; tooltip also accessible to screen readers.
- **Compatibility**: Works on modern browsers (Chrome, Edge, Safari) and on mobile browsers supporting Web Speech API.

## 5. Architecture Overview
1. **UI Layer** – React component `VoiceButton` (or equivalent in Flutter/Vue).
2. **Speech Service** – Wrapper around `window.SpeechRecognition` (Web Speech API).
3. **Parser Service** – Simple rule‑based parser mapping recognized text to internal actions.
4. **Command Dispatcher** – Calls existing navigation or modal services.
5. **Feedback Service** – Shows toast notifications.

## 6. Dependencies
- **Supabase** – for authentication context.
- **Framer Motion** – for icon animation (React).
- **Lottie** – optional for Flutter animation.
- **Vue 3** – for Vue implementation.

## 7. Acceptance Criteria
- Microphone button appears on all pages except Settings.
- Clicking the button requests permission and shows active animation.
- At least 10 defined commands are correctly recognized and executed.
- Visual feedback appears for success and error cases.
- No audio data is persisted after command execution.

---
*Document version 1.0 – 2025‑11‑24*
