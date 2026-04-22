import { createHmac } from "crypto";

// ═══════════════════════════════════════════════════════════════
// Passenger utilities — parsing + per-passenger access tokens
// ═══════════════════════════════════════════════════════════════

export type Passenger = {
  index: number;
  name: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  notes: string | null;
};

const PASSENGER_SECRET = process.env.SHARE_SECRET || "tm-share-default-key-2024";

/**
 * Parse a passenger list from free-form notes text.
 * Supports the format emitted by TicketMatch's upload parser:
 *
 *   1. Tanaka Yuki | yuki.tanaka@gmail.com | +81 90-1234-5678 | Japanese | Group leader
 *   2. Suzuki Haruto | haruto.s@yahoo.co.jp | +81 80-2345-6789 | Japanese
 *
 * Returns an empty array if nothing matches.
 */
export function parsePassengersFromNotes(notes: string | null | undefined): Passenger[] {
  if (!notes) return [];

  const result: Passenger[] = [];
  // Find numbered rows: "1. Name | email | phone | nationality | notes"
  const rowRegex = /^\s*(\d+)[\.\)]\s*([^\n\r|]+)(?:\s*\|\s*([^\n\r|]*))?(?:\s*\|\s*([^\n\r|]*))?(?:\s*\|\s*([^\n\r|]*))?(?:\s*\|\s*([^\n\r|]*))?/;

  for (const line of notes.split(/\r?\n/)) {
    const m = line.match(rowRegex);
    if (!m) continue;
    const [, idxStr, name, email, phone, nationality, notesCol] = m;
    const idx = Number(idxStr) - 1;
    if (!name?.trim() || Number.isNaN(idx)) continue;
    result.push({
      index: idx,
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      nationality: nationality?.trim() || null,
      notes: notesCol?.trim() || null,
    });
  }

  // Some groups store passengers inline without explicit newlines.
  // Fall back to splitting by numbered markers.
  if (result.length === 0) {
    const inline = notes.split(/(?=\s\d{1,3}\.\s)/g);
    for (const raw of inline) {
      const m = raw.match(rowRegex);
      if (!m) continue;
      const [, idxStr, name, email, phone, nationality, notesCol] = m;
      const idx = Number(idxStr) - 1;
      if (!name?.trim() || Number.isNaN(idx)) continue;
      result.push({
        index: idx,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        nationality: nationality?.trim() || null,
        notes: notesCol?.trim() || null,
      });
    }
  }

  return result.sort((a, b) => a.index - b.index);
}

/**
 * Generate an opaque, signed token that encodes a group_id + passenger index.
 * Format: base64url(groupId.index) + "." + 16-char hmac
 * Verifiable without a DB lookup.
 */
export function generatePassengerToken(groupId: string, passengerIndex: number): string {
  const payload = Buffer.from(`${groupId}.${passengerIndex}`, "utf-8").toString("base64url");
  const sig = createHmac("sha256", PASSENGER_SECRET)
    .update(payload)
    .digest("base64url")
    .slice(0, 16);
  return `${payload}.${sig}`;
}

/**
 * Verify a passenger token and extract { groupId, passengerIndex }. Returns null
 * if signature mismatch or malformed input.
 */
export function verifyPassengerToken(
  token: string
): { groupId: string; passengerIndex: number } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = createHmac("sha256", PASSENGER_SECRET)
    .update(payload)
    .digest("base64url")
    .slice(0, 16);
  if (sig !== expected) return null;
  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf-8");
    const [groupId, idxStr] = decoded.split(".");
    const idx = Number(idxStr);
    if (!groupId || Number.isNaN(idx)) return null;
    return { groupId, passengerIndex: idx };
  } catch {
    return null;
  }
}
