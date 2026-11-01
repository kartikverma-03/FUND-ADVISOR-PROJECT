"use client"
import { CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react"
import Card from "@/components/Card"
import type { Check, Level } from "@/lib/health"

const STYLE: Record<Level, { Icon: typeof CheckCircle2; color: string }> = {
  good: { Icon: CheckCircle2, color: "#34d399" },
  warn: { Icon: AlertTriangle, color: "#fbbf24" },
  risk: { Icon: ShieldAlert, color: "#f87171" },
}

export default function HealthChecks({
  checks,
  delay = 0,
}: {
  checks: Check[]
  delay?: number
}) {
  const flagged = checks.filter((c) => c.level !== "good").length

  return (
    <Card delay={delay} className="h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          Financial health checks
        </h2>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {flagged === 0 ? "All clear" : `${flagged} to review`}
        </span>
      </div>
      <ul className="space-y-4">
        {checks.map((c) => {
          const { Icon, color } = STYLE[c.level]
          return (
            <li key={c.title} className="flex gap-3">
              <Icon size={18} className="mt-0.5 shrink-0" style={{ color }} />
              <div>
                <p className="text-sm font-medium">{c.title}</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {c.detail}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-6 text-xs" style={{ color: "var(--text-secondary)" }}>
        Automated checks for education only, not personalised financial advice.
      </p>
    </Card>
  )
}