from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import select

from app.core.database import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.fund import Fund, AssetType
from app.schemas.fund import FundRead, FundMetrics, SyncFundRequest
from app.services.fund_sync import sync_indian_mf, sync_stock_or_global_fund, get_nav_entries_for_fund
from app.services.metrics import (
    calculate_cagr,
    calculate_std_deviation,
    calculate_sharpe_ratio,
    calculate_max_drawdown,
    calculate_alpha_beta,
)

router = APIRouter(prefix="/funds", tags=["funds"])


@router.post("/sync", response_model=FundRead)
async def sync_fund(
    payload: SyncFundRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Fetches a fund/stock's data from the external source and stores it locally.
    Call this once per fund before requesting its metrics.
    """
    if payload.asset_type == AssetType.indian_mf:
        fund = await sync_indian_mf(session, payload.symbol)
    else:
        fund = await sync_stock_or_global_fund(session, payload.symbol, payload.asset_type)

    if fund is None:
        raise HTTPException(status_code=404, detail="Could not fetch data for this symbol")

    return fund


@router.get("/", response_model=List[FundRead])
async def list_funds(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Lists every fund/stock we've synced so far."""
    result = await session.execute(select(Fund))
    return result.scalars().all()


@router.get("/{fund_id}/metrics", response_model=FundMetrics)
async def get_fund_metrics(
    fund_id: int,
    years: float = 3,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Computes CAGR, Sharpe, volatility, and max drawdown from this fund's stored NAV history."""
    fund = await session.get(Fund, fund_id)
    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found")

    entries = await get_nav_entries_for_fund(session, fund_id)
    if not entries:
        raise HTTPException(status_code=400, detail="No price history synced for this fund yet")

    return FundMetrics(
        symbol=fund.symbol,
        name=fund.name,
        cagr_1y=calculate_cagr(entries, 1),
        cagr_3y=calculate_cagr(entries, 3),
        cagr_5y=calculate_cagr(entries, 5),
        sharpe_ratio=calculate_sharpe_ratio(entries, years),
        std_deviation=calculate_std_deviation(entries),
        max_drawdown=calculate_max_drawdown(entries),
    )


@router.get("/compare", response_model=List[FundMetrics])
async def compare_funds(
    fund_ids: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Compares metrics across multiple funds at once — the core 'analyser' feature."""
    ids = [int(x) for x in fund_ids.split(",")]
    results = []

    for fund_id in ids:
        fund = await session.get(Fund, fund_id)
        if not fund:
            continue
        entries = await get_nav_entries_for_fund(session, fund_id)
        if not entries:
            continue

        results.append(FundMetrics(
            symbol=fund.symbol,
            name=fund.name,
            cagr_1y=calculate_cagr(entries, 1),
            cagr_3y=calculate_cagr(entries, 3),
            cagr_5y=calculate_cagr(entries, 5),
            sharpe_ratio=calculate_sharpe_ratio(entries, 3),
            std_deviation=calculate_std_deviation(entries),
            max_drawdown=calculate_max_drawdown(entries),
        ))

    return results