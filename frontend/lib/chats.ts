import type { Message } from "@/components/ChatMessage"

export interface Chat {
  id: string
  title: string
  updatedAt: number
  messages: Message[]
}

// Key chats per logged-in user so accounts on a shared browser stay separate
function storageKey(): string {
  try {
    const token = localStorage.getItem("token")
    if (!token) return "chats:anon"
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    const payload = JSON.parse(atob(part))
    return `chats:${payload.sub ?? "anon"}`
  } catch {
    return "chats:anon"
  }
}

export function loadChats(): Chat[] {
  try {
    const raw = localStorage.getItem(storageKey())
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveChats(chats: Chat[]) {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(chats.slice(0, 50)))
  } catch {
    // storage unavailable or full: chats just won't persist
  }
}

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" })
}