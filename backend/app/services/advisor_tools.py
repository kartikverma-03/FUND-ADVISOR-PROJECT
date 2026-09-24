"""
Tool functions the AI advisor can call. Each one wraps logic we already built
(metrics engine, fund sync) into a simple, self-contained function the model
can invoke by name with arguments it decides on its own.

These take an AsyncSession because they need real DB access -- we run them
ourselves in the tool-calling loop, not via the SDK's automatic invocation,
specifically so we can pass in the current request's session and user.
"""
from typing import Optional

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import select

from app.models.fund import Fund
from app.services.fund_sync import get_nav_entries_for_fund
from app.services.metrics import (
    calculate_cagr,
    calculate_std_deviation,
    calculate_sharpe_ratio,
    calculate_max_drawdown,
)


async def tool_list_synced_funds(session: AsyncSession) -> dict:
    """Lists every fund/stock currently synced in our database, with id, symbol, name, type."""
    result = await session.execute(select(Fund))
    funds = result.scalars().all()
    return {
        "funds": [
            {"id": f.id, "symbol": f.symbol, "name": f.name, "asset_type": f.asset_type}
            for f in funds
        ]
    }


async def tool_get_fund_metrics(session: AsyncSession, fund_id: int) -> dict:
    """Computes CAGR, Sharpe ratio, volatility, and max drawdown for one fund by its database id."""
    fund = await session.get(Fund, fund_id)
    if not fund:
        return {"error": f"No fund found with id {fund_id}"}

    entries = await get_nav_entries_for_fund(session, fund_id)
    if not entries:
        return {"error": f"No price history synced yet for fund id {fund_id}"}

    return {
        "symbol": fund.symbol,
        "name": fund.name,
        "cagr_1y": calculate_cagr(entries, 1),
        "cagr_3y": calculate_cagr(entries, 3),
        "cagr_5y": calculate_cagr(entries, 5),
        "sharpe_ratio": calculate_sharpe_ratio(entries, 3),
        "std_deviation": calculate_std_deviation(entries),
        "max_drawdown": calculate_max_drawdown(entries),
    }


async def tool_compare_funds(session: AsyncSession, fund_ids: list[int]) -> dict:
    """Compares metrics across multiple funds at once, given a list of their database ids."""
    results = []
    for fund_id in fund_ids:
        metrics = await tool_get_fund_metrics(session, fund_id)
        results.append(metrics)
    return {"comparison": results}