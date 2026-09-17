from typing import AsyncGenerator
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.core.config import settings

engine = create_async_engine(settings.database_url, echo=False, future=True)

async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency — yields a DB session per request."""
    async with async_session_maker() as session:
        yield session


async def init_db():
    """Create tables on startup. In production, use Alembic migrations instead."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)