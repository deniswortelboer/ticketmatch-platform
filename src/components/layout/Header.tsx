"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/80 backdrop-blur-xl">
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
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            How it Works
          </Link>
          <Link
            href="/#categories"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Categories
          </Link>
          <Link
            href="/#cities"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Cities
          </Link>
          <Link
            href="/partners"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Become a Supplier
          </Link>
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 hover:scale-[1.02]"
          >
            Request Access
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/60 bg-white px-6 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-muted"
              onClick={() => setMobileOpen(false)}
            >
              How it Works
            </Link>
            <Link
              href="/#categories"
              className="text-sm font-medium text-muted"
              onClick={() => setMobileOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/#cities"
              className="text-sm font-medium text-muted"
              onClick={() => setMobileOpen(false)}
            >
              Cities
            </Link>
            <Link
              href="/partners"
              className="text-sm font-medium text-muted"
              onClick={() => setMobileOpen(false)}
            >
              Become a Supplier
            </Link>
            <hr className="border-border/60" />
            <Link href="/auth/login" className="text-sm font-medium text-muted">
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="rounded-full bg-foreground px-5 py-2.5 text-center text-sm font-semibold text-white"
            >
              Request Access
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
