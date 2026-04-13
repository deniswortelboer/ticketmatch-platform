import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-surface transition-colors">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-accent to-blue-800">
                <span className="text-xs font-bold text-white">TM</span>
              </div>
              <span className="text-base font-semibold tracking-tight">
                Ticket<span className="text-accent">Match</span>
                <span className="text-muted">.ai</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              The B2B ecosystem for city experiences. 300,000+ experiences from 10 supplier APIs across 3,000+ cities — powered by 8 AI agents.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-alt text-muted transition-colors hover:bg-accent hover:text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="mailto:hello@ticketmatch.ai" aria-label="Email us" className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-alt text-muted transition-colors hover:bg-accent hover:text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
              </a>
            </div>
          </div>

          {/* Ecosystem */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
              Ecosystem
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/#how-it-works" className="text-sm text-muted transition-colors hover:text-foreground">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="text-sm text-muted transition-colors hover:text-foreground">
                  Experience Categories
                </Link>
              </li>
              <li>
                <Link href="/cities" className="text-sm text-muted transition-colors hover:text-foreground">
                  Cities
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-sm text-muted transition-colors hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted transition-colors hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/insights" className="text-sm text-muted transition-colors hover:text-foreground">
                  Insights
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-sm font-medium text-accent transition-colors hover:text-accent-dark">
                  Request Membership
                </Link>
              </li>
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
              Partners
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/partners" className="text-sm text-muted transition-colors hover:text-foreground">
                  Become a Supplier
                </Link>
              </li>
              <li>
                <Link href="/become-reseller" className="text-sm text-muted transition-colors hover:text-foreground">
                  Become a Reseller
                </Link>
              </li>
              <li>
                <Link href="/partners/tech" className="text-sm text-muted transition-colors hover:text-foreground">
                  API &amp; Integrations
                </Link>
              </li>
              <li>
                <Link href="/developers" className="text-sm text-muted transition-colors hover:text-foreground">
                  Developers
                </Link>
              </li>
              <li>
                <Link href="/partners/advertise" className="text-sm text-muted transition-colors hover:text-foreground">
                  Advertise
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-muted transition-colors hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@ticketmatch.ai"
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  hello@ticketmatch.ai
                </a>
              </li>
              <li>
                <span className="text-sm text-muted">Amsterdam, Netherlands</span>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted transition-colors hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted transition-colors hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 md:flex-row">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} TicketMatch.ai — All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-muted transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-muted transition-colors hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
