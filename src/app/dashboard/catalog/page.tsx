"use client";

import { useEffect, useState } from "react";

/* ───── Combitiq product data (scraped from combitiq.com) ───── */
const products = [
  { id: "ams-001", name: "AMAZE Amsterdam", category: "Immersive Experience", city: "Amsterdam", supplier: "Combitiq", priceRetail: 26.95, priceB2B: 22.70, duration: "90 min", address: "Elementenstraat 25, 1014 AR Amsterdam", description: "3,000m² playground of light, sound, and emotion", includes: ["Full immersive audiovisual experience", "Accessible venue"], image: "https://cdn.prod.website-files.com/6690fa96f0b41bbabcfbee64/68e50425db84cd19c37464bf_Business_events_AMAZE.jpg" },
  { id: "ams-002", name: "Moco Museum", category: "Museum", city: "Amsterdam", supplier: "Combitiq", priceRetail: 21.95, priceB2B: 17.95, duration: "120 min", address: "Honthorststraat 20, 1071 DE Amsterdam", description: "Contemporary art from Banksy, Basquiat, and Kusama", includes: ["Museum entry", "All exhibitions"], image: "https://app.thefeedfactory.nl/api/assets/65436991ff0fb235ff2e1b37/StudioIrma_DiamondMatrix.webp" },
  { id: "ams-003", name: "Fabrique des Lumières", category: "Immersive Experience", city: "Amsterdam", supplier: "Combitiq", priceRetail: 18.00, priceB2B: 16.20, duration: "120 min", address: "Pazzanistraat 37, 1014 DB Amsterdam", description: "Immersive audiovisual spectacle in a striking industrial setting", includes: ["Full immersive experience", "All exhibitions"], image: "https://www.fabrique-lumieres.com/sites/default/files/styles/380x380/public/2025-08/immersive_experience_monet_bridge.jpg.webp" },
  { id: "ams-004", name: "Bols Cocktail Experience", category: "Interactive Experience", city: "Amsterdam", supplier: "Combitiq", priceRetail: 19.50, priceB2B: 15.85, duration: "90 min", address: "Paulus Potterstraat 14, 1071 CZ Amsterdam", description: "World's oldest distilled spirits brand — interactive exhibits and cocktail crafting", includes: ["Scent tastings", "Personalized cocktail", "Audio guide (8 languages)", "Mirror Bar service"], image: "https://cdn.instant.so/sites/OApV7uC5OuPOMPwO/assets/bxNgLXuv9lnnY3Ib/bols-dag-213197-nov-28-2022-1-1-1.png?width=1280" },
  { id: "ams-005", name: "Museum Villa", category: "Museum", city: "Amsterdam", supplier: "Combitiq", priceRetail: 18.00, priceB2B: 16.25, duration: "90 min", address: "Haarlemmerweg 4, 1014 BE Amsterdam", description: "Contemporary art in a playful way — suitable for families", includes: ["Museum admission", "Audio tour", "Kids treasure hunt"], image: "https://app.thefeedfactory.nl/api/assets/68d3ed8365d49e00cdd8d27a/VILLA-Ruby_Cruden-4375__2_.webp" },
  { id: "ams-006", name: "Hard Rock Cafe Amsterdam", category: "Restaurant", city: "Amsterdam", supplier: "Combitiq", priceRetail: 37.95, priceB2B: 29.50, duration: "90-120 min", address: "Max Euweplein 57-61, 1017 MA Amsterdam", description: "Live music, iconic rock memorabilia, and American cuisine", includes: ["Dining experience", "Live music"], image: "https://app.thefeedfactory.nl/api/assets/5ff88131de7e8633a4aa65eb/e1f07ea8-bee1-447b-8bdf-6e72c9cc93f5.jpg" },
  { id: "ams-007", name: "Nxt Museum", category: "Museum", city: "Amsterdam", supplier: "Combitiq", priceRetail: 22.50, priceB2B: 18.50, duration: "90 min", address: "Asterweg 22, 1031 HP Amsterdam", description: "Cutting-edge digital art blending technology and creativity", includes: ["Museum entry", "All immersive installations"], image: "https://admin.nxtmuseum.com/content/uploads/2025/02/Nxt-Museum-Still-Processing-opening-028-low-res-–-foto-Maarten-Nauw.jpg" },
  { id: "ams-008", name: "The Upside Down", category: "Attraction", city: "Amsterdam", supplier: "Combitiq", priceRetail: 25.95, priceB2B: 18.95, duration: "90 min", address: "Europaboulevard 5, 1079 PC Amsterdam", description: "Gravity-defying illusions and mind-bending installations", includes: ["Full access", "Printed welcome picture", "Digital photo downloads"], image: "https://cdn.prod.website-files.com/655f4d9de6277e3be83ead95/685d352412a6ca9da6545bf6_TUDA_thanks.avif" },
  { id: "bru-001", name: "Belgian Beer World", category: "Interactive Experience", city: "Brussels", supplier: "Combitiq", priceRetail: 21.50, priceB2B: 17.50, duration: "90 min", address: "Anspachlaan 80, 1000 Brussel", description: "Centuries of Belgian brewing tradition with tastings", includes: ["Museum entry", "Free rooftop bar drink", "Beer tastings", "Archaeological site access"], image: "https://www.brusselsmuseums.be/imager/images/473074/BelgianBeerWorld_Eric-Danhier_376234736_693517219472357_6915659749880456523_n_05f55b4bf2d02f747b37b64fbd394766.jpg" },
];

