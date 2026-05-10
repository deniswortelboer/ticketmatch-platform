import { NextRequest, NextResponse } from "next/server";
import { getViatorBookingStatus } from "@/lib/viator";

/**
 * GET /api/viator/book/status/{ref}
 *
 * Poll a Viator booking's status. Used by the UI when a confirm comes
 * back as AWAITING_SUPPLIER (Viator forwarded the request to the
 * operator) and the voucher isn't ready yet. Same pattern as the
 * Musement order-status polling route.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params;
    if (!ref) {
      return NextResponse.json(
        { error: "Booking ref is required" },
        { status: 400 }
      );
    }

    const status = await getViatorBookingStatus(ref);
    if (!status) {
      return NextResponse.json(
        { error: "Booking not found or upstream error" },
        { status: 404 }
      );
    }
    return NextResponse.json(status);
  } catch (err) {
    console.error("Viator status route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch booking status" },
      { status: 500 }
    );
  }
}
