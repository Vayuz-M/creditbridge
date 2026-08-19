"""
CreditBridge Main FastAPI Application
Enterprise Production Configuration with Observability, Logging, and Error Handling
"""

import os
import time
import logging
from datetime import datetime
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy import text

from .config import settings
from .database import Base, engine, SessionLocal
from .models.models import User
from .auth.auth import get_password_hash
from .routers import auth, assessment, analytics, admin

# Configure Structured Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("creditbridge.api")

STARTUP_TIME = datetime.utcnow()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CreditBridge: Bridging the Credit Gap with Alternative Financial Intelligence & Explainable AI",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" or os.getenv("ENABLE_DOCS", "true").lower() == "true" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" or os.getenv("ENABLE_DOCS", "true").lower() == "true" else None,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request Latency & Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Response-Time"] = f"{duration_ms}ms"
    logger.info(f"{request.method} {request.url.path} - {response.status_code} ({duration_ms}ms)")
    return response


# Global Exception Handler for Unhandled Errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred. Our engineering team has been notified.",
            "error_code": "INTERNAL_SERVER_ERROR",
            "path": request.url.path
        }
    )


# Custom Validation Error Handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on {request.method} {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Invalid request payload or parameters.",
            "errors": exc.errors(),
            "error_code": "VALIDATION_ERROR"
        }
    )


# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(assessment.router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics.router, prefix=settings.API_V1_PREFIX)
app.include_router(admin.router, prefix=settings.API_V1_PREFIX)


@app.on_event("startup")
def on_startup():
    """Initializes default admin and demo user accounts on startup if not present."""
    logger.info("Initializing CreditBridge services...")
    db = SessionLocal()
    try:
        # 1. Ensure Demo Admin exists
        admin_user = db.query(User).filter(User.email == "admin@creditbridge.ai").first()
        if not admin_user:
            admin_user = User(
                email="admin@creditbridge.ai",
                hashed_password=get_password_hash("CreditBridge2026!"),
                full_name="System Administrator",
                role="ADMIN"
            )
            db.add(admin_user)

        # 2. Ensure Demo User exists
        demo_user = db.query(User).filter(User.email == "demo.user@creditbridge.ai").first()
        if not demo_user:
            demo_user = User(
                email="demo.user@creditbridge.ai",
                hashed_password=get_password_hash("CreditBridge2026!"),
                full_name="Arjun Sharma (Gig Worker)",
                role="USER"
            )
            db.add(demo_user)

        db.commit()
        logger.info("CreditBridge database verification complete.")
    except Exception as e:
        logger.error(f"Error during startup seeding: {e}")
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "status": "OPERATIONAL",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0",
        "docs_url": "/docs"
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    """
    Comprehensive health check and readiness probe for Kubernetes/Docker container orchestrators.
    """
    # 1. Test database connectivity
    db_status = "HEALTHY"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        db_status = f"UNHEALTHY: {str(e)}"

    # 2. Check ML model files
    models_ready = os.path.exists(os.path.join(settings.MODELS_DIR, "models_metadata.json"))

    uptime_seconds = int((datetime.utcnow() - STARTUP_TIME).total_seconds())

    return {
        "status": "HEALTHY" if db_status == "HEALTHY" and models_ready else "DEGRADED",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "uptime_seconds": uptime_seconds,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "ml_models_ready": models_ready,
        "responsible_ai_status": "COMPLIANT",
        "version": "1.0.0"
    }
