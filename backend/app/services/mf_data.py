from datetime import datetime
from typing import Optional

import httpx


MFAPI_BASE_URL = "https://api.mfapi.in/mf"


async def fetch_mf_nav_history(scheme_code: str) -> Optional[dict]:
    """
    Fetches full NAV history for an Indian mutual fund from MFAPI.in.
    scheme_code is the AMFI code, e.g. '119551' for a specific fund.
    Returns raw data with fund metadata + a list of {date, nav} entries, or None if not found.
    """
    url = f"{MFAPI_BASE_URL}/{scheme_code}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)

    if response.status_code != 200:
        return None

    data = response.json()
    if data.get("status") != "SUCCESS":
        return None

    return data


def parse_nav_entries(raw_data: dict) -> list[dict]:
    """
    Converts MFAPI's raw NAV list into a clean format ready for our FundNav table.
    MFAPI dates come as strings like '15-09-2026' (DD-MM-YYYY) — we convert to real dates.
    """
    entries = []
    for item in raw_data.get("data", []):
        entries.append({
            "date": datetime.strptime(item["date"], "%d-%m-%Y").date(),
            "value": float(item["nav"]),
        })
    return entries