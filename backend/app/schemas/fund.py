from datetime import date
from typing import Optional
from pydantic import BaseModel

from app.models.fund import AssetType


class FundRead(BaseModel):
    id: int
    symbol: str
    name: str
    asset_type: AssetType
    category: Optional[str]
    benchmark: Optional[str]
    expense_ratio: Optional[float]

    class Config:
        from_attributes = True


class FundMetrics(BaseModel):
    symbol: str
    name: str
    cagr_1y: Optional[float] = None
    cagr_3y: Optional[float] = None
    cagr_5y: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    std_deviation: Optional[float] = None
    alpha: Optional[float] = None
    beta: Optional[float] = None
    max_drawdown: Optional[float] = None


class HoldingCreate(BaseModel):
    fund_id: int
    units: float
    avg_buy_price: float
    purchase_date: date


class HoldingRead(HoldingCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True