"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  Search,
  LogOut,
  LifeBuoy,
  LayoutDashboard,
  Wallet,
  LineChart,
  Sparkles,
  Calculator,
  type LucideIcon,
} from "lucide-react"
import { apiFetch } from "@/lib/api"
import { assetLabel } from "@/lib/health"
import { tokenSubject } from "@/lib/auth"

const muted = { color: "var(--text-secondary)" }

interface FundLite {
  id: number
  symbol: string
  name: string
  asset_type: string
}

interface Item {
  key: string
  group: string
  title: string
  sub?: string
  icon: LucideIcon
  run: () => void
}

const PAGES = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, words: "home overview health" },
  { label: "Holdings", href: "/holdings", icon: Wallet, words: "positions invested add buy" },
  { label: "Funds", href: "/funds", icon: LineChart, words: "stocks research compare sync" },
  { label: "AI Advisor", href: "/advisor", icon: Sparkles, words: "chat assistant ask" },
  { label: "Calculators", href: "/holdings#calculators", icon: Calculator, words: "sip ipo average cost" },
]

// NSE regular session: Mon-Fri 09:15-15:30 IST (public holidays not modelled)
function nseOpen(): boolean {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date())
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ""
  const mins = parseInt(get("hour")) * 60 + parseInt(get("minute"))
  const weekday = !["Sat", "Sun"].includes(get("weekday"))
  return weekday && mins >= 555 && mins <= 930
}

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>
  const i = text.toLowerCase().indexOf(q)
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-semibold" style={{ color: "var(--accent)" }}>
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  )
}

