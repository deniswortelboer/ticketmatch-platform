import { NextRequest, NextResponse } from "next/server";
import { holdViatorBooking, type ViatorBookingHoldRequest } from "@/lib/viator";

/**
 * POST /api/viator/book/hold
 *
 * Reserve a Viator slot for ~30 minutes pending payment. The body is the
 * full ViatorBookingHoldRequest shape; the route just validates the
 * critical fields and forwards to the lib helper.
 *
 * Response: ViatorBookingHold (with `mock: true` until VIATOR_TAP_LIVE).
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ViatorBookingHoldRequest>;

    if (!body.productCode || !body.travelDate) {
      return NextResponse.json(
        { error: "productCode and travelDate are required" },
        { status: 400 }
      );
    }
    if (!Array.isArray(body.travellers) || body.travellers.length === 0) {
      return NextResponse.json(
        { error: "At least one traveller is required" },
        { status: 400 }
      );
    }
    if (!body.agentUserRef) {
      return NextResponse.json(
        { error: "agentUserRef is required for commission attribution" },
        { status: 400 }
      );
    }
    if (!body.idempotencyKey) {
      return NextResponse.json(
        { error: "idempotencyKey is required to prevent double-holds" },
        { status: 400 }
      );
    }

    const hold = await holdViatorBooking(body as ViatorBookingHoldRequest);
    if (!hold) {
      return NextResponse.json(
        { error: "Viator hold failed (upstream error or timeout)" },
        { status: 502 }
      );
    }
    return NextResponse.json(hold);
  } catch (err) {
    console.error("Viator hold route error:", err);
    return NextResponse.json(
      { error: "Failed to hold Viator booking" },
      { status: 500 }
    );
  }
}
