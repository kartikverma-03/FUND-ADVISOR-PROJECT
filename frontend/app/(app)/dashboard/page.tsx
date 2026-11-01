"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import type { Profile, PortfolioSummary } from "@/lib/types"
import { buildChecks } from "@/lib/health"
import AnimatedNumber from "@/components/AnimatedNumber"
import Card from "@/components/Card"
import AllocationDonut from "@/components/AllocationDonut"
import HealthChecks from "@/components/HealthChecks"
import ProfileForm from "@/components/ProfileForm"

type Stat = {
  label: string
  value: number
  prefix: string
  suffix?: string
  color?: string
}

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

  const stats: Stat[] = []
  if (portfolio && hasPortfolio) {
    const gainUp = portfolio.overall_gain_loss >= 0
    const pctUp = portfolio.overall_gain_loss_pct >= 0
    stats.push(
      { label: "Invested", value: portfolio.total_invested, prefix: `${cur} ` },
      { label: "Current value", value: portfolio.total_current_value, prefix: `${cur} ` },
      {
        label: "Gain / loss",
        value: Math.abs(portfolio.overall_gain_loss),
        prefix: `${gainUp ? "+" : "-"}${cur} `,
        color: gainUp ? "text-emerald-400" : "text-red-400",
      },
      {
        label: "Return",
        value: Math.abs(portfolio.overall_gain_loss_pct),
        prefix: pctUp ? "+" : "-",
        suffix: "%",
        color: pctUp ? "text-emerald-400" : "text-red-400",
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
    <div className="max-w-5xl mx-auto px-5 py-8 md:px-10 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Your portfolio and financial health at a glance.
        </p>
      </div>

      {hasPortfolio ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {stats.map((s, i) => (
            <Card key={s.label} delay={i * 0.08}>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {s.label}
              </p>
              <p className={`num text-xl font-semibold mt-2 ${s.color ?? ""}`}>
                <AnimatedNumber value={s.value} decimals={2} prefix={s.prefix} suffix={s.suffix} />
              </p>
            </Card>
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
            <h2 className="text-sm font-medium mb-5" style={{ color: "var(--text-secondary)" }}>
              Your financial profile
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
              {profileFields.map((f) => (
                <div key={f.label}>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {f.label}
                  </p>
                  <p className={`text-sm mt-1 capitalize ${f.mono ? "num" : ""}`}>{f.value}</p>
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