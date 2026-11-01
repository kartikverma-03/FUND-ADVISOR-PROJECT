"use client"
import { useState } from "react"
import Card from "@/components/Card"

const inputClass =
  "w-full px-3 py-2 rounded-lg text-sm border outline-none focus:border-[var(--accent)] transition-colors num"
const inputStyle = {
  backgroundColor: "var(--bg-base)",
  borderColor: "var(--border-subtle)",
  color: "var(--text-primary)",
}
const muted = { color: "var(--text-secondary)" }

const n = (s: string) => parseFloat(s) || 0
const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 2 })

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block text-xs space-y-1.5" style={muted}>
      {label}
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        style={inputStyle}
      />
    </label>
  )
}

function Result({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  const color = tone === "up" ? "text-emerald-400" : tone === "down" ? "text-red-400" : ""
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={muted}>{label}</span>
      <span className={`num font-semibold ${color}`}>{value}</span>
    </div>
  )
}

function Layout({
  inputs,
  results,
  note,
}: {
  inputs: React.ReactNode
  results: React.ReactNode
  note?: string
}) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="grid grid-cols-2 gap-3 content-start">{inputs}</div>
      <div
        className="space-y-3 pt-5 border-t md:pt-0 md:border-t-0 md:border-l md:pl-6"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {results}
        {note && (
          <p className="text-[11px] pt-2" style={muted}>
            {note}
          </p>
        )}
      </div>
    </div>
  )
}

function AverageCalc() {
  const [cu, setCu] = useState("")
  const [ca, setCa] = useState("")
  const [nu, setNu] = useState("")
  const [np, setNp] = useState("")
  const totalUnits = n(cu) + n(nu)
  const invested = n(cu) * n(ca) + n(nu) * n(np)
  const avg = totalUnits > 0 ? invested / totalUnits : 0
  return (
    <Layout
      inputs={
        <>
          <Field label="Current units" value={cu} onChange={setCu} />
          <Field label="Current avg price" value={ca} onChange={setCa} />
          <Field label="Units to buy" value={nu} onChange={setNu} />
          <Field label="Buy price" value={np} onChange={setNp} />
        </>
      }
      results={
        <>
          <Result label="New average price" value={fmt(avg)} />
          <Result label="Total units" value={fmt(totalUnits)} />
          <Result label="Total invested" value={fmt(invested)} />
        </>
      }
      note="See how buying more changes your average cost per unit."
    />
  )
}

function IpoCalc() {
  const [price, setPrice] = useState("")
  const [lot, setLot] = useState("")
  const [lots, setLots] = useState("1")
  const [listing, setListing] = useState("")
  const cost = n(price) * n(lot) * n(lots)
  const value = n(listing) * n(lot) * n(lots)
  const gain = value - cost
  const pct = cost > 0 ? (gain / cost) * 100 : 0
  const tone = gain === 0 ? undefined : gain > 0 ? "up" : "down"
  return (
    <Layout
      inputs={
        <>
          <Field label="Upper price band" value={price} onChange={setPrice} />
          <Field label="Lot size (shares)" value={lot} onChange={setLot} />
          <Field label="Lots applied" value={lots} onChange={setLots} />
          <Field label="Expected listing price" value={listing} onChange={setListing} />
        </>
      }
      results={
        <>
          <Result label="Amount to apply" value={fmt(cost)} />
          <Result label="Value at listing" value={fmt(value)} />
          <Result label="Listing gain / loss" value={`${gain >= 0 ? "+" : ""}${fmt(gain)}`} tone={tone} />
          <Result label="Return" value={`${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`} tone={tone} />
        </>
      }
      note="Allotment is not guaranteed. Assumes you receive every lot you apply for."
    />
  )
}

function SipCalc() {
  const [monthly, setMonthly] = useState("")
  const [rate, setRate] = useState("12")
  const [years, setYears] = useState("10")
  const r = n(rate) / 100 / 12
  const months = n(years) * 12
  const fv =
    r > 0
      ? n(monthly) * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
      : n(monthly) * months
  const invested = n(monthly) * months
  return (
    <Layout
      inputs={
        <>
          <div className="col-span-2">
            <Field label="Monthly investment" value={monthly} onChange={setMonthly} />
          </div>
          <Field label="Expected return (% / yr)" value={rate} onChange={setRate} />
          <Field label="Years" value={years} onChange={setYears} />
        </>
      }
      results={
        <>
          <Result label="Total invested" value={fmt(invested)} />
          <Result label="Estimated value" value={fmt(fv)} tone={fv > 0 ? "up" : undefined} />
          <Result label="Estimated gain" value={`+${fmt(Math.max(fv - invested, 0))}`} tone="up" />
        </>
      }
      note="Illustrative only. Real returns vary and are not guaranteed."
    />
  )
}

const TABS = [
  { id: "avg", label: "Average cost" },
  { id: "ipo", label: "IPO" },
  { id: "sip", label: "SIP growth" },
] as const

export default function Calculators() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("avg")
  return (
    <Card delay={0.1}>
      <h2 className="text-sm font-medium mb-4" style={muted}>
        Calculators
      </h2>
      <div className="flex gap-1 mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-3 py-1.5 rounded-md text-xs transition-colors"
            style={{
              backgroundColor: tab === t.id ? "var(--accent-soft)" : "transparent",
              color: tab === t.id ? "var(--accent)" : "var(--text-secondary)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "avg" && <AverageCalc />}
      {tab === "ipo" && <IpoCalc />}
      {tab === "sip" && <SipCalc />}
    </Card>
  )
}