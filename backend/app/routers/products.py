from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(prefix="/products", tags=["products"])


def _current_month() -> str:
    return datetime.now().strftime("%Y-%m")


def _is_current_month(date_obj) -> bool:
    if date_obj is None:
        return True
    return date_obj.strftime("%Y-%m") == _current_month()


@router.get("", response_model=List[schemas.ProductResponse])
def get_products(
    month: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_products(db, current_user.user_id, month)


@router.post("", response_model=schemas.ProductResponse, status_code=201)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.create_product(db, product, current_user.user_id)


@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    data: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = db.query(models.Product).filter(
        models.Product.product_id == product_id,
        models.Product.user_id == current_user.user_id,
    ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="항목을 찾을 수 없습니다.")
    if not _is_current_month(existing.date):
        raise HTTPException(status_code=403, detail="지난 달 항목은 수정할 수 없습니다.")

    updated = crud.update_product(db, product_id, current_user.user_id, data)
    return updated


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = db.query(models.Product).filter(
        models.Product.product_id == product_id,
        models.Product.user_id == current_user.user_id,
    ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="항목을 찾을 수 없습니다.")
    if not _is_current_month(existing.date):
        raise HTTPException(status_code=403, detail="지난 달 항목은 삭제할 수 없습니다.")

    crud.delete_product(db, product_id, current_user.user_id)
