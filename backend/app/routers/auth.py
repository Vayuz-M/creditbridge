"""
CreditBridge Authentication Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import User
from ..schemas.schemas import UserRegister, UserLogin, Token, UserResponse, DemoLoginRequest
from ..auth.auth import verify_password, get_password_hash, create_access_token, get_current_user
from ml.data_generator import get_default_sample_personas

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role=user_in.role or "USER"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email, "role": user.role, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token({"sub": user.email, "role": user.role, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }


@router.post("/demo-login", response_model=Token)
def demo_login(req: DemoLoginRequest, db: Session = Depends(get_db)):
    """Provides instant 1-click test access for User or Admin evaluation."""
    email = "admin@creditbridge.ai" if req.role == "ADMIN" else "demo.user@creditbridge.ai"
    full_name = "System Admin" if req.role == "ADMIN" else "Arjun Sharma (Gig Worker)"
    role = "ADMIN" if req.role == "ADMIN" else "USER"

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            hashed_password=get_password_hash("CreditBridge2026!"),
            full_name=full_name,
            role=role
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": user.email, "role": user.role, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/sample-personas")
def get_sample_personas():
    """Returns curated synthetic sample personas for frictionless UI testing."""
    return get_default_sample_personas()
