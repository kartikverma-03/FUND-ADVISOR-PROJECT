"use client";

import Link from "next/link";
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  Sparkles,
  PieChart,
  ArrowRight,
  LineChart,
  Wallet,
  CheckCircle2,
  Calculator,
  Layers,
  ShieldCheck,
  BarChart3,
  Scale,
  ChevronDown,
  Menu,
  X,
  Check,
  Lock,
  Database,
  EyeOff,
} from "lucide-react";

const trustBadges = [
  "Free to use",
  "Live market data",
  "AI-grounded, not generic",
  "No sponsored rankings",
];

const stats = [
  { value: "Unlimited", label: "Funds & stocks, live-synced" },
  { value: "6", label: "Risk & return metrics computed" },
  { value: "2", label: "Markets — Indian MF + Global" },
  { value: "AI", label: "Tool-calling advisor" },
];

const features = [
  {
    icon: Scale,
    title: "Compare side by side",
    description:
      "Put funds and stocks next to each other and read CAGR, Sharpe, volatility and drawdown together, not one page at a time.",
  },
  {
    icon: LineChart,
    title: "Live NAV & price history",
    description:
      "Years of real daily NAV and price data, synced on demand from AMFI-backed and market data sources — not stale snapshots.",
  },
  {
    icon: Calculator,
    title: "Real risk metrics",
    description:
      "CAGR, Sharpe ratio, standard deviation, max drawdown, alpha and beta — computed with standard formulas, reproducible, nothing proprietary.",
  },
  {
    icon: PieChart,
    title: "Live portfolio tracking",
    description:
      "Your actual holdings valued against today's price, with real gain/loss and an allocation breakdown by asset type.",
  },
  {
    icon: Sparkles,
    title: "AI financial advisor",
    description:
      "A tool-calling assistant that reads your real income, risk appetite and holdings, then looks up live fund data before answering.",
  },
  {
    icon: Layers,
    title: "Multi-asset in one place",
    description:
      "Indian mutual funds, global funds, and individual stocks — tracked and analysed under one roof, not three separate tools.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const metrics = [
  {
    term: "CAGR",
    explanation:
      "Compound Annual Growth Rate — the smoothed yearly return your investment would need to grow from its starting value to its current value, assuming steady compounding.",
  },
  {
    term: "Sharpe Ratio",
    explanation:
      "Return earned per unit of risk taken. A higher Sharpe ratio means you're getting better returns for the volatility you're exposed to.",
  },
  {
    term: "Standard Deviation",
    explanation:
      "How much a fund's returns swing around its average, annualized. Higher means more volatile — bigger ups and downs along the way.",
  },
  {
    term: "Max Drawdown",
    explanation:
      "The largest drop from a peak to a low point before recovering. It shows the worst-case pain you'd have felt holding through a downturn.",
  },
  {
    term: "Alpha",
    explanation:
      "Returns a fund generated beyond what its risk level would predict, relative to a benchmark. Positive alpha means it beat expectations.",
  },
  {
    term: "Beta",
    explanation:
      "How sensitive a fund is to overall market moves. A beta above 1 amplifies market swings; below 1 dampens them.",
  },
]

const howItWorks = [
  {
    title: "Connect your profile",
    description:
      "Tell us your income, goals, and risk appetite once — every insight after this is personalized around it.",
  },
  {
    title: "Add your holdings",
    description:
      "Sync Indian mutual funds, global funds, and stocks by symbol. We pull real NAV and price history automatically.",
  },
  {
    title: "Get real analysis",
    description:
      "See CAGR, Sharpe, drawdown and more instantly, then ask the AI advisor anything — it already knows your portfolio.",
  },
]

const faqs = [
  {
    question: "Is this free to use?",
    answer:
      "Yes. The AI advisor runs on Google's free Gemini API, and all fund data comes from free public sources — no subscription required.",
  },
  {
    question: "Which funds and stocks can I track?",
    answer:
      "Any Indian mutual fund scheme listed on MFAPI.in, plus any global stock or fund ticker supported by Yahoo Finance.",
  },
  {
    question: "How is the AI advisor different from a generic chatbot?",
    answer:
      "It has direct, live access to your actual profile and holdings through tool-calling — so its answers are grounded in your real numbers, not guesses.",
  },
  {
    question: "Is my financial data stored securely?",
    answer:
      "Your data is stored in a database tied to your authenticated account only, protected behind JWT-based login — no one else can access it.",
  },
]
const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to track and analyse your own portfolio.",
    features: [
      "Unlimited fund & stock tracking",
      "All 6 risk & return metrics",
      "Portfolio allocation overview",
      "NAV & price history charts",
      "AI advisor — limited daily messages",
    ],
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$10.99",
    period: "/ month",
    description: "For investors who want unlimited AI guidance and deeper analysis.",
    features: [
      "Everything in Free",
      "Unlimited AI advisor conversations",
      "Multi-fund comparison tools",
      "Priority data sync",
      "Early access to new features",
    ],
    cta: "Start Pro",
    highlighted: true,
  },
]

