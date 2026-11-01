"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Trash2 } from "lucide-react"
import { apiFetch } from "@/lib/api"
import Card from "@/components/Card"
import AddHoldingForm, { type FundOption } from "@/components/AddHoldingForm"
import Calculators from "@/components/Calculators"

interface Holding {
  id: number
  fund_id: number
  units: number
  avg_buy_price: number
  purchase_date: string
}

const muted = { color: "var(--text-secondary)" }
const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 2 })

export default function HoldingsPage() {
  const router = useRouter()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [funds, setFunds] = useState<FundOption[]>([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    const [holdingsRes, fundsRes] = await Promise.all([
      apiFetch("/holdings/"),
      apiFetch("/funds/"),
    ])
    if (holdingsRes.status === 401) {
      router.push("/login")
      return
    }
    if (holdingsRes.ok) setHoldings(await holdingsRes.json())
    if (fundsRes.ok) setFunds(await fundsRes.json())
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleDelete(id: number) {
    await apiFetch(`/holdings/${id}`, { method: "DELETE" })
    loadData()
  }

  if (loading) {
    return (
      <div className="p-10 text-sm" style={muted}>
        Loading...
      </div>
    )
  }

  const invested = (h: Holding) => h.units * h.avg_buy_price
  const total = holdings.reduce((s, h) => s + invested(h), 0)
  const largest = holdings.reduce<Holding | null>(
    (best, h) => (!best || invested(h) > invested(best) ? h : best),
    null
  )
  const largestFund = largest ? funds.find((f) => f.id === largest.fund_id) : null
  const latest = holdings.map((h) => h.purchase_date).sort().slice(-1)[0]

  const tiles = [
    { label: "Positions", value: holdings.length.toString(), sub: "holdings" },
    { label: "Total invested", value: fmt(total), sub: "at cost" },
    {
      label: "Largest position",
      value: largest && total > 0 ? `${((invested(largest) / total) * 100).toFixed(0)}%` : "—",
      sub: largestFund?.symbol ?? "",
    },
    { label: "Last purchase", value: latest ?? "—", sub: "" },
  ]

  return (
    <div className="max-w-[1400px] mx-auto px-5 py-8 md:px-10 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Holdings</h1>
        <p className="text-sm mt-1" style={muted}>
          Track what you own. Your dashboard and AI advisor use this.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left: portfolio */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {tiles.map((t, i) => (
              <Card key={t.label} delay={i * 0.06} className="!p-4">
                <p className="text-xs" style={muted}>
                  {t.label}
                </p>
                <p className="num text-lg font-semibold mt-1.5">{t.value}</p>
                <p className="num text-xs mt-0.5 h-4" style={muted}>
                  {t.sub}
                </p>
              </Card>
            ))}
          </div>

          <h2 className="text-sm font-medium mb-3" style={muted}>
            Your holdings
          </h2>

          {holdings.length === 0 ? (
            <Card>
              <p className="text-sm" style={muted}>
                No holdings yet. Add your first one using the form.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {holdings.map((h, index) => {
                const fund = funds.find((f) => f.id === h.fund_id)
                const share = total > 0 ? (invested(h) / total) * 100 : 0
                return (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.07 }}
                    className="p-4 rounded-xl border"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor: "var(--border-subtle)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {fund ? fund.name : `Fund #${h.fund_id}`}
                          {fund && (
                            <span className="ml-2 text-xs font-normal num" style={muted}>
                              {fund.symbol}
                            </span>
                          )}
                        </p>
                        <p className="text-xs mt-1" style={muted}>
                          <span className="num">{h.units}</span> {h.units === 1 ? "unit" : "units"} @{" "}
                          <span className="num">{h.avg_buy_price}</span> · bought{" "}
                          <span className="num">{h.purchase_date}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-xs" style={muted}>
                            Invested
                          </p>
                          <p className="num text-sm font-medium">{fmt(invested(h))}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(h.id)}
                          aria-label="Remove holding"
                          className="p-2 rounded-lg transition-colors hover:bg-red-500/10 text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: "var(--bg-base)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${share}%`, backgroundColor: "var(--accent)" }}
                        />
                      </div>
                      <span className="num text-xs w-12 text-right" style={muted}>
                        {share.toFixed(1)}%
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
                    <div id="calculators" className="mt-6">
            <Calculators />
          </div>
        </div>

        {/* Right: tools */}
         <div className="lg:sticky lg:top-6">
         <AddHoldingForm funds={funds} onAdded={loadData} />
          </div>
        </div>
      </div>
  )
}