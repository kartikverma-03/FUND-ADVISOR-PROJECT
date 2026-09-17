from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import select

from app.core.database import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.portfolio import Holding
from app.models.fund import Fund
from app.schemas.fund import HoldingCreate, HoldingRead

router = APIRouter(prefix="/holdings", tags=["holdings"])


@router.post("/", response_model=HoldingRead, status_code=201)
async def add_holding(
    payload: HoldingCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    fund = await session.get(Fund, payload.fund_id)
    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found")

    holding = Holding(**payload.model_dump(), user_id=current_user.id)
    session.add(holding)
    await session.commit()
    await session.refresh(holding)
    return holding


@router.get("/", response_model=List[HoldingRead])
async def list_holdings(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(Holding).where(Holding.user_id == current_user.id))
    return result.scalars().all()


@router.delete("/{holding_id}", status_code=204)
async def delete_holding(
    holding_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    holding = await session.get(Holding, holding_id)
    if not holding or holding.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Holding not found")
    await session.delete(holding)
    await session.commit()