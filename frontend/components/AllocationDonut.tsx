"use client"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import Card from "@/components/Card"
import { assetLabel } from "@/lib/health"

const COLORS = ["#3b82f6", "#8b5cf6", "#14b8a6", "#f59e0b"]

export default function AllocationDonut({
  allocation,
  currency,
  delay = 0,
}: {
  allocation: Record<string, number>
  currency: string
  delay?: number
}) {
  const data = Object.entries(allocation).map(([key, value]) => ({
    name: assetLabel(key),
    value,
  }))
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <Card delay={delay}>
      <h2 className="text-sm font-medium mb-4" style={{ color: "var(--text-secondary)" }}>
        Allocation
      </h2>
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={data.length > 1 ? 3 : 0}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => `${currency} ${Number(v).toLocaleString()}`}
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #1f2937",
                borderRadius: 8,
                fontSize: 12,
              }}
              itemStyle={{ color: "#e5e7eb" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Total
          </span>
          <span className="num text-lg font-semibold">
            {Math.round(total).toLocaleString()}
          </span>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              {d.name}
            </span>
            <span className="num" style={{ color: "var(--text-secondary)" }}>
              {total > 0 ? ((d.value / total) * 100).toFixed(1) : "0.0"}%
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}