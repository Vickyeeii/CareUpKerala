from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from middleware.db import get_db
from auth.schemas import (
    LoginRequest, LoginResponse, RefreshTokenRequest,
    NRISignupRequest, CompanionSignupRequest, LogoutRequest
)
from auth.services import (
    authenticate_user, refresh_access_token,
    register_nri, register_companion, logout_user
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    try:
        user_id, role, access_token, refresh_token = authenticate_user(
            db, request.email, request.password
        )
        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user_id,
            role=role
        )
    except ValueError as e:
        error_msg = str(e)
        if "Companion account not approved" in error_msg:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=error_msg)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error_msg)


@router.post("/refresh")
def refresh(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    try:
        access_token = refresh_access_token(db, request.refresh_token)
        return {"access_token": access_token, "token_type": "bearer"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/nri/signup")
def nri_signup(request: NRISignupRequest, db: Session = Depends(get_db)):
    try:
        user_id = register_nri(
            db, request.full_name, request.email, request.password,
            request.phone, request.country
        )
        return {"user_id": user_id, "message": "NRI user registered successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/companion/signup")
def companion_signup(request: CompanionSignupRequest, db: Session = Depends(get_db)):
    try:
        user_id = register_companion(
            db, request.full_name, request.email, request.password, request.phone
        )
        return {"user_id": user_id, "message": "Companion registered, pending approval"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/logout")
def logout(request: LogoutRequest, db: Session = Depends(get_db)):
    try:
        logout_user(db, request.refresh_token)
        return {"message": "Logged out successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))




