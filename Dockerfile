# ─────────────────────────────────────────────────────────────
#  TripMate AI — Dockerfile
#  Multi-stage build: slim Python 3.12 image, no dev tools in prod
# ─────────────────────────────────────────────────────────────

# ── Stage 1: dependency builder ───────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /build

# Install build essentials needed by psycopg binary
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip \
 && pip install --prefix=/install --no-cache-dir -r requirements.txt


# ── Stage 2: production image ─────────────────────────────────
FROM python:3.12-slim

LABEL maintainer="TripMate AI"
LABEL description="Multi-agent AI travel planner — FastAPI + LangGraph + Groq"

# Runtime library required by psycopg
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application source
COPY . .

# ── Environment defaults (override at runtime via --env-file or -e) ──
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Expose the web port
EXPOSE 8000

# Health-check so orchestrators (Render, K8s, ECS) know when ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# ── Start server ──────────────────────────────────────────────
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
