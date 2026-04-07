import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="mb-12 inline-flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
            <span className="text-sm font-bold text-white">TM</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Ticket<span className="text-blue-600">Match</span>
            <span className="text-gray-400">.ai</span>
          </span>
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: April 7, 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">1. Introduction</h2>
            <p>
              W69 AI Consultancy (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), operating TicketMatch.ai, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share your personal data when you use our Platform, in accordance with the General Data Protection Regulation (GDPR) and Dutch privacy law.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">2. Data Controller</h2>
            <p>
              The data controller for your personal data is:<br />
              <strong>W69 AI Consultancy</strong><br />
              Email: hello@ticketmatch.ai<br />
              The Netherlands
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">3. Data We Collect</h2>
            <p>We collect the following categories of personal data:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li><strong>Account data:</strong> Name, email address, company name, phone number, KVK number, VAT number.</li>
              <li><strong>Authentication data:</strong> Login method (Google, Microsoft, email OTP), session tokens.</li>
              <li><strong>Booking data:</strong> Group details, passenger names, travel dates, venue selections, booking history.</li>
              <li><strong>Usage data:</strong> Pages visited, features used, timestamps, IP address, browser type.</li>
              <li><strong>Payment data:</strong> Processed by Mollie; we do not store credit card or bank details.</li>
              <li><strong>Uploaded data:</strong> Passenger lists (Excel, CSV, Word files) uploaded by you.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">4. Purpose of Processing</h2>
            <p>We use your personal data for the following purposes:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li><strong>Service delivery:</strong> To provide and maintain the Platform, process bookings, and manage your account.</li>
              <li><strong>Communication:</strong> To send booking confirmations, login codes, and service updates.</li>
              <li><strong>Improvement:</strong> To analyze usage patterns and improve the Platform.</li>
              <li><strong>Legal compliance:</strong> To comply with legal obligations, such as tax and accounting requirements.</li>
              <li><strong>Marketing:</strong> Only with your explicit consent, to send promotional offers or newsletters.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">5. Legal Basis</h2>
            <p>We process your data based on:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li><strong>Contract:</strong> Processing necessary for the performance of our service agreement with you.</li>
              <li><strong>Legitimate interest:</strong> For improving our services and ensuring platform security.</li>
              <li><strong>Consent:</strong> For marketing communications and optional data processing.</li>
              <li><strong>Legal obligation:</strong> For compliance with tax, accounting, and other legal requirements.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">6. Data Sharing</h2>
            <p>We may share your data with:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li><strong>Venue/ticket providers:</strong> To process and confirm your bookings (group name, number of guests, date).</li>
              <li><strong>Payment provider:</strong> Mollie B.V. (Amsterdam, NL) for payment processing.</li>
              <li><strong>Hosting provider:</strong> Vercel Inc. and Supabase Inc. for platform hosting and database services.</li>
              <li><strong>CRM:</strong> HubSpot for customer relationship management.</li>
            </ul>
            <p className="mt-2">We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">7. Data Transfers</h2>
            <p>
              Some of our service providers (Vercel, Supabase, HubSpot) are based in the United States. Data transfers to the US are protected by Standard Contractual Clauses (SCCs) as approved by the European Commission.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">8. Data Retention</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Account data is retained for the duration of your account plus 12 months after deletion.</li>
              <li>Booking data is retained for 7 years for tax and legal purposes.</li>
              <li>Uploaded passenger lists are stored for the duration of the associated booking only.</li>
              <li>Usage data is retained for 26 months.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">9. Your Rights</h2>
            <p>Under the GDPR, you have the right to:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li><strong>Access:</strong> Request a copy of your personal data.</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate data.</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data (&quot;right to be forgotten&quot;).</li>
              <li><strong>Restriction:</strong> Request restriction of processing.</li>
              <li><strong>Portability:</strong> Request your data in a machine-readable format.</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interest.</li>
              <li><strong>Withdraw consent:</strong> Withdraw consent for marketing communications at any time.</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at hello@ticketmatch.ai. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">10. Cookies</h2>
            <p>
              The Platform uses essential cookies for authentication and session management. We do not use tracking or advertising cookies. No consent banner is required for essential cookies under GDPR.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">11. Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data, including encryption in transit (TLS/SSL), encrypted database storage, access controls, and regular security reviews.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">12. Children</h2>
            <p>
              The Platform is a B2B service intended for business use only. We do not knowingly collect data from individuals under 16 years of age.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users of significant changes via email. The latest version is always available at ticketmatch.ai/privacy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">14. Complaints</h2>
            <p>
              If you believe we are not handling your data correctly, you have the right to file a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens) at autoriteitpersoonsgegevens.nl.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">15. Contact</h2>
            <p>
              For any privacy-related questions or requests:<br />
              <strong>W69 AI Consultancy</strong><br />
              Email: hello@ticketmatch.ai<br />
              The Netherlands
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-6 flex items-center justify-between text-sm text-gray-400">
          <Link href="/terms" className="hover:text-gray-600 transition-colors">Terms & Conditions</Link>
          <Link href="/" className="hover:text-gray-600 transition-colors">Back to TicketMatch.ai</Link>
        </div>
      </div>
    </div>
  );
}
