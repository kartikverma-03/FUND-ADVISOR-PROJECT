"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import type { Profile, PortfolioSummary } from "@/lib/types"
import { buildChecks, assetLabel } from "@/lib/health"
import AnimatedNumber from "@/components/AnimatedNumber"
import Card from "@/components/Card"
import StatTile from "@/components/StatTile"
import PageHeader from "@/components/PageHeader"
import AllocationDonut from "@/components/AllocationDonut"
import HealthChecks from "@/components/HealthChecks"
import ProfileForm from "@/components/ProfileForm"

interface Tile {
  label: string
  n: number
  decimals: number
  prefix?: string
  suffix?: string
  sub: string
  tone?: "up" | "down"
}

const fmt = (v: number) => Math.round(v).toLocaleString()

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [profileRes, portfolioRes] = await Promise.all([
        apiFetch("/profile/"),
        apiFetch("/holdings/summary"),
      ])
      if (profileRes.status === 401) {
        router.push("/login")
        return
      }
      if (profileRes.ok) setProfile(await profileRes.json())
      if (portfolioRes.ok) setPortfolio(await portfolioRes.json())
      setLoading(false)
    }
    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="p-10 text-sm" style={{ color: "var(--text-secondary)" }}>
        Loading...
      </div>
    )
  }

  const cur = profile?.currency ?? "INR"
  const hasPortfolio = !!portfolio && portfolio.total_invested > 0

  const tiles: Tile[] = []
  if (portfolio && hasPortfolio) {
    const gainUp = portfolio.overall_gain_loss >= 0
    const pct = Math.abs(portfolio.overall_gain_loss_pct).toFixed(2)
    const entries = Object.entries(portfolio.allocation).filter(([, v]) => v > 0)
    const total = entries.reduce((s, [, v]) => s + v, 0)
    const top = entries.length ? entries.reduce((a, b) => (b[1] > a[1] ? b : a)) : null

    tiles.push(
      { label: "Invested", n: portfolio.total_invested, decimals: 2, prefix: `${cur} `, sub: "Total cost basis" },
      { label: "Current value", n: portfolio.total_current_value, decimals: 2, prefix: `${cur} `, sub: "At latest market prices" },
      {
        label: "Overall P&L",
        n: Math.abs(portfolio.overall_gain_loss),
        decimals: 2,
        prefix: `${gainUp ? "+" : "-"}${cur} `,
        sub: `${gainUp ? "▲" : "▼"} ${pct}% absolute`,
        tone: gainUp ? "up" : "down",
      },
      {
        label: "Asset classes",
        n: entries.length,
        decimals: 0,
        sub: top && total > 0 ? `${assetLabel(top[0])} · ${((top[1] / total) * 100).toFixed(0)}% largest` : "",
      }
    )
  }

  const checks = profile
    ? buildChecks(profile, hasPortfolio && portfolio ? portfolio.allocation : null)
    : []

  const profileFields = profile
    ? [
        { label: "Monthly income", value: `${cur} ${profile.monthly_income.toLocaleString()}`, mono: true },
        { label: "Monthly expenses", value: `${cur} ${profile.monthly_expenses.toLocaleString()}`, mono: true },
        { label: "Investment capacity", value: `${cur} ${profile.monthly_investment_capacity.toLocaleString()}/mo`, mono: true },
        { label: "Savings", value: `${cur} ${profile.existing_savings.toLocaleString()}`, mono: true },
        { label: "Debt", value: `${cur} ${profile.existing_debt.toLocaleString()}`, mono: true },
        { label: "Risk appetite", value: profile.risk_appetite, mono: false },
        { label: "Horizon", value: `${profile.investment_horizon_years} years`, mono: false },
        { label: "Goal", value: profile.primary_goal || "Not set", mono: false },
      ]
    : []

  return (
    <div className="max-w-[1400px] mx-auto px-5 py-8 md:px-10 md:py-10">
      <PageHeader
        title="Dashboard"
        subtitle={
          hasPortfolio && portfolio
            ? `${Object.keys(portfolio.allocation).length} asset classes · ${profile?.risk_appetite ?? "moderate"} risk profile`
            : "Your portfolio and financial health at a glance."
        }
        actions={
          <>
            <Link
              href="/advisor"
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:border-[var(--accent)]"
              style={{ borderColor: "var(--border-default)" }}
            >
              Ask advisor
            </Link>
            <Link
              href="/holdings"
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ backgroundColor: "var(--accent)", color: "var(--bg-base)" }}
            >
              + Add holding
            </Link>
          </>
        }
      />

      {hasPortfolio ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {tiles.map((t, i) => (
            <StatTile
              key={t.label}
              label={t.label}
              delay={i * 0.08}
              tone={t.tone}
              sub={t.sub}
              value={
                <AnimatedNumber value={t.n} decimals={t.decimals} prefix={t.prefix} suffix={t.suffix} />
              }
            />
          ))}
        </div>
      ) : (
        <Card className="mb-4">
          <h2 className="text-base font-semibold">No holdings yet</h2>
          <p className="text-sm mt-1 mb-4" style={{ color: "var(--text-secondary)" }}>
            Add your first holding to see your allocation, returns and risk checks.
          </p>
          <Link
            href="/holdings"
            className="inline-block px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: "var(--accent)", color: "var(--bg-base)" }}
          >
            Add a holding
          </Link>
        </Card>
      )}

      {profile ? (
        <>
          <div className="grid lg:grid-cols-3 gap-4 mb-4">
            <div className={hasPortfolio ? "lg:col-span-2" : "lg:col-span-3"}>
              <HealthChecks checks={checks} delay={0.35} />
            </div>
            {hasPortfolio && portfolio && (
              <AllocationDonut allocation={portfolio.allocation} currency={cur} delay={0.4} />
            )}
          </div>

          <Card delay={0.45}>
            <h2 className="label mb-5">Your financial profile</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
              {profileFields.map((f) => (
                <div key={f.label}>
                  <p className="label">{f.label}</p>
                  <p className={`text-sm mt-1.5 capitalize ${f.mono ? "num" : ""}`}>{f.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <Card delay={0.2}>
          <h2 className="text-base font-semibold">Set up your financial profile</h2>
          <p className="text-sm mt-1 mb-6" style={{ color: "var(--text-secondary)" }}>
            This powers your health checks and makes the AI advisor's answers personal.
          </p>
          <ProfileForm onSaved={setProfile} />
        </Card>
      )}
    </div>
  )
}