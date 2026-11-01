"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Wallet,
  LineChart,
  Sparkles,
  LogOut,
  LifeBuoy,
  Zap,
} from "lucide-react"

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/holdings", label: "Holdings", icon: Wallet },
  { href: "/funds", label: "Funds", icon: LineChart },
  { href: "/advisor", label: "AI Advisor", icon: Sparkles },
]

const muted = { color: "var(--text-secondary)" }

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function logout() {
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col border-r p-4"
        style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border-subtle)" }}
      >
        <Link href="/dashboard" className="px-3 py-2 mb-6 text-lg font-semibold tracking-tight">
          Fund Advisor
        </Link>

        <p className="px-3 mb-2 text-[11px] uppercase tracking-wider" style={muted}>
          Menu
        </p>
        <nav className="flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
               style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)" }}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg"
                    style={{ backgroundColor: "var(--bg-surface-hover)", border: "1px solid var(--border-subtle)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon size={18} className="relative" style={{ color: active ? "var(--accent)" : undefined }} />
                <span className="relative">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div
            className="rounded-xl border p-4"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Zap size={14} style={{ color: "var(--accent)" }} />
              <p className="text-xs font-semibold">Free plan</p>
            </div>
            <p className="text-xs leading-relaxed mb-3" style={muted}>
              Unlock unlimited AI advisor chats and deeper portfolio analysis with Pro.
            </p>
            <Link
              href="/#pricing"
              className="block text-center py-1.5 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: "var(--accent)", color: "var(--bg-base)" }}
            >
              See Pro
            </Link>
          </div>

          <a
            href="mailto:kartikverma2006@gmail.com"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:text-[var(--text-primary)]"
            style={muted}
          >
            <LifeBuoy size={18} />
            Support
          </a>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:text-[var(--text-primary)]"
            style={muted}
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 flex justify-around border-t backdrop-blur py-2"
        style={{ backgroundColor: "rgba(10,14,23,0.9)", borderColor: "var(--border-subtle)" }}
      >
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-2 py-1 text-[11px]"
              style={{ color: active ? "var(--accent)" : "var(--text-secondary)" }}
            >
              <Icon size={20} />
              {label}
            </Link>
          )
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 px-2 py-1 text-[11px]"
          style={muted}
        >
          <LogOut size={20} />
          Log out
        </button>
      </nav>
    </>
  )
}