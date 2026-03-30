"use client";

export default function GroupsPage() {
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
          <p className="mt-1 text-sm text-muted">Manage your guest lists and group configurations.</p>
        </div>
        <button className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-800">
          New Group
        </button>
      </div>

      {/* Upload area */}
      <div className="mb-8 rounded-2xl border-2 border-dashed border-border/60 bg-white p-12 text-center transition-colors hover:border-accent/30">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="font-medium">Upload a guest list</p>
        <p className="mt-1 text-sm text-muted">Drag &amp; drop a CSV or Excel file, or click to browse.</p>
        <p className="mt-3 text-xs text-muted/60">Supported formats: .csv, .xlsx, .xls</p>
        <input type="file" accept=".csv,.xlsx,.xls" className="hidden" />
        <button className="mt-4 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium transition-all hover:bg-gray-50">
          Choose File
        </button>
      </div>

      {/* Groups list placeholder */}
      <h2 className="mb-4 text-lg font-semibold">Your groups</h2>
      <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
        <p className="text-sm text-muted">No groups created yet.</p>
        <p className="mt-1 text-xs text-muted/60">Upload a guest list or create a new group to get started.</p>
      </div>
    </>
  );
}
