"use client"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import Sparkline from "@/components/Sparkline"
import { assetLabel } from "@/lib/health"
import type { HistoryPoint, Metrics } from "@/components/MetricsPanel"

interface Fund {
  id: number
  symbol: string
  name: string
  asset_type: string
  category: string | null
}

const muted = { color: "var(--text-secondary)" }
const pct = (v: number | null | undefined) => (v === null || v === undefined ? "—" : `${v}%`)

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px]" style={muted}>
        {label}
      </p>
      <p className="num text-sm mt-0.5">{value}</p>
    </div>
  )
}

export default function FundCard({
  fund,
  metrics,
  history,
  selected,
  index,
  onToggle,
  onOpen,
}: {
  fund: Fund
  metrics?: Metrics
  history?: HistoryPoint[]
  selected: boolean
  index: number
  onToggle: () => void
  onOpen: () => void
}) {
  const r1 = metrics?.cagr_1y ?? null
  const color = r1 === null ? "" : r1 >= 0 ? "text-emerald-400" : "text-red-400"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.05 }}
      onClick={onOpen}
      className="rounded-2xl border p-5 cursor-pointer transition-colors hover:border-[var(--accent)]"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: selected ? "var(--accent)" : "var(--border-subtle)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{fund.name}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="num text-xs" style={muted}>
              {fund.symbol}
            </span>
            <span
              className="text-[11px] px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
            >
              {assetLabel(fund.asset_type)}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          aria-label="Select for comparison"
          className="w-5 h-5 shrink-0 rounded-md border flex items-center justify-center"
          style={{
            borderColor: selected ? "var(--accent)" : "var(--border-subtle)",
            backgroundColor: selected ? "var(--accent)" : "transparent",
          }}
        >
          {selected && <Check size={14} style={{ color: "var(--bg-base)" }} />}
        </button>
      </div>

      <div className="flex items-end justify-between gap-4 mt-5">
        <div>
          <p className="text-[11px]" style={muted}>
            1Y return
          </p>
          <p className={`num text-2xl font-semibold ${color}`}>
            {metrics ? pct(r1) : "…"}
          </p>
        </div>
        <div className="w-28">{history && <Sparkline points={history} />}</div>
      </div>

      <div
        className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Mini label="Sharpe" value={metrics?.sharpe_ratio?.toString() ?? "—"} />
        <Mini label="Volatility" value={pct(metrics?.std_deviation)} />
        <Mini label="Max DD" value={pct(metrics?.max_drawdown)} />
      </div>
    </motion.div>
  )
}