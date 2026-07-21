from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.repositories.user_repository import UserRepository

bearer = HTTPBearer()


def current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
):
    try:
        data = decode_token(credentials.credentials, "access")
    except ValueError:
        raise HTTPException(401, "Invalid access token", {"WWW-Authenticate": "Bearer"})
    user = UserRepository(db).by_id(data["sub"])
    if not user or not user.is_active:
        raise HTTPException(401, "Inactive user")
    return user
