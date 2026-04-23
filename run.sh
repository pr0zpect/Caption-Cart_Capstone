#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────
#  CaptionCraft AI — startup script
#  Usage:  bash run.sh
# ─────────────────────────────────────────────────────────

set -e

VENV_DIR=".venv"

# 1. Create virtual environment if missing
if [ ! -d "$VENV_DIR" ]; then
  echo "🔧 Creating virtual environment…"
  python3 -m venv "$VENV_DIR"
fi

# 2. Activate
source "$VENV_DIR/bin/activate"

# 3. Install / upgrade deps
echo "📦 Installing dependencies…"
pip install --upgrade pip -q
pip install -r requirements.txt -q

# 4. Source .env if it exists
if [ -f ".env" ]; then
  echo "🔑 Loading .env …"
  export $(grep -v '^#' .env | xargs)
fi

# 5. Launch Flask
echo ""
echo "🚀 Starting CaptionCraft AI at http://127.0.0.1:5000"
echo "   (first run downloads Florence-2 + Zephyr — may take a few minutes)"
echo ""
python app.py
