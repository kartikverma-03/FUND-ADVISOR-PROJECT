"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const signupRes = await apiFetch("/auth/signup", {
          method: "POST",
          body: JSON.stringify({ email, password, full_name: fullName }),
        });
        if (!signupRes.ok) {
          const data = await signupRes.json();
          throw new Error(data.detail || "Signup failed");
        }
      }

      const loginRes = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });

      if (!loginRes.ok) {
        const data = await loginRes.json();
        throw new Error(data.detail || "Login failed");
      }

      const loginData = await loginRes.json();
      localStorage.setItem("token", loginData.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="w-full max-w-sm p-8 rounded-xl border border-neutral-800 bg-neutral-900">
        <h1 className="text-xl font-semibold mb-1">Fund Advisor</h1>
        <p className="text-sm text-neutral-400 mb-6">
          {mode === "login" ? "Log in to your account" : "Create a new account"}
        </p>

        <div className="flex mb-6 rounded-lg overflow-hidden border border-neutral-800">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-sm ${mode === "login" ? "bg-neutral-800" : "bg-transparent text-neutral-500"}`}
          >
            Log in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 text-sm ${mode === "signup" ? "bg-neutral-800" : "bg-transparent text-neutral-500"}`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm outline-none focus:border-neutral-500"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm outline-none focus:border-neutral-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm outline-none focus:border-neutral-500"
            required
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-white text-black text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}