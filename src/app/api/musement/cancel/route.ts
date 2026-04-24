import { NextRequest, NextResponse } from "next/server";
import { cancelOrderItem } from "@/lib/musement";

// Musement valid cancellation_reason enum (per Partner API v3 docs):
// API-ISSUE, CANCELLED-BY-CUSTOMER, GRACE-PERIOD, MISSING-MEETING-POINT-DETAILS,
// MISSING-PASSENGER-INFO, REJECTED-ORDER, REJECTED-SCHEDULE-CHANGE,
// TECHNICAL-ISSUE, VENUE-CLOSED
const VALID_REASONS = new Set([
  "API-ISSUE",
  "CANCELLED-BY-CUSTOMER",
  "GRACE-PERIOD",
  "MISSING-MEETING-POINT-DETAILS",
  "MISSING-PASSENGER-INFO",
  "REJECTED-ORDER",
  "REJECTED-SCHEDULE-CHANGE",
  "TECHNICAL-ISSUE",
  "VENUE-CLOSED",
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      itemId,
      reason = "CANCELLED-BY-CUSTOMER",
      language = "en",
    } = body;

    if (!orderId || !itemId) {
      return NextResponse.json(
        { error: "orderId and itemId are required" },
        { status: 400 }
      );
    }
    if (!VALID_REASONS.has(reason)) {
      return NextResponse.json(
        { error: `Invalid cancellation_reason. Must be one of: ${[...VALID_REASONS].join(", ")}` },
        { status: 400 }
      );
    }

    const result = await cancelOrderItem(orderId, itemId, reason, language);

    if (!result.ok) {
      const userMsg =
        result.reason === "NO_REFUND_POLICIES"
          ? "This activity has no refund policy and cannot be cancelled — the charge will stand."
          : result.reason === "REFUND_WINDOW_CLOSED"
          ? "The refund window has closed for this booking. Cancellation is no longer possible."
          : `Musement API error: ${result.detail || "unknown"}`;
      return NextResponse.json(
        { error: userMsg, code: result.reason, detail: result.detail },
        { status: result.reason === "API_ERROR" ? 502 : 409 }
      );
    }

    return NextResponse.json({
      success: true,
      refunded: result.refunded,
      policy: result.policy,
    });
  } catch (err) {
    console.error("Musement cancel route error:", err);
    return NextResponse.json(
      { error: "Failed to process cancellation" },
      { status: 502 }
    );
  }
}
