from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field
from app.models.user import Role


class RegisterRequest(BaseModel):
    company_name: str = Field(min_length=2, max_length=160)
    admin_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=20)


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: Role
    organization_id: UUID
    phone: str | None = None
    avatar_url: str | None = None
    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class OrganizationResponse(BaseModel):
    id: UUID
    name: str
    created_at: datetime
    model_config = {"from_attributes": True}
