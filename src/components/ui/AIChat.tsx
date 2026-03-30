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
    content: "Hi, I'm Emma! Tell me about your group trip and I'll find the best experiences for you.",
  },
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

export default function AIChat({ fullscreen = false }: { fullscreen?: boolean }) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: "user", content: input };
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
          message: input,
          history: history.slice(0, -1),
          sessionId: getSessionId(),
        }),
      });

      if (!res.ok) throw new Error("Agent unavailable");

      const data = await res.json();

      const assistantMsg: Message = {
        role: "assistant",
        content: data.content,
        suggestions: data.suggestions?.length > 0 ? data.suggestions : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm temporarily unavailable. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`flex flex-col overflow-hidden ${
      fullscreen
        ? "h-full w-full bg-white"
        : "h-[380px] w-[340px] rounded-2xl border border-white/20 bg-white/95 shadow-2xl shadow-black/20 backdrop-blur-xl"
    }`}>
      {/* Header */}
      <div className={`flex items-center gap-2.5 border-b border-border/40 ${
        fullscreen ? "px-5 py-4 bg-gradient-to-r from-accent to-blue-700" : "px-4 py-3"
      }`}>
        <div className={`flex items-center justify-center rounded-lg ${
          fullscreen ? "h-9 w-9 bg-white/20" : "h-7 w-7 bg-gradient-to-br from-accent to-blue-700"
        }`}>
          <svg width={fullscreen ? "16" : "12"} height={fullscreen ? "16" : "12"} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="flex-1">
          <p className={`font-semibold ${fullscreen ? "text-sm text-white" : "text-xs"}`}>TicketMatch AI-Agent</p>
          {fullscreen && (
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-white/70">Your B2B travel assistant</p>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              <p className="text-[11px] text-emerald-200">Online</p>
            </div>
          )}
        </div>
        {!fullscreen && (
          <>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-emerald-600">Online</span>
          </>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className={`flex-1 space-y-3 overflow-y-auto ${fullscreen ? "px-5 py-4" : "px-4 py-3"}`}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={fullscreen ? "max-w-[85%]" : "max-w-[90%]"}>
              <div
                className={`rounded-2xl px-3.5 py-2.5 leading-relaxed ${fullscreen ? "text-[15px]" : "text-[13px]"} ${
                  msg.role === "user"
                    ? "bg-accent text-white rounded-br-md"
                    : "bg-gray-100 text-foreground rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>

              {msg.suggestions && (
                <div className="mt-2 space-y-1.5">
                  {msg.suggestions.map((s, j) => (
                    <div
                      key={j}
                      className="chat-msg flex items-center justify-between rounded-lg border border-border/50 bg-white px-3 py-2 transition-all hover:border-accent/30 hover:shadow-sm"
                      style={{ animationDelay: `${j * 0.1}s` }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">{s.tag}</span>
                        <span className="text-[12px] font-medium">{s.name}</span>
                      </div>
                      <span className="text-[12px] font-bold text-accent">{s.price}</span>
                    </div>
                  ))}
                  <button className="mt-1 w-full rounded-lg bg-accent py-2 text-[11px] font-semibold text-white transition-all hover:brightness-110">
                    Add all to itinerary
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-msg flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-gray-100 px-3.5 py-2.5">
              <span className="h-1 w-1 animate-bounce rounded-full bg-muted/50" style={{ animationDelay: "0ms" }} />
              <span className="h-1 w-1 animate-bounce rounded-full bg-muted/50" style={{ animationDelay: "150ms" }} />
              <span className="h-1 w-1 animate-bounce rounded-full bg-muted/50" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`border-t border-border/40 ${fullscreen ? "px-4 py-3 pb-[env(safe-area-inset-bottom,12px)]" : "px-3 py-2.5"}`}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your group trip..."
            className={`flex-1 bg-transparent outline-none placeholder:text-muted/40 ${fullscreen ? "py-2 text-[15px]" : "py-1 text-[13px]"}`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`flex shrink-0 items-center justify-center rounded-lg bg-accent text-white transition-all hover:brightness-110 disabled:opacity-30 ${fullscreen ? "h-10 w-10" : "h-7 w-7"}`}
          >
            <svg width={fullscreen ? "16" : "12"} height={fullscreen ? "16" : "12"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
