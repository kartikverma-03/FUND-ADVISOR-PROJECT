"""
Syncs fund/stock data from external sources (MFAPI, yfinance) into our own
Fund + FundNav tables. This is the bridge between the fetchers we already
built and the database — run once per fund, then everything else reads
from our own DB instead of hitting external APIs repeatedly.
"""
from datetime import datetime
from typing import Optional

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import select

from app.models.fund import Fund, FundNav, AssetType
from app.services.mf_data import fetch_mf_nav_history, parse_nav_entries
from app.services.stock_data import fetch_stock_history, parse_stock_entries, fetch_stock_info


async def sync_indian_mf(session: AsyncSession, scheme_code: str) -> Optional[Fund]:
    """Fetches an Indian MF's full history from MFAPI and stores it locally."""
    raw = await fetch_mf_nav_history(scheme_code)
    if raw is None:
        return None

    entries = parse_nav_entries(raw)
    if not entries:
        return None

    result = await session.execute(
        select(Fund).where(Fund.symbol == scheme_code, Fund.asset_type == AssetType.indian_mf)
    )
    fund = result.scalar_one_or_none()

    if fund is None:
        fund = Fund(
            symbol=scheme_code,
            name=raw["meta"]["scheme_name"],
            asset_type=AssetType.indian_mf,
            category=raw["meta"].get("scheme_category"),
        )
        session.add(fund)
        await session.commit()
        await session.refresh(fund)

    await _replace_nav_history(session, fund.id, entries)

    fund.last_synced_at = datetime.utcnow()
    await session.commit()
    await session.refresh(fund)
    return fund


async def sync_stock_or_global_fund(
    session: AsyncSession, symbol: str, asset_type: AssetType = AssetType.stock
) -> Optional[Fund]:
    """Fetches a stock/global fund's history from yfinance and stores it locally."""
    history = fetch_stock_history(symbol, period="5y")
    if history is None:
        return None

    entries = parse_stock_entries(history)
    info = fetch_stock_info(symbol) or {}

    result = await session.execute(
        select(Fund).where(Fund.symbol == symbol, Fund.asset_type == asset_type)
    )
    fund = result.scalar_one_or_none()

    if fund is None:
        fund = Fund(
            symbol=symbol,
            name=info.get("name") or symbol,
            asset_type=asset_type,
            category=info.get("category"),
        )
        session.add(fund)
        await session.commit()
        await session.refresh(fund)

    await _replace_nav_history(session, fund.id, entries)

    fund.last_synced_at = datetime.utcnow()
    await session.commit()
    await session.refresh(fund)
    return fund


async def _replace_nav_history(session: AsyncSession, fund_id: int, entries: list[dict]) -> None:
    """
    Deletes old NAV rows for this fund and inserts fresh ones.
    Simple approach for now — re-syncing a fund replaces its whole history.
    """
    existing = await session.execute(select(FundNav).where(FundNav.fund_id == fund_id))
    for row in existing.scalars().all():
        await session.delete(row)
    await session.commit()

    for entry in entries:
        session.add(FundNav(fund_id=fund_id, date=entry["date"], value=entry["value"]))
    await session.commit()


async def get_nav_entries_for_fund(session: AsyncSession, fund_id: int) -> list[dict]:
    """Reads a fund's stored NAV history back out as {date, value} dicts for the metrics engine."""
    result = await session.execute(
        select(FundNav).where(FundNav.fund_id == fund_id).order_by(FundNav.date)
    )
    rows = result.scalars().all()
    return [{"date": row.date, "value": row.value} for row in rows]