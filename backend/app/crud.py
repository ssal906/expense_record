from datetime import date
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models, schemas
from .auth import hash_password


# ── Users ─────────────────────────────────────────────────────────────────────

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    db_user = models.User(email=user.email, password=hash_password(user.password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# ── Products ──────────────────────────────────────────────────────────────────

def get_products(db: Session, user_id: int, month: Optional[str] = None):
    query = db.query(models.Product).filter(models.Product.user_id == user_id)
    if month:
        year, mon = month.split("-")
        query = query.filter(
            func.year(models.Product.date) == int(year),
            func.month(models.Product.date) == int(mon),
        )
    return query.order_by(models.Product.date.desc()).all()


def create_product(db: Session, product: schemas.ProductCreate, user_id: int) -> models.Product:
    product_date = product.date if product.date else date.today()
    db_product = models.Product(
        user_id=user_id,
        name=product.name,
        price=product.price,
        necessity=product.necessity,
        date=product_date,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    _update_total(db, user_id, product_date.strftime("%Y-%m"))
    return db_product


def update_product(
    db: Session, product_id: int, user_id: int, data: schemas.ProductUpdate
) -> Optional[models.Product]:
    db_product = db.query(models.Product).filter(
        models.Product.product_id == product_id,
        models.Product.user_id == user_id,
    ).first()
    if not db_product:
        return None

    old_month = db_product.date.strftime("%Y-%m") if db_product.date else None

    if data.name is not None:
        db_product.name = data.name
    if data.price is not None:
        db_product.price = data.price
    if data.necessity is not None:
        db_product.necessity = data.necessity
    if data.date is not None:
        db_product.date = data.date

    db.commit()
    db.refresh(db_product)

    new_month = db_product.date.strftime("%Y-%m") if db_product.date else None
    if new_month:
        _update_total(db, user_id, new_month)
    if old_month and old_month != new_month:
        _update_total(db, user_id, old_month)

    return db_product


def delete_product(db: Session, product_id: int, user_id: int) -> bool:
    db_product = db.query(models.Product).filter(
        models.Product.product_id == product_id,
        models.Product.user_id == user_id,
    ).first()
    if not db_product:
        return False

    month = db_product.date.strftime("%Y-%m") if db_product.date else None
    db.delete(db_product)
    db.commit()
    if month:
        _update_total(db, user_id, month)
    return True


# ── Totals ────────────────────────────────────────────────────────────────────

def _update_total(db: Session, user_id: int, month: str) -> None:
    year, mon = month.split("-")
    total_amount = (
        db.query(func.sum(models.Product.price))
        .filter(
            models.Product.user_id == user_id,
            func.year(models.Product.date) == int(year),
            func.month(models.Product.date) == int(mon),
        )
        .scalar()
        or 0.0
    )
    db_total = db.query(models.Total).filter(
        models.Total.user_id == user_id,
        models.Total.month == month,
    ).first()
    if db_total:
        db_total.total = total_amount
    else:
        db.add(models.Total(user_id=user_id, month=month, total=total_amount))
    db.commit()


def get_totals(db: Session, user_id: int):
    return (
        db.query(models.Total)
        .filter(models.Total.user_id == user_id)
        .order_by(models.Total.month.desc())
        .all()
    )


def get_total_by_month(db: Session, user_id: int, month: str) -> Optional[models.Total]:
    return db.query(models.Total).filter(
        models.Total.user_id == user_id,
        models.Total.month == month,
    ).first()
