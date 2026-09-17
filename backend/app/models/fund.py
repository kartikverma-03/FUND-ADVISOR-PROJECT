from datetime import date as date_type, datetime
from enum import Enum
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class AssetType(str, Enum):
    indian_mf = "indian_mf"
    global_fund = "global_fund"
    stock = "stock"


class Fund(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    symbol: str = Field(index=True)
    name: str
    asset_type: AssetType
    category: Optional[str] = None
    benchmark: Optional[str] = None
    expense_ratio: Optional[float] = None
    inception_date: Optional[date_type] = None
    last_synced_at: Optional[datetime] = None

    nav_history: List["FundNav"] = Relationship(back_populates="fund")


class FundNav(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    fund_id: int = Field(foreign_key="fund.id", index=True)
    date: date_type = Field(index=True)
    value: float

    fund: Optional["Fund"] = Relationship(back_populates="nav_history")