const trustPoints = [
  {
    icon: Lock,
    title: "JWT-based authentication",
    description:
      "Every request is verified with a signed token tied only to your account — no shared sessions, no guesswork.",
  },
  {
    icon: ShieldCheck,
    title: "Encrypted passwords",
    description:
      "Your password is hashed before it ever touches the database. Not even we can see it.",
  },
  {
    icon: Database,
    title: "Your data stays yours",
    description:
      "Your holdings and financial profile are scoped to your account only — never shared, never sold.",
  },
  {
    icon: EyeOff,
    title: "No sponsored recommendations",
    description:
      "The AI advisor is grounded in your real numbers, not paid placements or rankings.",
  },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-x-hidden">
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--bg-base)]/70 border-b border-[var(--border-subtle)]">
        <div className="grid grid-cols-2 md:grid-cols-3 items-center px-6 py-4 max-w-6xl mx-auto">
          <Link href="/" className="flex items-center">
  <span className="font-semibold tracking-tight text-lg">Fund Advisor</span>
</Link>

          <div className="hidden md:flex items-center justify-center gap-8 text-sm" style={{ color: "var(--text-secondary)" }}>
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a>
            <a href="#metrics" className="hover:text-[var(--text-primary)] transition-colors">Metrics</a>
            <a href="#pricing" className="hover:text-[var(--text-primary)] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[var(--text-primary)] transition-colors">FAQ</a>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/login"
              className="hidden md:inline-flex px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "var(--accent)", color: "var(--bg-base)" }}
            >
              Log in
            </Link>
            <button
              className="md:hidden p-2 -mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="flex flex-col px-6 py-4 gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#metrics" onClick={() => setMobileMenuOpen(false)}>Metrics</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-center"
                  style={{ backgroundColor: "var(--accent)", color: "var(--bg-base)" }}
                >
                  Log in
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section className="relative max-w-5xl mx-auto px-8 pt-32 pb-20 px-6 text-center overflow-hidden">
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-[var(--accent)] opacity-[0.15] blur-[140px] rounded-full" />
        <div className="pointer-events-none absolute top-20 right-0 w-[300px] h-[300px] bg-cyan-400 opacity-[0.1] blur-[120px] rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)] mb-6"
        >
          <Sparkles size={12} className="text-[var(--accent)]" />
          Pick funds with the same math professional advisors use
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
        >
          Invest with data,
          <br />
          <span className="bg-gradient-to-r from-[var(--accent)] via-cyan-400 to-[var(--accent)] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            not guesswork.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="relative text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-8"
        >
          Analyse funds, track your real portfolio, and get AI-grounded
          advice personalized to your income, goals, and risk appetite.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="relative flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-10 text-xs text-[var(--text-secondary)]"
        >
          {trustBadges.map((b) => (
            <span key={b} className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-[var(--success)]" />
              {b}
            </span>
          ))}
        </motion.div>

        <motion.div
                  initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="relative flex items-center justify-center gap-4 mb-16"
        >
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors shadow-lg shadow-[var(--accent)]/20"
            >
              Get started free
              <ArrowRight size={16} />
            </motion.button>
          </Link>
          <a href="#features">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 px-5 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              See how it works
              <ChevronDown size={14} />
            </motion.span>
          </a>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="relative grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-20 pb-16 border-b border-[var(--border-subtle)]"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp} transition={{ duration: 0.5 }}>
              <p className="text-xl md:text-2xl font-semibold text-[var(--accent)] mb-1">{s.value}</p>
              <p className="text-xs text-[var(--text-secondary)] leading-snug">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="relative rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-2xl shadow-black/40 max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-3 gap-4 mb-5 text-left">
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Current Value</p>
              <p className="text-xl font-semibold">₹3,410.70</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Gain/Loss</p>
              <p className="text-xl font-semibold text-[var(--success)]">+88.96%</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Sharpe Ratio</p>
              <p className="text-xl font-semibold">0.65</p>
            </div>
          </div>
          <div className="h-24 flex items-end gap-1">
            {[40, 55, 48, 62, 58, 70, 65, 80, 75, 90, 85, 98].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.6, delay: 0.7 + i * 0.04, ease: "easeOut" }}
                className="flex-1 rounded-sm bg-gradient-to-t from-[var(--accent)] to-cyan-400 opacity-80"
              />
            ))}
          </div>
        </motion.div>
      </section>
            {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Why Fund Advisor
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">
              Everything you need, nothing you don&apos;t
            </h2>
            <p
              className="mt-4 max-w-2xl mx-auto text-base"
              style={{ color: "var(--text-secondary)" }}
            >
              Built for people who actually want to understand their money —
              not just stare at a number going up or down.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl p-6 border transition-colors"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: "var(--accent-soft)" }}
                >
                  <feature.icon className="w-5 h-5" style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
            {/* ===== METRICS GLOSSARY ===== */}
      <section id="metrics" className="py-24 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Know what you&apos;re reading
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">
              The metrics, explained plainly
            </h2>
            <p
              className="mt-4 max-w-2xl mx-auto text-base"
              style={{ color: "var(--text-secondary)" }}
            >
              No jargon left unexplained. Every number on your dashboard is
              backed by a real calculation, broken down here.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.term}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl p-6 border"
                style={{
                  backgroundColor: "var(--bg-base)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <h3
                  className="text-base font-semibold mb-2"
                  style={{ color: "var(--accent)" }}
                >
                  {metric.term}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {metric.explanation}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
            {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              How it works
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">
              Three steps to a clearer portfolio
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ delay: i * 0.12 }}
                className="relative"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-5"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--bg-base)",
                  }}
                >
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {step.description}
                </p>
                {i < howItWorks.length - 1 && (
                  <div
                    className="hidden md:block absolute top-6 left-full w-8 h-px"
                    style={{ backgroundColor: "var(--border-subtle)" }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
            {/* ===== PRICING ===== */}
      <section id="pricing" className="py-24 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Pricing
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">
              Simple pricing, no surprises
            </h2>
            <p
              className="mt-4 max-w-xl mx-auto text-base"
              style={{ color: "var(--text-secondary)" }}
            >
              Start free. Upgrade only if you want unlimited AI conversations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="relative rounded-2xl p-8 border"
                style={{
                  backgroundColor: tier.highlighted ? "var(--bg-surface)" : "var(--bg-base)",
                  borderColor: tier.highlighted ? "var(--accent)" : "var(--border-subtle)",
                  borderWidth: tier.highlighted ? "2px" : "1px",
                }}
              >
                {tier.highlighted && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "var(--accent)", color: "var(--bg-base)" }}
                  >
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {tier.period}
                  </span>
                </div>
                <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                  {tier.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check
                        size={16}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: "var(--accent)" }}
                      />
                      <span style={{ color: "var(--text-secondary)" }}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold"
                    style={{
                      backgroundColor: tier.highlighted ? "var(--accent)" : "transparent",
                      color: tier.highlighted ? "var(--bg-base)" : "var(--text-primary)",
                      border: tier.highlighted ? "none" : "1px solid var(--border-subtle)",
                    }}
                  >
                    {tier.cta}
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
            {/* ===== TRUST & SECURITY ===== */}
      <section className="py-24 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Trust & security
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">
              Built with your privacy in mind
            </h2>
            <p
              className="mt-4 max-w-2xl mx-auto text-base"
              style={{ color: "var(--text-secondary)" }}
            >
              Financial data deserves to be handled carefully. Here's exactly how we do that.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPoints.map((point, i) => (
              <motion.div
                key={point.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "var(--accent-soft)" }}
                >
                  <point.icon size={20} style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-sm font-semibold mb-2">{point.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {point.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
            {/* ===== FAQ ===== */}
      <section id="faq" className="py-24 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              FAQ
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">
              Common questions
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={faq.question}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border overflow-hidden"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium">{faq.question}</span>
                  <ChevronDown
                    className="w-4 h-4 flex-shrink-0 transition-transform"
                    style={{
                      color: "var(--text-secondary)",
                      transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p
                        className="px-5 pb-4 text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
            {/* ===== FOUNDER NOTE ===== */}
      <section className="py-24 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="rounded-2xl p-8 md:p-10 border text-center"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 text-lg font-semibold"
              style={{
                background: "linear-gradient(135deg, var(--accent), #8b5cf6)",
                color: "#fff",
              }}
            >
              KV
            </div>
                       <p
              className="text-base md:text-lg leading-relaxed mb-5"
              style={{ color: "var(--text-primary)" }}
            >
              &ldquo;Most investment tools either oversimplify the numbers or
              bury them in jargon. Fund Advisor was built to do neither —
              every metric is computed directly from real market data, and
              the AI advisor reasons only from your actual portfolio, never
              generic guesses. This is an early, independently built
              product, held to the same standard I&apos;d expect from any
              financial tool before trusting it with my own money.&rdquo;
            </p>
            <p className="text-sm font-semibold">Kartik Verma</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Builder of Fund Advisor
            </p>
          </motion.div>
        </div>
      </section>
            {/* ===== FOOTER CTA ===== */}
      <section className="py-24 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to see your portfolio clearly?
            </h2>
            <p className="mb-8 text-base" style={{ color: "var(--text-secondary)" }}>
              Set up your profile in under two minutes. No credit card, no catch.
            </p>
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 rounded-xl font-semibold text-sm"
                style={{ backgroundColor: "var(--accent)", color: "var(--bg-base)" }}
              >
                Get started free
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t py-10" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--accent), #8b5cf6)",
              }}
            >
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="text-sm font-semibold">Fund Advisor</span>
          </div>
          <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
            Multi-fund analyser & AI advisor · Built by Kartik Verma
          </p>
          <a
            href="mailto:kartikverma2006@gmail.com"
            className="text-xs hover:text-[var(--text-primary)] transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            Contact support: kartikverma2006@gmail.com
          </a>
        </div>
      </footer>
          </div>
  )
}        {/* Background glow mesh */}
        <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div
            className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-3xl opacity-30"
            style={{
              background:
                "radial-gradient(circle, var(--accent) 0%, #8b5cf6 45%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>