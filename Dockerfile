FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for Pillow
RUN apt-get update && apt-get install -y \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Hugging Face Spaces uses port 7860
EXPOSE 7860

CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--timeout", "120", "app:app"]
