"use client"
import Card from "@/components/Card"
import type { Metrics } from "@/components/MetricsPanel"

const pct = (v: number | null) => (v !== null ? `${v}%` : "—")

export default function CompareTable({ results }: { results: Metrics[] }) {
  const head = ["Fund", "CAGR 1y", "CAGR 3y", "CAGR 5y", "Sharpe", "Volatility", "Max DD"]
  return (
    <Card className="mb-6 !p-0 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr
            className="border-b text-left"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
          >
            {head.map((h) => (
              <th key={h} className="p-3 font-medium text-xs whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((m, i) => (
            <tr
              key={i}
              className="border-b last:border-0"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <td className="p-3 font-medium whitespace-nowrap">{m.name}</td>
              <td className="p-3 num">{pct(m.cagr_1y)}</td>
              <td className="p-3 num">{pct(m.cagr_3y)}</td>
              <td className="p-3 num">{pct(m.cagr_5y)}</td>
              <td className="p-3 num">{m.sharpe_ratio ?? "—"}</td>
              <td className="p-3 num">{pct(m.std_deviation)}</td>
              <td className="p-3 num">{pct(m.max_drawdown)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}