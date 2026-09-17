"""
Financial metrics engine.

Takes raw NAV/price history (list of {date, value} dicts, sorted oldest -> newest)
and computes standard portfolio analysis metrics. This is deliberately pure —
no database, no API calls — just math on numbers, so it's easy to test and reuse
whether the data came from MFAPI or yfinance.
"""
from datetime import date
from typing import Optional

import numpy as np
import pandas as pd


RISK_FREE_RATE = 0.07  # ~7%, a reasonable proxy for Indian govt bond yield; adjust as needed


def _to_series(entries: list[dict]) -> pd.Series:
    """Converts our {date, value} list into a pandas Series indexed by date."""
    df = pd.DataFrame(entries)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").set_index("date")
    return df["value"]


def calculate_cagr(entries: list[dict], years: float) -> Optional[float]:
    """
    Compound Annual Growth Rate over the trailing `years`.
    Formula: (end_value / start_value) ^ (1 / years) - 1
    """
    series = _to_series(entries)
    if series.empty:
        return None

    cutoff = series.index[-1] - pd.DateOffset(years=years)
    windowed = series[series.index >= cutoff]
    if len(windowed) < 2:
        return None

    start_value = windowed.iloc[0]
    end_value = windowed.iloc[-1]
    actual_years = (windowed.index[-1] - windowed.index[0]).days / 365.25

    if start_value <= 0 or actual_years <= 0:
        return None

    cagr = (end_value / start_value) ** (1 / actual_years) - 1
    return round(cagr * 100, 2)


def calculate_daily_returns(entries: list[dict]) -> pd.Series:
    """Day-over-day percentage change — the building block for volatility and Sharpe."""
    series = _to_series(entries)
    return series.pct_change().dropna()


def calculate_std_deviation(entries: list[dict]) -> Optional[float]:
    """
    Annualized standard deviation of daily returns — a measure of volatility.
    We multiply by sqrt(252) since there are ~252 trading days in a year.
    """
    daily_returns = calculate_daily_returns(entries)
    if daily_returns.empty:
        return None

    annualized_std = daily_returns.std() * np.sqrt(252)
    return round(annualized_std * 100, 2)


def calculate_sharpe_ratio(entries: list[dict], years: float = 3) -> Optional[float]:
    """
    Sharpe ratio = (annualized return - risk-free rate) / annualized volatility.
    Measures return earned per unit of risk taken — higher is better.
    """
    cagr = calculate_cagr(entries, years)
    std = calculate_std_deviation(entries)

    if cagr is None or std is None or std == 0:
        return None

    sharpe = (cagr / 100 - RISK_FREE_RATE) / (std / 100)
    return round(sharpe, 2)


def calculate_max_drawdown(entries: list[dict]) -> Optional[float]:
    """
    Max drawdown = the largest peak-to-trough decline in the fund's history.
    """
    series = _to_series(entries)
    if series.empty:
        return None

    running_max = series.cummax()
    drawdown = (series - running_max) / running_max
    max_dd = drawdown.min()

    return round(max_dd * 100, 2)


def calculate_alpha_beta(
    entries: list[dict],
    benchmark_entries: list[dict],
    years: float = 3,
) -> tuple[Optional[float], Optional[float]]:
    """
    Beta = how much the fund moves relative to its benchmark (1.0 = moves with the market).
    Alpha = the fund's excess return beyond what beta alone would predict.
    """
    fund_returns = calculate_daily_returns(entries)
    benchmark_returns = calculate_daily_returns(benchmark_entries)

    aligned = pd.DataFrame({"fund": fund_returns, "benchmark": benchmark_returns}).dropna()
    if len(aligned) < 30:
        return None, None

    covariance = aligned["fund"].cov(aligned["benchmark"])
    benchmark_variance = aligned["benchmark"].var()

    if benchmark_variance == 0:
        return None, None

    beta = covariance / benchmark_variance

    fund_cagr = calculate_cagr(entries, years)
    benchmark_cagr = calculate_cagr(benchmark_entries, years)

    if fund_cagr is None or benchmark_cagr is None:
        return round(beta, 2), None

    expected_return = RISK_FREE_RATE * 100 + beta * (benchmark_cagr - RISK_FREE_RATE * 100)
    alpha = fund_cagr - expected_return

    return round(beta, 2), round(alpha, 2)