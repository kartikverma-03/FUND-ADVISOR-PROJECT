"use client"
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import type { HistoryPoint } from "@/components/MetricsPanel"

export default function Sparkline({ points }: { points: HistoryPoint[] }) {
  if (points.length < 2) return <div className="h-10" />
  const step = Math.max(1, Math.floor(points.length / 60))
  const data = points.filter((_, i) => i % step === 0)
  const up = data[data.length - 1].value >= data[0].value
  return (
    <div className="h-10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={up ? "#34d399" : "#f87171"}
            strokeWidth={1.8}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}