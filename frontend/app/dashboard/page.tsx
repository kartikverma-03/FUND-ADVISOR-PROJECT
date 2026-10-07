"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Profile {
  monthly_income: number;
  monthly_expenses: number;
  existing_savings: number;
  existing_debt: number;
  monthly_investment_capacity: number;
  risk_appetite: string;
  investment_horizon_years: number;
  primary_goal: string | null;
  target_amount: number | null;
  currency: string;
}
interface PortfolioSummary {
  total_invested: number;
  total_current_value: number;
  overall_gain_loss: number;
  overall_gain_loss_pct: number;
  allocation: Record<string, number>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);

  const [form, setForm] = useState({
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
  });

    useEffect(() => {
    async function loadData() {
      const [profileRes, portfolioRes] = await Promise.all([
        apiFetch("/profile/"),
        apiFetch("/holdings/summary"),
      ]);
      if (profileRes.status === 401) {
        router.push("/");
        return;
      }
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data);
        setHasProfile(true);
      }
      if (portfolioRes.ok) {
        setPortfolio(await portfolioRes.json());
      }
      setLoading(false);
    }
    loadData();
  }, [router]);
  async function handleCreateProfile(e: React.FormEvent) {
    e.preventDefault();
    const res = await apiFetch("/profile/", {
      method: "PUT",
      body: JSON.stringify({
        monthly_income: parseFloat(form.monthly_income),
        monthly_expenses: parseFloat(form.monthly_expenses),
        existing_savings: parseFloat(form.existing_savings || "0"),
        existing_debt: parseFloat(form.existing_debt || "0"),
        monthly_investment_capacity: parseFloat(form.monthly_investment_capacity),
        risk_appetite: form.risk_appetite,
        investment_horizon_years: parseInt(form.investment_horizon_years),
        primary_goal: form.primary_goal || null,
        target_amount: form.target_amount ? parseFloat(form.target_amount) : null,
        currency: form.currency,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      setHasProfile(true);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <button onClick={logout} className="text-sm text-neutral-400 hover:text-neutral-200">
            Log out
          </button>
        </div>

        <div className="flex gap-3 mb-8">
          <a href="/holdings" className="px-4 py-2 rounded-lg bg-neutral-800 text-sm hover:bg-neutral-700">
            Holdings
          </a>
          <a href="/funds" className="px-4 py-2 rounded-lg bg-neutral-800 text-sm hover:bg-neutral-700">
            Funds
          </a>
          <a href="/advisor" className="px-4 py-2 rounded-lg bg-neutral-800 text-sm hover:bg-neutral-700">
            AI Advisor
          </a>
        </div>

                {portfolio && portfolio.total_invested > 0 && (
          <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900 mb-6">
            <h2 className="text-sm font-medium text-neutral-400 mb-4">Portfolio Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <span className="text-neutral-500 text-xs">Invested</span>
                <p className="text-lg font-semibold">
                  {profile?.currency} {portfolio.total_invested.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-neutral-500 text-xs">Current Value</span>
                <p className="text-lg font-semibold">
                  {profile?.currency} {portfolio.total_current_value.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-neutral-500 text-xs">Gain/Loss</span>
                <p className={`text-lg font-semibold ${portfolio.overall_gain_loss >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {portfolio.overall_gain_loss >= 0 ? "+" : ""}
                  {profile?.currency} {portfolio.overall_gain_loss.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-neutral-500 text-xs">Return</span>
                <p className={`text-lg font-semibold ${portfolio.overall_gain_loss_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {portfolio.overall_gain_loss_pct >= 0 ? "+" : ""}
                  {portfolio.overall_gain_loss_pct}%
                </p>
              </div>
            </div>

            {Object.keys(portfolio.allocation).length > 0 && (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(portfolio.allocation).map(([name, value]) => ({ name, value }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={(entry) => `${entry.name}: ${profile?.currency} ${entry.value.toLocaleString()}`}
                    >
                      {Object.keys(portfolio.allocation).map((_, index) => (
                        <Cell key={index} fill={["#60a5fa", "#34d399", "#fbbf24", "#f87171"][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#171717", border: "1px solid #404040", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}{hasProfile && profile ? (
          <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900">
            <h2 className="text-sm font-medium text-neutral-400 mb-4">Your Financial Profile</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Monthly income</span>
                <p>{profile.currency} {profile.monthly_income}</p>
              </div>
              <div>
                <span className="text-neutral-500">Monthly expenses</span>
                <p>{profile.currency} {profile.monthly_expenses}</p>
              </div>
              <div>
                <span className="text-neutral-500">Investment capacity</span>
                <p>{profile.currency} {profile.monthly_investment_capacity}/mo</p>
              </div>
              <div>
                <span className="text-neutral-500">Risk appetite</span>
                <p className="capitalize">{profile.risk_appetite}</p>
              </div>
              <div>
                <span className="text-neutral-500">Horizon</span>
                <p>{profile.investment_horizon_years} years</p>
              </div>
              <div>
                <span className="text-neutral-500">Goal</span>
                <p>{profile.primary_goal || "Not set"}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900">
            <h2 className="text-sm font-medium text-neutral-400 mb-4">
              Set up your financial profile
            </h2>
            <form onSubmit={handleCreateProfile} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Monthly income" value={form.monthly_income} onChange={(e) => setForm({ ...form, monthly_income: e.target.value })} className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm" required />
                <input type="number" placeholder="Monthly expenses" value={form.monthly_expenses} onChange={(e) => setForm({ ...form, monthly_expenses: e.target.value })} className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm" required />
                <input type="number" placeholder="Existing savings" value={form.existing_savings} onChange={(e) => setForm({ ...form, existing_savings: e.target.value })} className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm" />
                <input type="number" placeholder="Existing debt" value={form.existing_debt} onChange={(e) => setForm({ ...form, existing_debt: e.target.value })} className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm" />
                <input type="number" placeholder="Monthly investment capacity" value={form.monthly_investment_capacity} onChange={(e) => setForm({ ...form, monthly_investment_capacity: e.target.value })} className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm" required />
                <select value={form.risk_appetite} onChange={(e) => setForm({ ...form, risk_appetite: e.target.value })} className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm">
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
                <input type="number" placeholder="Investment horizon (years)" value={form.investment_horizon_years} onChange={(e) => setForm({ ...form, investment_horizon_years: e.target.value })} className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm" />
                <input type="text" placeholder="Primary goal (e.g. retirement)" value={form.primary_goal} onChange={(e) => setForm({ ...form, primary_goal: e.target.value })} className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm" />
                <input type="number" placeholder="Target amount" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm" />
              </div>
              <button type="submit" className="w-full py-2 rounded-lg bg-white text-black text-sm font-medium">
                Save profile
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}