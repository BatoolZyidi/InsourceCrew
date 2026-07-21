from datetime import timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import get_settings
from app.core.security import (
    create_token,
    decode_token,
    hash_password,
    token_fingerprint,
    verify_password,
)
from app.models.user import RefreshToken, Role, User
from app.repositories.organization_repository import OrganizationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest
from app.services.workflow_service import provision_builtin_employees


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.orgs = OrganizationRepository(db)
        self.users = UserRepository(db)

    def register(self, payload: RegisterRequest) -> AuthResponse:
        if self.orgs.by_name(payload.company_name):
            raise HTTPException(409, "Company name is already registered")
        if self.users.by_email(str(payload.email)):
            raise HTTPException(409, "Email is already registered")
        org = self.orgs.create(payload.company_name)
        user = self.users.add(
            User(
                organization_id=org.id,
                email=str(payload.email).lower(),
                full_name=payload.admin_name,
                password_hash=hash_password(payload.password),
                role=Role.OWNER,
            )
        )
        provision_builtin_employees(self.db, org.id)
        self.db.commit()
        self.db.refresh(user)
        return self._issue(user)

    def login(self, payload: LoginRequest) -> AuthResponse:
        user = self.users.by_email(str(payload.email))
        if (
            not user
            or not user.is_active
            or not verify_password(payload.password, user.password_hash)
        ):
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                "Invalid email or password",
                {"WWW-Authenticate": "Bearer"},
            )
        return self._issue(user)

    def refresh(self, raw_token: str) -> AuthResponse:
        try:
            subject = decode_token(raw_token, "refresh")["sub"]
        except ValueError:
            raise HTTPException(401, "Invalid refresh token")
        stored = self.users.active_refresh(token_fingerprint(raw_token))
        user = self.users.by_id(subject)
        if not stored or not user:
            raise HTTPException(401, "Invalid refresh token")
        self.users.revoke(stored)
        self.db.commit()
        return self._issue(user)

    def _issue(self, user: User) -> AuthResponse:
        settings = get_settings()
        access, _ = create_token(
            str(user.id), "access", timedelta(minutes=settings.jwt_access_token_minutes)
        )
        refresh, expires = create_token(
            str(user.id), "refresh", timedelta(days=settings.jwt_refresh_token_days)
        )
        self.users.add_refresh_token(
            RefreshToken(
                user_id=user.id,
                fingerprint=token_fingerprint(refresh),
                expires_at=expires,
            )
        )
        self.db.commit()
        return AuthResponse(access_token=access, refresh_token=refresh, user=user)
