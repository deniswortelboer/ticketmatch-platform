export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
        </div>
        {/* Pulsing text */}
        <div className="flex flex-col items-center gap-2 animate-pulse">
          <div className="h-3 w-32 rounded-full bg-accent/20" />
          <div className="h-2 w-20 rounded-full bg-muted/20" />
        </div>
      </div>
    </div>
  );
}
