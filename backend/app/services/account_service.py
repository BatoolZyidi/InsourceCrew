from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.schemas.account import AccountUpdate, PasswordChange


class AccountService:
    def __init__(self, db: Session):
        self.db = db

    def update(self, user, data: AccountUpdate):
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user

    def change_password(self, user, data: PasswordChange):
        user.password_hash = hash_password(data.new_password)
        self.db.commit()

    def delete_self(self, user, confirmation: str):
        if confirmation.strip().lower() != "delete":
            raise HTTPException(400, "Type delete to confirm account deletion")
        self.db.delete(user)
        self.db.commit()
