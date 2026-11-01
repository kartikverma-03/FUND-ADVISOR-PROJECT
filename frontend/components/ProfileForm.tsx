"use client"
import { useState } from "react"
import { apiFetch } from "@/lib/api"
import type { Profile } from "@/lib/types"

type FormState = {
  monthly_income: string
  monthly_expenses: string
  existing_savings: string
  existing_debt: string
  monthly_investment_capacity: string
  risk_appetite: string
  investment_horizon_years: string
  primary_goal: string
  target_amount: string
  currency: string
}

const FIELDS: { key: keyof FormState; label: string; required?: boolean }[] = [
  { key: "monthly_income", label: "Monthly income", required: true },
  { key: "monthly_expenses", label: "Monthly expenses", required: true },
  { key: "existing_savings", label: "Existing savings" },
  { key: "existing_debt", label: "Existing debt" },
  { key: "monthly_investment_capacity", label: "Monthly investment capacity", required: true },
  { key: "investment_horizon_years", label: "Investment horizon (years)" },
  { key: "target_amount", label: "Target amount (optional)" },
]

const inputClass =
  "w-full px-3 py-2.5 rounded-lg text-sm border outline-none focus:border-[var(--accent)] transition-colors"
const inputStyle = { backgroundColor: "var(--bg-base)", borderColor: "var(--border-subtle)" }
const labelStyle = { color: "var(--text-secondary)" }

export default function ProfileForm({ onSaved }: { onSaved: (p: Profile) => void }) {
  const [form, setForm] = useState<FormState>({
    monthly_income: "",
    monthly_expenses: "",
    existing_savings: "",
    existing_debt: "",
    monthly_investment_capacity: "",
    risk_appetite: "moderate",
    investment_horizon_years: "5",
    primary_goal: "",
    target_amount: "",
    currency: "INR",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    const res = await apiFetch("/profile/", {
      method: "PUT",
      body: JSON.stringify({
        monthly_income: parseFloat(form.monthly_income),
        monthly_expenses: parseFloat(form.monthly_expenses),
        existing_savings: parseFloat(form.existing_savings || "0"),
        existing_debt: parseFloat(form.existing_debt || "0"),
        monthly_investment_capacity: parseFloat(form.monthly_investment_capacity),
        risk_appetite: form.risk_appetite,
        investment_horizon_years: parseInt(form.investment_horizon_years || "5"),
        primary_goal: form.primary_goal || null,
        target_amount: form.target_amount ? parseFloat(form.target_amount) : null,
        currency: form.currency,
      }),
    })
    setSaving(false)
    if (res.ok) {
      onSaved(await res.json())
    } else {
      setError("Could not save your profile. Check the numbers and try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <label key={f.key} className="block text-xs space-y-1.5" style={labelStyle}>
            {f.label}
            <input
              type="number"
              step="any"
              value={form[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              required={f.required}
              className={`${inputClass} num`}
              style={{ ...inputStyle, color: "var(--text-primary)" }}
            />
          </label>
        ))}
        <label className="block text-xs space-y-1.5" style={labelStyle}>
          Primary goal
          <input
            type="text"
            placeholder="e.g. retirement"
            value={form.primary_goal}
            onChange={(e) => set("primary_goal", e.target.value)}
            className={inputClass}
            style={{ ...inputStyle, color: "var(--text-primary)" }}
          />
        </label>
        <label className="block text-xs space-y-1.5" style={labelStyle}>
          Risk appetite
          <select
            value={form.risk_appetite}
            onChange={(e) => set("risk_appetite", e.target.value)}
            className={inputClass}
            style={{ ...inputStyle, color: "var(--text-primary)" }}
          >
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </label>
        <label className="block text-xs space-y-1.5" style={labelStyle}>
          Currency
          <select
            value={form.currency}
            onChange={(e) => set("currency", e.target.value)}
            className={inputClass}
            style={{ ...inputStyle, color: "var(--text-primary)" }}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </label>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
        style={{ backgroundColor: "var(--accent)", color: "var(--bg-base)" }}
      >
        {saving ? "Saving..." : "Save profile"}
      </button>
    </form>
  )
}