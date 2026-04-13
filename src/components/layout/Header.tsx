"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const navLinks = [
    { href: "/#how-it-works", label: "How it Works" },
    { href: "/#categories", label: "Categories" },
    { href: "/cities", label: "Cities" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/insights", label: "Insights" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/become-reseller", label: "Resellers" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-surface/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-blue-800">
            <span className="text-sm font-bold text-white">TM</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Ticket<span className="text-accent">Match</span>
            <span className="text-muted">.ai</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: theme toggle + CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-surface text-muted transition-[color,border-color] hover:text-foreground hover:border-border"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <Link
            href="/auth/login"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-[filter,transform] hover:brightness-110 hover:scale-[1.02] shadow-lg shadow-accent/20"
          >
            Request Access
          </Link>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-surface text-muted"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              {mobileOpen ? (
                <path d="M5 5l10 10M15 5L5 15" />
              ) : (
                <>
                  <path d="M3 6h14" />
                  <path d="M3 10h14" />
                  <path d="M3 14h14" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/60 bg-surface px-6 pb-6 pt-4 md:hidden transition-colors">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border/60" />
            <Link href="/auth/login" className="text-sm font-medium text-muted">
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full bg-accent px-5 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-accent/20"
            >
              Request Access
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
