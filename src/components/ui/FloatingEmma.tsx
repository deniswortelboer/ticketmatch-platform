"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string;
  suggestions?: { name: string; price: string; tag: string }[];
};

const AGENT_URL = "/api/agent";

type PageContext = {
  greeting: string;
  topics: { label: string; icon: string }[];
};

function getPageContext(pathname: string): PageContext {
  // Insights article detail
  if (pathname.startsWith("/insights/") && pathname !== "/insights") {
    return {
      greeting: "Hi! I'm Emma. I can answer questions about this article, suggest related topics, or help you find experiences mentioned here. I speak every language!",
      topics: [
        { label: "Summarize this article for me", icon: "📝" },
        { label: "What related insights do you have?", icon: "🔗" },
        { label: "How does this apply to my business?", icon: "💼" },
        { label: "Show me relevant experiences", icon: "🎯" },
      ],
    };
  }

  switch (pathname) {
    case "/insights":
      return {
        greeting: "Hi! I'm Emma. Welcome to our Knowledge Bank! I can help you find insights on market trends, pricing strategies, city guides, and more. What topic interests you?",
        topics: [
          { label: "What are the top trends in 2026?", icon: "📈" },
          { label: "Best pricing strategies for groups?", icon: "💰" },
          { label: "Which cities are trending?", icon: "🌍" },
          { label: "How can AI help tour operators?", icon: "🤖" },
        ],
      };

    case "/faq":
      return {
        greeting: "Hi! I'm Emma. I see you're on our FAQ page — I can answer any question about TicketMatch instantly, or dive deeper into topics the FAQ doesn't cover!",
        topics: [
          { label: "How does TicketMatch work?", icon: "⚙️" },
          { label: "What are the membership plans?", icon: "💳" },
          { label: "How do QR vouchers work?", icon: "📱" },
          { label: "What's the reseller program?", icon: "🤝" },
        ],
      };

    case "/become-reseller":
      return {
        greeting: "Hi! I'm Emma. Interested in our reseller program? I can explain how commissions work, what support you get, and how to get started. Ask me anything!",
        topics: [
          { label: "How does the commission work?", icon: "💰" },
          { label: "What tools do resellers get?", icon: "🛠️" },
          { label: "How do I manage my clients?", icon: "👥" },
          { label: "Can I white-label TicketMatch?", icon: "🏷️" },
        ],
      };

    case "/partners":
      return {
        greeting: "Hi! I'm Emma. Want to list your venue or experiences on TicketMatch? I can explain how our supplier network works and what the benefits are!",
        topics: [
          { label: "How do I list my venue?", icon: "🏛️" },
          { label: "What supplier APIs do you use?", icon: "🔌" },
          { label: "What are the benefits for suppliers?", icon: "📊" },
          { label: "How does B2B distribution work?", icon: "🌐" },
        ],
      };

    case "/partners/tech":
      return {
        greeting: "Hi! I'm Emma. Interested in our technology stack? I can explain our API integrations, data infrastructure, and how we connect 10 supplier APIs into one platform!",
        topics: [
          { label: "Which APIs do you integrate?", icon: "🔌" },
          { label: "How does real-time data work?", icon: "⚡" },
          { label: "Tell me about the AI agents", icon: "🤖" },
          { label: "How does the busyness data work?", icon: "📊" },
        ],
      };

    case "/partners/advertise":
      return {
        greeting: "Hi! I'm Emma. Looking to advertise on TicketMatch? I can explain our advertising options and how to reach B2B travel professionals directly!",
        topics: [
          { label: "What ad formats are available?", icon: "📢" },
          { label: "Who is your target audience?", icon: "🎯" },
          { label: "What's the reach of the platform?", icon: "📈" },
          { label: "How do sponsored listings work?", icon: "⭐" },
        ],
      };

    case "/developers":
      return {
        greeting: "Hi! I'm Emma. Welcome to our developer hub! I can help you understand our API, webhooks, and integration options. What would you like to build?",
        topics: [
          { label: "How does the API work?", icon: "🔧" },
          { label: "What endpoints are available?", icon: "📡" },
          { label: "Do you have webhooks?", icon: "🪝" },
          { label: "Show me code examples", icon: "💻" },
        ],
      };

    case "/auth/register":
      return {
        greeting: "Hi! I'm Emma. Great that you're signing up! I can answer any last questions about plans, features, or how TicketMatch works before you join.",
        topics: [
          { label: "What's included in the free plan?", icon: "🆓" },
          { label: "How quickly can I start booking?", icon: "⚡" },
          { label: "What experiences are available?", icon: "🎭" },
          { label: "Is there a trial period?", icon: "📅" },
        ],
      };

    case "/auth/login":
      return {
        greeting: "Hi! I'm Emma. Need help logging in, or have questions about your account? I'm here to help!",
        topics: [
          { label: "I forgot my password", icon: "🔑" },
          { label: "How do I create an account?", icon: "📝" },
          { label: "What can I do after logging in?", icon: "🖥️" },
          { label: "Tell me about the dashboard", icon: "📊" },
        ],
      };

    case "/privacy":
      return {
        greeting: "Hi! I'm Emma. Have questions about how TicketMatch handles your data? I can explain our privacy practices in simple terms!",
        topics: [
          { label: "How is my data protected?", icon: "🔒" },
          { label: "Do you share data with third parties?", icon: "🤝" },
          { label: "What data do you collect?", icon: "📋" },
          { label: "How do I delete my account?", icon: "🗑️" },
        ],
      };

    case "/terms":
      return {
        greeting: "Hi! I'm Emma. Have questions about our terms? I can explain the key points in plain language!",
        topics: [
          { label: "What's the cancellation policy?", icon: "↩️" },
          { label: "How do refunds work?", icon: "💸" },
          { label: "What are my obligations?", icon: "📜" },
          { label: "How does billing work?", icon: "💳" },
        ],
      };

    case "/blog":
      return {
        greeting: "Hi! I'm Emma. Enjoying our blog? I can help you find specific topics, or answer questions about anything you've read here!",
        topics: [
          { label: "What topics do you cover?", icon: "📚" },
          { label: "Tell me about group travel trends", icon: "📈" },
          { label: "Best cities for tour operators?", icon: "🌍" },
          { label: "How does TicketMatch help?", icon: "🚀" },
        ],
      };

    case "/":
      return {
        greeting: "Hi! I'm Emma. I see you're exploring TicketMatch — ask me anything about our platform, experiences, cities, or how we can help your business!",
        topics: [
          { label: "Best venues for groups?", icon: "🏛️" },
          { label: "Plan a full-day itinerary", icon: "📋" },
          { label: "How does TicketMatch work?", icon: "🤝" },
          { label: "What's trending?", icon: "🔥" },
        ],
      };

    default:
      // Blog article or any other page
      if (pathname.startsWith("/blog/")) {
        return {
          greeting: "Hi! I'm Emma. Want to discuss this article, or explore related topics? I'm your travel intelligence assistant!",
          topics: [
            { label: "Tell me more about this topic", icon: "📝" },
            { label: "What experiences are related?", icon: "🎯" },
            { label: "Show me similar articles", icon: "🔗" },
            { label: "How can TicketMatch help?", icon: "🚀" },
          ],
        };
      }
      return {
        greeting: "Hi! I'm Emma, your AI travel assistant. Ask me anything about group bookings, venues, pricing or how TicketMatch works. I speak every language!",
        topics: [
          { label: "Best venues for groups?", icon: "🏛️" },
          { label: "Plan a full-day itinerary", icon: "📋" },
          { label: "How does TicketMatch work?", icon: "🤝" },
          { label: "What's trending?", icon: "🔥" },
        ],
      };
  }
}

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
  const fixed = text.replace(/\]\s*\n\s*\(/g, "](");
  const lines = fixed.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const formatLine = (s: string) => {
      const parts: React.ReactNode[] = [];
      let last = 0;
      const re =
        /\*\*(.+?)\*\*|\[(.+?)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)|\[(https?:\/\/[^\]]+)\]|(https?:\/\/[^\s,)]+)/g;
      let m;
      while ((m = re.exec(s)) !== null) {
        if (m.index > last) parts.push(s.slice(last, m.index));
        if (m[1]) {
          parts.push(
            <strong key={`b${m.index}`} className="font-semibold">
              {m[1]}
            </strong>
          );
        } else if (m[2] && m[3]) {
          parts.push(
            <a
              key={`l${m.index}`}
              href={m[3]}
              className="font-medium text-accent underline underline-offset-2 hover:text-accent/80"
              target={m[3].startsWith("/") ? undefined : "_blank"}
              rel={m[3].startsWith("/") ? undefined : "noopener noreferrer"}
            >
              {m[2]}
            </a>
          );
        } else if (m[4]) {
          parts.push(
            <a
              key={`u${m.index}`}
              href={m[4]}
              className="font-medium text-accent underline underline-offset-2 hover:text-accent/80"
              target="_blank"
              rel="noopener noreferrer"
            >
              {m[4].replace(/^https?:\/\//, "")}
            </a>
          );
        } else if (m[5]) {
          parts.push(
            <a
              key={`u${m.index}`}
              href={m[5]}
              className="font-medium text-accent underline underline-offset-2 hover:text-accent/80"
              target="_blank"
              rel="noopener noreferrer"
            >
              {m[5].replace(/^https?:\/\//, "")}
            </a>
          );
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
          <span className="text-accent/60 font-medium shrink-0">
            {isNumbered ? listMatch[1].trim() : "›"}
          </span>
          <span>{formatLine(listMatch[2])}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
    } else {
      elements.push(
        <span key={key++} className="block">
          {formatLine(line)}
        </span>
      );
    }
  }

  return <>{elements}</>;
}

function formatLiveClock(d: Date) {
  const days = ["zo", "ma", "di", "wo", "do", "vr", "za"];
  const months = [
    "jan", "feb", "mrt", "apr", "mei", "jun",
    "jul", "aug", "sep", "okt", "nov", "dec",
  ];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${String(
    d.getHours()
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* ═══════ Emma Avatar Components — Realistic Blonde Assistant ═══════ */

function EmmaAvatarLarge() {
  return (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="eHairL" x1="10" y1="4" x2="38" y2="24"><stop offset="0%" stopColor="#F5D680" /><stop offset="50%" stopColor="#E8C255" /><stop offset="100%" stopColor="#D4A843" /></linearGradient>
        <linearGradient id="eSkinL" x1="16" y1="14" x2="32" y2="40"><stop offset="0%" stopColor="#FDEBD0" /><stop offset="100%" stopColor="#F5CBA7" /></linearGradient>
        <radialGradient id="eBlushL" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#F5A6C0" stopOpacity="0.5" /><stop offset="100%" stopColor="#F5A6C0" stopOpacity="0" /></radialGradient>
      </defs>
      {/* Background circle */}
      <circle cx="24" cy="24" r="23" fill="#F0F4FF" />
      {/* Hair back — flowing blonde */}
      <ellipse cx="24" cy="20" rx="17" ry="16" fill="url(#eHairL)" />
      <path d="M7 22C7 22 8 36 14 40C14 40 10 28 10 22Z" fill="url(#eHairL)" opacity="0.8" />
      <path d="M41 22C41 22 40 36 34 40C34 40 38 28 38 22Z" fill="url(#eHairL)" opacity="0.8" />
      {/* Neck */}
      <rect x="20" y="34" width="8" height="5" rx="3" fill="url(#eSkinL)" />
      {/* Shoulders / top hint */}
      <path d="M14 42C14 39 18 37 24 37C30 37 34 39 34 42V48H14V42Z" fill="#4F76F6" />
      <path d="M18 38.5C18 38.5 21 37 24 37C27 37 30 38.5 30 38.5" stroke="white" strokeWidth="0.6" strokeLinecap="round" opacity="0.3" />
      {/* Face */}
      <ellipse cx="24" cy="24" rx="12" ry="13" fill="url(#eSkinL)" />
      {/* Hair front — bangs */}
      <path d="M12 18C12 10 16 6 24 5.5C32 6 36 10 36 18C36 18 34 14 30 13C28 12.5 26 14 24 14C22 14 20 12.5 18 13C14 14 12 18 12 18Z" fill="url(#eHairL)" />
      {/* Side hair strands */}
      <path d="M12 18C11 22 10 28 12 32" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M36 18C37 22 38 28 36 32" stroke="#D4A843" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      {/* Eyebrows */}
      <path d="M17 18.5C17.5 17.5 19 17 20.5 17.5" stroke="#B8923A" strokeWidth="0.9" strokeLinecap="round" fill="none" />
      <path d="M31 18.5C30.5 17.5 29 17 27.5 17.5" stroke="#B8923A" strokeWidth="0.9" strokeLinecap="round" fill="none" />
      {/* Eyes — expressive */}
      <ellipse cx="19.5" cy="21.5" rx="2.3" ry="2.5" fill="white" />
      <ellipse cx="28.5" cy="21.5" rx="2.3" ry="2.5" fill="white" />
      <circle cx="19.5" cy="21.8" r="1.5" fill="#4A7DC7" />
      <circle cx="28.5" cy="21.8" r="1.5" fill="#4A7DC7" />
      <circle cx="19.5" cy="21.8" r="0.7" fill="#1e293b" />
      <circle cx="28.5" cy="21.8" r="0.7" fill="#1e293b" />
      {/* Eye sparkle */}
      <circle cx="20.2" cy="20.8" r="0.6" fill="white" />
      <circle cx="29.2" cy="20.8" r="0.6" fill="white" />
      <circle cx="18.8" cy="22.2" r="0.3" fill="white" opacity="0.6" />
      <circle cx="27.8" cy="22.2" r="0.3" fill="white" opacity="0.6" />
      {/* Eyelashes */}
      <path d="M17 20C17 20 17.5 19 18 19" stroke="#1e293b" strokeWidth="0.5" strokeLinecap="round" />
      <path d="M31 20C31 20 30.5 19 30 19" stroke="#1e293b" strokeWidth="0.5" strokeLinecap="round" />
      {/* Nose — subtle */}
      <path d="M23.5 25C23.5 25 24 26.5 24.5 25" stroke="#D4A87A" strokeWidth="0.7" strokeLinecap="round" fill="none" />
      {/* Lips — friendly smile */}
      <path d="M20 28.5C20 28.5 22 31 24 31C26 31 28 28.5 28 28.5" stroke="#E07A7A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M21 28.8C21 28.8 22.5 30 24 30C25.5 30 27 28.8 27 28.8" fill="#E88E8E" opacity="0.6" />
      {/* Blush */}
      <circle cx="15.5" cy="26.5" r="2.5" fill="url(#eBlushL)" />
      <circle cx="32.5" cy="26.5" r="2.5" fill="url(#eBlushL)" />
    </svg>
  );
}

function EmmaAvatarSmall() {
  return (
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" className="rounded-full">
      <defs>
        <linearGradient id="eHairS" x1="10" y1="4" x2="38" y2="24"><stop offset="0%" stopColor="#F5D680" /><stop offset="50%" stopColor="#E8C255" /><stop offset="100%" stopColor="#D4A843" /></linearGradient>
        <linearGradient id="eSkinS" x1="16" y1="14" x2="32" y2="40"><stop offset="0%" stopColor="#FDEBD0" /><stop offset="100%" stopColor="#F5CBA7" /></linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="#F0F4FF" />
      <ellipse cx="24" cy="20" rx="17" ry="16" fill="url(#eHairS)" />
      <path d="M7 22C7 22 8 36 14 40C14 40 10 28 10 22Z" fill="url(#eHairS)" opacity="0.7" />
      <path d="M41 22C41 22 40 36 34 40C34 40 38 28 38 22Z" fill="url(#eHairS)" opacity="0.7" />
      <rect x="20" y="34" width="8" height="5" rx="3" fill="url(#eSkinS)" />
      <path d="M14 42C14 39 18 37 24 37C30 37 34 39 34 42V48H14V42Z" fill="#4F76F6" />
      <ellipse cx="24" cy="24" rx="12" ry="13" fill="url(#eSkinS)" />
      <path d="M12 18C12 10 16 6 24 5.5C32 6 36 10 36 18C36 18 34 14 30 13C28 12.5 26 14 24 14C22 14 20 12.5 18 13C14 14 12 18 12 18Z" fill="url(#eHairS)" />
      <path d="M17 18.5C17.5 17.5 19 17 20.5 17.5" stroke="#B8923A" strokeWidth="0.9" strokeLinecap="round" fill="none" />
      <path d="M31 18.5C30.5 17.5 29 17 27.5 17.5" stroke="#B8923A" strokeWidth="0.9" strokeLinecap="round" fill="none" />
      <ellipse cx="19.5" cy="21.5" rx="2.3" ry="2.5" fill="white" />
      <ellipse cx="28.5" cy="21.5" rx="2.3" ry="2.5" fill="white" />
      <circle cx="19.5" cy="21.8" r="1.5" fill="#4A7DC7" />
      <circle cx="28.5" cy="21.8" r="1.5" fill="#4A7DC7" />
      <circle cx="19.5" cy="21.8" r="0.7" fill="#1e293b" />
      <circle cx="28.5" cy="21.8" r="0.7" fill="#1e293b" />
      <circle cx="20.2" cy="20.8" r="0.6" fill="white" />
      <circle cx="29.2" cy="20.8" r="0.6" fill="white" />
      <path d="M23.5 25C23.5 25 24 26.5 24.5 25" stroke="#D4A87A" strokeWidth="0.7" strokeLinecap="round" fill="none" />
      <path d="M20 28.5C20 28.5 22 31 24 31C26 31 28 28.5 28 28.5" stroke="#E07A7A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M21 28.8C21 28.8 22.5 30 24 30C25.5 30 27 28.8 27 28.8" fill="#E88E8E" opacity="0.5" />
      <circle cx="15.5" cy="26.5" r="2.5" fill="#F5A6C0" fillOpacity="0.35" />
      <circle cx="32.5" cy="26.5" r="2.5" fill="#F5A6C0" fillOpacity="0.35" />
    </svg>
  );
}

function EmmaAvatarButton() {
  return (
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="eHairB" x1="10" y1="4" x2="38" y2="24"><stop offset="0%" stopColor="#F5D680" /><stop offset="50%" stopColor="#E8C255" /><stop offset="100%" stopColor="#D4A843" /></linearGradient>
      </defs>
      {/* Simplified but recognizable blonde Emma for the button */}
      <circle cx="24" cy="24" r="22" fill="white" fillOpacity="0.15" />
      {/* Hair */}
      <ellipse cx="24" cy="19" rx="15" ry="14" fill="url(#eHairB)" opacity="0.9" />
      <path d="M9 21C9 21 10 33 15 37" stroke="url(#eHairB)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M39 21C39 21 38 33 33 37" stroke="url(#eHairB)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* Face */}
      <ellipse cx="24" cy="24" rx="11" ry="12" fill="#FDEBD0" fillOpacity="0.9" />
      {/* Bangs */}
      <path d="M13 17C13 10 17 7 24 6.5C31 7 35 10 35 17C35 17 33 13.5 29 13C27 12.5 25 14 24 14C23 14 21 12.5 19 13C15 13.5 13 17 13 17Z" fill="url(#eHairB)" />
      {/* Eyes */}
      <ellipse cx="19.5" cy="21.5" rx="2" ry="2.2" fill="white" />
      <ellipse cx="28.5" cy="21.5" rx="2" ry="2.2" fill="white" />
      <circle cx="19.5" cy="22" r="1.3" fill="#4A7DC7" />
      <circle cx="28.5" cy="22" r="1.3" fill="#4A7DC7" />
      <circle cx="19.5" cy="22" r="0.6" fill="#1e293b" />
      <circle cx="28.5" cy="22" r="0.6" fill="#1e293b" />
      <circle cx="20.1" cy="21" r="0.5" fill="white" />
      <circle cx="29.1" cy="21" r="0.5" fill="white" />
      {/* Smile */}
      <path d="M20.5 28C20.5 28 22 30 24 30C26 30 27.5 28 27.5 28" stroke="#E07A7A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function FloatingEmma() {
  const pathname = usePathname();
  const pageContext = getPageContext(pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: pageContext.greeting },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [clock, setClock] = useState(() => formatLiveClock(new Date()));
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isHomepage = pathname === "/";
  // Only hide on dashboard pages
  const hidden = pathname.startsWith("/dashboard");

  useEffect(() => {
    const timer = setInterval(
      () => setClock(formatLiveClock(new Date())),
      30000
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // On homepage: show floating button only after scrolling past the hero (where inline Emma lives)
  useEffect(() => {
    if (!isHomepage) {
      setScrolledPastHero(true);
      return;
    }
    const onScroll = () => {
      setScrolledPastHero(window.scrollY > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomepage]);

  // Reset messages when navigating to a different page
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      prevPathRef.current = pathname;
      const ctx = getPageContext(pathname);
      setMessages([{ role: "assistant", content: ctx.greeting }]);
      setInput("");
    }
  }, [pathname]);

  // Show notification dot after 8 seconds if never opened
  useEffect(() => {
    if (hidden || hasBeenOpened) return;
    const timer = setTimeout(() => setHasNewMessage(true), 8000);
    return () => clearTimeout(timer);
  }, [hidden, hasBeenOpened]);

  // When Emma opens on homepage, pick up any HeroChat conversation
  useEffect(() => {
    if (!isOpen || !isHomepage) return;
    try {
      const saved = sessionStorage.getItem("tm_hero_messages");
      if (saved) {
        const heroMsgs = JSON.parse(saved) as Message[];
        if (heroMsgs.length > 0) {
          // Merge: keep greeting + add hero conversation
          setMessages([
            { role: "assistant", content: pageContext.greeting },
            ...heroMsgs,
          ]);
          sessionStorage.removeItem("tm_hero_messages"); // only inject once
        }
      }
    } catch {}
  }, [isOpen, isHomepage, pageContext.greeting]);

  // Listen for custom event from MobileBottomBar to open Emma
  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
      setHasNewMessage(false);
      setHasBeenOpened(true);
    };
    window.addEventListener("open-emma", handler);
    return () => window.removeEventListener("open-emma", handler);
  }, []);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
      setHasBeenOpened(true);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const history = updatedMessages
        .slice(1)
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
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content,
          suggestions:
            data.suggestions?.length > 0 ? data.suggestions : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm temporarily unavailable. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const hasUserMessages = messages.length > 1;

  if (hidden) return null;

  // On homepage, hide until scrolled past hero
  const showButton = scrolledPastHero;

  return (
    <>
      {/* ══ Chat Window ══ */}
      <div
        className={`fixed bottom-24 right-5 z-[9998] w-[390px] max-w-[calc(100vw-2.5rem)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen && showButton
            ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
            : "translate-y-6 opacity-0 scale-[0.92] pointer-events-none"
        }`}
      >
        {/* Animated outer glow */}
        <div className="absolute -inset-3 rounded-[32px] bg-gradient-to-br from-accent/30 via-blue-400/20 to-purple-500/25 blur-2xl opacity-70 animate-[emma-glow_4s_ease-in-out_infinite]" />

        <div className="relative flex h-[540px] flex-col overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-white dark:bg-[#0f1729] shadow-2xl shadow-black/20">

          {/* ── Premium Header ── */}
          <div className="relative overflow-hidden px-4 py-4">
            {/* Header gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent via-blue-600 to-indigo-700" />
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            {/* Bottom glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-12 w-3/4 bg-white/10 blur-2xl rounded-full" />

            <div className="relative flex items-center gap-3">
              {/* Emma Avatar — SVG face */}
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg shadow-black/10 border border-white/20">
                  <EmmaAvatarLarge />
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-sm shadow-emerald-400/50">
                  <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-bold text-white tracking-tight">Emma</p>
                  <span className="rounded-full bg-white/15 backdrop-blur-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/80">AI</span>
                </div>
                <p className="text-[11px] text-white/50 font-medium mt-0.5">Travel Intelligence Agent · {clock}</p>
              </div>

              {/* Close button */}
              <button
                onClick={toggleOpen}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm text-white/70 transition-all hover:bg-white/20 hover:text-white hover:scale-105"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 3L3 9M3 3l6 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3 bg-gradient-to-b from-gray-50/50 to-white dark:from-[#0f1729] dark:to-[#131d33]"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                } animate-[emma-msg_0.3s_ease-out]`}
              >
                {/* Emma avatar for assistant messages */}
                {msg.role === "assistant" && (
                  <div className="shrink-0 mr-2 mt-1"><EmmaAvatarSmall /></div>
                )}
                <div className={msg.role === "user" ? "max-w-[80%]" : "max-w-[82%]"}>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-accent to-blue-600 text-white rounded-br-sm shadow-md shadow-accent/15"
                        : "bg-white dark:bg-white/8 text-gray-700 dark:text-gray-200 rounded-bl-sm shadow-sm border border-gray-100 dark:border-white/8"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <ChatMarkdown text={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.suggestions && (
                    <div className="mt-2 space-y-1.5">
                      {msg.suggestions.map((s, j) => (
                        <div
                          key={j}
                          className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-white/8 bg-white dark:bg-white/5 px-3 py-2.5 transition-all hover:border-accent/30 hover:shadow-md hover:shadow-accent/5 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-gradient-to-r from-accent/10 to-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                              {s.tag}
                            </span>
                            <span className="text-[12px] font-medium text-gray-700 dark:text-gray-200">
                              {s.name}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-accent">
                            {s.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-[emma-msg_0.3s_ease-out]">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-indigo-500/20 mr-2 mt-1">
                  <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="13" fill="#6366F1" fillOpacity="0.15" />
                    <circle cx="12" cy="15" r="1.2" fill="#6366F1" />
                    <circle cx="20" cy="15" r="1.2" fill="#6366F1" />
                    <path d="M12 19.5C12 19.5 13.5 21 16 21C18.5 21 20 19.5 20 19.5" stroke="#6366F1" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white dark:bg-white/8 border border-gray-100 dark:border-white/8 px-4 py-3 shadow-sm">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/50" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/50" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent/50" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {/* Quick topics — context-aware per page */}
            {!hasUserMessages && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                {pageContext.topics.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => sendMessage(t.label)}
                    className="group flex items-center gap-2.5 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-3 text-left transition-all hover:border-accent/25 hover:bg-gradient-to-r hover:from-accent/5 hover:to-blue-500/5 hover:shadow-md hover:shadow-accent/5 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">{t.icon}</span>
                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300 leading-tight group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Input ── */}
          <div className="border-t border-gray-100 dark:border-white/8 bg-white dark:bg-[#0f1729] px-4 py-3">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3.5 py-1.5 transition-all focus-within:border-accent/30 focus-within:ring-2 focus-within:ring-accent/10 focus-within:bg-white dark:focus-within:bg-white/8">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask Emma anything..."
                className="flex-1 bg-transparent py-1.5 text-[13px] text-gray-800 dark:text-gray-100 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-blue-600 text-white transition-all hover:shadow-lg hover:shadow-accent/25 hover:scale-105 active:scale-95 disabled:opacity-25 disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-center mt-2">
              <span className="text-[9px] text-gray-300 dark:text-gray-600">Powered by TicketMatch.ai</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Floating Button ══ */}
      <button
        onClick={toggleOpen}
        className={`fixed bottom-5 right-5 z-[9999] group transition-all duration-500 ${
          showButton
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-4 opacity-0 scale-75 pointer-events-none"
        }`}
        aria-label="Chat with Emma"
      >
        {/* Animated glow rings */}
        <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-accent via-blue-500 to-indigo-500 opacity-0 blur-xl transition-all duration-700 group-hover:opacity-50" />
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-accent to-indigo-600 opacity-25 animate-[emma-pulse_3s_ease-in-out_infinite]" />

        {/* Button with Emma face */}
        <div
          className={`relative flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gradient-to-br from-accent via-blue-600 to-indigo-700 shadow-xl shadow-accent/30 transition-all duration-500 ${
            isOpen ? "scale-90 rotate-180" : "scale-100 rotate-0"
          } group-hover:scale-110 group-hover:shadow-accent/50 group-hover:shadow-2xl`}
        >
          {/* Chat → Close icon transition */}
          <div
            className={`absolute transition-all duration-500 ${
              isOpen
                ? "rotate-180 scale-0 opacity-0"
                : "rotate-0 scale-100 opacity-100"
            }`}
          >
            <EmmaAvatarButton />
          </div>
          <div
            className={`absolute transition-all duration-500 ${
              isOpen
                ? "rotate-0 scale-100 opacity-100"
                : "rotate-180 scale-0 opacity-0"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 4L4 12M4 4l8 8" />
            </svg>
          </div>
        </div>

        {/* Notification badge */}
        {hasNewMessage && !isOpen && (
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
            <div className="absolute h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
            <div className="relative h-4 w-4 rounded-full bg-gradient-to-br from-red-500 to-pink-500 border-2 border-white dark:border-[#0f1729] shadow-lg shadow-red-500/30" />
          </div>
        )}

        {/* Tooltip */}
        <div
          className={`absolute bottom-full right-0 mb-4 whitespace-nowrap rounded-2xl bg-gradient-to-r from-[#0f1729] to-[#1a2744] px-5 py-3 text-[12px] font-medium text-white shadow-2xl shadow-black/20 transition-all duration-500 ${
            isOpen || hasBeenOpened
              ? "translate-y-2 opacity-0 pointer-events-none scale-95"
              : "translate-y-0 opacity-100 scale-100"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 overflow-hidden">
              <EmmaAvatarSmall />
            </div>
            <span>Hi! I&apos;m Emma. Need help?</span>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          {/* Tooltip arrow */}
          <div className="absolute -bottom-1.5 right-7 h-3 w-3 rotate-45 bg-[#1a2744]" />
        </div>
      </button>

      {/* ══ Keyframe styles ══ */}
      <style jsx global>{`
        @keyframes emma-pulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.2); opacity: 0.1; }
        }
        @keyframes emma-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        @keyframes emma-msg {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
