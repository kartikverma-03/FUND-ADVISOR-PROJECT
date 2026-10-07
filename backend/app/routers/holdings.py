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
from app.models.fund import Fund
from sqlalchemy import desc
from app.models.fund import FundNav

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
@router.get("/summary")
async def portfolio_summary(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Aggregates all holdings into a portfolio-level view: total invested,
    current value, gain/loss, and allocation breakdown by asset type.
    """
    result = await session.execute(
        select(Holding, Fund).join(Fund, Holding.fund_id == Fund.id).where(Holding.user_id == current_user.id)
    )
    rows = result.all()

    total_invested = 0.0
    total_current_value = 0.0
    allocation: dict[str, float] = {}
    holdings_detail = []

    for holding, fund in rows:
        latest_nav_result = await session.execute(
            select(FundNav).where(FundNav.fund_id == fund.id).order_by(desc(FundNav.date)).limit(1)
        )
        latest_nav = latest_nav_result.scalar_one_or_none()
        current_price = latest_nav.value if latest_nav else holding.avg_buy_price

        invested = holding.units * holding.avg_buy_price
        current_value = holding.units * current_price

        total_invested += invested
        total_current_value += current_value
        allocation[fund.asset_type] = allocation.get(fund.asset_type, 0) + current_value

        holdings_detail.append({
            "fund_id": fund.id,
            "symbol": fund.symbol,
            "name": fund.name,
            "units": holding.units,
            "avg_buy_price": holding.avg_buy_price,
            "current_price": current_price,
            "invested": round(invested, 2),
            "current_value": round(current_value, 2),
            "gain_loss": round(current_value - invested, 2),
            "gain_loss_pct": round(((current_value - invested) / invested) * 100, 2) if invested > 0 else 0,
        })

    overall_gain_loss = total_current_value - total_invested
    overall_gain_loss_pct = (overall_gain_loss / total_invested * 100) if total_invested > 0 else 0

    return {
        "total_invested": round(total_invested, 2),
        "total_current_value": round(total_current_value, 2),
        "overall_gain_loss": round(overall_gain_loss, 2),
        "overall_gain_loss_pct": round(overall_gain_loss_pct, 2),
        "allocation": {k: round(v, 2) for k, v in allocation.items()},
        "holdings": holdings_detail,
    }