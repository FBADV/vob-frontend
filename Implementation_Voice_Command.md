# Implementation_Voice_Command.md

## Overview
This guide provides step‑by‑step instructions to implement the **Voice Command** feature in three front‑end frameworks used by VOB:
- **React (Vite)**
- **Flutter**
- **Vue 3 (Vite)**

The implementation covers UI components, speech‑to‑text integration, command parsing, action dispatch, and user feedback.

---
### 1. Shared Assets & Design Tokens
Create a shared folder `src/assets/voice/` containing:
- `mic_outline.svg` – default microphone icon.
- `mic_filled.svg` – active microphone icon.
- `pulse.svg` – optional halo for animation.

Add the following CSS variables to your global stylesheet (e.g., `src/index.css`):
```css
:root {
  --voice-icon-color-default: #6C757D; /* secondary */
  --voice-icon-color-active: #0A3D62;  /* primary */
  --voice-pulse-color: #0A3D62;
  --voice-pulse-duration: 1.2s;
  --voice-tooltip-bg: rgba(0,0,0,0.75);
  --voice-tooltip-text: #FFF;
}
```
---
### 2. React (Vite) Implementation
#### 2.1 Component `VoiceButton.tsx`
```tsx
import { useState, useEffect } from "react";
import { supabase } from "../services/supabase"; // auth context if needed
import micOutline from "../assets/voice/mic_outline.svg";
import micFilled from "../assets/voice/mic_filled.svg";
import { toast } from "react-hot-toast"; // or any toast lib

export const VoiceButton = () => {
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("SpeechRecognition API not supported in this browser.");
      return;
    }
    const recognizer = new SpeechRecognition();
    recognizer.lang = "pt-BR";
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;
    recognizer.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      handleCommand(transcript);
    };
    recognizer.onerror = (e) => {
      toast.error(`Voice error: ${e.error}`);
      setListening(false);
    };
    recognizer.onend = () => setListening(false);
    setRecognition(recognizer);
  }, []);

  const startListening = async () => {
    if (!recognition) return;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setListening(true);
      recognition.start();
    } catch (err) {
      toast.error("Microphone permission denied.");
    }
  };

  const handleCommand = (text: string) => {
    // Simple rule‑based parser – expand as needed
    if (text.includes("dashboard")) {
      window.location.href = "/dashboard";
      toast.success("Abrindo Dashboard");
    } else if (text.includes("processos")) {
      window.location.href = "/processes";
      toast.success("Abrindo Processos");
    } else if (text.includes("novo cliente")) {
      // dispatch modal open via context or event bus
      const event = new CustomEvent("open-modal", { detail: { type: "client" } });
      window.dispatchEvent(event);
      toast.success("Abrindo cadastro de cliente");
    } else {
      toast.error("Comando não reconhecido.");
    }
  };

  return (
    <button
      className="voice-btn"
      onClick={startListening}
      aria-label={listening ? "Ouvindo…" : "Comando por voz"}
    >
      <img
        src={listening ? micFilled : micOutline}
        alt="Microphone"
        className={listening ? "pulse" : ""}
      />
    </button>
  );
};
```
Add the following CSS (e.g., `src/components/VoiceButton.css`):
```css
.voice-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.voice-btn img {
  width: 24px;
  height: 24px;
  filter: invert(40%);
}
.voice-btn img.pulse {
  animation: pulse var(--voice-pulse-duration) infinite;
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}
```
Import `VoiceButton` into your header component and place it after the existing icons. Ensure the Settings page conditionally hides it.
---
### 3. Flutter Implementation
#### 3.1 Widget `VoiceButton.dart`
```dart
import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:fluttertoast/fluttertoast.dart';

class VoiceButton extends StatefulWidget {
  const VoiceButton({Key? key}) : super(key: key);

  @override
  _VoiceButtonState createState() => _VoiceButtonState();
}

class _VoiceButtonState extends State<VoiceButton> {
  final stt.SpeechToText _speech = stt.SpeechToText();
  bool _listening = false;

  @override
  void initState() {
    super.initState();
    _speech.initialize();
  }

  void _startListening() async {
    bool available = await _speech.initialize();
    if (!available) {
      Fluttertoast.showToast(msg: "Speech recognition not available");
      return;
    }
    setState(() => _listening = true);
    _speech.listen(
      localeId: "pt_BR",
      onResult: (result) {
        if (result.finalResult) {
          _handleCommand(result.recognizedWords.toLowerCase());
        }
      },
      onError: (err) {
        Fluttertoast.showToast(msg: "Erro: ${err.errorMsg}");
        setState(() => _listening = false);
      },
    );
  }

  void _handleCommand(String text) {
    setState(() => _listening = false);
    _speech.stop();
    if (text.contains("dashboard")) {
      Navigator.pushNamed(context, "/dashboard");
      Fluttertoast.showToast(msg: "Abrindo Dashboard");
    } else if (text.contains("novo cliente")) {
      // open modal – implementation depends on your UI lib
      Fluttertoast.showToast(msg: "Abrindo cadastro de cliente");
    } else {
      Fluttertoast.showToast(msg: "Comando não reconhecido");
    }
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: _listening
          ? const Icon(Icons.mic, color: Color(0xFF0A3D62))
          : const Icon(Icons.mic_none, color: Color(0xFF6C757D)),
      tooltip: _listening ? "Ouvindo…" : "Comando por voz",
      onPressed: _startListening,
    );
  }
}
```
Add the widget to your `AppBar` after other action icons, and hide it on the Settings route.
---
### 4. Vue 3 (Vite) Implementation
#### 4.1 Component `VoiceButton.vue`
```vue
<template>
  <button @click="startListening" :aria-label="listening ? 'Ouvindo…' : 'Comando por voz'" class="voice-btn">
    <img :src="listening ? micFilled : micOutline" :class="{ pulse: listening }" alt="Microphone" />
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import micOutline from '@/assets/voice/mic_outline.svg';
import micFilled from '@/assets/voice/mic_filled.svg';
import { useToast } from 'vue-toastification';

const toast = useToast();
const listening = ref(false);
let recognition: SpeechRecognition | null = null;

onMounted(() => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    toast.error('SpeechRecognition API not supported');
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (e: SpeechRecognitionEvent) => {
    const transcript = e.results[0][0].transcript.trim().toLowerCase();
    handleCommand(transcript);
  };
  recognition.onerror = (e) => {
    toast.error(`Voice error: ${e.error}`);
    listening.value = false;
  };
  recognition.onend = () => (listening.value = false);
});

const startListening = async () => {
  if (!recognition) return;
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    listening.value = true;
    recognition.start();
  } catch {
    toast.error('Microphone permission denied');
  }
};

const handleCommand = (text: string) => {
  if (text.includes('dashboard')) {
    window.location.href = '/dashboard';
    toast.success('Abrindo Dashboard');
  } else if (text.includes('novo cliente')) {
    // emit event to open modal
    const ev = new CustomEvent('open-modal', { detail: { type: 'client' } });
    window.dispatchEvent(ev);
    toast.success('Abrindo cadastro de cliente');
  } else {
    toast.error('Comando não reconhecido');
  }
};
</script>

<style scoped>
.voice-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.voice-btn img {
  width: 24px;
  height: 24px;
}
.pulse {
  animation: pulse var(--voice-pulse-duration) infinite;
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}
</style>
```
Register the component in your header and hide it on the Settings page (`if (route.name !== 'settings')`).
---
### 5. Common Command Parser
For all platforms, keep a simple dictionary mapping Portuguese phrases to internal actions. Expand as needed. Consider moving to a more robust NLP library if the command set grows.
---
### 6. Testing & QA
- Unit‑test the parser functions.
- E2E test the full voice flow using Cypress (mock SpeechRecognition).
- Verify that the microphone icon appears on every page except Settings.
- Ensure no audio is stored; only transient processing.
---
*Document version 1.0 – 2025‑11‑24*
