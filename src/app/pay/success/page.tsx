import Link from "next/link";

export default async function PaymentSuccess({
  searchParams,
}: {
  searchParams: Promise<{ invoice?: string }>;
}) {
  const params = await searchParams;
  const invoiceNumber = params.invoice || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1729] via-[#1a2744] to-[#0f1729] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          {/* Checkmark animation */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>

          <p className="text-gray-500 mb-6">
            Thank you for your payment. Your invoice has been settled.
          </p>

          {invoiceNumber && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Invoice Reference
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {invoiceNumber}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-left bg-blue-50 rounded-xl p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Confirmation email sent</p>
                <p className="text-xs text-gray-500">You will receive a receipt shortly</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left bg-green-50 rounded-xl p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Bookings confirmed</p>
                <p className="text-xs text-gray-500">All activities are now confirmed</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Link
              href="/dashboard/bookings"
              className="flex-1 rounded-xl bg-gradient-to-r from-[#0f1729] to-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              View Bookings
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Branding */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500">
              <span className="text-[10px] font-bold text-white">TM</span>
            </div>
            <span className="text-sm font-semibold text-white/80">
              Ticket<span className="text-blue-400">Match</span>
            </span>
          </div>
          <p className="mt-2 text-xs text-white/40">
            Secure payment powered by Mollie
          </p>
        </div>
      </div>
    </div>
  );
}
