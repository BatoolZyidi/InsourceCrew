from datetime import datetime, timedelta, timezone
from uuid import uuid4
import hashlib
import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher
from app.core.config import get_settings

password_hash = PasswordHash((BcryptHasher(),))
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, digest: str) -> bool:
    return password_hash.verify(password, digest)


def token_fingerprint(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_token(
    subject: str, token_type: str, expires: timedelta
) -> tuple[str, datetime]:
    settings = get_settings()
    expiry = datetime.now(timezone.utc) + expires
    payload = {"sub": subject, "type": token_type, "exp": expiry, "jti": str(uuid4())}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=ALGORITHM), expiry


def decode_token(token: str, expected_type: str) -> dict:
    try:
        payload = jwt.decode(
            token, get_settings().jwt_secret_key, algorithms=[ALGORITHM]
        )
        if payload.get("type") != expected_type:
            raise jwt.InvalidTokenError("Invalid token type")
        return payload
    except jwt.PyJWTError as exc:
        raise ValueError("Invalid or expired token") from exc
