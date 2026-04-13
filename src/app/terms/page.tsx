import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for TicketMatch.ai — usage terms, conditions, and service agreements for our B2B city experience ecosystem.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service — TicketMatch.ai",
    description: "Usage terms, conditions, and service agreements for the TicketMatch.ai B2B ecosystem.",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background transition-colors">
      <Header />

      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -left-20 top-10 h-[400px] w-[400px] rounded-full bg-accent/12 blur-[100px]" />
        <div className="pointer-events-none absolute -right-20 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[80px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.1fr]">

            {/* ═══════ LEFT: Content ═══════ */}
            <div className="mx-auto w-full max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[12px] font-semibold text-accent uppercase tracking-[0.15em]">Legal</span>
              </div>
              <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight md:text-[2.5rem]">
                Terms &{" "}
                <span className="bg-gradient-to-r from-accent via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Conditions
                </span>
              </h1>
              <p className="mt-3 text-[15px] leading-[1.7] text-muted">
                The rules of the ecosystem. Last updated: April 7, 2026
              </p>

              <div className="mt-10 space-y-8 text-[14px] leading-relaxed text-muted">
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">1. Introduction</h2>
                  <p>
                    These Terms & Conditions (&quot;Terms&quot;) govern your use of the TicketMatch.ai platform (&quot;Platform&quot;), operated by W69 AI Consultancy, registered in the Netherlands (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By accessing or using the Platform, you agree to be bound by these Terms.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">2. Definitions</h2>
                  <ul className="list-disc space-y-2 pl-5">
                    <li><strong className="text-foreground">Platform:</strong> The TicketMatch.ai web application and all related services.</li>
                    <li><strong className="text-foreground">User:</strong> Any individual or business entity that registers for and uses the Platform.</li>
                    <li><strong className="text-foreground">Booking:</strong> A reservation made through the Platform for tickets, experiences, or services.</li>
                    <li><strong className="text-foreground">Subscription:</strong> A paid plan (Free, Pro, or Enterprise) that grants access to specific features.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">3. Account Registration</h2>
                  <p>
                    To use the Platform, you must create an account using a valid email address or third-party authentication (Google, Microsoft). You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">4. Services</h2>
                  <p>
                    TicketMatch.ai provides a B2B platform for tour operators and travel agencies to discover, book, and manage group tickets for museums, attractions, and experiences in the Netherlands and beyond. We act as an intermediary between tour operators and venue/ticket providers.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">5. Subscriptions & Payments</h2>
                  <ul className="list-disc space-y-2 pl-5">
                    <li>The Platform offers Free, Pro, and Enterprise subscription plans.</li>
                    <li>Paid subscriptions are billed monthly or annually via our payment provider (Mollie).</li>
                    <li>Prices are in EUR and exclusive of VAT unless stated otherwise.</li>
                    <li>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period.</li>
                    <li>We reserve the right to change pricing with 30 days notice.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">6. Bookings & Cancellations</h2>
                  <ul className="list-disc space-y-2 pl-5">
                    <li>Bookings made through the Platform are subject to availability and the terms of the venue/ticket provider.</li>
                    <li>Cancellation policies vary per venue and will be clearly displayed before booking confirmation.</li>
                    <li>TicketMatch.ai is not liable for cancellations or changes made by venue/ticket providers.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">7. User Obligations</h2>
                  <p>You agree to:</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    <li>Provide accurate and complete information when registering and making bookings.</li>
                    <li>Use the Platform only for lawful business purposes.</li>
                    <li>Not attempt to reverse-engineer, copy, or redistribute any part of the Platform.</li>
                    <li>Not share your account credentials with unauthorized third parties.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">8. Intellectual Property</h2>
                  <p>
                    All content, designs, logos, and software on the Platform are the property of W69 AI Consultancy and are protected by intellectual property laws. You may not use, copy, or distribute any materials from the Platform without our written consent.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">9. Limitation of Liability</h2>
                  <p>
                    TicketMatch.ai is provided &quot;as is&quot;. To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability shall not exceed the amount paid by you in subscription fees during the 12 months preceding the claim.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">10. Termination</h2>
                  <p>
                    We reserve the right to suspend or terminate your account if you violate these Terms. You may terminate your account at any time by contacting us at hello@ticketmatch.ai.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">11. Governing Law</h2>
                  <p>
                    These Terms are governed by the laws of the Netherlands. Any disputes shall be submitted to the competent court in Amsterdam, the Netherlands.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">12. Changes to These Terms</h2>
                  <p>
                    We may update these Terms from time to time. We will notify registered users of significant changes via email. Continued use of the Platform after changes constitutes acceptance of the updated Terms.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">13. Contact</h2>
                  <p>
                    If you have any questions about these Terms, please contact us at:<br />
                    <strong className="text-foreground">W69 AI Consultancy</strong><br />
                    Email: hello@ticketmatch.ai
                  </p>
                </section>
              </div>

              <div className="mt-12 border-t border-border pt-6 flex items-center justify-between text-sm text-muted">
                <Link href="/privacy" className="font-semibold text-accent hover:underline">← Privacy Policy</Link>
                <Link href="/" className="hover:text-foreground transition-colors">Back to TicketMatch.ai</Link>
              </div>
            </div>

            {/* ═══════ RIGHT: Visual (desktop only) ═══════ */}
            <div className="hidden lg:block lg:sticky lg:top-32">
              {/* Animated SVG — Legal / Ecosystem */}
              <div className="flex justify-center mb-10">
                <svg viewBox="0 0 360 300" className="w-full max-w-[360px]" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="tc-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="tc-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>

                  <circle cx="180" cy="150" r="130" fill="url(#tc-glow)" />
                  <circle cx="180" cy="150" r="120" fill="none" stroke="url(#tc-ring)" strokeWidth="1" strokeDasharray="6 5"
                    style={{ animation: "tc-spin 28s linear infinite", transformOrigin: "180px 150px" }} />
                  <circle cx="180" cy="150" r="75" fill="none" stroke="var(--color-accent)" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 4"
                    style={{ animation: "tc-spin-rev 20s linear infinite", transformOrigin: "180px 150px" }} />

                  {/* Center: Legal */}
                  <circle cx="180" cy="150" r="40" fill="var(--color-accent)" fillOpacity="0.08" stroke="var(--color-accent)" strokeWidth="1.5" strokeOpacity="0.3" />
                  <text x="180" y="144" textAnchor="middle" className="fill-foreground" fontSize="16">📜</text>
                  <text x="180" y="162" textAnchor="middle" className="fill-accent" fontSize="7" fontWeight="700" letterSpacing="1">AGREEMENT</text>

                  {/* Feature nodes */}
                  {[
                    { cx: 180, cy: 35, label: "Membership", emoji: "🤝", color: "#60a5fa" },
                    { cx: 305, cy: 90, label: "Bookings", emoji: "📋", color: "#10b981" },
                    { cx: 305, cy: 215, label: "Payments", emoji: "💳", color: "#f59e0b" },
                    { cx: 180, cy: 265, label: "Dutch Law", emoji: "🇳🇱", color: "#a78bfa" },
                    { cx: 55, cy: 215, label: "IP Rights", emoji: "©️", color: "#06b6d4" },
                    { cx: 55, cy: 90, label: "Support", emoji: "💬", color: "#ec4899" },
                  ].map((node, i) => (
                    <g key={i} style={{ animation: `tc-breathe 4s ease-in-out ${i * 0.3}s infinite` }}>
                      <line x1={node.cx} y1={node.cy} x2="180" y2="150" stroke={node.color} strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="3 3" />
                      <circle cx={node.cx} cy={node.cy} r="24" fill={node.color} fillOpacity="0.07" stroke={node.color} strokeWidth="0.8" strokeOpacity="0.3" />
                      <text x={node.cx} y={node.cy - 2} textAnchor="middle" fontSize="14">{node.emoji}</text>
                      <text x={node.cx} y={node.cy + 14} textAnchor="middle" className="fill-muted" fontSize="6.5" fontWeight="600">{node.label}</text>
                    </g>
                  ))}

                  {/* Orbiting dots */}
                  {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                    <circle key={`o-${i}`} cx="180" cy="30" r="2.5"
                      fill={["#60a5fa", "#10b981", "#f59e0b", "#a78bfa", "#06b6d4", "#ec4899"][i]}
                      fillOpacity="0.6"
                      style={{ animation: "tc-spin 28s linear infinite", transformOrigin: "180px 150px", transform: `rotate(${deg}deg)` }} />
                  ))}

                  <style>{`
                    @keyframes tc-spin { to { transform: rotate(360deg) } }
                    @keyframes tc-spin-rev { to { transform: rotate(-360deg) } }
                    @keyframes tc-breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.05) } }
                  `}</style>
                </svg>
              </div>

              {/* Trust highlights */}
              <div className="max-w-md mx-auto text-center">
                <h2 className="text-xl font-extrabold tracking-tight">Fair & Transparent</h2>
                <p className="mt-2 text-[13px] text-muted leading-relaxed">
                  Clear terms, no hidden fees. Dutch law, Amsterdam jurisdiction.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { value: "0", label: "Hidden Fees" },
                    { value: "24h", label: "Cancellation" },
                    { value: "NL", label: "Jurisdiction" },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3.5 text-center shadow-lg">
                      <p className="text-lg font-extrabold text-white">{s.value}</p>
                      <p className="mt-0.5 text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
