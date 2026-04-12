"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const AGENT_URL = "/api/agent/partner";

const QUICK_TOPICS = [
  { label: "How does TicketMatch work for me?", icon: "?" },
  { label: "What are the commission rates?", icon: "%" },
  { label: "How do I optimize my listing?", icon: "+" },
  { label: "Payment & settlement terms", icon: "$" },
];

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("tm_partner_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("tm_partner_session", id);
  }
  return id;
}

function ChatMarkdown({ text }: { text: string }) {
  const fixed = text.replace(/\]\s*\n\s*\(/g, "](");
  const lines = fixed.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.trim().replace("```", "");
        codeLines = [];
        continue;
      } else {
        inCodeBlock = false;
        elements.push(
          <div key={key++} className="my-2 rounded-lg bg-emerald-900/30 p-3 overflow-x-auto">
            {codeLang && <div className="text-[10px] text-emerald-400/60 mb-1 font-mono">{codeLang}</div>}
            <pre className="text-[12px] leading-relaxed text-emerald-100 font-mono whitespace-pre">{codeLines.join("\n")}</pre>
          </div>
        );
        continue;
      }
    }
    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const formatLine = (s: string) => {
      const parts: React.ReactNode[] = [];
      let last = 0;
      const re = /\*\*(.+?)\*\*|`([^`]+)`|\[(.+?)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)|(https?:\/\/[^\s,)]+)/g;
      let m;
      while ((m = re.exec(s)) !== null) {
        if (m.index > last) parts.push(s.slice(last, m.index));
        if (m[1]) {
          parts.push(<strong key={`b${m.index}`} className="font-semibold">{m[1]}</strong>);
        } else if (m[2]) {
          parts.push(<code key={`c${m.index}`} className="rounded bg-emerald-100 px-1.5 py-0.5 text-[12px] font-mono text-emerald-700">{m[2]}</code>);
        } else if (m[3] && m[4]) {
          parts.push(<a key={`l${m.index}`} href={m[4]} className="font-medium text-emerald-600 underline underline-offset-2 hover:text-emerald-500" target={m[4].startsWith("/") ? undefined : "_blank"} rel={m[4].startsWith("/") ? undefined : "noopener noreferrer"}>{m[3]}</a>);
        } else if (m[5]) {
          parts.push(<a key={`u${m.index}`} href={m[5]} className="font-medium text-emerald-600 underline underline-offset-2 hover:text-emerald-500" target="_blank" rel="noopener noreferrer">{m[5].replace(/^https?:\/\//, '')}</a>);
        }
        last = re.lastIndex;
      }
      if (last < s.length) parts.push(s.slice(last));
      return parts.length ? parts : s;
    };

    const listMatch = line.match(/^(\d+\.\s+|-\s+)(.*)$/);
    if (listMatch) {
      const isNumbered = /^\d+\./.test(listMatch[1]);
      elements.push(
        <div key={key++} className="flex gap-2 mt-1">
          <span className="text-emerald-400 font-medium shrink-0">{isNumbered ? listMatch[1].trim() : ">"}</span>
          <span>{formatLine(listMatch[2])}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(<span key={key++} className="block">{formatLine(line)}</span>);
    }
  }

  return <>{elements}</>;
}

export default function PartnerAgent({ partnerName }: { partnerName?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(AGENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: updated.map((m) => ({ role: m.role, content: m.content })),
          sessionId: getSessionId(),
        }),
      });

      if (!res.ok) throw new Error("Agent unavailable");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, I'm temporarily unavailable. Please try again in a moment.",
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const hasMessages = messages.length > 0;
  const displayName = partnerName || "Partner";

  return (
    <>
      {/* Floating button — emerald theme */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-28 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all md:bottom-6 md:right-6 ${
          open
            ? "bg-gray-800 text-white"
            : "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
        }`}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18" /><path d="M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" />
              <path d="M5 21V7l7-4 7 4v14" />
              <path d="M9 21v-6h6v6" />
            </svg>
            <div className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-emerald-600 bg-green-400" />
            <div className="absolute -left-1 -bottom-1 rounded-full bg-emerald-400 px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-emerald-900 shadow-sm">
              VENUE
            </div>
          </>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-50 md:inset-auto md:bottom-24 md:right-6">
          {/* Glow */}
          <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-green-500/20 blur-xl animate-pulse hidden md:block" />
          <div className="relative flex h-full w-full md:h-[520px] md:w-[380px] flex-col overflow-hidden md:rounded-2xl border border-emerald-200/40 bg-white shadow-2xl shadow-emerald-500/10">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-100">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l7-4 7 4v14" />
                  <path d="M9 21v-6h6v6" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">Partner Success</p>
                  <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-emerald-100 ring-1 ring-white/20">
                    VENUE
                  </span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 md:hidden"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-300 animate-pulse" />
                  <p className="text-[11px] text-white/60">your partnership assistant</p>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
              {!hasMessages && (
                <div className="space-y-4">
                  <div className="rounded-2xl rounded-bl-md bg-emerald-50 border border-emerald-100 px-3.5 py-2.5 text-[13px] leading-relaxed text-gray-700">
                    Welcome{partnerName ? `, ${partnerName}` : ""}! I&apos;m your Partner Success assistant. I can help you understand how TicketMatch works, optimize your listings, and answer questions about revenue, bookings, and your partnership. How can I help?
                  </div>

                  {/* Quick topic cards */}
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_TOPICS.map((t) => (
                      <button
                        key={t.label}
                        onClick={() => sendMessage(t.label)}
                        className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2.5 text-left transition-all hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-xs font-bold text-emerald-700">{t.icon}</span>
                        <span className="text-[11px] font-medium text-gray-600 leading-tight">{t.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Stats preview */}
                  <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-3">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-lg font-bold text-emerald-700">100+</p>
                        <p className="text-[10px] text-gray-500">Tour operators</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-700">Groups</p>
                        <p className="text-[10px] text-gray-500">10-50+ people</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-emerald-700">Net 30</p>
                        <p className="text-[10px] text-gray-500">Settlement</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {hasMessages && (
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[85%]">
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                            msg.role === "user"
                              ? "bg-emerald-600 text-white rounded-br-md"
                              : "bg-emerald-50 border border-emerald-100 text-gray-700 rounded-bl-md"
                          }`}
                        >
                          {msg.role === "assistant" ? <ChatMarkdown text={msg.content} /> : msg.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-emerald-50 border border-emerald-100 px-3.5 py-2.5">
                        <span className="h-1 w-1 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: "0ms" }} />
                        <span className="h-1 w-1 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: "150ms" }} />
                        <span className="h-1 w-1 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-emerald-100 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Ask about your partnership..."
                  className="flex-1 bg-transparent py-1.5 text-[13px] text-gray-700 outline-none placeholder:text-gray-400"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition-all hover:bg-emerald-500 disabled:opacity-30"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
