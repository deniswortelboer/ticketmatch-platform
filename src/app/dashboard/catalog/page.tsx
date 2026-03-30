"use client";

import { useState } from "react";

/* ───── mock product data (later from Combitiq API / multi-supplier) ───── */
const products = [
  { id: "1", name: "AMAZE Amsterdam", category: "Attraction", city: "Amsterdam", supplier: "Combitiq", priceRetail: 26.95, priceB2B: 22.70, image: null },
  { id: "2", name: "Bols Cocktail Experience", category: "Attraction", city: "Amsterdam", supplier: "Combitiq", priceRetail: 19.50, priceB2B: 15.85, image: null },
  { id: "3", name: "Moco Museum", category: "Museum", city: "Amsterdam", supplier: "Combitiq", priceRetail: 21.95, priceB2B: 17.95, image: null },
  { id: "4", name: "Fabrique des Lumières", category: "Museum", city: "Amsterdam", supplier: "Combitiq", priceRetail: 18.00, priceB2B: 16.20, image: null },
  { id: "5", name: "Museum Villa", category: "Museum", city: "Amsterdam", supplier: "Combitiq", priceRetail: 18.00, priceB2B: 16.25, image: null },
  { id: "6", name: "Hard Rock Cafe Amsterdam", category: "Restaurant", city: "Amsterdam", supplier: "Combitiq", priceRetail: 37.95, priceB2B: 29.50, image: null },
  { id: "7", name: "Nxt Museum", category: "Museum", city: "Amsterdam", supplier: "Combitiq", priceRetail: 22.50, priceB2B: 18.50, image: null },
  { id: "8", name: "The Upside Down", category: "Attraction", city: "Amsterdam", supplier: "Combitiq", priceRetail: 25.95, priceB2B: 18.95, image: null },
  { id: "9", name: "Belgian Beer World", category: "Attraction", city: "Brussels", supplier: "Combitiq", priceRetail: 21.50, priceB2B: 17.50, image: null },
];

const categoryFilters = ["All", "Museum", "Attraction", "Restaurant"];
const cityFilters = ["All", "Amsterdam", "Brussels"];

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All");

  const filtered = products.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (city !== "All" && p.city !== city) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Catalog</h1>
        <p className="mt-1 text-sm text-muted">Browse available venues and add them to your itinerary or booking.</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search venues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-64 rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
        />

        <div className="flex gap-1.5">
          {categoryFilters.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                category === c
                  ? "bg-foreground text-white"
                  : "bg-white border border-border text-muted hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {cityFilters.map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                city === c
                  ? "bg-accent text-white"
                  : "bg-white border border-border text-muted hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <div key={product.id} className="group overflow-hidden rounded-2xl border border-border/60 bg-white transition-all hover:border-border hover:shadow-lg hover:shadow-black/[0.03]">
            {/* Image placeholder */}
            <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="flex h-full items-center justify-center text-xs text-muted/40">
                Photo placeholder
              </div>
            </div>

            <div className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">{product.category}</span>
                <span className="text-xs text-muted">{product.city}</span>
              </div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="mt-1 text-xs text-muted">via {product.supplier}</p>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted line-through">&euro; {product.priceRetail.toFixed(2)}</p>
                  <p className="text-lg font-bold text-accent">&euro; {product.priceB2B.toFixed(2)}</p>
                  <p className="text-xs text-muted">B2B price p.p.</p>
                </div>
                <button className="rounded-xl bg-foreground px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-gray-800">
                  Add to Booking
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
          <p className="text-sm text-muted">No venues found matching your filters.</p>
        </div>
      )}
    </>
  );
}
