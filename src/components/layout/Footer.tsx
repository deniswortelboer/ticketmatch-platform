import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-white">
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
              The smart B2B procurement platform for city experiences. Built for
              tour operators, DMCs and group travel professionals.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
              Platform
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="#categories" className="text-sm text-muted transition-colors hover:text-foreground">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="#cities" className="text-sm text-muted transition-colors hover:text-foreground">
                  Cities
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-sm text-muted transition-colors hover:text-foreground">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-sm text-muted transition-colors hover:text-foreground">
                  Request Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
              For Partners
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/partners" className="text-sm text-muted transition-colors hover:text-foreground">
                  Become a Supplier
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-sm text-muted transition-colors hover:text-foreground">
                  API Integration
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-sm text-muted transition-colors hover:text-foreground">
                  Affiliate Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
              Contact
            </h4>
            <ul className="space-y-3">
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
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 md:flex-row">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} TicketMatch.ai — All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-muted transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-muted transition-colors hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
