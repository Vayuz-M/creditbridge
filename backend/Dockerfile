# ==========================================
# CreditBridge Backend Production Dockerfile
# Multi-stage, security-hardened container
# ==========================================

FROM python:3.10-slim as builder

WORKDIR /app

# Install system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Build Python wheels
RUN pip install --no-cache-dir --user -r requirements.txt \
    && pip install --no-cache-dir --user email-validator pytest httpx

# ==========================================
# Final Runtime Stage
# ==========================================
FROM python:3.10-slim

WORKDIR /app

# Install runtime libraries for LightGBM and XGBoost
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed python packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV ENVIRONMENT=production

# Copy application source code and models
COPY . /app/

# Create non-root user for security
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/data/models /app/data/datasets && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
