from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date as Date
from enum import Enum


class NecessityEnum(str, Enum):
    HIGH = "상"
    MEDIUM = "중"
    LOW = "하"


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None


# ── Products ──────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    price: float
    necessity: NecessityEnum
    date: Optional[Date] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    necessity: Optional[NecessityEnum] = None
    date: Optional[Date] = None


class ProductResponse(BaseModel):
    product_id: int
    user_id: int
    name: str
    price: float
    necessity: NecessityEnum
    date: Optional[Date] = None

    model_config = {"from_attributes": True}


# ── Totals ────────────────────────────────────────────────────────────────────

class TotalResponse(BaseModel):
    id: int
    user_id: int
    month: str
    total: float

    model_config = {"from_attributes": True}
