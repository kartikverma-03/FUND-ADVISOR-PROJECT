"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface Fund {
  id: number;
  symbol: string;
  name: string;
  asset_type: string;
  category: string | null;
}

interface HistoryPoint {
  date: string;
  value: number;
}

interface Metrics {
  symbol: string;
  name: string;
  cagr_1y: number | null;
  cagr_3y: number | null;
  cagr_5y: number | null;
  sharpe_ratio: number | null;
  std_deviation: number | null;
  max_drawdown: number | null;
}

export default function FundsPage() {
  const router = useRouter();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [compareResults, setCompareResults] = useState<Metrics[] | null>(null);
  const [comparing, setComparing] = useState(false);

  const [symbol, setSymbol] = useState("");
  const [assetType, setAssetType] = useState("stock");

  const [metricsFor, setMetricsFor] = useState<number | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  async function loadFunds() {
    const res = await apiFetch("/funds/");
    if (res.status === 401) {
      router.push("/");
      return;
    }
    if (res.ok) setFunds(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadFunds();
  }, []);

  async function handleSync(e: React.FormEvent) {
    e.preventDefault();
    setSyncing(true);
    setSyncError("");
    const res = await apiFetch("/funds/sync", {
      method: "POST",
      body: JSON.stringify({ symbol: symbol.trim(), asset_type: assetType }),
    });
    if (res.ok) {
      setSymbol("");
      loadFunds();
    } else {
      const data = await res.json().catch(() => ({}));
      setSyncError(data.detail || "Could not sync this symbol. Double check it's correct.");
    }
    setSyncing(false);
  }

  async function viewMetrics(fundId: number) {
    setMetricsFor(fundId);
    setMetrics(null);
    setHistory([]);
    setMetricsLoading(true);

    const [metricsRes, historyRes] = await Promise.all([
      apiFetch(`/funds/${fundId}/metrics`),
      apiFetch(`/funds/${fundId}/history`),
    ]);

    if (metricsRes.ok) setMetrics(await metricsRes.json());
    if (historyRes.ok) {
      const data = await historyRes.json();
      const sampled = data.history.filter((_: HistoryPoint, i: number) => i % 7 === 0);
      setHistory(sampled);
    }

    setMetricsLoading(false);
  }

  function toggleSelect(fundId: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(fundId)) {
        next.delete(fundId);
      } else {
        next.add(fundId);
      }
      return next;
    });
  }

  async function handleCompare() {
    if (selectedIds.size < 2) return;
    setComparing(true);
    const idsParam = Array.from(selectedIds).join(",");
    const res = await apiFetch(`/funds/compare?fund_ids=${idsParam}`);
    if (res.ok) {
      setCompareResults(await res.json());
    }
    setComparing(false);
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
          <h1 className="text-xl font-semibold">Funds</h1>
          <a href="/dashboard" className="text-sm text-neutral-400 hover:text-neutral-200">
            Back to dashboard
          </a>
        </div>

        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900 mb-6">
          <h2 className="text-sm font-medium text-neutral-400 mb-4">
            Sync a fund or stock
          </h2>
          <form onSubmit={handleSync} className="flex gap-3">
            <input
              type="text"
              placeholder="Symbol (e.g. AAPL) or MF scheme code"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm"
              required
            />
            <select value={assetType} onChange={(e) => setAssetType(e.target.value)} className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm">
              <option value="stock">Stock</option>
              <option value="global_fund">Global Fund</option>
              <option value="indian_mf">Indian MF</option>
            </select>
            <button type="submit" disabled={syncing} className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium disabled:opacity-50">
              {syncing ? "Syncing..." : "Sync"}
            </button>
          </form>
          {syncError && <p className="text-sm text-red-400 mt-2">{syncError}</p>}
        </div>

        {funds.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-neutral-500">
              {selectedIds.size === 0
                ? "Select 2 or more funds to compare"
                : `${selectedIds.size} selected`}
            </p>
            <button
              onClick={handleCompare}
              disabled={selectedIds.size < 2 || comparing}
              className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium disabled:opacity-30"
            >
              {comparing ? "Comparing..." : "Compare selected"}
            </button>
          </div>
        )}

        {compareResults && compareResults.length > 0 && (
          <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 text-left">
                  <th className="p-3 font-medium">Fund</th>
                  <th className="p-3 font-medium">CAGR 1y</th>
                  <th className="p-3 font-medium">CAGR 3y</th>
                  <th className="p-3 font-medium">CAGR 5y</th>
                  <th className="p-3 font-medium">Sharpe</th>
                  <th className="p-3 font-medium">Volatility</th>
                  <th className="p-3 font-medium">Max DD</th>
                </tr>
              </thead>
              <tbody>
                {compareResults.map((m, i) => (
                  <tr key={i} className="border-b border-neutral-800 last:border-0">
                    <td className="p-3 font-medium">{m.name}</td>
                    <td className="p-3">{m.cagr_1y !== null ? `${m.cagr_1y}%` : "—"}</td>
                    <td className="p-3">{m.cagr_3y !== null ? `${m.cagr_3y}%` : "—"}</td>
                    <td className="p-3">{m.cagr_5y !== null ? `${m.cagr_5y}%` : "—"}</td>
                    <td className="p-3">{m.sharpe_ratio ?? "—"}</td>
                    <td className="p-3">{m.std_deviation !== null ? `${m.std_deviation}%` : "—"}</td>
                    <td className="p-3">{m.max_drawdown !== null ? `${m.max_drawdown}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="space-y-3">
          {funds.length === 0 ? (
            <p className="text-sm text-neutral-500">No funds synced yet.</p>
          ) : (
            funds.map((f) => (
              <div key={f.id} className="rounded-lg border border-neutral-800 bg-neutral-900">
                <div className="flex justify-between items-center p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(f.id)}
                      onChange={() => toggleSelect(f.id)}
                      className="w-4 h-4"
                    />
                    <div className="text-sm">
                      <p className="font-medium">{f.name}</p>
                      <p className="text-neutral-500">
                        {f.symbol} · {f.asset_type} {f.category ? `· ${f.category}` : ""}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => viewMetrics(f.id)} className="text-sm px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700">
                    View metrics
                  </button>
                </div>

                {metricsFor === f.id && (
                  <div className="px-4 pb-4 border-t border-neutral-800 pt-4">
                    {metricsLoading ? (
                      <p className="text-sm text-neutral-500">Loading metrics...</p>
                    ) : metrics ? (
                      <>
                        <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                          <Metric label="CAGR 1y" value={metrics.cagr_1y} suffix="%" />
                          <Metric label="CAGR 3y" value={metrics.cagr_3y} suffix="%" />
                          <Metric label="CAGR 5y" value={metrics.cagr_5y} suffix="%" />
                          <Metric label="Sharpe" value={metrics.sharpe_ratio} />
                          <Metric label="Volatility" value={metrics.std_deviation} suffix="%" />
                          <Metric label="Max Drawdown" value={metrics.max_drawdown} suffix="%" />
                        </div>
                        {history.length > 0 && (
                          <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={history}>
                                <XAxis
                                  dataKey="date"
                                  tick={{ fontSize: 10, fill: "#737373" }}
                                  tickFormatter={(d) => d.slice(0, 7)}
                                  interval="preserveStartEnd"
                                />
                                <YAxis
                                  tick={{ fontSize: 10, fill: "#737373" }}
                                  domain={["auto", "auto"]}
                                />
                                <Tooltip
                                  contentStyle={{ backgroundColor: "#171717", border: "1px solid #404040", borderRadius: "8px" }}
                                  labelStyle={{ color: "#a3a3a3" }}
                                />
                                <Line type="monotone" dataKey="value" stroke="#60a5fa" dot={false} strokeWidth={2} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-neutral-500">Could not load metrics.</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, suffix = "" }: { label: string; value: number | null; suffix?: string }) {
  return (
    <div>
      <span className="text-neutral-500 text-xs">{label}</span>
      <p className="font-medium">{value !== null ? `${value}${suffix}` : "—"}</p>
    </div>
  );
}
