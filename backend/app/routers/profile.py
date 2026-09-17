from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import select

from app.core.database import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import FinancialProfile
from app.schemas.user import FinancialProfileCreate, FinancialProfileRead

router = APIRouter(prefix="/profile", tags=["financial-profile"])


@router.put("/", response_model=FinancialProfileRead)
async def upsert_profile(
    payload: FinancialProfileCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(FinancialProfile).where(FinancialProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if profile:
        for field, value in payload.model_dump().items():
            setattr(profile, field, value)
        profile.updated_at = datetime.utcnow()
    else:
        profile = FinancialProfile(**payload.model_dump(), user_id=current_user.id)
        session.add(profile)

    await session.commit()
    await session.refresh(profile)
    return profile


@router.get("/", response_model=FinancialProfileRead)
async def get_profile(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(FinancialProfile).where(FinancialProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="No financial profile set up yet")
    return profile