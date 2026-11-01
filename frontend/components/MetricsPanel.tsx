"use client"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

export interface HistoryPoint {
  date: string
  value: number
}

export interface Metrics {
  symbol: string
  name: string
  cagr_1y: number | null
  cagr_3y: number | null
  cagr_5y: number | null
  sharpe_ratio: number | null
  std_deviation: number | null
  max_drawdown: number | null
}

function Tile({ label, value, suffix = "" }: { label: string; value: number | null; suffix?: string }) {
  const color =
    value === null || suffix !== "%" || label === "Volatility"
      ? ""
      : value >= 0
      ? "text-emerald-400"
      : "text-red-400"
  return (
    <div
      className="rounded-lg border p-3"
      style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border-subtle)" }}
    >
      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
      <p className={`num text-base font-semibold mt-1 ${color}`}>
        {value !== null ? `${value}${suffix}` : "—"}
      </p>
    </div>
  )
}

export default function MetricsPanel({
  metrics,
  history,
  loading,
}: {
  metrics: Metrics | null
  history: HistoryPoint[]
  loading: boolean
}) {
  const muted = { color: "var(--text-secondary)" }
  if (loading) return <p className="text-sm" style={muted}>Loading metrics...</p>
  if (!metrics) return <p className="text-sm" style={muted}>Could not load metrics.</p>

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <Tile label="CAGR 1y" value={metrics.cagr_1y} suffix="%" />
        <Tile label="CAGR 3y" value={metrics.cagr_3y} suffix="%" />
        <Tile label="CAGR 5y" value={metrics.cagr_5y} suffix="%" />
        <Tile label="Sharpe" value={metrics.sharpe_ratio} />
        <Tile label="Volatility" value={metrics.std_deviation} suffix="%" />
        <Tile label="Max drawdown" value={metrics.max_drawdown} suffix="%" />
      </div>
      {history.length > 0 && (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickFormatter={(d) => d.slice(0, 7)}
                interval="preserveStartEnd"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#64748b" }}
                domain={["auto", "auto"]}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #1f2937",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  )
}