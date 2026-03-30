"use client";

import { useState } from "react";
import AIChat from "@/components/ui/AIChat";

export default function MobileBottomBar() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {/* Fullscreen chat modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-[9998] flex flex-col bg-white md:hidden animate-in fade-in duration-200">
          {/* Close button */}
          <div className="absolute right-3 top-3 z-10">
            <button
              onClick={() => setChatOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" /><path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
          <AIChat fullscreen />
        </div>
      )}

      {/* Bottom navigation bar — hidden when chat is open */}
      <nav className={`fixed bottom-0 left-0 right-0 z-[9999] flex items-end justify-around border-t border-white/10 bg-[#0a0f1e]/95 backdrop-blur-xl md:hidden ${chatOpen ? "hidden" : ""}`}
        style={{ padding: "6px 0 calc(6px + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Home */}
        <a href="#" className="flex flex-col items-center gap-0.5 px-3 py-1.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b8fa3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-[10px] text-[#8b8fa3]">Home</span>
        </a>

        {/* Catalog */}
        <a href="#categories" className="flex flex-col items-center gap-0.5 px-3 py-1.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b8fa3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className="text-[10px] text-[#8b8fa3]">Catalog</span>
        </a>

        {/* Center AI button */}
        <button
          onClick={() => setChatOpen(true)}
          className="relative -mt-7 flex flex-col items-center"
        >
          <div className="relative flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gradient-to-br from-accent to-blue-700 shadow-[0_4px_20px_rgba(37,99,235,0.5)]">
            {/* Pulse ring */}
            <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" style={{ animationDuration: "2s" }} />
            {/* Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="mt-0.5 text-[10px] font-semibold text-white">AI Agent</span>
        </button>

        {/* Cities */}
        <a href="#cities" className="flex flex-col items-center gap-0.5 px-3 py-1.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b8fa3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-[10px] text-[#8b8fa3]">Cities</span>
        </a>

        {/* Register */}
        <a href="/auth/register" className="flex flex-col items-center gap-0.5 px-3 py-1.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b8fa3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          <span className="text-[10px] text-[#8b8fa3]">Sign Up</span>
        </a>
      </nav>
    </>
  );
}
