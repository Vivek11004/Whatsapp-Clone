from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from Depends.auth import get_current_user

from Depends.get_db import get_db
from schemas.user import UserResponse


from schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse
)

from services.auth_service import (
    create_user,
    authenticate_user
)

from core.security import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    user = create_user(
        db,
        data.name,
        data.email,
        data.password,
        data.phone_number
    )

    return {
        "message": "User created successfully",
        "user_id": user.id
    }


@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = authenticate_user(
        db,
        data.email,
        data.password
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token({
        "sub": str(user.id)
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/me" , response_model=UserResponse)
def get_me(
    current_user = Depends(get_current_user)
):
    return current_user