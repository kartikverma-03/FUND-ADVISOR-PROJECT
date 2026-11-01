"use client"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import MetricsPanel, { type HistoryPoint, type Metrics } from "@/components/MetricsPanel"

const RANGES: [string, number][] = [
  ["1M", 30],
  ["6M", 182],
  ["1Y", 365],
  ["3Y", 1095],
  ["All", 0],
]

function slice(history: HistoryPoint[], days: number) {
  if (!history.length) return history
  let out = history
  if (days) {
    const d = new Date(history[history.length - 1].date)
    d.setDate(d.getDate() - days)
    const cutoff = d.toISOString().slice(0, 10)
    out = history.filter((p) => p.date >= cutoff)
  }
  const step = Math.max(1, Math.floor(out.length / 120))
  return out.filter((_, i) => i % step === 0)
}

export default function FundDrawer({
  fund,
  metrics,
  history,
  onClose,
}: {
  fund: { name: string; symbol: string; category: string | null } | null
  metrics: Metrics | null
  history: HistoryPoint[]
  onClose: () => void
}) {
  const [days, setDays] = useState(365)

  return (
    <AnimatePresence>
      {fund && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60"
          />
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="fixed right-0 inset-y-0 z-50 w-full max-w-lg overflow-y-auto border-l p-6"
            style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border-subtle)" }}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold">{fund.name}</h2>
                <p className="text-xs mt-1 num" style={{ color: "var(--text-secondary)" }}>
                  {fund.symbol}
                  {fund.category ? ` · ${fund.category}` : ""}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded-lg hover:bg-white/5"
                style={{ color: "var(--text-secondary)" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-1 mb-4">
              {RANGES.map(([label, d]) => (
                <button
                  key={label}
                  onClick={() => setDays(d)}
                  className="px-3 py-1 rounded-md text-xs"
                  style={{
                    backgroundColor: days === d ? "var(--accent-soft)" : "transparent",
                    color: days === d ? "var(--accent)" : "var(--text-secondary)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <MetricsPanel metrics={metrics} history={slice(history, days)} loading={false} />

            <p className="text-xs mt-6" style={{ color: "var(--text-secondary)" }}>
              Past performance does not guarantee future results.
            </p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}