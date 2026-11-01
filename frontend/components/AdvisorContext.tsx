"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Eye } from "lucide-react"
import { apiFetch } from "@/lib/api"
import type { Profile, PortfolioSummary } from "@/lib/types"

const muted = { color: "var(--text-secondary)" }
const fmt = (v: number) => Math.round(v).toLocaleString()

function Row({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  const color = tone === "up" ? "text-emerald-400" : tone === "down" ? "text-red-400" : ""
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={muted}>{label}</span>
      <span className={`num capitalize ${color}`}>{value}</span>
    </div>
  )
}

export default function AdvisorContext() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null)

  useEffect(() => {
    async function load() {
      const [p, s] = await Promise.all([apiFetch("/profile/"), apiFetch("/holdings/summary")])
      if (p.ok) setProfile(await p.json())
      if (s.ok) setPortfolio(await s.json())
    }
    load()
  }, [])

  const cur = profile?.currency ?? ""
  const has = !!portfolio && portfolio.total_invested > 0
  const up = (portfolio?.overall_gain_loss_pct ?? 0) >= 0

  return (
    <aside
      className="hidden xl:block w-80 shrink-0 border-l p-6 overflow-y-auto"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Eye size={15} style={{ color: "var(--accent)" }} />
        <h2 className="text-sm font-semibold">What the advisor sees</h2>
      </div>
      <p className="text-xs mb-6" style={muted}>
        Answers are based on this information from your account.
      </p>

      <p className="text-[11px] uppercase tracking-wider mb-3" style={muted}>
        Portfolio
      </p>
      {has && portfolio ? (
        <div className="space-y-2.5 mb-6">
          <Row label="Invested" value={`${cur} ${fmt(portfolio.total_invested)}`} />
          <Row label="Current value" value={`${cur} ${fmt(portfolio.total_current_value)}`} />
          <Row
            label="Return"
            value={`${up ? "+" : ""}${portfolio.overall_gain_loss_pct.toFixed(2)}%`}
            tone={up ? "up" : "down"}
          />
        </div>
      ) : (
        <p className="text-sm mb-6" style={muted}>
          No holdings yet.{" "}
          <Link href="/holdings" className="underline" style={{ color: "var(--accent)" }}>
            Add some
          </Link>{" "}
          for portfolio-aware answers.
        </p>
      )}

      <p className="text-[11px] uppercase tracking-wider mb-3" style={muted}>
        Profile
      </p>
      {profile ? (
        <div className="space-y-2.5 mb-6">
          <Row label="Risk appetite" value={profile.risk_appetite} />
          <Row label="Horizon" value={`${profile.investment_horizon_years} years`} />
          <Row label="Monthly capacity" value={`${cur} ${fmt(profile.monthly_investment_capacity)}`} />
          <Row label="Goal" value={profile.primary_goal || "Not set"} />
        </div>
      ) : (
        <p className="text-sm mb-6" style={muted}>
          Profile not set up.{" "}
          <Link href="/dashboard" className="underline" style={{ color: "var(--accent)" }}>
            Set it up
          </Link>
        </p>
      )}

      <p
        className="text-[11px] leading-relaxed pt-4 border-t"
        style={{ ...muted, borderColor: "var(--border-subtle)" }}
      >
        AI responses are for education and can be wrong. This is not personalised financial
        advice. Check important decisions with a licensed professional.
      </p>
    </aside>
  )
}