"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const AGENT_URL = "/api/agent/dashboard";

// Tier-specific configuration
const TIER_CONFIG = {
  free: {
    name: "TicketMatch Assistant",
    subtitle: "Online",
    greeting: (name: string) =>
      `Hi${name ? ` ${name}` : ""}! I'm your TicketMatch Assistant. I can help you with bookings, groups, and itineraries. Ask me anything!`,
    quickTopics: [
      { label: "How do I book?", icon: "🎫" },
      { label: "How do groups work?", icon: "👥" },
      { label: "How do I share an itinerary?", icon: "📤" },
      { label: "What's included in Pro?", icon: "⚡" },
    ],
    headerGradient: "from-accent to-blue-700",
    iconGradient: "from-blue-400 to-blue-600",
    iconShadow: "shadow-blue-500/25",
    glowColors: "from-accent/30 via-blue-400/20 to-cyan-300/25",
    borderColor: "border-accent/15",
    shadowColor: "shadow-accent/15",
    buttonBg: "bg-accent",
    buttonShadow: "shadow-accent/30 hover:shadow-accent/50",
    userBubble: "bg-accent",
    dotColor: "bg-emerald-400",
    sendBg: "bg-accent",
    badge: null,
  },
  pro: {
    name: "TicketMatch Pro Advisor",
    subtitle: "Pro · Online",
    greeting: (name: string) =>
      `Welcome back${name ? ` ${name}` : ""}! As your Pro Advisor, I have full access to venue recommendations, planning strategies, and market insights. How can I help you today?`,
    quickTopics: [
      { label: "Best venues for my group", icon: "🏛️" },
      { label: "Plan a full-day itinerary", icon: "🗓️" },
      { label: "Market insights & trends", icon: "📊" },
      { label: "Optimize my bookings", icon: "💡" },
    ],
    headerGradient: "from-amber-600 to-amber-800",
    iconGradient: "from-amber-400 to-amber-600",
    iconShadow: "shadow-amber-500/25",
    glowColors: "from-amber-500/30 via-yellow-400/20 to-orange-300/25",
    borderColor: "border-amber-500/15",
    shadowColor: "shadow-amber-500/15",
    buttonBg: "bg-amber-600",
    buttonShadow: "shadow-amber-500/30 hover:shadow-amber-500/50",
    userBubble: "bg-amber-600",
    dotColor: "bg-emerald-400",
    sendBg: "bg-amber-600",
    badge: "PRO",
  },
  enterprise: {
    name: "TicketMatch Strategic Partner",
    subtitle: "Enterprise · Priority",
    greeting: (name: string) =>
      `Hello${name ? ` ${name}` : ""}. I'm your dedicated Strategic Partner — with full access to market intelligence, trend analysis, and premium venue insights. Let's make your next program exceptional.`,
    quickTopics: [
      { label: "Market trends & analysis", icon: "📈" },
      { label: "Strategic venue selection", icon: "🎯" },
      { label: "Competitor benchmarking", icon: "🔍" },
      { label: "Seasonal planning advice", icon: "📅" },
    ],
    headerGradient: "from-purple-700 to-indigo-900",
    iconGradient: "from-purple-400 to-purple-600",
    iconShadow: "shadow-purple-500/25",
    glowColors: "from-purple-500/30 via-indigo-400/20 to-violet-300/25",
    borderColor: "border-purple-500/15",
    shadowColor: "shadow-purple-500/15",
    buttonBg: "bg-purple-700",
    buttonShadow: "shadow-purple-500/30 hover:shadow-purple-500/50",
    userBubble: "bg-purple-700",
    dotColor: "bg-emerald-300",
    sendBg: "bg-purple-700",
    badge: "ENTERPRISE",
  },
};

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("tm_dash_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("tm_dash_session", id);
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

    // List items (- or numbered)
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

export default function DashboardAgent({ userPlan = "free", userName = "" }: { userPlan?: string; userName?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [clock, setClock] = useState(() => formatLiveClock(new Date()));
  const scrollRef = useRef<HTMLDivElement>(null);

  const tier = (TIER_CONFIG[userPlan as keyof typeof TIER_CONFIG] ? userPlan : "free") as keyof typeof TIER_CONFIG;
  const config = TIER_CONFIG[tier];
  const firstName = userName ? userName.split(" ")[0] : "";

  useEffect(() => {
    const timer = setInterval(() => setClock(formatLiveClock(new Date())), 30000);
    return () => clearInterval(timer);
  }, []);

  // Listen for "Ask the Agent" events from Knowledge Base page
  useEffect(() => {
    const handler = (e: Event) => {
      const question = (e as CustomEvent).detail;
      if (question) {
        setOpen(true);
        // Small delay to ensure chat is open before sending
        setTimeout(() => sendMessage(question), 300);
      }
    };
    window.addEventListener("tm-ask-agent", handler);
    return () => window.removeEventListener("tm-ask-agent", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

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
          userPlan,
          userName,
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
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-28 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all md:bottom-6 md:right-6 ${
          open
            ? "bg-gray-800 text-white rotate-0"
            : `${config.buttonBg} text-white ${config.buttonShadow} hover:scale-105`
        }`}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18" /><path d="M6 6l12 12" />
          </svg>
        ) : (
          <>
            <span className="text-base font-bold text-white">TM</span>
            {/* Notification dot */}
            <div className={`absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${config.dotColor}`} />
            {/* Pro/Enterprise badge on button */}
            {config.badge && (
              <div className="absolute -left-1 -bottom-1 rounded-full bg-white px-1.5 py-0.5 text-[8px] font-bold tracking-wide shadow-sm"
                style={{ color: tier === "pro" ? "#b45309" : "#7c3aed" }}>
                {config.badge}
              </div>
            )}
          </>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-50 md:inset-auto md:bottom-24 md:right-6">
          {/* Premium glow — desktop only */}
          <div className={`absolute -inset-1.5 rounded-3xl bg-gradient-to-r ${config.glowColors} blur-xl animate-pulse hidden md:block`} />
          <div className={`relative flex h-full w-full md:h-[480px] md:w-[360px] flex-col overflow-hidden md:rounded-2xl border ${config.borderColor} bg-white shadow-2xl ${config.shadowColor}`}>
          {/* Header */}
          <div className={`flex items-center gap-3 border-b border-border/40 bg-gradient-to-r ${config.headerGradient} px-4 py-3`}>
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${config.iconGradient} shadow-lg ${config.iconShadow}`}>
              <span className="text-xs font-bold text-white">TM</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{config.name}</p>
                  {config.badge && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${
                      tier === "pro"
                        ? "bg-amber-400/20 text-amber-200"
                        : "bg-purple-400/20 text-purple-200"
                    }`}>
                      {config.badge}
                    </span>
                  )}
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
                <div className={`h-1.5 w-1.5 rounded-full ${config.dotColor} animate-pulse`} />
                <p className="text-[11px] text-white/60">{config.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
            {/* Welcome state with quick topics */}
            {!hasMessages && (
              <div className="space-y-4">
                <div className="rounded-2xl rounded-bl-md bg-gray-100 px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground">
                  {config.greeting(firstName)}
                </div>

                {/* Quick topic cards */}
                <div className="grid grid-cols-2 gap-2">
                  {config.quickTopics.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => sendMessage(t.label)}
                      className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-left transition-all hover:shadow-sm ${
                        tier === "pro"
                          ? "border-amber-200/60 hover:border-amber-300/60 hover:bg-amber-50/50"
                          : tier === "enterprise"
                          ? "border-purple-200/60 hover:border-purple-300/60 hover:bg-purple-50/50"
                          : "border-border/60 hover:border-accent/30 hover:bg-accent/5"
                      }`}
                    >
                      <span className="text-lg">{t.icon}</span>
                      <span className="text-[12px] font-medium text-foreground">{t.label}</span>
                    </button>
                  ))}
                </div>

                {userPlan === "free" && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <p className="text-[11px] font-semibold text-amber-800">Upgrade to Pro</p>
                    <p className="mt-0.5 text-[11px] text-amber-700">Get unlimited AI assistance, venue tips and planning advice.</p>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {hasMessages && (
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[85%]">
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                          msg.role === "user"
                            ? `${config.userBubble} text-white rounded-br-md`
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
                placeholder={tier === "enterprise" ? "Ask your strategic partner..." : tier === "pro" ? "Ask your advisor..." : "Ask me anything..."}
                className="flex-1 bg-transparent py-1.5 text-[13px] outline-none placeholder:text-muted/40"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.sendBg} text-white transition-all hover:brightness-110 disabled:opacity-30`}
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
