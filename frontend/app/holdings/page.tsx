"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Holding {
  id: number;
  fund_id: number;
  units: number;
  avg_buy_price: number;
  purchase_date: string;
}

interface Fund {
  id: number;
  symbol: string;
  name: string;
}

export default function HoldingsPage() {
  const router = useRouter();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    fund_id: "",
    units: "",
    avg_buy_price: "",
    purchase_date: "",
  });

  async function loadData() {
    const [holdingsRes, fundsRes] = await Promise.all([
      apiFetch("/holdings/"),
      apiFetch("/funds/"),
    ]);
    if (holdingsRes.status === 401) {
      router.push("/");
      return;
    }
    if (holdingsRes.ok) setHoldings(await holdingsRes.json());
    if (fundsRes.ok) setFunds(await fundsRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await apiFetch("/holdings/", {
      method: "POST",
      body: JSON.stringify({
        fund_id: parseInt(form.fund_id),
        units: parseFloat(form.units),
        avg_buy_price: parseFloat(form.avg_buy_price),
        purchase_date: form.purchase_date,
      }),
    });
    if (res.ok) {
      setForm({ fund_id: "", units: "", avg_buy_price: "", purchase_date: "" });
      loadData();
    }
  }

  async function handleDelete(id: number) {
    await apiFetch(`/holdings/${id}`, { method: "DELETE" });
    loadData();
  }

  function fundName(fundId: number) {
    const fund = funds.find((f) => f.id === fundId);
    return fund ? `${fund.name} (${fund.symbol})` : `Fund #${fundId}`;
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
          <h1 className="text-xl font-semibold">Holdings</h1>
          <a href="/dashboard" className="text-sm text-neutral-400 hover:text-neutral-200">
            Back to dashboard
          </a>
        </div>

        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900 mb-6">
          <h2 className="text-sm font-medium text-neutral-400 mb-4">Add a holding</h2>
          {funds.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No funds synced yet. Go to the Funds page first and sync one before adding a holding.
            </p>
          ) : (
            <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3">
              <select value={form.fund_id} onChange={(e) => setForm({ ...form, fund_id: e.target.value })} className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm" required>
                <option value="">Select a fund</option>
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.symbol})</option>
                ))}
              </select>
              <input type="number" step="any" placeholder="Units" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm" required />
              <input type="number" step="any" placeholder="Average buy price" value={form.avg_buy_price} onChange={(e) => setForm({ ...form, avg_buy_price: e.target.value })} className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm" required />
              <input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm" required />
              <button type="submit" className="col-span-2 py-2 rounded-lg bg-white text-black text-sm font-medium">
                Add holding
              </button>
            </form>
          )}
        </div>

        <div className="space-y-3">
          {holdings.length === 0 ? (
            <p className="text-sm text-neutral-500">No holdings yet.</p>
          ) : (
            holdings.map((h) => (
              <div key={h.id} className="flex justify-between items-center p-4 rounded-lg border border-neutral-800 bg-neutral-900">
                <div className="text-sm">
                  <p className="font-medium">{fundName(h.fund_id)}</p>
                  <p className="text-neutral-500">
                    {h.units} units @ avg {h.avg_buy_price} — bought {h.purchase_date}
                  </p>
                </div>
                <button onClick={() => handleDelete(h.id)} className="text-sm text-red-400 hover:text-red-300">
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}