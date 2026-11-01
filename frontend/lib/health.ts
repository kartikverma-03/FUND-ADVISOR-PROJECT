import type { Profile } from "@/lib/types"

export type Level = "good" | "warn" | "risk"

export interface Check {
  level: Level
  title: string
  detail: string
}

const ASSET_LABELS: Record<string, string> = {
  stock: "Stocks",
  indian_mf: "Indian mutual funds",
  global_fund: "Global funds",
}

export function assetLabel(key: string): string {
  return ASSET_LABELS[key] ?? key
}

const fmt = (n: number) => Math.round(n).toLocaleString()

export function buildChecks(
  profile: Profile,
  allocation: Record<string, number> | null
): Check[] {
  const cur = profile.currency
  const checks: Check[] = []

  // Budget
  const surplus = profile.monthly_income - profile.monthly_expenses
  if (surplus <= 0) {
    checks.push({
      level: "risk",
      title: "Spending matches or exceeds income",
      detail: "There is no monthly surplus to invest. Reducing expenses comes before investing more.",
    })
  } else if (profile.monthly_investment_capacity > surplus) {
    checks.push({
      level: "warn",
      title: "Investment plan is above your surplus",
      detail: `You plan to invest ${cur} ${fmt(profile.monthly_investment_capacity)} a month, but only ${cur} ${fmt(surplus)} is left after expenses.`,
    })
  } else {
    const rate = (profile.monthly_investment_capacity / profile.monthly_income) * 100
    checks.push({
      level: "good",
      title: "Investment plan fits your budget",
      detail: `You plan to invest ${rate.toFixed(0)}% of income, within your monthly surplus of ${cur} ${fmt(surplus)}.`,
    })
  }

  // Emergency fund
  if (profile.monthly_expenses > 0) {
    const months = profile.existing_savings / profile.monthly_expenses
    const label = months.toFixed(1)
    if (months < 3) {
      checks.push({
        level: "risk",
        title: "Thin emergency fund",
        detail: `Your savings cover about ${label} months of expenses. Many planners suggest 6.`,
      })
    } else if (months < 6) {
      checks.push({
        level: "warn",
        title: "Emergency fund below 6 months",
        detail: `Your savings cover about ${label} months of expenses. 6 months is a common target.`,
      })
    } else {
      checks.push({
        level: "good",
        title: "Emergency fund in place",
        detail: `Your savings cover about ${label} months of expenses.`,
      })
    }
  }

  // Debt
  if (profile.existing_debt > 0 && profile.monthly_income > 0) {
    const ratio = profile.existing_debt / (profile.monthly_income * 12)
    const pct = (ratio * 100).toFixed(0)
    if (ratio > 0.4) {
      checks.push({
        level: "risk",
        title: "High debt load",
        detail: `Your debt is about ${pct}% of annual income. Paying it down may beat investing.`,
      })
    } else if (ratio > 0.1) {
      checks.push({
        level: "warn",
        title: "Moderate debt",
        detail: `Your debt is about ${pct}% of annual income. Check the interest rates on it.`,
      })
    } else {
      checks.push({
        level: "good",
        title: "Manageable debt",
        detail: `Your debt is about ${pct}% of annual income.`,
      })
    }
  } else {
    checks.push({ level: "good", title: "No debt recorded", detail: "You have no existing debt on your profile." })
  }

  // Concentration
  if (allocation) {
    const entries = Object.entries(allocation).filter(([, v]) => v > 0)
    const total = entries.reduce((s, [, v]) => s + v, 0)
    if (entries.length > 0 && total > 0) {
      const [topKey, topVal] = entries.reduce((a, b) => (b[1] > a[1] ? b : a))
      const share = (topVal / total) * 100
      const name = assetLabel(topKey).toLowerCase()
      if (entries.length === 1) {
        checks.push({
          level: "warn",
          title: "Single asset class",
          detail: `All of your portfolio is in ${name}. Spreading across asset classes can reduce risk.`,
        })
      } else if (share >= 70) {
        checks.push({
          level: "warn",
          title: "Concentrated portfolio",
          detail: `${share.toFixed(0)}% of your portfolio is in ${name}.`,
        })
      } else {
        checks.push({
          level: "good",
          title: "Reasonably diversified",
          detail: `Your largest asset class (${name}) is ${share.toFixed(0)}% of the portfolio.`,
        })
      }
    }
  }

  const order: Record<Level, number> = { risk: 0, warn: 1, good: 2 }
  return checks.sort((a, b) => order[a.level] - order[b.level])
}