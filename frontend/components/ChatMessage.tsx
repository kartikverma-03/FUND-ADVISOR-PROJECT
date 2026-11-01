"use client"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export interface Message {
  role: "user" | "advisor"
  text: string
}

const md: Components = {
  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 last:mb-0 list-disc pl-5 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 last:mb-0 list-decimal pl-5 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  h1: ({ children }) => <h3 className="font-semibold text-base mb-2 mt-4">{children}</h3>,
  h2: ({ children }) => <h3 className="font-semibold text-base mb-2 mt-4">{children}</h3>,
  h3: ({ children }) => <h3 className="font-semibold mb-2 mt-3">{children}</h3>,
  code: ({ children }) => (
    <code className="num text-[13px] px-1 py-0.5 rounded bg-white/10">{children}</code>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline"
      style={{ color: "var(--accent)" }}
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th
      className="py-2 pr-4 text-left font-medium border-b whitespace-nowrap"
      style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="py-2 pr-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
      {children}
    </td>
  ),
}

function Avatar() {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
      style={{ backgroundColor: "var(--accent-soft)" }}
    >
      <Sparkles size={15} style={{ color: "var(--accent)" }} />
    </div>
  )
}

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user"
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && <Avatar />}
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${isUser ? "rounded-br-md" : "rounded-tl-md border"}`}
        style={
          isUser
            ? { backgroundColor: "var(--accent)", color: "var(--bg-base)" }
            : { backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }
        }
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{message.text}</span>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
            {message.text}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  )
}

export function Typing() {
  return (
    <div className="flex gap-3">
      <Avatar />
      <div
        className="px-4 py-3.5 rounded-2xl rounded-tl-md border flex items-center gap-1.5"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "var(--text-secondary)" }}
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  )
}