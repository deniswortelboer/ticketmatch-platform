import { createHmac } from "crypto";

const SHARE_SECRET = process.env.SHARE_SECRET || "tm-share-default-key-2024";

/**
 * Generate a deterministic, signed share token for a group ID.
 * Format: base64url(groupId) + "." + hmac_signature
 */
export function generateShareToken(groupId: string): string {
  const payload = Buffer.from(groupId, "utf-8").toString("base64url");
  const signature = createHmac("sha256", SHARE_SECRET)
    .update(payload)
    .digest("base64url")
    .slice(0, 16); // shorter for cleaner URLs
  return `${payload}.${signature}`;
}

/**
 * Validate and extract the group ID from a share token.
 * Returns null if the token is invalid.
 */
export function validateShareToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;

  const expectedSignature = createHmac("sha256", SHARE_SECRET)
    .update(payload)
    .digest("base64url")
    .slice(0, 16);

  if (signature !== expectedSignature) return null;

  try {
    return Buffer.from(payload, "base64url").toString("utf-8");
  } catch {
    return null;
  }
}
