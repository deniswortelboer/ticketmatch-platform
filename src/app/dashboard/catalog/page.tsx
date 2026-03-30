"use client";

import { useState } from "react";

/* ───── Combitiq product data (scraped from combitiq.com) ───── */
const products = [
  { id: "ams-001", name: "AMAZE Amsterdam", category: "Immersive Experience", city: "Amsterdam", supplier: "Combitiq", priceRetail: 26.95, priceB2B: 22.70, duration: "90 min", address: "Elementenstraat 25, 1014 AR Amsterdam", website: "https://www.amaze-amsterdam.nl", description: "3,000m² playground of light, sound, and emotion", includes: ["Full immersive audiovisual experience", "Accessible venue"] },
  { id: "ams-002", name: "Moco Museum", category: "Museum", city: "Amsterdam", supplier: "Combitiq", priceRetail: 21.95, priceB2B: 17.95, duration: "120 min", address: "Honthorststraat 20, 1071 DE Amsterdam", website: "https://mocomuseum.com", description: "Contemporary art from Banksy, Basquiat, and Kusama", includes: ["Museum entry", "All exhibitions"] },
  { id: "ams-003", name: "Fabrique des Lumières", category: "Immersive Experience", city: "Amsterdam", supplier: "Combitiq", priceRetail: 18.00, priceB2B: 16.20, duration: "120 min", address: "Pazzanistraat 37, 1014 DB Amsterdam", website: "https://www.fabrique-lumieres.com", description: "Immersive audiovisual spectacle in a striking industrial setting", includes: ["Full immersive experience", "All exhibitions"] },
  { id: "ams-004", name: "Bols Cocktail Experience", category: "Interactive Experience", city: "Amsterdam", supplier: "Combitiq", priceRetail: 19.50, priceB2B: 15.85, duration: "90 min", address: "Paulus Potterstraat 14, 1071 CZ Amsterdam", website: "https://bols.com/experience", description: "World's oldest distilled spirits brand — interactive exhibits and cocktail crafting", includes: ["Scent tastings", "Personalized cocktail", "Audio guide (8 languages)", "Mirror Bar service"] },
  { id: "ams-005", name: "Museum Villa", category: "Museum", city: "Amsterdam", supplier: "Combitiq", priceRetail: 18.00, priceB2B: 16.25, duration: "90 min", address: "Haarlemmerweg 4, 1014 BE Amsterdam", website: "https://www.museumvilla.com", description: "Contemporary art in a playful way — suitable for families", includes: ["Museum admission", "Audio tour", "Kids treasure hunt"] },
  { id: "ams-006", name: "Hard Rock Cafe Amsterdam", category: "Restaurant", city: "Amsterdam", supplier: "Combitiq", priceRetail: 37.95, priceB2B: 29.50, duration: "90-120 min", address: "Max Euweplein 57-61, 1017 MA Amsterdam", website: "https://cafe.hardrock.com/amsterdam/", description: "Live music, iconic rock memorabilia, and American cuisine", includes: ["Dining experience", "Live music"] },
  { id: "ams-007", name: "Nxt Museum", category: "Museum", city: "Amsterdam", supplier: "Combitiq", priceRetail: 22.50, priceB2B: 18.50, duration: "90 min", address: "Asterweg 22, 1031 HP Amsterdam", website: "https://nxtmuseum.com", description: "Cutting-edge digital art blending technology and creativity", includes: ["Museum entry", "All immersive installations"] },
  { id: "ams-008", name: "The Upside Down", category: "Attraction", city: "Amsterdam", supplier: "Combitiq", priceRetail: 25.95, priceB2B: 18.95, duration: "90 min", address: "Europaboulevard 5, 1079 PC Amsterdam", website: "https://the-upsidedown.com/nl", description: "Gravity-defying illusions and mind-bending installations", includes: ["Full access", "Printed welcome picture", "Digital photo downloads"] },
  { id: "bru-001", name: "Belgian Beer World", category: "Interactive Experience", city: "Brussels", supplier: "Combitiq", priceRetail: 21.50, priceB2B: 17.50, duration: "90 min", address: "Anspachlaan 80, 1000 Brussel", website: "https://www.belgianbeerworld.be", description: "Centuries of Belgian brewing tradition with tastings", includes: ["Museum entry", "Free rooftop bar drink", "Beer tastings", "Archaeological site access"] },
];

const categoryFilters = ["All", "Museum", "Immersive Experience", "Interactive Experience", "Attraction", "Restaurant"];
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
            <div className="p-5">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">{product.category}</span>
                <span className="text-xs text-muted">{product.city}</span>
                <span className="text-xs text-muted">{product.duration}</span>
              </div>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{product.description}</p>
              <p className="mt-2 text-xs text-muted/70">{product.address}</p>

              {product.includes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {product.includes.map((inc) => (
                    <span key={inc} className="rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-muted">{inc}</span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-end justify-between border-t border-border/40 pt-4">
                <div>
                  <p className="text-xs text-muted line-through">&euro; {product.priceRetail.toFixed(2)}</p>
                  <p className="text-lg font-bold text-accent">&euro; {product.priceB2B.toFixed(2)}</p>
                  <p className="text-xs text-muted">B2B price p.p. via {product.supplier}</p>
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
