"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type AgentConfig = {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  badge: string;
  apiUrl: string;
  gradient: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  userBubble: string;
  botBubbleBg: string;
  botBubbleBorder: string;
  accentText: string;
  sendBg: string;
  placeholder: string;
  greeting: string;
  dotColor: string;
  glowFrom: string;
  glowTo: string;
  extraBody?: Record<string, unknown>;
};

const AGENTS: AgentConfig[] = [
  {
    id: "admin",
    name: "Admin Command Center",
    shortName: "Admin",
    icon: "shield",
    badge: "ADMIN",
    apiUrl: "/api/agent/admin",
    gradient: "from-amber-500 to-orange-600",
    borderColor: "border-amber-200/40",
    badgeBg: "bg-white/20",
    badgeText: "text-amber-100",
    userBubble: "bg-amber-500 text-white",
    botBubbleBg: "bg-amber-50",
    botBubbleBorder: "border-amber-100",
    accentText: "text-amber-600",
    sendBg: "bg-amber-500 hover:bg-amber-600",
    placeholder: "Vraag me alles over je platform...",
    greeting: "Hey! Ik ben je Admin Agent — ik help je met het runnen van TicketMatch. Strategie, prioriteiten, content — vraag maar!",
    dotColor: "bg-yellow-300",
    glowFrom: "from-amber-500/20",
    glowTo: "to-orange-500/20",
  },
  {
    id: "enterprise",
    name: "Strategic Partner",
    shortName: "Enterprise",
    icon: "star",
    badge: "ENTERPRISE",
    apiUrl: "/api/agent/dashboard",
    gradient: "from-purple-600 to-violet-700",
    borderColor: "border-purple-200/40",
    badgeBg: "bg-white/20",
    badgeText: "text-purple-100",
    userBubble: "bg-purple-600 text-white",
    botBubbleBg: "bg-purple-50",
    botBubbleBorder: "border-purple-100",
    accentText: "text-purple-600",
    sendBg: "bg-purple-600 hover:bg-purple-500",
    placeholder: "Ask your strategic partner...",
    greeting: "Welcome! I'm your TicketMatch Strategic Partner. I have access to exclusive market insights, trends, and advanced planning tools. How can I help?",
    dotColor: "bg-purple-300",
    glowFrom: "from-purple-500/20",
    glowTo: "to-violet-500/20",
    extraBody: { plan: "enterprise" },
  },
  {
    id: "pro",
    name: "Pro Advisor",
    shortName: "Pro",
    icon: "zap",
    badge: "PRO",
    apiUrl: "/api/agent/dashboard",
    gradient: "from-amber-500 to-yellow-600",
    borderColor: "border-amber-200/40",
    badgeBg: "bg-white/20",
    badgeText: "text-amber-100",
    userBubble: "bg-amber-500 text-white",
    botBubbleBg: "bg-amber-50",
    botBubbleBorder: "border-amber-100",
    accentText: "text-amber-600",
    sendBg: "bg-amber-500 hover:bg-amber-600",
    placeholder: "Ask your advisor...",
    greeting: "Hi! I'm your TicketMatch Pro Advisor. I can help with planning, venue recommendations, and group management. What do you need?",
    dotColor: "bg-amber-300",
    glowFrom: "from-amber-500/20",
    glowTo: "to-yellow-500/20",
    extraBody: { plan: "pro" },
  },
  {
    id: "free",
    name: "TicketMatch Assistant",
    shortName: "Free",
    icon: "chat",
    badge: "FREE",
    apiUrl: "/api/agent/dashboard",
    gradient: "from-blue-500 to-blue-600",
    borderColor: "border-blue-200/40",
    badgeBg: "bg-white/20",
    badgeText: "text-blue-100",
    userBubble: "bg-blue-500 text-white",
    botBubbleBg: "bg-blue-50",
    botBubbleBorder: "border-blue-100",
    accentText: "text-blue-600",
    sendBg: "bg-blue-500 hover:bg-blue-600",
    placeholder: "Ask me anything...",
    greeting: "Hi! I'm the TicketMatch Assistant. I can help you find venues, plan itineraries, and answer questions about the platform. What can I do for you?",
    dotColor: "bg-blue-300",
    glowFrom: "from-blue-500/20",
    glowTo: "to-blue-500/20",
    extraBody: { plan: "free" },
  },
  {
    id: "reseller",
    name: "Reseller Growth Partner",
    shortName: "Reseller",
    icon: "users",
    badge: "RESELLER",
    apiUrl: "/api/agent/reseller",
    gradient: "from-green-600 to-emerald-600",
    borderColor: "border-green-200/40",
    badgeBg: "bg-white/20",
    badgeText: "text-green-100",
    userBubble: "bg-green-600 text-white",
    botBubbleBg: "bg-green-50",
    botBubbleBorder: "border-green-100",
    accentText: "text-green-600",
    sendBg: "bg-green-600 hover:bg-green-500",
    placeholder: "Ask about reselling...",
    greeting: "Hey! I'm your Reseller Growth Partner. I help you grow your network, write outreach messages, and maximize your commission. What can I help with?",
    dotColor: "bg-green-300",
    glowFrom: "from-green-500/20",
    glowTo: "to-emerald-500/20",
  },
  {
    id: "developer",
    name: "Developer Agent",
    shortName: "Developer",
    icon: "code",
    badge: "DEV",
    apiUrl: "/api/agent/developer",
    gradient: "from-[#0f172a] to-[#1e3a5f]",
    borderColor: "border-cyan-500/15",
    badgeBg: "bg-cyan-500/10",
    badgeText: "text-cyan-400",
    userBubble: "bg-cyan-600 text-white",
    botBubbleBg: "bg-[#0f172a]/5",
    botBubbleBorder: "border-cyan-200/30",
    accentText: "text-cyan-600",
    sendBg: "bg-cyan-600 hover:bg-cyan-500",
    placeholder: "Ask about the API...",
    greeting: "Hey! I'm the Developer Agent. I can help you understand our API, provide code examples, and guide you through integration. What are you building?",
    dotColor: "bg-cyan-300",
    glowFrom: "from-cyan-500/20",
    glowTo: "to-blue-500/20",
  },
  {
    id: "partner",
    name: "Partner Success",
    shortName: "Partner",
    icon: "building",
    badge: "VENUE",
    apiUrl: "/api/agent/partner",
    gradient: "from-emerald-600 to-teal-700",
    borderColor: "border-emerald-200/40",
    badgeBg: "bg-white/20",
    badgeText: "text-emerald-100",
    userBubble: "bg-emerald-600 text-white",
    botBubbleBg: "bg-emerald-50",
    botBubbleBorder: "border-emerald-100",
    accentText: "text-emerald-600",
    sendBg: "bg-emerald-600 hover:bg-emerald-500",
    placeholder: "Ask about your partnership...",
    greeting: "Welcome! I'm your Partner Success assistant. I help you understand how TicketMatch works, optimize your listings, and grow your bookings. How can I help?",
    dotColor: "bg-emerald-300",
    glowFrom: "from-emerald-500/20",
    glowTo: "to-teal-500/20",
  },
  {
    id: "advertising",
    name: "Advertising Advisor",
    shortName: "Ads",
    icon: "megaphone",
    badge: "ADS",
    apiUrl: "/api/agent/advertising",
    gradient: "from-yellow-500 to-amber-600",
    borderColor: "border-yellow-200/40",
    badgeBg: "bg-white/20",
    badgeText: "text-yellow-100",
    userBubble: "bg-amber-500 text-white",
    botBubbleBg: "bg-amber-50",
    botBubbleBorder: "border-amber-100",
    accentText: "text-amber-600",
    sendBg: "bg-amber-500 hover:bg-amber-600",
    placeholder: "Ask about advertising tiers...",
    greeting: "Hey! I'm the Advertising Advisor. I help venue partners understand our advertising tiers (Bronze, Silver, Gold, Platinum) and choose the right plan. What would you like to know?",
    dotColor: "bg-yellow-300",
    glowFrom: "from-yellow-500/20",
    glowTo: "to-amber-500/20",
  },
];

