import os
import ssl

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:password@localhost/expense_record")

# TiDB Serverless는 SSL 필수 — 로컬 MySQL은 SSL 불필요
if "tidbcloud.com" in DATABASE_URL:
    ssl_ctx = ssl.create_default_context()
    connect_args = {"ssl": ssl_ctx}
else:
    connect_args = {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
