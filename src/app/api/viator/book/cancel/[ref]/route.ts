import { NextRequest, NextResponse } from "next/server";
import { cancelViatorBooking } from "@/lib/viator";

/**
 * POST /api/viator/book/cancel/{ref}
 *
 * Actually cancel a Viator booking. Returns the refunded amount on
 * success or a `reason` string on failure (past the free-cancellation
 * deadline, supplier already issued the voucher, etc.). The UI should
 * always show the cancel-quote first so the user sees the refund amount
 * BEFORE confirming.
 *
 * Body (optional): { reason?: string } — passed to Viator + logged
 * internally for analytics on why customers cancel.
 */
export async function POST(
  request: NextRequest,
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

    let reason: string | undefined;
    try {
      const body = (await request.json()) as { reason?: string };
      reason = body.reason;
    } catch {
      // Body is optional — empty POST is fine.
    }

    const result = await cancelViatorBooking(ref, reason);
    if (!result.ok) {
      return NextResponse.json(result, { status: 409 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("Viator cancel route error:", err);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
