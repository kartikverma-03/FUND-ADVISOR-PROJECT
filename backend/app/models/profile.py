from datetime import datetime
from enum import Enum
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.user import User


class RiskAppetite(str, Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"


class FinancialProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)

    monthly_income: float
    monthly_expenses: float
    existing_savings: float = 0
    existing_debt: float = 0

    monthly_investment_capacity: float
    risk_appetite: RiskAppetite = RiskAppetite.moderate
    investment_horizon_years: int = 5

    primary_goal: Optional[str] = None
    target_amount: Optional[float] = None
    target_year: Optional[int] = None

    currency: str = "INR"
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional["User"] = Relationship(back_populates="profile")