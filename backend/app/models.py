import enum
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .database import Base


class NecessityEnum(str, enum.Enum):
    HIGH = "상"
    MEDIUM = "중"
    LOW = "하"


class User(Base):
    __tablename__ = "Users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)

    products = relationship("Product", back_populates="user", cascade="all, delete")
    totals = relationship("Total", back_populates="user", cascade="all, delete")


class Product(Base):
    __tablename__ = "Products"

    product_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("Users.user_id"), nullable=False)
    name = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    necessity = Column(Enum(NecessityEnum), nullable=False)
    date = Column(Date, nullable=True)

    user = relationship("User", back_populates="products")


class Total(Base):
    __tablename__ = "totals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("Users.user_id"), nullable=False)
    month = Column(String(7), nullable=False)  # "YYYY-MM"
    total = Column(Float, default=0.0)

    user = relationship("User", back_populates="totals")
