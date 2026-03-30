export default function BookingsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="mt-1 text-sm text-muted">Track all your bookings, vouchers and booking status.</p>
      </div>

      {/* Filters row */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search bookings..."
          className="h-10 w-64 rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
          readOnly
        />
        <select className="h-10 rounded-xl border border-border bg-white px-4 text-sm text-muted outline-none">
          <option>All statuses</option>
          <option>Confirmed</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* Table placeholder */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/60 bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 font-medium text-muted">Booking ID</th>
              <th className="px-6 py-4 font-medium text-muted">Venue</th>
              <th className="px-6 py-4 font-medium text-muted">Date</th>
              <th className="px-6 py-4 font-medium text-muted">Guests</th>
              <th className="px-6 py-4 font-medium text-muted">Total</th>
              <th className="px-6 py-4 font-medium text-muted">Status</th>
              <th className="px-6 py-4 font-medium text-muted"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="px-6 py-16 text-center text-muted">
                <p>No bookings yet.</p>
                <p className="mt-1 text-xs text-muted/60">
                  Browse the catalog and add venues to create your first booking.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
