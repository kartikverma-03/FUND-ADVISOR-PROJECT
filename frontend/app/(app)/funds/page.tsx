"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { assetLabel } from "@/lib/health"
import Card from "@/components/Card"
import CompareTable from "@/components/CompareTable"
import CompareChart from "@/components/CompareChart"
import FundCard from "@/components/FundCard"
import FundDrawer from "@/components/FundDrawer"
import type { HistoryPoint, Metrics } from "@/components/MetricsPanel"

interface Fund {
  id: number
  symbol: string
  name: string
  asset_type: string
  category: string | null
}

type SortKey = "name" | "cagr_1y" | "sharpe_ratio" | "std_deviation"

const inputClass =
  "px-3 py-2.5 rounded-lg text-sm border outline-none focus:border-[var(--accent)] transition-colors"
const inputStyle = {
  backgroundColor: "var(--bg-base)",
  borderColor: "var(--border-subtle)",
  color: "var(--text-primary)",
}
const muted = { color: "var(--text-secondary)" }
const primaryBtn = { backgroundColor: "var(--accent)", color: "var(--bg-base)" }
const TYPES = ["all", "stock", "global_fund", "indian_mf"]

export default function FundsPage() {
  const router = useRouter()
  const [funds, setFunds] = useState<Fund[]>([])
  const [loading, setLoading] = useState(true)
  const [metricsMap, setMetricsMap] = useState<Record<number, Metrics>>({})
  const [historyMap, setHistoryMap] = useState<Record<number, HistoryPoint[]>>({})
  const requested = useRef<Set<number>>(new Set())

  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState("")
  const [symbol, setSymbol] = useState("")
  const [assetType, setAssetType] = useState("stock")

  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [openId, setOpenId] = useState<number | null>(null)

  async function loadFunds() {
    const res = await apiFetch("/funds/")
    if (res.status === 401) {
      router.push("/login")
      return
    }
    if (res.ok) setFunds(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    loadFunds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch metrics + history for every fund once, in parallel
  useEffect(() => {
    funds.forEach(async (f) => {
      if (requested.current.has(f.id)) return
      requested.current.add(f.id)
      const [m, h] = await Promise.all([
        apiFetch(`/funds/${f.id}/metrics`),
        apiFetch(`/funds/${f.id}/history`),
      ])
      if (m.ok) {
        const data = await m.json()
        setMetricsMap((prev) => ({ ...prev, [f.id]: data }))
      }
      if (h.ok) {
        const data = await h.json()
        setHistoryMap((prev) => ({ ...prev, [f.id]: data.history }))
      }
    })
  }, [funds])

  async function handleSync(e: React.FormEvent) {
    e.preventDefault()
    setSyncing(true)
    setSyncError("")
    const res = await apiFetch("/funds/sync", {
      method: "POST",
      body: JSON.stringify({ symbol: symbol.trim(), asset_type: assetType }),
    })
    if (res.ok) {
      setSymbol("")
      loadFunds()
    } else {
      const data = await res.json().catch(() => ({}))
      setSyncError(data.detail || "Could not sync this symbol. Double check it's correct.")
    }
    setSyncing(false)
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = funds.filter(
      (f) =>
        (typeFilter === "all" || f.asset_type === typeFilter) &&
        (!q || f.name.toLowerCase().includes(q) || f.symbol.toLowerCase().includes(q))
    )
    return list.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name)
      const av = metricsMap[a.id]?.[sortKey] ?? null
      const bv = metricsMap[b.id]?.[sortKey] ?? null
      if (av === null) return 1
      if (bv === null) return -1
      return sortKey === "std_deviation" ? av - bv : bv - av
    })
  }, [funds, query, typeFilter, sortKey, metricsMap])

  const best = useMemo(() => {
    const rows = funds
      .map((f) => ({ f, m: metricsMap[f.id] }))
      .filter((r) => r.m)
    const pick = (key: "cagr_1y" | "sharpe_ratio" | "std_deviation", min = false) => {
      const valid = rows.filter((r) => r.m[key] !== null)
      if (!valid.length) return null
      return valid.reduce((a, b) =>
        (min ? (b.m[key] as number) < (a.m[key] as number) : (b.m[key] as number) > (a.m[key] as number)) ? b : a
      )
    }
    return {
      ret: pick("cagr_1y"),
      sharpe: pick("sharpe_ratio"),
      vol: pick("std_deviation", true),
    }
  }, [funds, metricsMap])

  const selectedFunds = funds.filter((f) => selectedIds.has(f.id))
  const compareMetrics = selectedFunds
    .map((f) => metricsMap[f.id])
    .filter((m): m is Metrics => !!m)
  const openFund = funds.find((f) => f.id === openId) ?? null

  if (loading) {
    return (
      <div className="p-10 text-sm" style={muted}>
        Loading...
      </div>
    )
  }

  const tiles = [
    { label: "Funds tracked", value: funds.length.toString(), sub: "synced" },
    {
      label: "Best 1Y return",
      value: best.ret ? `${best.ret.m.cagr_1y}%` : "—",
      sub: best.ret?.f.symbol ?? "",
    },
    {
      label: "Best Sharpe ratio",
      value: best.sharpe ? `${best.sharpe.m.sharpe_ratio}` : "—",
      sub: best.sharpe?.f.symbol ?? "",
    },
    {
      label: "Lowest volatility",
      value: best.vol ? `${best.vol.m.std_deviation}%` : "—",
      sub: best.vol?.f.symbol ?? "",
    },
  ]

  return (
    <div className="max-w-[1400px] mx-auto px-5 py-8 md:px-10 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Funds</h1>
        <p className="text-sm mt-1" style={muted}>
          Research stocks and funds side by side. Click any card for details.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {tiles.map((t, i) => (
          <Card key={t.label} delay={i * 0.06}>
            <p className="text-xs" style={muted}>
              {t.label}
            </p>
            <p className="num text-xl font-semibold mt-2">{t.value}</p>
            <p className="num text-xs mt-1 h-4" style={muted}>
              {t.sub}
            </p>
          </Card>
        ))}
      </div>

      <Card className="mb-6" delay={0.25}>
        <form onSubmit={handleSync} className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <p className="text-sm font-medium lg:mr-2 shrink-0" style={muted}>
            Add to your universe
          </p>
          <input
            type="text"
            placeholder="Symbol (e.g. AAPL) or MF scheme code"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className={`${inputClass} flex-1`}
            style={inputStyle}
            required
          />
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            className={inputClass}
            style={inputStyle}
          >
            <option value="stock">Stock</option>
            <option value="global_fund">Global fund</option>
            <option value="indian_mf">Indian MF</option>
          </select>
          <button
            type="submit"
            disabled={syncing}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
            style={primaryBtn}
          >
            {syncing ? "Syncing..." : "Sync"}
          </button>
        </form>
        {syncError && <p className="text-sm text-red-400 mt-3">{syncError}</p>}
      </Card>

      {funds.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between mb-5">
          <div className="relative lg:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={muted}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or symbol"
              className={`${inputClass} w-full pl-9`}
              style={inputStyle}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className="px-3 py-1.5 rounded-full text-xs border transition-colors"
                style={{
                  borderColor: typeFilter === t ? "var(--accent)" : "var(--border-subtle)",
                  backgroundColor: typeFilter === t ? "var(--accent-soft)" : "transparent",
                  color: typeFilter === t ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                {t === "all" ? "All" : assetLabel(t)}
              </button>
            ))}
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className={`${inputClass} !py-1.5 text-xs`}
              style={inputStyle}
            >
              <option value="name">Sort: Name</option>
              <option value="cagr_1y">Sort: 1Y return</option>
              <option value="sharpe_ratio">Sort: Sharpe</option>
              <option value="std_deviation">Sort: Lowest volatility</option>
            </select>
          </div>
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm" style={muted}>
            {selectedIds.size < 2
              ? "Select one more to compare"
              : `Comparing ${selectedIds.size} funds`}
          </p>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="flex items-center gap-1 text-xs"
            style={muted}
          >
            <X size={14} /> Clear selection
          </button>
        </div>
      )}

      {selectedIds.size >= 2 && (
        <>
          <CompareChart
            series={selectedFunds.map((f) => ({
              name: f.symbol,
              points: historyMap[f.id] ?? [],
            }))}
          />
          {compareMetrics.length > 0 && <CompareTable results={compareMetrics} />}
        </>
      )}

      {funds.length === 0 ? (
        <Card>
          <p className="text-sm" style={muted}>
            Nothing here yet. Sync a symbol above, for example AAPL, to get started.
          </p>
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <p className="text-sm" style={muted}>
            No funds match your filters.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((f, i) => (
            <FundCard
              key={f.id}
              fund={f}
              metrics={metricsMap[f.id]}
              history={historyMap[f.id]}
              selected={selectedIds.has(f.id)}
              index={i}
              onToggle={() => toggleSelect(f.id)}
              onOpen={() => setOpenId(f.id)}
            />
          ))}
        </div>
      )}

      <FundDrawer
        fund={openFund}
        metrics={openFund ? metricsMap[openFund.id] ?? null : null}
        history={openFund ? historyMap[openFund.id] ?? [] : []}
        onClose={() => setOpenId(null)}
      />
    </div>
  )
}