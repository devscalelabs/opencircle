from typing import Optional

from pydantic import BaseModel


class RegisterRequest(BaseModel):
    name: Optional[str] = None
    username: str
    email: str
    password: str
    invite_code: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str


class LogoutRequest(BaseModel):
    refresh_token: str


class LogoutResponse(BaseModel):
    message: str


class GitHubLoginRequest(BaseModel):
    code: str


class GitHubAuthUrlResponse(BaseModel):
    authorization_url: str
    state: str


class GitHubLoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user_id: str
    username: str
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class ResetPasswordRequest(BaseModel):
    email: str


class ResetPasswordResponse(BaseModel):
    message: str


class ConfirmResetPasswordRequest(BaseModel):
    code: str
    new_password: str


class ConfirmResetPasswordResponse(BaseModel):
    message: str


class GoogleLoginRequest(BaseModel):
    code: str


class GoogleAuthUrlResponse(BaseModel):
    authorization_url: str
    state: str


class GoogleLoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user_id: str
    username: str
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class VerifyEmailRequest(BaseModel):
    code: str


class VerifyEmailResponse(BaseModel):
    message: str


class SessionResponse(BaseModel):
    id: str
    device_name: Optional[str] = None
    device_type: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: str
    last_used_at: Optional[str] = None


class RevokeSessionRequest(BaseModel):
    session_id: str


class RevokeSessionResponse(BaseModel):
    message: str
