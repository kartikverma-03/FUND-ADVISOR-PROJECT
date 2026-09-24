from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import select

from app.core.database import get_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.profile import FinancialProfile
from app.models.portfolio import Holding
from app.models.fund import Fund
from app.schemas.advisor import ChatRequest, ChatResponse
from app.services.advisor import run_advisor_chat

router = APIRouter(prefix="/advisor", tags=["advisor"])


@router.post("/chat", response_model=ChatResponse)
async def chat_with_advisor(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Sends a message to the AI financial advisor. The advisor is grounded in
    the user's stored financial profile and holdings, and can look up real
    fund metrics via tool calls before answering.
    """
    result = await session.execute(
        select(FinancialProfile).where(FinancialProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    holdings_result = await session.execute(
        select(Holding, Fund).join(Fund, Holding.fund_id == Fund.id).where(Holding.user_id == current_user.id)
    )
    holdings_rows = holdings_result.all()
    if holdings_rows:
        holdings_summary = "\n".join(
            f"- {fund.name} ({fund.symbol}): {holding.units} units, avg buy price {holding.avg_buy_price}"
            for holding, fund in holdings_rows
        )
    else:
        holdings_summary = "No holdings recorded yet."

    reply = await run_advisor_chat(
        session=session,
        user=current_user,
        profile=profile,
        holdings_summary=holdings_summary,
        message=payload.message,
    )

    return ChatResponse(reply=reply)