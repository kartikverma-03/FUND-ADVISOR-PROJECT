from datetime import date, datetime
from typing import Optional

import yfinance as yf
import pandas as pd


def fetch_stock_history(symbol: str, period: str = "5y") -> Optional[pd.DataFrame]:
    """
    Fetches historical price data for a stock/global fund symbol via yfinance.
    period examples: '1y', '3y', '5y', 'max'.
    Returns a pandas DataFrame indexed by date, or None if the symbol is invalid.
    """
    ticker = yf.Ticker(symbol)
    history = ticker.history(period=period)

    if history.empty:
        return None

    return history


def parse_stock_entries(history: pd.DataFrame) -> list[dict]:
    """
    Converts yfinance's DataFrame into the same clean format we used for MF data:
    a list of {date, value} dicts, ready for our FundNav table.
    We use the 'Close' price as the daily value.
    """
    entries = []
    for index, row in history.iterrows():
        entries.append({
            "date": index.date(),
            "value": float(row["Close"]),
        })
    return entries


def fetch_stock_info(symbol: str) -> Optional[dict]:
    """
    Fetches basic metadata about a symbol — name, category — separate from price history,
    since this is a different, lighter API call.
    """
    ticker = yf.Ticker(symbol)
    info = ticker.info
    if not info or "symbol" not in info:
        return None

    return {
        "symbol": info.get("symbol"),
        "name": info.get("longName") or info.get("shortName"),
        "category": info.get("category") or info.get("sector"),
    }