"use client"
import { Plus, Trash2, MessageSquare } from "lucide-react"
import { timeAgo, type Chat } from "@/lib/chats"

const muted = { color: "var(--text-secondary)" }

export default function ChatHistory({
  chats,
  activeId,
  disabled,
  onSelect,
  onNew,
  onDelete,
  className = "",
}: {
  chats: Chat[]
  activeId: string
  disabled: boolean
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  className?: string
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      <button
        onClick={onNew}
        disabled={disabled}
        className="flex items-center justify-center gap-2 py-2.5 mb-4 rounded-lg text-sm font-semibold disabled:opacity-50"
        style={{ backgroundColor: "var(--accent)", color: "var(--bg-base)" }}
      >
        <Plus size={16} /> New chat
      </button>

      <p className="text-[11px] uppercase tracking-wider mb-2 px-1" style={muted}>
        Saved chats
      </p>

      {chats.length === 0 ? (
        <p className="text-xs px-1 leading-relaxed" style={muted}>
          Your conversations will be saved here so you can pick them up later.
        </p>
      ) : (
        <ul className="space-y-1 overflow-y-auto">
          {chats.map((c) => {
            const active = c.id === activeId
            return (
              <li key={c.id} className="group relative">
                <button
                  onClick={() => onSelect(c.id)}
                  disabled={disabled}
                  className="w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-lg transition-colors disabled:opacity-60 hover:bg-white/5"
                  style={{ backgroundColor: active ? "var(--accent-soft)" : undefined }}
                >
                  <MessageSquare
                    size={15}
                    className="mt-0.5 shrink-0"
                    style={{ color: active ? "var(--accent)" : "var(--text-secondary)" }}
                  />
                  <span className="min-w-0 pr-5">
                    <span
                      className="block text-sm truncate"
                      style={{ color: active ? "var(--accent)" : "var(--text-primary)" }}
                    >
                      {c.title}
                    </span>
                    <span className="block text-[11px] mt-0.5" style={muted}>
                      {timeAgo(c.updatedAt)}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => onDelete(c.id)}
                  disabled={disabled}
                  aria-label="Delete chat"
                  className="absolute right-2 top-2.5 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}