"use client"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import Card from "@/components/Card"
import type { HistoryPoint } from "@/components/MetricsPanel"

const COLORS = ["#3b82f6", "#a78bfa", "#2dd4bf", "#fbbf24", "#f472b6", "#fb923c"]

export default function CompareChart({
  series,
}: {
  series: { name: string; points: HistoryPoint[] }[]
}) {
  const usable = series.filter((s) => s.points.length > 1)
  if (usable.length < 2) return null

  const start = usable.map((s) => s.points[0].date).sort().slice(-1)[0]
  const rows: Record<string, Record<string, number | string>> = {}

  usable.forEach((s) => {
    const pts = s.points.filter((p) => p.date >= start)
    if (!pts.length) return
    const base = pts[0].value
    pts.forEach((p) => {
      rows[p.date] = rows[p.date] || { date: p.date }
      rows[p.date][s.name] = Number(((p.value / base) * 100).toFixed(2))
    })
  })

  const all = Object.values(rows).sort((a, b) => String(a.date).localeCompare(String(b.date)))
  const step = Math.max(1, Math.floor(all.length / 150))
  const data = all.filter((_, i) => i % step === 0)

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          Growth of 100, same start date
        </h2>
        <span className="text-xs num" style={{ color: "var(--text-secondary)" }}>
          from {start}
        </span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickFormatter={(d) => String(d).slice(0, 7)}
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
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {usable.map((s, i) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={COLORS[i % COLORS.length]}
                dot={false}
                strokeWidth={2}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}