"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  suggestions?: { name: string; price: string; tag: string }[];
};

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content:
      "Hi! I'm the TicketMatch AI assistant. Tell me about your group trip and I'll recommend the best experiences.",
  },
];

const DEMO_RESPONSES: Record<string, Message> = {
  default: {
    role: "assistant",
    content:
      "Great question! Based on popular group trips to Amsterdam, here are my top picks:",
    suggestions: [
      { name: "Moco Museum", price: "€17.95", tag: "Museum" },
      { name: "AMAZE Amsterdam", price: "€22.70", tag: "Attraction" },
      { name: "Fabrique des Lumières", price: "€16.20", tag: "Museum" },
    ],
  },
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, DEMO_RESPONSES.default]);
    }, 1500);
  };

  return (
    <div className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-border/80 bg-white shadow-xl shadow-black/[0.04]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-blue-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold">TicketMatch AI</p>
          <p className="text-xs text-muted">Your group travel assistant</p>
        </div>
        <div className="ml-auto flex h-2 w-2 rounded-full bg-emerald-400" />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : ""}`}>
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-foreground text-white rounded-br-md"
                    : "bg-gray-100 text-foreground rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>

              {/* Suggestion cards */}
              {msg.suggestions && (
                <div className="mt-3 space-y-2">
                  {msg.suggestions.map((s, j) => (
                    <div
                      key={j}
                      className="chat-msg flex items-center justify-between rounded-xl border border-border/60 bg-white px-4 py-3 transition-all hover:border-accent/30 hover:shadow-md hover:shadow-accent/5"
                      style={{ animationDelay: `${j * 0.1}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="rounded-lg bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                          {s.tag}
                        </span>
                        <span className="text-sm font-medium">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-accent">{s.price}</span>
                        <span className="text-xs text-muted">p.p.</span>
                      </div>
                    </div>
                  ))}
                  <button className="mt-1 w-full rounded-xl bg-foreground py-2.5 text-xs font-semibold text-white transition-all hover:bg-gray-800">
                    Add all to itinerary
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="chat-msg flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted/50" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted/50" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted/50" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="E.g. 25 people, 3 days in Amsterdam, mix of culture and fun..."
            className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-white transition-all hover:bg-gray-800 disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
