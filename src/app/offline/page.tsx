"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-surface to-background px-6 text-center transition-colors">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-blue-800">
        <span className="text-2xl font-bold text-white">TM</span>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-foreground">You&apos;re offline</h1>
      <p className="mt-3 max-w-sm text-sm text-muted">
        It looks like you&apos;re not connected to the internet. Check your connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:brightness-110"
      >
        Try again
      </button>
    </div>
  );
}
