import { randomBytes } from "crypto";

/**
 * Generate an opaque, URL-safe access token for a ticket page.
 * 32 chars of base64url ≈ 192 bits of entropy → not brute-forceable.
 * Stored in bookings.access_token; used in /t/[token] URLs.
 */
export function generateTicketToken(): string {
  return randomBytes(24).toString("base64url");
}
