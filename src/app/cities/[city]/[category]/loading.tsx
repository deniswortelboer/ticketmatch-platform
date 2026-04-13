export default function CategoryLoading() {
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
          <div className="h-3 w-3 rounded-full bg-muted/10" />
          <div className="h-3 w-24 rounded-full bg-muted/20 animate-pulse" />
        </div>

        {/* Hero skeleton */}
        <div className="mb-10 space-y-4">
          <div className="h-8 w-80 rounded-lg bg-muted/20 animate-pulse" />
          <div className="h-4 w-full max-w-lg rounded-full bg-muted/15 animate-pulse" />
          <div className="h-4 w-full max-w-sm rounded-full bg-muted/10 animate-pulse" />
        </div>

        {/* Filter bar skeleton */}
        <div className="mb-8 flex gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-9 rounded-full bg-card-bg border border-card-border animate-pulse"
              style={{ width: `${60 + i * 12}px` }}
            />
          ))}
        </div>

        {/* Experience cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-card-border bg-card-bg overflow-hidden animate-pulse"
            >
              {/* Image placeholder */}
              <div className="aspect-[4/3] bg-muted/15" />
              {/* Content */}
              <div className="p-5 space-y-3">
                {/* Category badge */}
                <div className="h-5 w-20 rounded-full bg-accent/10" />
                {/* Title */}
                <div className="h-5 w-full rounded bg-muted/20" />
                <div className="h-5 w-3/4 rounded bg-muted/15" />
                {/* Description */}
                <div className="space-y-2 pt-1">
                  <div className="h-3 w-full rounded-full bg-muted/10" />
                  <div className="h-3 w-5/6 rounded-full bg-muted/10" />
                </div>
                {/* Footer: price + rating */}
                <div className="flex items-center justify-between pt-2">
                  <div className="h-5 w-16 rounded bg-accent/15" />
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded bg-amber-500/20" />
                    <div className="h-3 w-8 rounded-full bg-muted/15" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
