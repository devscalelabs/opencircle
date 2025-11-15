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


class GitHubLoginRequest(BaseModel):
    code: str


class GitHubAuthUrlResponse(BaseModel):
    authorization_url: str
    state: str


class GitHubLoginResponse(BaseModel):
    access_token: str
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
    token_type: str
    user_id: str
    username: str
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
