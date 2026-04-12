"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const AGENT_URL = "/api/agent/developer";

const QUICK_TOPICS = [
  { label: "Show me the API endpoints", icon: "{ }" },
  { label: "How do I authenticate?", icon: "🔐" },
  { label: "Integration process", icon: "🚀" },
  { label: "Show a code example", icon: "💻" },
];

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("tm_dev_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("tm_dev_session", id);
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

    // Code block handling
    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.trim().replace("```", "");
        codeLines = [];
        continue;
      } else {
        inCodeBlock = false;
        elements.push(
          <div key={key++} className="my-2 rounded-lg bg-[#1a1a2e] p-3 overflow-x-auto">
            {codeLang && <div className="text-[10px] text-cyan-400/60 mb-1 font-mono">{codeLang}</div>}
            <pre className="text-[12px] leading-relaxed text-cyan-100 font-mono whitespace-pre">{codeLines.join("\n")}</pre>
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
          parts.push(<code key={`c${m.index}`} className="rounded bg-[#1a1a2e] px-1.5 py-0.5 text-[12px] font-mono text-cyan-300">{m[2]}</code>);
        } else if (m[3] && m[4]) {
          parts.push(<a key={`l${m.index}`} href={m[4]} className="font-medium text-cyan-400 underline underline-offset-2 hover:text-cyan-300" target={m[4].startsWith("/") ? undefined : "_blank"} rel={m[4].startsWith("/") ? undefined : "noopener noreferrer"}>{m[3]}</a>);
        } else if (m[5]) {
          parts.push(<a key={`u${m.index}`} href={m[5]} className="font-medium text-cyan-400 underline underline-offset-2 hover:text-cyan-300" target="_blank" rel="noopener noreferrer">{m[5].replace(/^https?:\/\//, '')}</a>);
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
          <span className="text-cyan-500/60 font-medium shrink-0 font-mono">{isNumbered ? listMatch[1].trim() : ">"}</span>
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

export default function DeveloperAgent() {
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

  return (
    <>
      {/* Floating button — dark/cyan tech theme */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-28 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all md:bottom-6 md:right-6 ${
          open
            ? "bg-gray-800 text-white"
            : "bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-cyan-400 shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 ring-1 ring-cyan-500/20"
        }`}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18" /><path d="M6 6l12 12" />
          </svg>
        ) : (
          <>
            <span className="text-sm font-mono font-bold">&lt;/&gt;</span>
            <div className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0f172a] bg-cyan-400" />
            <div className="absolute -left-1 -bottom-1 rounded-full bg-cyan-400 px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-[#0f172a] shadow-sm">
              DEV
            </div>
          </>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-50 md:inset-auto md:bottom-24 md:right-6">
          {/* Tech glow */}
          <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-purple-500/20 blur-xl animate-pulse hidden md:block" />
          <div className="relative flex h-full w-full md:h-[520px] md:w-[380px] flex-col overflow-hidden md:rounded-2xl border border-cyan-500/15 bg-[#0f172a] shadow-2xl shadow-cyan-500/10">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-cyan-500/10 bg-gradient-to-r from-[#0f172a] to-[#1a2744] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/20">
                <span className="text-xs font-mono font-bold text-cyan-400">&lt;/&gt;</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">Developer Agent</p>
                  <span className="rounded-full bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-cyan-400 ring-1 ring-cyan-500/20">
                    API
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
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <p className="text-[11px] text-white/40 font-mono">integration assistant</p>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
              {!hasMessages && (
                <div className="space-y-4">
                  <div className="rounded-2xl rounded-bl-md bg-white/5 border border-white/5 px-3.5 py-2.5 text-[13px] leading-relaxed text-gray-300">
                    Hey! I&apos;m the TicketMatch Developer Agent. I can help you understand our API, provide code examples, and guide you through the integration process. What are you building?
                  </div>

                  {/* Quick topic cards */}
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_TOPICS.map((t) => (
                      <button
                        key={t.label}
                        onClick={() => sendMessage(t.label)}
                        className="flex items-center gap-2 rounded-xl border border-cyan-500/10 bg-white/5 px-3 py-2.5 text-left transition-all hover:border-cyan-500/25 hover:bg-cyan-500/5"
                      >
                        <span className="text-sm font-mono text-cyan-400">{t.icon}</span>
                        <span className="text-[12px] font-medium text-gray-300">{t.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Terminal-style info */}
                  <div className="rounded-xl bg-white/5 border border-white/5 px-3 py-2.5 font-mono">
                    <p className="text-[11px] text-cyan-400/60">$ ticketmatch --version</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">API v1.0 · REST · JSON · 6 endpoints</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Integration time: ~5 days</p>
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
                              ? "bg-cyan-600 text-white rounded-br-md"
                              : "bg-white/5 border border-white/5 text-gray-300 rounded-bl-md"
                          }`}
                        >
                          {msg.role === "assistant" ? <ChatMarkdown text={msg.content} /> : msg.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white/5 border border-white/5 px-3.5 py-2.5">
                        <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-400/50" style={{ animationDelay: "0ms" }} />
                        <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-400/50" style={{ animationDelay: "150ms" }} />
                        <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-400/50" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-cyan-500/10 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-cyan-500/30 font-mono text-sm">$</span>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Ask about the API..."
                  className="flex-1 bg-transparent py-1.5 text-[13px] text-gray-300 outline-none placeholder:text-white/20 font-mono"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-600 text-white transition-all hover:bg-cyan-500 disabled:opacity-30"
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