export default function TopBar() {
  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(0)
  const [funds, setFunds] = useState<FundLite[]>([])
  const [fundsLoaded, setFundsLoaded] = useState(false)
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    setOpen(nseOpen())
    setEmail(tokenSubject())
    const id = setInterval(() => setOpen(nseOpen()), 60000)
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      clearInterval(id)
      window.removeEventListener("keydown", onKey)
    }
  }, [])
    useEffect(() => {
    function onDown(e: MouseEvent) {
      const t = e.target as Node
      if (formRef.current && !formRef.current.contains(t)) setFocused(false)
      if (menuRef.current && !menuRef.current.contains(t)) setMenu(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  async function loadFunds() {
    if (fundsLoaded) return
    setFundsLoaded(true)
    const res = await apiFetch("/funds/")
    if (res.ok) setFunds(await res.json())
  }

  function close() {
    setFocused(false)
    setQuery("")
    inputRef.current?.blur()
  }

  function go(href: string) {
    close()
    router.push(href)
  }

  function openFund(f: FundLite) {
    close()
    if (pathname === "/funds") {
      window.dispatchEvent(new CustomEvent("fa:open", { detail: f.id }))
    } else {
      router.push(`/funds?open=${f.id}`)
    }
  }

  function searchFunds(q: string) {
    close()
    if (pathname === "/funds") {
      window.dispatchEvent(new CustomEvent("fa:search", { detail: q }))
    } else {
      router.push(`/funds?q=${encodeURIComponent(q)}`)
    }
  }

  const q = query.trim().toLowerCase()

  const items: Item[] = useMemo(() => {
    const match = (s: string) => s.toLowerCase().includes(q)
    const list: Item[] = funds
      .filter((f) => !q || match(f.name) || match(f.symbol))
      .slice(0, 5)
      .map((f) => ({
        key: `fund-${f.id}`,
        group: "Your funds",
        title: f.name,
        sub: `${f.symbol} · ${assetLabel(f.asset_type)}`,
        icon: LineChart,
        run: () => openFund(f),
      }))
    PAGES.filter((p) => !q || match(p.label) || match(p.words)).forEach((p) =>
      list.push({
        key: `page-${p.href}`,
        group: "Pages",
        title: p.label,
        icon: p.icon,
        run: () => go(p.href),
      })
    )
    if (q) {
      list.push({
        key: "search",
        group: "Search",
        title: `Search Funds for "${query.trim()}"`,
        icon: Search,
        run: () => searchFunds(query.trim()),
      })
    }
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funds, q, pathname])

  useEffect(() => setActive(0), [q])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, items.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === "Escape") {
      close()
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    items[active]?.run()
  }

  function logout() {
    localStorage.removeItem("token")
    router.push("/login")
  }

  const initials = (email.split("@")[0] || "U").slice(0, 2).toUpperCase()
  const showDropdown = focused && items.length > 0

  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center gap-4 px-5 md:px-10 border-b backdrop-blur"
      style={{ backgroundColor: "rgba(9,12,18,0.85)", borderColor: "var(--border-subtle)" }}
    >
      <span className="md:hidden text-base font-semibold tracking-tight">Fund Advisor</span>


        <form ref={formRef} onSubmit={submit} className="hidden sm:block relative z-50 w-full max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={muted} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setFocused(true)
            loadFunds()
          }}
          onKeyDown={onKeyDown}
          placeholder="Search funds, pages and tools"
          autoComplete="off"
          className="w-full pl-9 pr-10 py-2 rounded-lg text-sm border outline-none focus:border-[var(--accent)] transition-colors"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
            color: "var(--text-primary)",
          }}
        />
        <kbd
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] px-1.5 rounded border num"
          style={{ ...muted, borderColor: "var(--border-default)" }}
        >
          /
        </kbd>

        {showDropdown && (
          <div
            className="absolute left-0 right-0 top-full mt-2 rounded-xl border p-1.5 max-h-[26rem] overflow-y-auto shadow-2xl"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
          >
            {items.map((it, i) => {
              const Icon = it.icon
              const showGroup = i === 0 || items[i - 1].group !== it.group
              return (
                <div key={it.key}>
                  {showGroup && <p className="label px-3 pt-2 pb-1.5">{it.group}</p>}
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={it.run}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left"
                    style={{ backgroundColor: i === active ? "var(--bg-surface-hover)" : undefined }}
                  >
                    <Icon
                      size={16}
                      className="shrink-0"
                      style={{ color: i === active ? "var(--accent)" : "var(--text-secondary)" }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm truncate">
                        <Highlight text={it.title} q={q} />
                      </span>
                      {it.sub && (
                        <span className="block text-xs num truncate" style={muted}>
                          <Highlight text={it.sub} q={q} />
                        </span>
                      )}
                    </span>
                    {i === active && (
                      <span className="text-[11px]" style={muted}>
                        Enter
                      </span>
                    )}
                  </button>
                </div>
              )
            })}
            <p
              className="px-3 pt-2 pb-1 mt-1 text-[11px] border-t"
              style={{ ...muted, borderColor: "var(--border-subtle)" }}
            >
              ↑↓ to move · Enter to open · Esc to close
            </p>
          </div>
        )}
      </form>

      <div className="ml-auto flex items-center gap-3">
        <span
          className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border"
          style={{ borderColor: "var(--border-subtle)", ...muted }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: open ? "var(--success)" : "var(--text-muted)" }}
          />
          NSE {open ? "open" : "closed"}
        </span>

          <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenu((m) => !m)}
            aria-label="Account menu"
            className="w-9 h-9 rounded-full text-xs font-semibold flex items-center justify-center"
            style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
          >
            {initials}
          </button>
          {menu && (
            <>
              <div
                className="absolute right-0 mt-2 w-56 z-50 rounded-xl border p-1.5"
                style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
              >
                {email && (
                  <p className="px-3 py-2 text-xs truncate" style={muted}>
                    {email}
                  </p>
                )}
                <a
                  href="mailto:kartikverma2006@gmail.com"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-white/5"
                >
                  <LifeBuoy size={15} /> Support
                </a>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-white/5"
                >
                  <LogOut size={15} /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}