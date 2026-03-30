export default function ProfilePage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Company Profile</h1>
        <p className="mt-1 text-sm text-muted">Manage your company information and billing details.</p>
      </div>

      <div className="space-y-6">
        {/* Company info */}
        <div className="rounded-2xl border border-border/60 bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold">Company Information</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Company name</label>
              <input type="text" defaultValue="Demo Company B.V." className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Company type</label>
              <select className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10">
                <option>Tour Operator</option>
                <option>Travel Agency</option>
                <option>DMC</option>
                <option>MICE / Event Agency</option>
                <option>Corporate Travel</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">KVK / Chamber of Commerce</label>
              <input type="text" placeholder="12345678" className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">VAT number</label>
              <input type="text" placeholder="NL123456789B01" className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl border border-border/60 bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold">Primary Contact</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Full name</label>
              <input type="text" defaultValue="John Doe" className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <input type="email" defaultValue="john@democompany.com" className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Phone</label>
              <input type="tel" defaultValue="+31 6 1234 5678" className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Role</label>
              <input type="text" defaultValue="Operations Manager" className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800">
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
