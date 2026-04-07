"use client";

import { useEffect, useState, useRef } from "react";

interface Group {
  id: string;
  name: string;
  travel_date: string | null;
  number_of_guests: number;
  contact_person: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

interface ParsedPassenger {
  name: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  notes: string | null;
}

interface UploadResult {
  fileName: string;
  suggestedGroupName: string;
  totalPassengers: number;
  detectedColumns: Record<string, string | null>;
  passengers: ParsedPassenger[];
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [notes, setNotes] = useState("");

  // Upload state
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadGroupName, setUploadGroupName] = useState("");
  const [uploadTravelDate, setUploadTravelDate] = useState("");
  const [uploadContactPerson, setUploadContactPerson] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rebook state
  const [showRebookModal, setShowRebookModal] = useState(false);
  const [rebookGroup, setRebookGroup] = useState<Group | null>(null);
  const [rebookName, setRebookName] = useState("");
  const [rebookDate, setRebookDate] = useState("");
  const [rebooking, setRebooking] = useState(false);
  const [rebookSuccess, setRebookSuccess] = useState("");

  const loadGroups = async () => {
    const res = await fetch("/api/groups");
    const data = await res.json();
    setGroups(data.groups || []);
    setLoading(false);
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        travelDate: travelDate || null,
        numberOfGuests: parseInt(numberOfGuests) || 0,
        contactPerson: contactPerson.trim() || null,
        notes: notes.trim() || null,
      }),
    });

    if (res.ok) {
      setName("");
      setTravelDate("");
      setNumberOfGuests("");
      setContactPerson("");
      setNotes("");
      setShowForm(false);
      await loadGroups();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/groups?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setGroups((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const openRebook = (group: Group) => {
    setRebookGroup(group);
    setRebookName(`${group.name} (Rebooked)`);
    setRebookDate("");
    setRebookSuccess("");
    setShowRebookModal(true);
  };

  const handleRebook = async () => {
    if (!rebookGroup) return;
    setRebooking(true);
    try {
      const res = await fetch("/api/groups/rebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: rebookGroup.id,
          newName: rebookName.trim() || undefined,
          newTravelDate: rebookDate || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRebookSuccess(data.message);
        await loadGroups();
        setTimeout(() => {
          setShowRebookModal(false);
          setRebookSuccess("");
        }, 2000);
      }
    } catch (err) {
      console.error("Rebook failed:", err);
    }
    setRebooking(false);
  };

  // File upload handling
  const handleFile = async (file: File) => {
    const validTypes = [".xlsx", ".xls", ".csv", ".docx"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validTypes.includes(ext)) {
      setUploadError("Upload een .xlsx, .xls, .csv of .docx bestand.");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-passengers", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
      } else {
        setUploadResult(data);
        setUploadGroupName(data.suggestedGroupName);
      }
    } catch {
      setUploadError("Upload failed. Try again.");
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleCreateFromUpload = async () => {
    if (!uploadResult || !uploadGroupName.trim()) return;
    setSaving(true);

    // Build passenger list as notes
    const passengerList = uploadResult.passengers
      .map((p, i) => {
        let line = `${i + 1}. ${p.name}`;
        if (p.email) line += ` | ${p.email}`;
        if (p.phone) line += ` | ${p.phone}`;
        if (p.nationality) line += ` | ${p.nationality}`;
        if (p.dateOfBirth) line += ` | DOB: ${p.dateOfBirth}`;
        if (p.notes) line += ` | ${p.notes}`;
        return line;
      })
      .join("\n");

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: uploadGroupName.trim(),
        travelDate: uploadTravelDate || null,
        numberOfGuests: uploadResult.totalPassengers,
        contactPerson: uploadContactPerson.trim() || null,
        notes: `Passenger list (from ${uploadResult.fileName}):\n${passengerList}`,
      }),
    });

    if (res.ok) {
      setUploadResult(null);
      setUploadGroupName("");
      setUploadTravelDate("");
      setUploadContactPerson("");
      await loadGroups();
    }
    setSaving(false);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "No date set";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
          <p className="mt-1 text-sm text-muted">
            Manage your guest lists and group configurations.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setUploadResult(null); }}
          className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-800"
        >
          {showForm ? "Cancel" : "New Group"}
        </button>
      </div>

      {/* Upload Drop Zone — always visible when no upload result */}
      {!uploadResult && !showForm && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`mb-8 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            dragging
              ? "border-accent bg-accent/5 scale-[1.01]"
              : "border-border/60 bg-white hover:border-accent/40 hover:bg-accent/[0.02]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <div className="flex flex-col items-center gap-3">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
              dragging ? "bg-accent/20 text-accent" : "bg-gray-100 text-muted"
            }`}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                <p className="text-sm font-medium text-accent">Reading your file...</p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-semibold">
                    {dragging ? "Drop your file here!" : "Drop your passenger list here"}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Excel, CSV or Word — we automatically read names, emails, phone numbers and more
                  </p>
                </div>
              </>
            )}
          </div>
          {uploadError && (
            <p className="mt-3 text-sm text-red-600">{uploadError}</p>
          )}
        </div>
      )}

      {/* Upload Result — Review & Confirm */}
      {uploadResult && (
        <div className="mb-8 rounded-2xl border border-accent/30 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {uploadResult.totalPassengers} passengers found!
              </h2>
              <p className="text-xs text-muted">
                From: {uploadResult.fileName}
                {uploadResult.detectedColumns.name && (
                  <> &middot; Name column: &quot;{uploadResult.detectedColumns.name}&quot;</>
                )}
                {uploadResult.detectedColumns.email && (
                  <> &middot; Email column: &quot;{uploadResult.detectedColumns.email}&quot;</>
                )}
              </p>
            </div>
          </div>

          {/* Group details form */}
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Group name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={uploadGroupName}
                onChange={(e) => setUploadGroupName(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Travel date</label>
              <input
                type="date"
                value={uploadTravelDate}
                onChange={(e) => setUploadTravelDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Contact person</label>
              <input
                type="text"
                value={uploadContactPerson}
                onChange={(e) => setUploadContactPerson(e.target.value)}
                placeholder="e.g. Tour guide name"
                className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
          </div>

          {/* Passenger preview */}
          <div className="mb-5 max-h-64 overflow-y-auto rounded-xl border border-border/40 bg-gray-50/50">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-100/90 backdrop-blur">
                <tr className="text-left text-xs font-medium uppercase tracking-wider text-muted">
                  <th className="px-4 py-2.5 w-8">#</th>
                  <th className="px-4 py-2.5">Name</th>
                  {uploadResult.detectedColumns.email && <th className="px-4 py-2.5 hidden sm:table-cell">Email</th>}
                  {uploadResult.detectedColumns.phone && <th className="px-4 py-2.5 hidden sm:table-cell">Phone</th>}
                  {uploadResult.detectedColumns.nationality && <th className="px-4 py-2.5 hidden md:table-cell">Nationality</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {uploadResult.passengers.map((p, i) => (
                  <tr key={i} className="hover:bg-white/60">
                    <td className="px-4 py-2 text-muted">{i + 1}</td>
                    <td className="px-4 py-2 font-medium">{p.name}</td>
                    {uploadResult.detectedColumns.email && <td className="px-4 py-2 text-muted hidden sm:table-cell">{p.email || "—"}</td>}
                    {uploadResult.detectedColumns.phone && <td className="px-4 py-2 text-muted hidden sm:table-cell">{p.phone || "—"}</td>}
                    {uploadResult.detectedColumns.nationality && <td className="px-4 py-2 text-muted hidden md:table-cell">{p.nationality || "—"}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setUploadResult(null)}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFromUpload}
              disabled={saving || !uploadGroupName.trim()}
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-40"
            >
              {saving ? "Creating..." : `Create Group with ${uploadResult.totalPassengers} passengers`}
            </button>
          </div>
        </div>
      )}

      {/* New Group Form */}
      {showForm && (
        <div className="mb-8 rounded-2xl border border-border/60 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">Create a new group</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium">
                Group name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Singapore Seniors — Amsterdam June 2026"
                className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Travel date
              </label>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Number of guests
              </label>
              <input
                type="number"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(e.target.value)}
                placeholder="e.g. 28"
                min="1"
                className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Contact person on-site
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Mei Lin Wong"
                className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 4 wheelchair users, Chinese-speaking guide needed"
                className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCreate}
              disabled={saving || !name.trim()}
              className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create Group"}
            </button>
          </div>
        </div>
      )}

      {/* Groups list */}
      {groups.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Your groups ({groups.length})
          </h2>
          {groups.map((group) => (
            <div
              key={group.id}
              className="rounded-2xl border border-border/60 bg-white p-6 transition-all hover:shadow-lg hover:shadow-black/[0.03]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold">{group.name}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[group.status] || statusColors.draft}`}
                    >
                      {group.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
                      </svg>
                      {formatDate(group.travel_date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      {group.number_of_guests} guests
                    </span>
                    {group.contact_person && (
                      <span className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                        {group.contact_person}
                      </span>
                    )}
                  </div>
                  {group.notes && (
                    <p className="mt-2 text-sm text-muted/80 whitespace-pre-line line-clamp-3">{group.notes}</p>
                  )}
                </div>
                <div className="ml-4 flex items-center gap-1">
                  <button
                    onClick={() => openRebook(group)}
                    className="rounded-lg p-2 text-muted hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    title="Rebook this trip"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(group.id)}
                    className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete group"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <h2 className="mb-4 text-lg font-semibold">Your groups</h2>
          <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
            <p className="text-sm text-muted">No groups created yet.</p>
            <p className="mt-1 text-xs text-muted/60">
              Drop an Excel file above or click &quot;New Group&quot; to get started.
            </p>
          </div>
        </>
      )}
      {/* Rebook Modal */}
      {showRebookModal && rebookGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !rebooking && setShowRebookModal(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {rebookSuccess ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-center text-sm font-medium text-green-700">{rebookSuccess}</p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Rebook Trip</h3>
                    <p className="text-sm text-muted">Duplicate &quot;{rebookGroup.name}&quot; with all activities</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-blue-50 p-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="text-xs text-blue-500 font-medium">Original trip</p>
                        <p className="font-semibold text-blue-900">{rebookGroup.name}</p>
                      </div>
                      <div className="text-blue-300">→</div>
                      <div>
                        <p className="text-xs text-blue-500 font-medium">Guests</p>
                        <p className="font-semibold text-blue-900">{rebookGroup.number_of_guests}</p>
                      </div>
                      <div className="text-blue-300">→</div>
                      <div>
                        <p className="text-xs text-blue-500 font-medium">Date</p>
                        <p className="font-semibold text-blue-900">{formatDate(rebookGroup.travel_date)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">New group name</label>
                    <input
                      type="text"
                      value={rebookName}
                      onChange={(e) => setRebookName(e.target.value)}
                      className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">New travel date</label>
                    <input
                      type="date"
                      value={rebookDate}
                      onChange={(e) => setRebookDate(e.target.value)}
                      className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                    />
                    <p className="mt-1 text-xs text-muted">All activity dates will shift automatically to match the new travel date.</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={() => setShowRebookModal(false)}
                    className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRebook}
                    disabled={rebooking}
                    className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {rebooking ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Rebooking...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 4 23 10 17 10" />
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        Rebook Trip
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
