/**
 * Parse an ISO 8601 duration string (e.g. "PT30M", "P2D", "PT1H30M") into
 * a human-readable label, preserving the original unit per Musement docs
 * ("PT24H" must render as "24 hours", NOT "1 day").
 *
 * Returns null for unparseable input — caller decides what to render.
 *
 * Pure utility — safe to import from client and server components.
 */
export function formatIso8601Duration(input: string | null | undefined): string | null {
  if (!input) return null;
  const m = input.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!m) return null;
  const days = m[1] ? parseInt(m[1], 10) : 0;
  const hours = m[2] ? parseInt(m[2], 10) : 0;
  const minutes = m[3] ? parseInt(m[3], 10) : 0;
  const seconds = m[4] ? parseInt(m[4], 10) : 0;

  if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
    return "Instant";
  }

  const parts: string[] = [];
  if (days) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  if (hours) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  if (minutes) parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  if (seconds) parts.push(`${seconds} ${seconds === 1 ? "second" : "seconds"}`);
  return parts.join(" ");
}
