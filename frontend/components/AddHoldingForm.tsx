"use client"
import { useState } from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import Card from "@/components/Card"

export interface FundOption {
  id: number
  symbol: string
  name: string
}

const inputClass =
  "w-full px-3 py-2.5 rounded-lg text-sm border outline-none focus:border-[var(--accent)] transition-colors"
const inputStyle = {
  backgroundColor: "var(--bg-base)",
  borderColor: "var(--border-subtle)",
  color: "var(--text-primary)",
}
const muted = { color: "var(--text-secondary)" }
const empty = { fund_id: "", units: "", avg_buy_price: "", purchase_date: "" }

export default function AddHoldingForm({
  funds,
  onAdded,
}: {
  funds: FundOption[]
  onAdded: () => void
}) {
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    const res = await apiFetch("/holdings/", {
      method: "POST",
      body: JSON.stringify({
        fund_id: parseInt(form.fund_id),
        units: parseFloat(form.units),
        avg_buy_price: parseFloat(form.avg_buy_price),
        purchase_date: form.purchase_date,
      }),
    })
    setSaving(false)
    if (res.ok) {
      setForm(empty)
      onAdded()
    } else {
      setError("Could not add this holding. Check the values and try again.")
    }
  }

  return (
    <Card>
      <h2 className="text-sm font-medium mb-4" style={muted}>
        Add a holding
      </h2>
      {funds.length === 0 ? (
        <p className="text-sm" style={muted}>
          No funds synced yet.{" "}
          <Link href="/funds" className="underline" style={{ color: "var(--accent)" }}>
            Go to Funds
          </Link>{" "}
          and sync one first.
        </p>
      ) : (
        <form onSubmit={handleAdd} className="space-y-4">
          <label className="block text-xs space-y-1.5" style={muted}>
            Fund
            <select
              value={form.fund_id}
              onChange={(e) => setForm({ ...form, fund_id: e.target.value })}
              className={inputClass}
              style={inputStyle}
              required
            >
              <option value="">Select a fund</option>
              {funds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.symbol})
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs space-y-1.5" style={muted}>
              Units
              <input
                type="number"
                step="any"
                value={form.units}
                onChange={(e) => setForm({ ...form, units: e.target.value })}
                className={`${inputClass} num`}
                style={inputStyle}
                required
              />
            </label>
            <label className="block text-xs space-y-1.5" style={muted}>
              Avg buy price
              <input
                type="number"
                step="any"
                value={form.avg_buy_price}
                onChange={(e) => setForm({ ...form, avg_buy_price: e.target.value })}
                className={`${inputClass} num`}
                style={inputStyle}
                required
              />
            </label>
          </div>
          <label className="block text-xs space-y-1.5" style={muted}>
            Purchase date
            <input
              type="date"
              value={form.purchase_date}
              onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
              className={inputClass}
              style={{ ...inputStyle, colorScheme: "dark" }}
              required
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
            style={{ backgroundColor: "var(--accent)", color: "var(--bg-base)" }}
          >
            {saving ? "Adding..." : "Add holding"}
          </button>
        </form>
      )}
    </Card>
  )
}