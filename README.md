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

## Setup

### 1. Get a HuggingFace token
Create a free token at https://huggingface.co/settings/tokens (read access is enough).

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and set HF_TOKEN=hf_your_token
```

### 3. Run
```bash
bash run.sh
```
Then open http://127.0.0.1:5000

> **First run** will download Florence-2 (~900 MB) and cache Zephyr-7b via HF Inference API. Subsequent runs are fast.

## Tech Stack

| Layer    | Model / Library                        |
|----------|----------------------------------------|
| Vision   | microsoft/Florence-2-base (local)      |
| Language | HuggingFaceH4/zephyr-7b-beta (API)    |
| Backend  | Flask + flask-cors                     |
| Frontend | Vanilla HTML/CSS/JS                    |
