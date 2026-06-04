# KEVA — AI Voice Receptionist

**Dr. Keshav's Skin Hair & Aesthetics Hospital**

An AI-powered voice receptionist prototype built with React, Groq (Whisper + LLama 3.3), and Web Speech API.

---

## Setup (3 Steps)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure API key
```bash
cp .env.example .env
# Edit .env and add your Groq API key
```

### 3. Run the app
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Deploy to Netlify

```bash
npm run build
# Upload the `dist` folder to Netlify, or connect your Git repo
```

The included `netlify.toml` handles build configuration automatically.

---

## Features

- **Voice Interface** — Click mic to speak, KEVA responds via text + speech
- **Text Fallback** — Type messages for silent interaction
- **Appointment Booking** — Conversational booking flow with localStorage persistence
- **Reschedule / Cancel** — Manage existing appointments by ID
- **Admin Dashboard** — View all appointments with status filters
- **Lead Capture** — Auto-saves contact details from conversations

## Tech Stack

React 18 · TypeScript · Vite · Tailwind CSS · Groq API (Whisper + LLama 3.3) · Web Speech API · localStorage
