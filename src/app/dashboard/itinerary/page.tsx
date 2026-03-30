"use client";

const sampleDays = [
  { day: 1, label: "Day 1", date: "Select date" },
  { day: 2, label: "Day 2", date: "Select date" },
  { day: 3, label: "Day 3", date: "Select date" },
];

export default function ItineraryPage() {
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Itinerary Builder</h1>
          <p className="mt-1 text-sm text-muted">Create day-by-day plans for your group trips.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium transition-all hover:bg-gray-50">
            Add Day
          </button>
          <button className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-800">
            New Itinerary
          </button>
        </div>
      </div>

      {/* Itinerary days */}
      <div className="space-y-4">
        {sampleDays.map((day) => (
          <div key={day.day} className="rounded-2xl border border-border/60 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                  {day.day}
                </span>
                <div>
                  <h3 className="font-semibold">{day.label}</h3>
                  <p className="text-xs text-muted">{day.date}</p>
                </div>
              </div>
              <button className="text-sm font-medium text-accent hover:underline">
                + Add Activity
              </button>
            </div>

            {/* Activity slots */}
            <div className="rounded-xl border border-dashed border-border/40 bg-gray-50/50 p-8 text-center">
              <p className="text-sm text-muted">No activities added yet.</p>
              <p className="mt-1 text-xs text-muted/60">
                Add venues from the catalog or drag activities here.
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 rounded-2xl border border-border/60 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Itinerary Summary</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted">Total days</p>
            <p className="text-2xl font-bold">3</p>
          </div>
          <div>
            <p className="text-sm text-muted">Activities</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div>
            <p className="text-sm text-muted">Est. total per person</p>
            <p className="text-2xl font-bold">&euro; 0.00</p>
          </div>
        </div>
      </div>
    </>
  );
}
