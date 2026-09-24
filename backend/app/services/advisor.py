"""
The AI financial advisor's core chat loop. Wires Gemini's tool-calling to our
actual fund metrics functions, grounded in the user's real financial profile
and holdings -- not generic advice from the model's training data alone.
"""
from google import genai
from google.genai import types
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import settings
from app.models.user import User
from app.models.profile import FinancialProfile
from app.services.advisor_tools import (
    tool_list_synced_funds,
    tool_get_fund_metrics,
    tool_compare_funds,
)

MAX_TOOL_ROUNDS = 5

TOOLS = types.Tool(function_declarations=[
    types.FunctionDeclaration(
        name="list_synced_funds",
        description="Lists every fund/stock currently available in our database, with their ids.",
        parameters=types.Schema(type="OBJECT", properties={}),
    ),
    types.FunctionDeclaration(
        name="get_fund_metrics",
        description="Gets CAGR, Sharpe ratio, volatility, and max drawdown for one specific fund.",
        parameters=types.Schema(
            type="OBJECT",
            properties={"fund_id": types.Schema(type="INTEGER", description="The fund's database id")},
            required=["fund_id"],
        ),
    ),
    types.FunctionDeclaration(
        name="compare_funds",
        description="Compares metrics across multiple funds at once, given a list of their ids.",
        parameters=types.Schema(
            type="OBJECT",
            properties={
                "fund_ids": types.Schema(
                    type="ARRAY",
                    items=types.Schema(type="INTEGER"),
                    description="List of fund database ids to compare",
                )
            },
            required=["fund_ids"],
        ),
    ),
])


def _build_system_instruction(profile: FinancialProfile | None, holdings_summary: str) -> str:
    """Turns the user's stored financial profile + holdings into grounding context."""
    if profile is None:
        return (
            "You are a financial advisor assistant. The user has not yet filled out "
            "their financial profile. Politely ask them to set up their income, "
            "risk appetite, and goals before giving specific investment advice."
        )

    return f"""You are a financial advisor assistant for an Indian investor.

Here is the user's real financial profile -- use it to personalize every answer:
- Monthly income: {profile.currency} {profile.monthly_income}
- Monthly expenses: {profile.currency} {profile.monthly_expenses}
- Monthly investment capacity: {profile.currency} {profile.monthly_investment_capacity}
- Risk appetite: {profile.risk_appetite}
- Investment horizon: {profile.investment_horizon_years} years
- Primary goal: {profile.primary_goal or "not specified"}
- Target amount: {profile.target_amount or "not specified"}

Current holdings:
{holdings_summary}

You have tools to look up real fund data and metrics -- use them whenever the user
asks about specific funds, rather than guessing numbers. Be concise, practical, and
always tie recommendations back to their stated risk appetite, goals, and existing
holdings. This is not professional financial advice and you should note that when
giving specific recommendations."""


async def _execute_tool(session: AsyncSession, name: str, args: dict) -> dict:
    """Routes a tool call by name to the actual Python function, with our DB session."""
    if name == "list_synced_funds":
        return await tool_list_synced_funds(session)
    elif name == "get_fund_metrics":
        return await tool_get_fund_metrics(session, args["fund_id"])
    elif name == "compare_funds":
        return await tool_compare_funds(session, args["fund_ids"])
    else:
        return {"error": f"Unknown tool: {name}"}


async def run_advisor_chat(
    session: AsyncSession,
    user: User,
    profile: FinancialProfile | None,
    holdings_summary: str,
    message: str,
) -> str:
    """
    Sends a user message to Gemini, running the full tool-call loop until
    a final text answer is produced. Returns that final answer as a string.
    """
    client = genai.Client(api_key=settings.gemini_api_key)

    contents: list[types.Content] = [
        types.Content(role="user", parts=[types.Part.from_text(text=message)])
    ]

    config = types.GenerateContentConfig(
        system_instruction=_build_system_instruction(profile, holdings_summary),
        tools=[TOOLS],
    )

    for _ in range(MAX_TOOL_ROUNDS):
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=contents,
            config=config,
        )

        if not response.function_calls:
            return response.text

        contents.append(response.candidates[0].content)

        function_response_parts = []
        for call in response.function_calls:
            result = await _execute_tool(session, call.name, dict(call.args))
            function_response_parts.append(
                types.Part.from_function_response(name=call.name, response=result)
            )

        contents.append(types.Content(role="user", parts=function_response_parts))

    return "I wasn't able to finish gathering the data needed to answer that -- try rephrasing or asking about fewer funds at once."