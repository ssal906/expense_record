from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(prefix="/totals", tags=["totals"])


@router.get("", response_model=List[schemas.TotalResponse])
def get_totals(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_totals(db, current_user.user_id)


@router.get("/{month}", response_model=schemas.TotalResponse)
def get_total_by_month(
    month: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    total = crud.get_total_by_month(db, current_user.user_id, month)
    if not total:
        return schemas.TotalResponse(
            id=0, user_id=current_user.user_id, month=month, total=0.0
        )
    return total
