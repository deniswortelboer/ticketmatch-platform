import Link from "next/link";
import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for TicketMatch.ai — how we handle your data, GDPR compliance, and your rights as a user.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <main className="min-h-screen bg-background transition-colors">
        {/* Decorative top */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[var(--hero-from)] via-background to-background pt-12 pb-8 transition-colors">
          <div className="absolute -left-20 top-10 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[80px]" />
          <div className="absolute -right-20 top-20 h-[250px] w-[250px] rounded-full bg-cyan-500/8 blur-[60px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

          <div className="relative mx-auto max-w-3xl px-6">
            <Link href="/" className="mb-6 inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
                <span className="text-sm font-bold text-white">TM</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Ticket<span className="text-accent">Match</span>
                <span className="text-muted">.ai</span>
              </span>
            </Link>
            <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Privacy Policy</h1>
            <p className="mt-2 text-sm text-muted">Last updated: April 7, 2026</p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 pb-20">
          <div className="mt-8 space-y-8 text-[14px] leading-relaxed text-muted">
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
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms & Conditions →</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Back to TicketMatch.ai</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
