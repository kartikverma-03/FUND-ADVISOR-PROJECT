"use client"
import type { ReactNode } from "react"
import Card from "@/components/Card"

export default function StatTile({
  label,
  value,
  sub,
  tone,
  delay = 0,
}: {
  label: string
  value: ReactNode
  sub?: ReactNode
  tone?: "up" | "down"
  delay?: number
}) {
  const color = tone === "up" ? "text-emerald-400" : tone === "down" ? "text-red-400" : ""
  return (
    <Card delay={delay}>
      <p className="label">{label}</p>
      <p className={`num text-2xl font-semibold mt-3 ${color}`}>{value}</p>
      <p
        className={`num text-xs mt-2 min-h-4 ${color}`}
        style={tone ? undefined : { color: "var(--text-secondary)" }}
      >
        {sub}
      </p>
    </Card>
  )
}