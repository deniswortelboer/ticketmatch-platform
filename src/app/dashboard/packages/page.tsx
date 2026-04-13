"use client";

import { useState, useEffect } from "react";
import { NL_CITIES } from "@/lib/cities";

type PackageItem = {
  venue_name: string;
  venue_category: string;
  unit_price: number;
  notes: string;
};

type Package = {
  id: string;
  name: string;
  description: string | null;
  city: string;
  items: PackageItem[];
  total_price: number;
  discount_pct: number;
  status: string;
  created_at: string;
};

const VENUE_CATEGORIES = [
  { id: "museum", label: "Museum", icon: "🏛️" },
  { id: "cruise", label: "Cruise / Boat", icon: "🚢" },
  { id: "experience", label: "Experience", icon: "🎯" },
  { id: "outdoor", label: "Outdoor", icon: "🌳" },
  { id: "food", label: "Food & Drink", icon: "🍽️" },
  { id: "tour", label: "Tour", icon: "🏮" },
  { id: "transport", label: "Transport", icon: "🚌" },
  { id: "hotel", label: "Hotel / Stay", icon: "🏨" },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    active: "bg-green-50 text-green-600",
    archived: "bg-red-50 text-red-500",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);
  const [saving, setSaving] = useState(false);

  // Builder form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Amsterdam");
  const [discountPct, setDiscountPct] = useState(10);
  const [items, setItems] = useState<PackageItem[]>([]);
  const [status, setStatus] = useState("draft");

  // New item form
  const [newVenue, setNewVenue] = useState("");
  const [newCategory, setNewCategory] = useState("experience");
  const [newPrice, setNewPrice] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const fetchPackages = () => {
    setLoading(true);
    fetch("/api/packages")
      .then((r) => r.json())
      .then((d) => setPackages(d.packages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPackages(); }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCity("Amsterdam");
    setDiscountPct(10);
    setItems([]);
    setStatus("draft");
    setEditingPkg(null);
    setNewVenue("");
    setNewCategory("experience");
    setNewPrice("");
    setNewNotes("");
  };

  const openBuilder = (pkg?: Package) => {
    if (pkg) {
      setEditingPkg(pkg);
      setName(pkg.name);
      setDescription(pkg.description || "");
      setCity(pkg.city);
      setDiscountPct(pkg.discount_pct);
      setItems(pkg.items || []);
      setStatus(pkg.status);
    } else {
      resetForm();
    }
    setShowBuilder(true);
  };

  const addItem = () => {
    if (!newVenue || !newPrice) return;
    setItems([...items, {
      venue_name: newVenue,
      venue_category: newCategory,
      unit_price: parseFloat(newPrice),
      notes: newNotes,
    }]);
    setNewVenue("");
    setNewPrice("");
    setNewNotes("");
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const n = [...items];
    const j = idx + dir;
    if (j < 0 || j >= n.length) return;
    [n[idx], n[j]] = [n[j], n[idx]];
    setItems(n);
  };

  const subtotal = items.reduce((s, i) => s + i.unit_price, 0);
  const discountAmount = subtotal * (discountPct / 100);
  const totalPrice = subtotal - discountAmount;

  const savePackage = async () => {
    if (!name || items.length === 0) return;
    setSaving(true);
    try {
      await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingPkg?.id || undefined,
          name,
          description,
          city,
          items,
          total_price: totalPrice,
          discount_pct: discountPct,
          status,
        }),
      });
      setShowBuilder(false);
      resetForm();
      fetchPackages();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const deletePackage = async (id: string) => {
    await fetch(`/api/packages?id=${id}`, { method: "DELETE" });
    fetchPackages();
  };

  const duplicatePackage = (pkg: Package) => {
    openBuilder({
      ...pkg,
      id: "", // new
      name: `${pkg.name} (copy)`,
      status: "draft",
    } as Package);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Packages</h1>
              <p className="text-orange-100 text-sm">Build bundle deals for your groups — combine venues, tours & experiences</p>
            </div>
          </div>
          <button onClick={() => openBuilder()}
            className="rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm">
            + New Package
          </button>
        </div>
      </div>

      {/* Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-8 px-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl mb-8">
            {/* Builder Header */}
            <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold">{editingPkg?.id ? "Edit Package" : "Create Package"}</h2>
                <p className="text-xs text-muted">Add venues and set pricing for your bundle</p>
              </div>
              <button onClick={() => { setShowBuilder(false); resetForm(); }}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Package info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Package name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amsterdam Culture Day"
                    className="h-10 w-full rounded-lg border border-border/60 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">City</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border/60 px-3 text-sm outline-none focus:border-blue-500">
                    {NL_CITIES.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what makes this package special..."
                  rows={2}
                  className="w-full rounded-lg border border-border/60 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold">Package items ({items.length})</label>
                </div>

                {items.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {items.map((item, idx) => {
                      const cat = VENUE_CATEGORIES.find((c) => c.id === item.venue_category);
                      return (
                        <div key={idx} className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                          <span className="text-lg">{cat?.icon || "📍"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.venue_name}</p>
                            <p className="text-[10px] text-muted">{cat?.label || item.venue_category}{item.notes ? ` — ${item.notes}` : ""}</p>
                          </div>
                          <p className="text-sm font-bold text-green-600 shrink-0">€{item.unit_price.toFixed(2)}</p>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button onClick={() => moveItem(idx, -1)} className="rounded p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-200">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>
                            </button>
                            <button onClick={() => moveItem(idx, 1)} className="rounded p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-200">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                            </button>
                            <button onClick={() => removeItem(idx)} className="rounded p-1 text-gray-300 hover:text-red-500 hover:bg-red-50">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add item form */}
                <div className="rounded-xl border-2 border-dashed border-border/40 p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted">Add venue to package</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input type="text" value={newVenue} onChange={(e) => setNewVenue(e.target.value)}
                      placeholder="Venue name *"
                      className="h-9 rounded-lg border border-border/60 px-3 text-sm outline-none focus:border-blue-500" />
                    <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                      className="h-9 rounded-lg border border-border/60 px-3 text-sm outline-none focus:border-blue-500">
                      {VENUE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[120px_1fr_auto]">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                      <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="Price"
                        className="h-9 w-full rounded-lg border border-border/60 pl-7 pr-3 text-sm outline-none focus:border-blue-500" />
                    </div>
                    <input type="text" value={newNotes} onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Notes (optional)"
                      className="h-9 rounded-lg border border-border/60 px-3 text-sm outline-none focus:border-blue-500" />
                    <button onClick={addItem} disabled={!newVenue || !newPrice}
                      className="h-9 rounded-lg bg-blue-500 px-4 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-40 transition-colors">
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold">Pricing</p>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted">Bundle discount</label>
                    <div className="relative">
                      <input type="number" value={discountPct} onChange={(e) => setDiscountPct(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                        className="h-8 w-16 rounded-lg border border-border/60 px-2 pr-6 text-sm text-right outline-none focus:border-amber-500" />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Subtotal ({items.length} items)</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  {discountPct > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span>Bundle discount ({discountPct}%)</span>
                      <span>-€{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-amber-200 pt-1.5 flex justify-between font-bold text-lg">
                    <span>Package price</span>
                    <span className="text-green-600">€{totalPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-muted">Per person price. Multiply by group size for total.</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-gray-500">Status:</label>
                <div className="flex gap-2">
                  {["draft", "active", "archived"].map((s) => (
                    <button key={s} onClick={() => setStatus(s)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        status === s
                          ? s === "active" ? "bg-green-500 text-white" : s === "archived" ? "bg-red-500 text-white" : "bg-gray-700 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border/30 px-6 py-4">
              <button onClick={() => { setShowBuilder(false); resetForm(); }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={savePackage} disabled={saving || !name || items.length === 0}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 transition-all shadow-md shadow-amber-500/20">
                {saving ? "Saving..." : editingPkg?.id ? "Update Package" : "Create Package"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            <p className="text-sm text-muted mt-3">Loading packages...</p>
          </div>
        </div>
      ) : packages.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border/40 bg-white p-12 text-center">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="text-lg font-semibold mb-1">No packages yet</h3>
          <p className="text-sm text-muted mb-4">Create your first bundle deal — combine museums, tours, food & more into one attractive package for your groups.</p>
          <button onClick={() => openBuilder()}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-500/20">
            + Create your first package
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => {
            const pkgItems = (pkg.items || []) as PackageItem[];
            return (
              <div key={pkg.id} className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 border-b border-border/20">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold truncate">{pkg.name}</h3>
                    <StatusBadge status={pkg.status} />
                  </div>
                  <p className="text-[10px] text-muted">📍 {pkg.city} · {pkgItems.length} items · Created {new Date(pkg.created_at).toLocaleDateString("nl-NL")}</p>
                </div>

                {/* Items Preview */}
                <div className="px-5 py-3">
                  {pkg.description && <p className="text-xs text-muted mb-3 line-clamp-2">{pkg.description}</p>}
                  <div className="space-y-1.5">
                    {pkgItems.slice(0, 4).map((item, idx) => {
                      const cat = VENUE_CATEGORIES.find((c) => c.id === item.venue_category);
                      return (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span>{cat?.icon || "📍"}</span>
                          <span className="flex-1 truncate text-gray-600">{item.venue_name}</span>
                          <span className="font-medium text-gray-500">€{item.unit_price.toFixed(0)}</span>
                        </div>
                      );
                    })}
                    {pkgItems.length > 4 && (
                      <p className="text-[10px] text-muted">+{pkgItems.length - 4} more items</p>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t border-border/20 px-5 py-3 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      {pkg.discount_pct > 0 && (
                        <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded">-{pkg.discount_pct}% bundle deal</span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">€{(pkg.total_price || 0).toFixed(2)}</p>
                      <p className="text-[9px] text-muted">per person</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-border/20 px-5 py-3 flex items-center gap-2">
                  <button onClick={() => openBuilder(pkg)}
                    className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => duplicatePackage(pkg)}
                    className="flex-1 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                    Duplicate
                  </button>
                  <button onClick={() => deletePackage(pkg.id)}
                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-100 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add new card */}
          <button onClick={() => openBuilder()}
            className="rounded-2xl border-2 border-dashed border-border/40 bg-white p-8 text-center hover:border-amber-300 hover:bg-amber-50/30 transition-all group">
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📦</div>
            <p className="text-sm font-semibold text-muted group-hover:text-amber-600">+ New Package</p>
          </button>
        </div>
      )}

      {/* Info footer */}
      <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
          <span className="font-semibold">How it works:</span>
          <span>1. Create a package with venues</span>
          <span className="text-gray-300">→</span>
          <span>2. Set bundle discount</span>
          <span className="text-gray-300">→</span>
          <span>3. Activate & sell to groups</span>
          <span className="text-gray-300">→</span>
          <span>4. Book as a bundle</span>
        </div>
      </div>
    </div>
  );
}
