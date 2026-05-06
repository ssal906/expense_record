from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..auth import create_access_token, verify_password, ACCESS_TOKEN_EXPIRE_DAYS
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/check-email")
def check_email(email: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email)
    return {"exists": user is not None}


@router.post("/signup", response_model=schemas.Token, status_code=201)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")
    db_user = crud.create_user(db, user)
    token = create_access_token(
        {"sub": str(db_user.user_id)},
        timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS),
    )
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")
    token = create_access_token(
        {"sub": str(db_user.user_id)},
        timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS),
    )
    return {"access_token": token, "token_type": "bearer"}
