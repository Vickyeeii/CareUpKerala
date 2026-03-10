from pydantic import BaseModel, EmailStr
from uuid import UUID


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: UUID
    role: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class NRISignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: str
    country: str


class CompanionSignupRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: str


class LogoutRequest(BaseModel):
    refresh_token: str
