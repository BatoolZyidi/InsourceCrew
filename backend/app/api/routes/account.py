from fastapi import APIRouter, Depends, Response, UploadFile, File, HTTPException
from pathlib import Path
import shutil
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import current_user
from app.schemas.account import AccountUpdate, DeleteAccountRequest, PasswordChange
from app.schemas.auth import UserResponse
from app.services.account_service import AccountService

router = APIRouter(prefix="/account", tags=["account"])
UPLOAD_DIR = Path(__file__).resolve().parents[3] / "uploads"


@router.get("/me", response_model=UserResponse)
def me(user=Depends(current_user)):
    return user


@router.patch("/me", response_model=UserResponse)
def update(
    data: AccountUpdate, user=Depends(current_user), db: Session = Depends(get_db)
):
    return AccountService(db).update(user, data)


@router.post("/avatar", response_model=UserResponse)
def avatar(
    file: UploadFile = File(...),
    user=Depends(current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(415, "Upload a PNG, JPEG, or WEBP image")
    UPLOAD_DIR.mkdir(exist_ok=True)
    suffix = Path(file.filename or "avatar.png").suffix.lower() or ".png"
    target = UPLOAD_DIR / f"{user.id}{suffix}"
    with target.open("wb") as destination:
        shutil.copyfileobj(file.file, destination)
    user.avatar_url = f"/uploads/{target.name}"
    db.commit()
    db.refresh(user)
    return user


@router.post("/password", status_code=204)
def password(
    data: PasswordChange, user=Depends(current_user), db: Session = Depends(get_db)
):
    AccountService(db).change_password(user, data)
    return Response(status_code=204)


@router.delete("/me", status_code=204)
def delete(
    data: DeleteAccountRequest,
    user=Depends(current_user),
    db: Session = Depends(get_db),
):
    AccountService(db).delete_self(user, data.confirmation)
    return Response(status_code=204)
