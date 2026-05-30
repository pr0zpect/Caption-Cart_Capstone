# CaptionCraft AI 🎨✨

> Turn any image into viral social media captions — powered by **Microsoft Florence-2** (vision) + **Zephyr-7b** (language).

## Pipeline

```
User uploads image
       ↓
Florence-2 (microsoft/Florence-2-base)
  → Detailed image description
       ↓
Zephyr-7b (HuggingFaceH4/zephyr-7b-beta)
  → 3 styled captions per platform & tone
       ↓
Display + one-click copy
```

## Features

- 📸 Drag-and-drop image upload
- 📱 Platform selector: Instagram, Twitter/X, LinkedIn, Facebook, TikTok
- 🎭 Tone selector: Casual, Funny, Professional, Sarcastic, Inspirational, Aesthetic
- 💬 Optional extra context box
- 📋 One-click copy for each caption
- 🌓 Dark glassmorphic UI

## Deployment Link
https://caption-craft-ai-production-3190.up.railway.app/
## Tech Stack

| Layer    | Model / Library                        |
|----------|----------------------------------------|
| Vision   | microsoft/Florence-2-base (local)      |
| Language | HuggingFaceH4/zephyr-7b-beta (API)    |
| Backend  | Flask + flask-cors                     |
| Frontend | Vanilla HTML/CSS/JS                    |
