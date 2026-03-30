export default function SettingsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your account preferences and notifications.</p>
      </div>

      <div className="space-y-6">
        {/* Notifications */}
        <div className="rounded-2xl border border-border/60 bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold">Notifications</h2>
          <div className="space-y-4">
            {[
              { label: "Booking confirmations", desc: "Receive email when a booking is confirmed.", defaultChecked: true },
              { label: "New venues added", desc: "Get notified when new venues are added to the catalog.", defaultChecked: true },
              { label: "Weekly summary", desc: "Receive a weekly overview of your bookings and groups.", defaultChecked: false },
              { label: "Marketing updates", desc: "News about new features and platform updates.", defaultChecked: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-border/40 px-5 py-4">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted">{item.desc}</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" defaultChecked={item.defaultChecked} className="peer sr-only" />
                  <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-accent peer-focus:ring-2 peer-focus:ring-accent/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-border/60 bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold">Security</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Current password</label>
              <input type="password" placeholder="Enter current password" className="h-12 w-full max-w-md rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">New password</label>
              <input type="password" placeholder="Enter new password" className="h-12 w-full max-w-md rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10" />
            </div>
            <button className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-800">
              Update Password
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-700">Danger Zone</h2>
          <p className="mb-4 text-sm text-red-600/70">
            Permanently delete your account and all associated data.
          </p>
          <button className="rounded-xl border border-red-300 bg-white px-5 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50">
            Delete Account
          </button>
        </div>
      </div>
    </>
  );
}
