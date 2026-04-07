"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CURRENCIES, type CurrencyInfo, formatFromEUR, getCurrency } from "@/lib/currency";

// ---------------------------------------------------------------------------
// Tiny external store so every component using useCurrency() stays in sync
// ---------------------------------------------------------------------------
const STORAGE_KEY = "tm_currency";

let currentCode = "EUR";
const listeners = new Set<() => void>();

function getSnapshot(): string {
  return currentCode;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function setCode(code: string) {
  currentCode = code;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {}
  listeners.forEach((cb) => cb());
}

// Hydrate from localStorage on first load (client only)
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && CURRENCIES.some((c) => c.code === stored)) {
      currentCode = stored;
    }
  } catch {}
}

// ---------------------------------------------------------------------------
// Hook: useCurrency
// ---------------------------------------------------------------------------
export function useCurrency() {
  const code = useSyncExternalStore(subscribe, getSnapshot, () => "EUR");
  const currency = getCurrency(code);

  const format = useCallback(
    (amountInEUR: number) => formatFromEUR(amountInEUR, code),
    [code]
  );

  const setCurrency = useCallback((c: string) => setCode(c), []);

  return { currency, setCurrency, format } as const;
}

// ---------------------------------------------------------------------------
// Component: CurrencySelector
// ---------------------------------------------------------------------------
export default function CurrencySelector({ compact = false }: { compact?: boolean }) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = search
    ? CURRENCIES.filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.name.toLowerCase().includes(search.toLowerCase())
      )
    : CURRENCIES;

  const handleSelect = (c: CurrencyInfo) => {
    setCurrency(c.code);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-xl border border-border/60 bg-white text-sm font-medium transition-all hover:border-accent/30 hover:shadow-sm ${
          compact ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2"
        }`}
      >
        <span className="text-base leading-none">{currency.flag}</span>
        <span>{currency.code}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-border/60 bg-white shadow-xl shadow-black/10">
          {/* Search */}
          <div className="border-b border-border/40 p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search currency..."
              autoFocus
              className="w-full rounded-lg border border-border/40 bg-gray-50 px-3 py-2 text-sm outline-none placeholder:text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent/20"
            />
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.map((c) => (
              <button
                key={c.code}
                onClick={() => handleSelect(c)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  c.code === currency.code
                    ? "bg-accent/10 font-medium text-accent"
                    : "text-foreground hover:bg-gray-50"
                }`}
              >
                <span className="text-base leading-none">{c.flag}</span>
                <span className="font-medium">{c.code}</span>
                <span className="text-muted text-xs">{c.name}</span>
                {c.code === currency.code && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-auto text-accent"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-xs text-muted">No currencies found</p>
            )}
          </div>

          {/* Footer note */}
          <div className="border-t border-border/40 px-3 py-2">
            <p className="text-[10px] text-muted/60 text-center">
              Approximate rates. All invoices in EUR.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
