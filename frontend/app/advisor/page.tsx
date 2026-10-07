"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "advisor";
  text: string;
}

export default function AdvisorPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "advisor",
      text: "Hi! I'm your AI financial advisor. Ask me about your holdings, specific funds, or how to invest based on your profile.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setSending(true);

        const historyToSend = messages
      .filter((m) => m.role === "user" || m.role === "advisor")
      .map((m) => ({ role: m.role, text: m.text }));

    const res = await apiFetch("/advisor/chat", {
      method: "POST",
      body: JSON.stringify({ message: text, history: historyToSend }),
    });

    if (res.status === 401) {
      router.push("/");
      return;
    }

    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "advisor", text: data.reply }]);
    } else {
      const data = await res.json().catch(() => ({}));
      setMessages((prev) => [
        ...prev,
        { role: "advisor", text: data.detail || "Something went wrong. Please try again." },
      ]);
    }
    setSending(false);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <div className="flex justify-between items-center p-6 border-b border-neutral-800">
        <h1 className="text-xl font-semibold">AI Advisor</h1>
        <a href="/dashboard" className="text-sm text-neutral-400 hover:text-neutral-200">
          Back to dashboard
        </a>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${m.role === "user" ? "bg-white text-black" : "bg-neutral-800 text-neutral-100"}`}>
              {m.role === "advisor" ? (
                <div className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              ) : (
                <span className="whitespace-pre-wrap">{m.text}</span>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm bg-neutral-800 text-neutral-500">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-6 border-t border-neutral-800">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            placeholder="Ask about your portfolio or a specific fund..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-sm outline-none focus:border-neutral-500"
            disabled={sending}
          />
          <button type="submit" disabled={sending || !input.trim()} className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium disabled:opacity-50">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}