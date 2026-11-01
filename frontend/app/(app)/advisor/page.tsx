"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowUp, History, Plus } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { loadChats, saveChats, newId, type Chat } from "@/lib/chats"
import ChatMessage, { Typing, type Message } from "@/components/ChatMessage"
import ChatHistory from "@/components/ChatHistory"
import AdvisorContext from "@/components/AdvisorContext"

const WELCOME: Message = {
  role: "advisor",
  text: "Hi! I'm your AI financial advisor. Ask me about your holdings, specific funds, or how to invest based on your profile.",
}

const SUGGESTIONS = [
  "How is my portfolio allocated?",
  "Am I saving enough for my goal?",
  "Which of my holdings is the riskiest?",
  "Explain the Sharpe ratio simply",
]

const muted = { color: "var(--text-secondary)" }

export default function AdvisorPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [chats, setChats] = useState<Chat[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const [hydrated, setHydrated] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const skipSave = useRef(false)

  // Load saved chats once, start on a fresh chat
  useEffect(() => {
    setChats(loadChats())
    setActiveId(newId())
    setHydrated(true)
  }, [])

  // Auto-save the active chat whenever its messages change
  useEffect(() => {
    if (!hydrated || messages.length < 2) return
    if (skipSave.current) {
      skipSave.current = false
      return
    }
    setChats((prev) => {
      const title =
        messages.find((m) => m.role === "user")?.text.slice(0, 48) || "New chat"
      const next = [
        { id: activeId, title, updatedAt: Date.now(), messages },
        ...prev.filter((c) => c.id !== activeId),
      ]
      saveChats(next)
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, sending])

  function startNewChat() {
    if (sending) return
    setActiveId(newId())
    setMessages([WELCOME])
    setShowHistory(false)
  }

  function selectChat(id: string) {
    if (sending) return
    const chat = chats.find((c) => c.id === id)
    if (!chat) return
    skipSave.current = true
    setActiveId(chat.id)
    setMessages(chat.messages)
    setShowHistory(false)
  }

  function deleteChat(id: string) {
    if (sending) return
    const next = chats.filter((c) => c.id !== id)
    setChats(next)
    saveChats(next)
    if (id === activeId) startNewChat()
  }

  async function send(raw: string) {
    const text = raw.trim()
    if (!text || sending) return

    const historyToSend = messages.map((m) => ({ role: m.role, text: m.text }))
    setMessages((prev) => [...prev, { role: "user", text }])
    setInput("")
    setSending(true)

    try {
      const res = await apiFetch("/advisor/chat", {
        method: "POST",
        body: JSON.stringify({ message: text, history: historyToSend }),
      })

      if (res.status === 401) {
        router.push("/login")
        return
      }

      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, { role: "advisor", text: data.reply }])
      } else {
        const data = await res.json().catch(() => ({}))
        setMessages((prev) => [
          ...prev,
          { role: "advisor", text: data.detail || "Something went wrong. Please try again." },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "advisor", text: "I could not reach the server. Please try again in a moment." },
      ])
    } finally {
      setSending(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    send(input)
  }

  const fresh = messages.length === 1

  const historyProps = {
    chats,
    activeId,
    disabled: sending,
    onSelect: selectChat,
    onNew: startNewChat,
    onDelete: deleteChat,
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] md:h-[calc(100vh-3.5rem)]">
      {/* Saved chats column (desktop) */}
      <div
        className="hidden lg:flex w-64 shrink-0 flex-col border-r p-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <ChatHistory {...historyProps} className="min-h-0 flex-1" />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div>
            <h1 className="text-lg font-semibold tracking-tight">AI Advisor</h1>
            <p className="text-xs mt-0.5" style={muted}>
              Ask about your portfolio, funds or financial plan
            </p>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setShowHistory((s) => !s)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border"
              style={{ borderColor: "var(--border-subtle)", ...muted }}
            >
              <History size={13} /> History
            </button>
            <button
              onClick={startNewChat}
              disabled={sending}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border disabled:opacity-40"
              style={{ borderColor: "var(--border-subtle)", ...muted }}
            >
              <Plus size={13} /> New
            </button>
          </div>
        </header>

        {showHistory && (
          <div
            className="lg:hidden border-b p-4 max-h-72 overflow-y-auto"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <ChatHistory {...historyProps} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((m, i) => (
              <ChatMessage key={i} message={m} />
            ))}

            {fresh && !sending && (
              <div className="pt-2 pl-11 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-2 rounded-full border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    style={{ borderColor: "var(--border-subtle)", ...muted }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {sending && <Typing />}
            <div ref={bottomRef} />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-4 border-t"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="max-w-3xl mx-auto relative">
            <input
              type="text"
              placeholder="Ask about your portfolio or a specific fund..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              className="w-full pl-4 pr-14 py-3.5 rounded-xl text-sm border outline-none focus:border-[var(--accent)] transition-colors"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-40"
              style={{ backgroundColor: "var(--accent)", color: "var(--bg-base)" }}
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </form>
      </div>

      <AdvisorContext />
    </div>
  )
}