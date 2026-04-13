import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for TicketMatch.ai — how we handle your data, GDPR compliance, and your rights as a user.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — TicketMatch.ai",
    description: "How TicketMatch.ai handles your data, GDPR compliance, cookies, and your rights as a user.",
  },
};

export default function PrivacyPage() {
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
                <span className="text-[12px] font-semibold text-accent uppercase tracking-[0.15em]">GDPR Compliant</span>
              </div>
              <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight md:text-[2.5rem]">
                Privacy{" "}
                <span className="bg-gradient-to-r from-accent via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Policy
                </span>
              </h1>
              <p className="mt-3 text-[15px] leading-[1.7] text-muted">
                How we protect your data. Last updated: April 7, 2026
              </p>

              <div className="mt-10 space-y-8 text-[14px] leading-relaxed text-muted">
                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">1. Introduction</h2>
                  <p>
                    W69 AI Consultancy (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), operating TicketMatch.ai, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share your personal data when you use our Platform, in accordance with the General Data Protection Regulation (GDPR) and Dutch privacy law.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">2. Data Controller</h2>
                  <p>
                    The data controller for your personal data is:<br />
                    <strong className="text-foreground">W69 AI Consultancy</strong><br />
                    Email: hello@ticketmatch.ai<br />
                    The Netherlands
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">3. Data We Collect</h2>
                  <p>We collect the following categories of personal data:</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    <li><strong className="text-foreground">Account data:</strong> Name, email address, company name, phone number, KVK number, VAT number.</li>
                    <li><strong className="text-foreground">Authentication data:</strong> Login method (Google, Microsoft, email OTP), session tokens.</li>
                    <li><strong className="text-foreground">Booking data:</strong> Group details, passenger names, travel dates, venue selections, booking history.</li>
                    <li><strong className="text-foreground">Usage data:</strong> Pages visited, features used, timestamps, IP address, browser type.</li>
                    <li><strong className="text-foreground">Payment data:</strong> Processed by Mollie; we do not store credit card or bank details.</li>
                    <li><strong className="text-foreground">Uploaded data:</strong> Passenger lists (Excel, CSV, Word files) uploaded by you.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">4. Purpose of Processing</h2>
                  <p>We use your personal data for the following purposes:</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    <li><strong className="text-foreground">Service delivery:</strong> To provide and maintain the Platform, process bookings, and manage your account.</li>
                    <li><strong className="text-foreground">Communication:</strong> To send booking confirmations, login codes, and service updates.</li>
                    <li><strong className="text-foreground">Improvement:</strong> To analyze usage patterns and improve the Platform.</li>
                    <li><strong className="text-foreground">Legal compliance:</strong> To comply with legal obligations, such as tax and accounting requirements.</li>
                    <li><strong className="text-foreground">Marketing:</strong> Only with your explicit consent, to send promotional offers or newsletters.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">5. Legal Basis</h2>
                  <p>We process your data based on:</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    <li><strong className="text-foreground">Contract:</strong> Processing necessary for the performance of our service agreement with you.</li>
                    <li><strong className="text-foreground">Legitimate interest:</strong> For improving our services and ensuring platform security.</li>
                    <li><strong className="text-foreground">Consent:</strong> For marketing communications and optional data processing.</li>
                    <li><strong className="text-foreground">Legal obligation:</strong> For compliance with tax, accounting, and other legal requirements.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">6. Data Sharing</h2>
                  <p>We may share your data with:</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    <li><strong className="text-foreground">Venue/ticket providers:</strong> To process and confirm your bookings (group name, number of guests, date).</li>
                    <li><strong className="text-foreground">Payment provider:</strong> Mollie B.V. (Amsterdam, NL) for payment processing.</li>
                    <li><strong className="text-foreground">Hosting provider:</strong> Vercel Inc. and Supabase Inc. for platform hosting and database services.</li>
                    <li><strong className="text-foreground">CRM:</strong> HubSpot for customer relationship management.</li>
                  </ul>
                  <p className="mt-2">We do not sell your personal data to third parties.</p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">7. Data Transfers</h2>
                  <p>
                    Some of our service providers (Vercel, Supabase, HubSpot) are based in the United States. Data transfers to the US are protected by Standard Contractual Clauses (SCCs) as approved by the European Commission.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">8. Data Retention</h2>
                  <ul className="list-disc space-y-2 pl-5">
                    <li>Account data is retained for the duration of your account plus 12 months after deletion.</li>
                    <li>Booking data is retained for 7 years for tax and legal purposes.</li>
                    <li>Uploaded passenger lists are stored for the duration of the associated booking only.</li>
                    <li>Usage data is retained for 26 months.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">9. Your Rights</h2>
                  <p>Under the GDPR, you have the right to:</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    <li><strong className="text-foreground">Access:</strong> Request a copy of your personal data.</li>
                    <li><strong className="text-foreground">Rectification:</strong> Request correction of inaccurate data.</li>
                    <li><strong className="text-foreground">Erasure:</strong> Request deletion of your personal data (&quot;right to be forgotten&quot;).</li>
                    <li><strong className="text-foreground">Restriction:</strong> Request restriction of processing.</li>
                    <li><strong className="text-foreground">Portability:</strong> Request your data in a machine-readable format.</li>
                    <li><strong className="text-foreground">Objection:</strong> Object to processing based on legitimate interest.</li>
                    <li><strong className="text-foreground">Withdraw consent:</strong> Withdraw consent for marketing communications at any time.</li>
                  </ul>
                  <p className="mt-2">
                    To exercise any of these rights, contact us at hello@ticketmatch.ai. We will respond within 30 days.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">10. Cookies</h2>
                  <p>
                    The Platform uses essential cookies for authentication and session management. We do not use tracking or advertising cookies. No consent banner is required for essential cookies under GDPR.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">11. Security</h2>
                  <p>
                    We implement appropriate technical and organizational measures to protect your personal data, including encryption in transit (TLS/SSL), encrypted database storage, access controls, and regular security reviews.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">12. Children</h2>
                  <p>
                    The Platform is a B2B service intended for business use only. We do not knowingly collect data from individuals under 16 years of age.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">13. Changes to This Policy</h2>
                  <p>
                    We may update this Privacy Policy from time to time. We will notify registered users of significant changes via email. The latest version is always available at ticketmatch.ai/privacy.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">14. Complaints</h2>
                  <p>
                    If you believe we are not handling your data correctly, you have the right to file a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens) at autoriteitpersoonsgegevens.nl.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-lg font-semibold text-foreground">15. Contact</h2>
                  <p>
                    For any privacy-related questions or requests:<br />
                    <strong className="text-foreground">W69 AI Consultancy</strong><br />
                    Email: hello@ticketmatch.ai<br />
                    The Netherlands
                  </p>
                </section>
              </div>

              <div className="mt-12 border-t border-border pt-6 flex items-center justify-between text-sm text-muted">
                <Link href="/terms" className="font-semibold text-accent hover:underline">Terms & Conditions →</Link>
                <Link href="/" className="hover:text-foreground transition-colors">Back to TicketMatch.ai</Link>
              </div>
            </div>

            {/* ═══════ RIGHT: Visual (desktop only) ═══════ */}
            <div className="hidden lg:block lg:sticky lg:top-32">
              {/* Animated SVG — Privacy Shield */}
              <div className="flex justify-center mb-10">
                <svg viewBox="0 0 360 300" className="w-full max-w-[360px]" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="pp-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="pp-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>

                  <circle cx="180" cy="150" r="130" fill="url(#pp-glow)" />
                  <circle cx="180" cy="150" r="120" fill="none" stroke="url(#pp-ring)" strokeWidth="1" strokeDasharray="6 5"
                    style={{ animation: "pp-spin 28s linear infinite", transformOrigin: "180px 150px" }} />
                  <circle cx="180" cy="150" r="75" fill="none" stroke="var(--color-accent)" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 4"
                    style={{ animation: "pp-spin-rev 20s linear infinite", transformOrigin: "180px 150px" }} />

                  {/* Center: Shield */}
                  <circle cx="180" cy="150" r="40" fill="var(--color-accent)" fillOpacity="0.08" stroke="var(--color-accent)" strokeWidth="1.5" strokeOpacity="0.3" />
                  <text x="180" y="144" textAnchor="middle" className="fill-foreground" fontSize="16">🛡️</text>
                  <text x="180" y="162" textAnchor="middle" className="fill-accent" fontSize="7" fontWeight="700" letterSpacing="1">PROTECTED</text>

                  {/* Feature nodes */}
                  {[
                    { cx: 180, cy: 35, label: "GDPR", emoji: "🇪🇺", color: "#60a5fa" },
                    { cx: 305, cy: 90, label: "Encryption", emoji: "🔒", color: "#10b981" },
                    { cx: 305, cy: 215, label: "EU Data", emoji: "🏛️", color: "#f59e0b" },
                    { cx: 180, cy: 265, label: "Your Rights", emoji: "⚖️", color: "#a78bfa" },
                    { cx: 55, cy: 215, label: "No Tracking", emoji: "🚫", color: "#06b6d4" },
                    { cx: 55, cy: 90, label: "SSL/TLS", emoji: "🔐", color: "#ec4899" },
                  ].map((node, i) => (
                    <g key={i} style={{ animation: `pp-breathe 4s ease-in-out ${i * 0.3}s infinite` }}>
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
                      style={{ animation: "pp-spin 28s linear infinite", transformOrigin: "180px 150px", transform: `rotate(${deg}deg)` }} />
                  ))}

                  <style>{`
                    @keyframes pp-spin { to { transform: rotate(360deg) } }
                    @keyframes pp-spin-rev { to { transform: rotate(-360deg) } }
                    @keyframes pp-breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.05) } }
                  `}</style>
                </svg>
              </div>

              {/* Trust highlights */}
              <div className="max-w-md mx-auto text-center">
                <h2 className="text-xl font-extrabold tracking-tight">Your Data, Protected</h2>
                <p className="mt-2 text-[13px] text-muted leading-relaxed">
                  GDPR compliant, encrypted, and transparent. We never sell your data.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { value: "256-bit", label: "Encryption" },
                    { value: "GDPR", label: "Compliant" },
                    { value: "99.9%", label: "Uptime" },
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