function DockIcon({ type, size = 16 }: { type: string; size?: number }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "shield": return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case "star": return <svg {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
    case "zap": return <svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
    case "chat": return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
    case "users": return <svg {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "code": return <svg {...props}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
    case "building": return <svg {...props}><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" /></svg>;
    case "megaphone": return <svg {...props}><path d="m3 11 18-5v12L3 13v-2z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>;
    default: return null;
  }
}

function ChatMarkdown({ text, accentText }: { text: string; accentText: string }) {
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
      if (!inCodeBlock) { inCodeBlock = true; codeLang = line.trim().replace("```", ""); codeLines = []; continue; }
      else { inCodeBlock = false; elements.push(<div key={key++} className="my-2 rounded-lg bg-gray-900/10 p-3 overflow-x-auto">{codeLang && <div className="text-[10px] text-gray-500 mb-1 font-mono">{codeLang}</div>}<pre className="text-[12px] leading-relaxed text-gray-800 font-mono whitespace-pre">{codeLines.join("\n")}</pre></div>); continue; }
    }
    if (inCodeBlock) { codeLines.push(line); continue; }

    const formatLine = (s: string) => {
      const parts: React.ReactNode[] = [];
      let last = 0;
      const re = /\*\*(.+?)\*\*|`([^`]+)`|\[(.+?)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)|(https?:\/\/[^\s,)]+)/g;
      let m;
      while ((m = re.exec(s)) !== null) {
        if (m.index > last) parts.push(s.slice(last, m.index));
        if (m[1]) parts.push(<strong key={`b${m.index}`} className="font-semibold">{m[1]}</strong>);
        else if (m[2]) parts.push(<code key={`c${m.index}`} className="rounded bg-gray-100 px-1.5 py-0.5 text-[12px] font-mono">{m[2]}</code>);
        else if (m[3] && m[4]) parts.push(<a key={`l${m.index}`} href={m[4]} className={`font-medium ${accentText} underline underline-offset-2`} target={m[4].startsWith("/") ? undefined : "_blank"} rel={m[4].startsWith("/") ? undefined : "noopener noreferrer"}>{m[3]}</a>);
        else if (m[5]) parts.push(<a key={`u${m.index}`} href={m[5]} className={`font-medium ${accentText} underline underline-offset-2`} target="_blank" rel="noopener noreferrer">{m[5].replace(/^https?:\/\//, '')}</a>);
        last = re.lastIndex;
      }
      if (last < s.length) parts.push(s.slice(last));
      return parts.length ? parts : s;
    };

    const listMatch = line.match(/^(\d+\.\s+|-\s+)(.*)$/);
    if (listMatch) {
      elements.push(<div key={key++} className="flex gap-2 mt-1"><span className={`${accentText} font-medium shrink-0`}>{/^\d+\./.test(listMatch[1]) ? listMatch[1].trim() : ">"}</span><span>{formatLine(listMatch[2])}</span></div>);
    } else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(<span key={key++} className="block">{formatLine(line)}</span>);
    }
  }
  return <>{elements}</>;
}

export default function AdminAgentDock({ userName }: { userName: string }) {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dockExpanded, setDockExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [conversations, isTyping, activeAgent]);

  const agent = AGENTS.find((a) => a.id === activeAgent);
  const messages = activeAgent ? (conversations[activeAgent] || []) : [];

  const getSessionId = (agentId: string) => {
    if (typeof window === "undefined") return "";
    const key = `tm_dock_${agentId}`;
    let id = sessionStorage.getItem(key);
    if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(key, id); }
    return id;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping || !agent || !activeAgent) return;

    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setConversations((prev) => ({ ...prev, [activeAgent]: updated }));
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(agent.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: updated.map((m) => ({ role: m.role, content: m.content })),
          sessionId: getSessionId(activeAgent),
          ...(agent.extraBody || {}),
        }),
      });

      if (!res.ok) throw new Error("Agent unavailable");
      const data = await res.json();
      setConversations((prev) => ({
        ...prev,
        [activeAgent]: [...(prev[activeAgent] || []), userMsg, { role: "assistant", content: data.content }],
      }));
    } catch {
      setConversations((prev) => ({
        ...prev,
        [activeAgent]: [...(prev[activeAgent] || []), userMsg, { role: "assistant", content: "Sorry, even niet bereikbaar. Probeer het zo nog eens." }],
      }));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Dock toggle */}
      <button
        onClick={() => setDockExpanded(!dockExpanded)}
        className="fixed bottom-28 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:scale-105 transition-all md:bottom-6 md:right-6"
      >
        {dockExpanded ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <div className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-amber-500 bg-yellow-300" />
          </>
        )}
      </button>

      {/* Agent dock — vertical bar */}
      {dockExpanded && (
        <div className="fixed bottom-42 right-4 z-50 flex flex-col gap-2 md:bottom-20 md:right-6">
          {AGENTS.map((a) => {
            const isActive = activeAgent === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setActiveAgent(isActive ? null : a.id)}
                className={`group relative flex h-11 w-11 items-center justify-center rounded-xl shadow-md transition-all ${
                  isActive
                    ? `bg-gradient-to-br ${a.gradient} text-white scale-110 ring-2 ring-white/50`
                    : `bg-gradient-to-br ${a.gradient} text-white/80 hover:scale-105 hover:text-white`
                }`}
                title={a.name}
              >
                <DockIcon type={a.icon} size={16} />
                {/* Tooltip */}
                <div className="absolute right-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center">
                  <div className="rounded-lg bg-gray-900 px-2.5 py-1.5 text-[11px] font-medium text-white whitespace-nowrap shadow-lg">
                    {a.name}
                    <span className={`ml-1.5 rounded px-1 py-0.5 text-[9px] font-bold ${a.id === "admin" ? "bg-amber-500/30" : a.id === "enterprise" ? "bg-purple-500/30" : a.id === "pro" ? "bg-amber-500/30" : a.id === "free" ? "bg-blue-500/30" : a.id === "reseller" ? "bg-green-500/30" : a.id === "developer" ? "bg-cyan-500/30" : a.id === "advertising" ? "bg-yellow-500/30" : "bg-emerald-500/30"}`}>
                      {a.badge}
                    </span>
                  </div>
                  <div className="h-2 w-2 bg-gray-900 rotate-45 -ml-1" />
                </div>
                {/* Active dot */}
                {(conversations[a.id]?.length || 0) > 0 && !isActive && (
                  <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-white border-2 border-current" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Chat panel */}
      {activeAgent && agent && dockExpanded && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-50 md:inset-auto md:bottom-20 md:right-20">
          <div className={`absolute -inset-1.5 rounded-3xl bg-gradient-to-r ${agent.glowFrom} via-transparent ${agent.glowTo} blur-xl animate-pulse hidden md:block`} />
          <div className={`relative flex h-full w-full md:h-[520px] md:w-[380px] flex-col overflow-hidden md:rounded-2xl border ${agent.borderColor} bg-white shadow-2xl`}>
            {/* Header */}
            <div className={`flex items-center gap-3 bg-gradient-to-r ${agent.gradient} px-4 py-3`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/20">
                <DockIcon type={agent.icon} size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{agent.name}</p>
                  <span className={`rounded-full ${agent.badgeBg} px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${agent.badgeText} ring-1 ring-white/20`}>
                    {agent.badge}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${agent.dotColor} animate-pulse`} />
                  <p className="text-[11px] text-white/60">online</p>
                </div>
              </div>
              <button onClick={() => setActiveAgent(null)} className="hidden md:flex rounded-lg p-1 hover:bg-white/10 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                </svg>
              </button>
              <button
                onClick={() => setActiveAgent(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 md:hidden"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
              {messages.length === 0 && (
                <div className={`rounded-2xl rounded-bl-md ${agent.botBubbleBg} border ${agent.botBubbleBorder} px-3.5 py-2.5 text-[13px] leading-relaxed text-gray-700`}>
                  {agent.greeting}
                </div>
              )}
              {messages.length > 0 && (
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[85%]">
                        <div className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                          msg.role === "user"
                            ? `${agent.userBubble} rounded-br-md`
                            : `${agent.botBubbleBg} border ${agent.botBubbleBorder} text-gray-700 rounded-bl-md`
                        }`}>
                          {msg.role === "assistant" ? <ChatMarkdown text={msg.content} accentText={agent.accentText} /> : msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className={`flex items-center gap-1 rounded-2xl rounded-bl-md ${agent.botBubbleBg} border ${agent.botBubbleBorder} px-3.5 py-2.5`}>
                        <span className={`h-1 w-1 animate-bounce rounded-full ${agent.dotColor}`} style={{ animationDelay: "0ms" }} />
                        <span className={`h-1 w-1 animate-bounce rounded-full ${agent.dotColor}`} style={{ animationDelay: "150ms" }} />
                        <span className={`h-1 w-1 animate-bounce rounded-full ${agent.dotColor}`} style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            <div className={`border-t ${agent.botBubbleBorder} px-3 py-2.5`}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder={agent.placeholder}
                  className="flex-1 bg-transparent py-1.5 text-[13px] text-gray-700 outline-none placeholder:text-gray-400"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${agent.sendBg} text-white transition-all disabled:opacity-30`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
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
