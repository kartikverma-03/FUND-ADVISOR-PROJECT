"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { ShieldCheck, LineChart, Sparkles, MailCheck } from "lucide-react"

const inputClass =
  "w-full px-3 py-2.5 rounded-lg text-sm border outline-none focus:border-[var(--accent)] transition-colors"
const inputStyle = {
  backgroundColor: "var(--bg-base)",
  borderColor: "var(--border-subtle)",
  color: "var(--text-primary)",
}
const muted = { color: "var(--text-secondary)" }

const points = [
  { icon: LineChart, text: "CAGR, Sharpe, volatility and drawdown for any fund or stock" },
  { icon: Sparkles, text: "An AI advisor that answers using your own portfolio and profile" },
  { icon: ShieldCheck, text: "Financial health checks on savings, debt and diversification" },
]

type Mode = "login" | "signup" | "forgot"

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  function switchMode(m: Mode) {
    setMode(m)
    setError("")
    setResetSent(false)
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      if (res.ok) setResetSent(true)
      else setError("Password reset by email is not available yet. Please contact support.")
    } catch {
      setError("Could not reach the server. Try again in a moment.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (mode === "signup") {
        const signupRes = await apiFetch("/auth/signup", {
          method: "POST",
          body: JSON.stringify({ email, password, full_name: fullName }),
        })
        if (!signupRes.ok) {
          const data = await signupRes.json()
          throw new Error(data.detail || "Signup failed")
        }
      }

      const loginRes = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      })

      if (!loginRes.ok) {
        const data = await loginRes.json()
        throw new Error(data.detail || "Login failed")
      }

      const loginData = await loginRes.json()
      localStorage.setItem("token", loginData.access_token)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const errorBox = error && (
    <p className="text-sm text-red-400 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
      {error}
    </p>
  )

  return (
    <div
      className="min-h-screen grid lg:grid-cols-2"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 border-r relative overflow-hidden"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: "var(--accent)" }}
        />
        <Link href="/" className="relative text-lg font-semibold tracking-tight">
          Fund Advisor
        </Link>
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight leading-tight mb-8">
            Understand your money.
            <br />
            Invest with clarity.
          </h2>
          <ul className="space-y-5">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3 text-sm" style={muted}>
                <Icon size={18} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs" style={muted}>
          For education only. Not financial advice.
        </p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden block text-lg font-semibold tracking-tight mb-8">
            Fund Advisor
          </Link>

          {mode === "forgot" ? (
            resetSent ? (
              <div className="text-center">
                <MailCheck size={36} className="mx-auto mb-4" style={{ color: "var(--accent)" }} />
                <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
                <p className="text-sm mt-2" style={muted}>
                  If an account exists for {email}, we have sent a link to reset your password.
                </p>
                <button
                  onClick={() => switchMode("login")}
                  className="mt-8 text-sm"
                  style={{ color: "var(--accent)" }}
                >
                  ← Back to log in
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
                <p className="text-sm mt-1 mb-6" style={muted}>
                  Enter your email and we will send you a link to choose a new password.
                </p>
                <form onSubmit={handleReset} className="space-y-4">
                  <label className="block text-xs space-y-1.5" style={muted}>
                    Email
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      style={inputStyle}
                      autoComplete="email"
                      required
                    />
                  </label>
                  {errorBox}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                    style={{ backgroundColor: "var(--accent)", color: "var(--bg-base)" }}
                  >
                    {loading ? "Sending..." : "Send reset link"}
                  </button>
                </form>
                <button
                  onClick={() => switchMode("login")}
                  className="block mx-auto mt-8 text-xs"
                  style={muted}
                >
                  ← Back to log in
                </button>
              </>
            )
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm mt-1 mb-6" style={muted}>
                {mode === "login"
                  ? "Log in to see your portfolio."
                  : "Start tracking and analysing your investments."}
              </p>

              <div
                className="flex p-1 mb-6 rounded-lg border"
                style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
              >
                {(["login", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className="flex-1 py-1.5 text-sm rounded-md transition-colors"
                    style={{
                      backgroundColor: mode === m ? "var(--accent-soft)" : "transparent",
                      color: mode === m ? "var(--accent)" : "var(--text-secondary)",
                    }}
                  >
                    {m === "login" ? "Log in" : "Sign up"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <label className="block text-xs space-y-1.5" style={muted}>
                    Full name
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputClass}
                      style={inputStyle}
                      autoComplete="name"
                      required
                    />
                  </label>
                )}
                <label className="block text-xs space-y-1.5" style={muted}>
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="block text-xs space-y-1.5" style={muted}>
                  <span className="flex items-center justify-between">
                    Password
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="hover:underline"
                        style={{ color: "var(--accent)" }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    required
                  />
                </label>

                {errorBox}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                  style={{ backgroundColor: "var(--accent)", color: "var(--bg-base)" }}
                >
                  {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
                </button>
              </form>

              <p className="text-xs mt-8 text-center" style={muted}>
                <Link href="/" className="hover:underline">
                  ← Back to home
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}