const categoryFilters = ["All", "Museum", "Immersive Experience", "Interactive Experience", "Attraction", "Restaurant"];
const cityFilters = ["All", "Amsterdam", "Brussels"];

interface Group {
  id: string;
  name: string;
  travel_date: string | null;
  number_of_guests: number;
}

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All");
  const [groups, setGroups] = useState<Group[]>([]);
  const [showModal, setShowModal] = useState<string | null>(null); // product id
  const [selectedGroup, setSelectedGroup] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((d) => setGroups(d.groups || []));
  }, []);

  const filtered = products.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (city !== "All" && p.city !== city) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleBook = async (product: (typeof products)[0]) => {
    if (!selectedGroup) return;
    setBooking(true);

    const group = groups.find((g) => g.id === selectedGroup);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId: selectedGroup,
        venueName: product.name,
        venueCategory: product.category,
        venueCity: product.city,
        scheduledDate: bookingDate || group?.travel_date || null,
        numberOfGuests: group?.number_of_guests || 0,
        unitPrice: product.priceB2B,
        notes: bookingTime ? `Time slot: ${bookingTime}` : null,
      }),
    });

    if (res.ok) {
      setBooked((prev) => [...prev, product.id]);
      setShowModal(null);
      setSelectedGroup("");
      setBookingDate("");
      setBookingTime("");
    }
    setBooking(false);
  };

  const modalProduct = products.find((p) => p.id === showModal);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Catalog</h1>
        <p className="mt-1 text-sm text-muted">Browse available venues and add them to your booking.</p>
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
            <button key={c} onClick={() => setCategory(c)} className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${category === c ? "bg-foreground text-white" : "bg-white border border-border text-muted hover:text-foreground"}`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {cityFilters.map((c) => (
            <button key={c} onClick={() => setCity(c)} className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${city === c ? "bg-accent text-white" : "bg-white border border-border text-muted hover:text-foreground"}`}>{c}</button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <div key={product.id} className="group overflow-hidden rounded-2xl border border-border/60 bg-white transition-all hover:border-border hover:shadow-lg hover:shadow-black/[0.03]">
            <div className="relative h-44 w-full overflow-hidden bg-gray-100">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
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
                {booked.includes(product.id) ? (
                  <span className="rounded-xl bg-green-100 px-4 py-2.5 text-xs font-semibold text-green-700">
                    Added!
                  </span>
                ) : (
                  <button
                    onClick={() => setShowModal(product.id)}
                    className="rounded-xl bg-foreground px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-gray-800"
                  >
                    Add to Booking
                  </button>
                )}
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

      {/* Booking Modal */}
      {showModal && modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Add to Booking</h2>
            <p className="mt-1 text-sm text-muted">
              Book <span className="font-medium text-foreground">{modalProduct.name}</span> for a group.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Select group <span className="text-red-400">*</span>
                </label>
                {groups.length > 0 ? (
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                  >
                    <option value="">Choose a group...</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.number_of_guests} guests)
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
                    You need to create a group first. Go to Groups to create one.
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Time slot</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                  >
                    <option value="">Select time...</option>
                    <option value="09:00">09:00</option>
                    <option value="09:30">09:30</option>
                    <option value="10:00">10:00</option>
                    <option value="10:30">10:30</option>
                    <option value="11:00">11:00</option>
                    <option value="11:30">11:30</option>
                    <option value="12:00">12:00</option>
                    <option value="12:30">12:30</option>
                    <option value="13:00">13:00</option>
                    <option value="13:30">13:30</option>
                    <option value="14:00">14:00</option>
                    <option value="14:30">14:30</option>
                    <option value="15:00">15:00</option>
                    <option value="15:30">15:30</option>
                    <option value="16:00">16:00</option>
                    <option value="16:30">16:30</option>
                    <option value="17:00">17:00</option>
                    <option value="17:30">17:30</option>
                    <option value="18:00">18:00</option>
                    <option value="19:00">19:00</option>
                    <option value="20:00">20:00</option>
                  </select>
                  <p className="mt-1 text-xs text-muted">Live availability via API coming soon</p>
                </div>
              </div>

              {selectedGroup && (
                <div className="rounded-xl bg-accent/5 border border-accent/20 p-4">
                  <p className="text-sm">
                    <span className="font-medium">Price:</span>{" "}
                    {groups.find((g) => g.id === selectedGroup)?.number_of_guests || 0} guests &times; &euro;{modalProduct.priceB2B.toFixed(2)} ={" "}
                    <span className="font-bold text-accent">
                      &euro;{((groups.find((g) => g.id === selectedGroup)?.number_of_guests || 0) * modalProduct.priceB2B).toFixed(2)}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(null)}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted transition-all hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBook(modalProduct)}
                disabled={booking || !selectedGroup}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {booking ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
