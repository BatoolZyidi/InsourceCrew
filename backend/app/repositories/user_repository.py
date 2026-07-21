from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.user import RefreshToken, User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def by_email(self, email: str) -> User | None:
        return self.db.scalar(select(User).where(User.email == email.lower()))

    def by_id(self, user_id) -> User | None:
        return self.db.get(User, user_id)

    def add(self, user: User) -> User:
        self.db.add(user)
        self.db.flush()
        return user

    def add_refresh_token(self, token: RefreshToken) -> None:
        self.db.add(token)

    def active_refresh(self, fingerprint: str) -> RefreshToken | None:
        return self.db.scalar(
            select(RefreshToken).where(
                RefreshToken.fingerprint == fingerprint,
                RefreshToken.revoked_at.is_(None),
            )
        )

    def revoke(self, token: RefreshToken) -> None:
        token.revoked_at = datetime.utcnow()
