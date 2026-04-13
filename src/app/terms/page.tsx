import Link from "next/link";
import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for TicketMatch.ai — usage terms, conditions, and service agreements for our B2B city experience ecosystem.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <main className="min-h-screen bg-background transition-colors">
        {/* Hero header */}
        <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-background to-background dark:from-[#0c1a2e] dark:via-background pt-10 pb-10 transition-colors">
          <div className="absolute -left-20 top-0 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[100px]" />
          <div className="absolute -right-20 top-10 h-[300px] w-[300px] rounded-full bg-cyan-500/15 blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

          <div className="relative mx-auto max-w-3xl px-6">
            <Link href="/" className="mb-8 inline-flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-600/20">
                <span className="text-sm font-bold text-white">TM</span>
              </div>
              <span className="text-lg font-semibold tracking-tight group-hover:text-accent transition-colors">
                Ticket<span className="text-accent">Match</span>
                <span className="text-muted">.ai</span>
              </span>
            </Link>
            <Breadcrumbs items={[{ label: "Terms & Conditions" }]} />
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">Terms & Conditions</h1>
            <p className="mt-2 text-[14px] text-muted">Last updated: April 7, 2026</p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 pb-20">
          <div className="mt-8 space-y-8 text-[14px] leading-relaxed text-muted">
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
            <Link href="/privacy" className="hover:text-foreground transition-colors">← Privacy Policy</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Back to TicketMatch.ai</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
