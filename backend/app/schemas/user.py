from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

from app.models.profile import RiskAppetite


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class FinancialProfileCreate(BaseModel):
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


class FinancialProfileRead(FinancialProfileCreate):
    id: int
    user_id: int
    updated_at: datetime

    class Config:
        from_attributes = True