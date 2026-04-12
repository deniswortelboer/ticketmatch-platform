"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  suggestions?: { name: string; price: string; tag: string }[];
};

const AGENT_URL = "/api/agent";

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content: "Hi! I'm Emma, your AI travel assistant. Ask me anything about group bookings, venues, pricing or how TicketMatch works. I speak every language!",
  },
];

const QUICK_TOPICS = [
  { label: "Best venues for groups in Amsterdam?", icon: "🏛️" },
  { label: "Plan a full-day itinerary", icon: "📋" },
  { label: "How do I become a member?", icon: "🤝" },
  { label: "What experiences are trending?", icon: "🔥" },
];

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("tm_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("tm_session", id);
  }
  return id;
}

function ChatMarkdown({ text }: { text: string }) {
  // Fix broken markdown links split across lines and join [text]\n(url) patterns
  const fixed = text.replace(/\]\s*\n\s*\(/g, "](");
  const lines = fixed.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const formatLine = (s: string) => {
      const parts: React.ReactNode[] = [];
      let last = 0;
      // Match **bold**, [link](url), [url], or plain URLs
      const re = /\*\*(.+?)\*\*|\[(.+?)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)|\[(https?:\/\/[^\]]+)\]|(https?:\/\/[^\s,)]+)/g;
      let m;
      while ((m = re.exec(s)) !== null) {
        if (m.index > last) parts.push(s.slice(last, m.index));
        if (m[1]) {
          parts.push(<strong key={`b${m.index}`} className="font-semibold">{m[1]}</strong>);
        } else if (m[2] && m[3]) {
          parts.push(<a key={`l${m.index}`} href={m[3]} className="font-medium text-accent underline underline-offset-2 hover:text-accent/80" target={m[3].startsWith("/") ? undefined : "_blank"} rel={m[3].startsWith("/") ? undefined : "noopener noreferrer"}>{m[2]}</a>);
        } else if (m[4]) {
          parts.push(<a key={`u${m.index}`} href={m[4]} className="font-medium text-accent underline underline-offset-2 hover:text-accent/80" target="_blank" rel="noopener noreferrer">{m[4].replace(/^https?:\/\//, '')}</a>);
        } else if (m[5]) {
          parts.push(<a key={`u${m.index}`} href={m[5]} className="font-medium text-accent underline underline-offset-2 hover:text-accent/80" target="_blank" rel="noopener noreferrer">{m[5].replace(/^https?:\/\//, '')}</a>);
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
          <span className="text-accent/60 font-medium shrink-0">{isNumbered ? listMatch[1].trim() : "›"}</span>
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

export default function HeroChat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [clock, setClock] = useState(() => formatLiveClock(new Date()));
  const scrollRef = useRef<HTMLDivElement>(null);

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
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const history = updatedMessages
        .filter((m) => m !== INITIAL_MESSAGES[0])
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(AGENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: history.slice(0, -1),
          sessionId: getSessionId(),
        }),
      });

      if (!res.ok) throw new Error("Agent unavailable");

      const data = await res.json();
      const assistantMsg = {
        role: "assistant" as const,
        content: data.content,
        suggestions: data.suggestions?.length > 0 ? data.suggestions : undefined,
      };
      setMessages((prev) => {
        const next = [...prev, assistantMsg];
        // Save conversation to sessionStorage so FloatingEmma can pick it up
        try {
          const toSave = next.filter((m) => m !== INITIAL_MESSAGES[0]);
          sessionStorage.setItem("tm_hero_messages", JSON.stringify(toSave));
        } catch {}
        return next;
      });
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, I'm temporarily unavailable. Please try again in a moment.",
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const hasUserMessages = messages.length > 1;

  return (
    <div>
      {/* Chat widget with premium glow */}
      <div className="relative">
        <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-accent/25 via-blue-400/20 to-cyan-300/25 blur-xl animate-pulse" />
        <div className="relative flex h-[480px] flex-col overflow-hidden rounded-2xl border border-accent/15 bg-white dark:bg-[#1a2236] shadow-2xl shadow-accent/15">
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b border-border/40 bg-gradient-to-r from-accent to-blue-700 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/25">
              <span className="text-xs font-bold text-white">TM</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Emma — AI Travel Assistant</p>
                <span className="text-[10px] text-white/50 font-medium">{clock}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                <p className="text-[11px] text-white/60">Online</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {/* Welcome state with quick topics inside chat */}
            {!hasUserMessages && (
              <div className="space-y-3">
                {/* Initial greeting already in messages[0] renders below */}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%]">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-accent text-white rounded-br-md"
                        : "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-100 rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? <ChatMarkdown text={msg.content} /> : msg.content}
                  </div>
                  {msg.suggestions && (
                    <div className="mt-2 space-y-1.5">
                      {msg.suggestions.map((s, j) => (
                        <div key={j} className="flex items-center justify-between rounded-lg border border-border/50 bg-white dark:bg-white/5 px-3 py-2 hover:border-accent/30 hover:shadow-sm">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">{s.tag}</span>
                            <span className="text-[12px] font-medium">{s.name}</span>
                          </div>
                          <span className="text-[12px] font-bold text-accent">{s.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-gray-100 dark:bg-white/10 px-3.5 py-2.5">
                  <span className="h-1 w-1 animate-bounce rounded-full bg-muted/50" style={{ animationDelay: "0ms" }} />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-muted/50" style={{ animationDelay: "150ms" }} />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-muted/50" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {/* Quick topic cards — inside chat, disappear after first message */}
            {!hasUserMessages && (
              <div className="grid grid-cols-2 gap-2">
                {QUICK_TOPICS.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => sendMessage(t.label)}
                    className="flex items-center gap-2 rounded-xl border border-border/60 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2.5 text-left transition-all hover:border-accent/30 hover:bg-accent/5 hover:shadow-sm"
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className="text-[12px] font-medium text-gray-700 dark:text-gray-200">{t.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border/40 dark:border-white/10 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask Emma anything... (any language!)"
                className="flex-1 bg-transparent py-1 text-[13px] text-gray-800 dark:text-gray-100 outline-none placeholder:text-muted/40 dark:placeholder:text-gray-500"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white transition-all hover:brightness-110 disabled:opacity-30"
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
    </div>
  );
}
