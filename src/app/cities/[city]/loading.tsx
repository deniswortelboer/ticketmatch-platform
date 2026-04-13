export default function CityLoading() {
  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Header placeholder */}
      <div className="h-16 border-b border-card-border bg-card-bg" />

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Breadcrumb skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-3 w-14 rounded-full bg-muted/20 animate-pulse" />
          <div className="h-3 w-3 rounded-full bg-muted/10" />
          <div className="h-3 w-20 rounded-full bg-muted/20 animate-pulse" />
        </div>

        {/* Hero skeleton */}
        <div className="mb-10 space-y-4">
          <div className="h-8 w-64 rounded-lg bg-muted/20 animate-pulse" />
          <div className="h-4 w-full max-w-xl rounded-full bg-muted/15 animate-pulse" />
          <div className="h-4 w-full max-w-md rounded-full bg-muted/10 animate-pulse" />
        </div>

        {/* Stats row */}
        <div className="mb-10 flex gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-2xl border border-card-border bg-card-bg p-5 animate-pulse"
            >
              <div className="h-6 w-16 rounded bg-muted/20 mb-2" />
              <div className="h-3 w-24 rounded-full bg-muted/10" />
            </div>
          ))}
        </div>

        {/* Category cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-card-border bg-card-bg p-6 animate-pulse"
            >
              {/* Image placeholder */}
              <div className="mb-4 aspect-[4/3] rounded-xl bg-muted/15" />
              {/* Title */}
              <div className="h-5 w-3/4 rounded bg-muted/20 mb-3" />
              {/* Description lines */}
              <div className="space-y-2">
                <div className="h-3 w-full rounded-full bg-muted/10" />
                <div className="h-3 w-5/6 rounded-full bg-muted/10" />
              </div>
              {/* Footer */}
              <div className="mt-4 flex items-center justify-between">
                <div className="h-4 w-20 rounded-full bg-accent/15" />
                <div className="h-4 w-16 rounded-full bg-muted/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
