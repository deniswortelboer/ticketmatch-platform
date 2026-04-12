"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const AGENT_URL = "/api/agent/reseller";

const QUICK_TOPICS = [
  { label: "Write a message for agencies", icon: "✉️" },
  { label: "How does my commission work?", icon: "💰" },
  { label: "Who should I target?", icon: "🎯" },
  { label: "Tips to grow my network", icon: "📈" },
];

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("tm_reseller_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("tm_reseller_session", id);
  }
  return id;
}

function ChatMarkdown({ text }: { text: string }) {
  const fixed = text.replace(/\]\s*\n\s*\(/g, "](");
  const lines = fixed.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const formatLine = (s: string) => {
      const parts: React.ReactNode[] = [];
      let last = 0;
      const re = /\*\*(.+?)\*\*|\[(.+?)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)|\[(https?:\/\/[^\]]+)\]|(https?:\/\/[^\s,)]+)/g;
      let m;
      while ((m = re.exec(s)) !== null) {
        if (m.index > last) parts.push(s.slice(last, m.index));
        if (m[1]) {
          parts.push(<strong key={`b${m.index}`} className="font-semibold">{m[1]}</strong>);
        } else if (m[2] && m[3]) {
          parts.push(<a key={`l${m.index}`} href={m[3]} className="font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-600" target={m[3].startsWith("/") ? undefined : "_blank"} rel={m[3].startsWith("/") ? undefined : "noopener noreferrer"}>{m[2]}</a>);
        } else if (m[4]) {
          parts.push(<a key={`u${m.index}`} href={m[4]} className="font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-600" target="_blank" rel="noopener noreferrer">{m[4].replace(/^https?:\/\//, '')}</a>);
        } else if (m[5]) {
          parts.push(<a key={`u${m.index}`} href={m[5]} className="font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-600" target="_blank" rel="noopener noreferrer">{m[5].replace(/^https?:\/\//, '')}</a>);
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
          <span className="text-emerald-600/60 font-medium shrink-0">{isNumbered ? listMatch[1].trim() : "›"}</span>
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

function formatLiveClock(d: Date) {
  const days = ["zo", "ma", "di", "wo", "do", "vr", "za"];
  const months = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

interface ResellerAgentProps {
  resellerName?: string;
  resellerSlug?: string;
  agencyCount?: number;
  totalCommission?: number;
}

export default function ResellerAgent({ resellerName = "", resellerSlug = "", agencyCount = 0, totalCommission = 0 }: ResellerAgentProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [clock, setClock] = useState(() => formatLiveClock(new Date()));
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstName = resellerName ? resellerName.split(" ")[0] : "";

  useEffect(() => {
    const timer = setInterval(() => setClock(formatLiveClock(new Date())), 30000);
    return () => clearInterval(timer);
  }, []);

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
          resellerName,
          resellerSlug,
          agencyCount,
          totalCommission,
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
      {/* Floating button — green for resellers */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-28 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all md:bottom-6 md:right-6 ${
          open
            ? "bg-gray-800 text-white"
            : "bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105"
        }`}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18" /><path d="M6 6l12 12" />
          </svg>
        ) : (
          <>
            <span className="text-base font-bold text-white">TM</span>
            <div className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-300" />
            <div className="absolute -left-1 -bottom-1 rounded-full bg-white px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-green-700 shadow-sm">
              RESELLER
            </div>
          </>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-50 md:inset-auto md:bottom-24 md:right-6">
          {/* Green glow */}
          <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-green-500/30 via-emerald-400/20 to-teal-300/25 blur-xl animate-pulse hidden md:block" />
          <div className="relative flex h-full w-full md:h-[480px] md:w-[360px] flex-col overflow-hidden md:rounded-2xl border border-green-500/15 bg-white shadow-2xl shadow-green-500/15">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border/40 bg-gradient-to-r from-green-700 to-emerald-600 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/25">
                <span className="text-xs font-bold text-white">TM</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">Reseller Growth Partner</p>
                    <span className="rounded-full bg-green-400/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-green-200">
                      RESELLER
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/50 font-medium">{clock}</span>
                    <button
                      onClick={() => setOpen(false)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 md:hidden"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <p className="text-[11px] text-white/60">Your growth coach</p>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
              {!hasMessages && (
                <div className="space-y-4">
                  <div className="rounded-2xl rounded-bl-md bg-gray-100 px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground">
                    Hi{firstName ? ` ${firstName}` : ""}! I&apos;m your Reseller Growth Partner. I can help you write outreach messages, find new agencies to recruit, and grow your commission. {agencyCount > 0 ? `You've already referred ${agencyCount} ${agencyCount === 1 ? "agency" : "agencies"} — let's get more!` : "Let's get your first agency signed up!"} What would you like to work on?
                  </div>

                  {/* Quick topic cards */}
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_TOPICS.map((t) => (
                      <button
                        key={t.label}
                        onClick={() => sendMessage(t.label)}
                        className="flex items-center gap-2 rounded-xl border border-green-200/60 bg-white px-3 py-2.5 text-left transition-all hover:border-green-300/60 hover:bg-green-50/50 hover:shadow-sm"
                      >
                        <span className="text-lg">{t.icon}</span>
                        <span className="text-[12px] font-medium text-foreground">{t.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Stats mini card */}
                  <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2.5">
                    <p className="text-[11px] font-semibold text-green-800">Your stats</p>
                    <div className="mt-1 flex gap-4 text-[11px] text-green-700">
                      <span>{agencyCount} {agencyCount === 1 ? "agency" : "agencies"}</span>
                      <span>&euro; {totalCommission.toFixed(2)} earned</span>
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
                              ? "bg-green-700 text-white rounded-br-md"
                              : "bg-gray-100 text-foreground rounded-bl-md"
                          }`}
                        >
                          {msg.role === "assistant" ? <ChatMarkdown text={msg.content} /> : msg.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-gray-100 px-3.5 py-2.5">
                        <span className="h-1 w-1 animate-bounce rounded-full bg-muted/50" style={{ animationDelay: "0ms" }} />
                        <span className="h-1 w-1 animate-bounce rounded-full bg-muted/50" style={{ animationDelay: "150ms" }} />
                        <span className="h-1 w-1 animate-bounce rounded-full bg-muted/50" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border/40 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Ask your growth partner..."
                  className="flex-1 bg-transparent py-1.5 text-[13px] outline-none placeholder:text-muted/40"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-700 text-white transition-all hover:brightness-110 disabled:opacity-30"
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
