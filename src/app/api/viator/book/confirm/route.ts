import { NextRequest, NextResponse } from "next/server";
import { confirmViatorBooking, type ViatorBookingConfirmRequest } from "@/lib/viator";

/**
 * POST /api/viator/book/confirm
 *
 * Confirm a previously-held booking after the customer has completed
 * payment via Viator's embedded widget. Body must include the holdRef
 * issued by /api/viator/book/hold and the paymentToken Viator returned
 * to our payment-success callback.
 *
 * Response: ViatorBookingConfirmed with voucher URL + commission info.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ViatorBookingConfirmRequest>;

    if (!body.holdRef) {
      return NextResponse.json(
        { error: "holdRef is required" },
        { status: 400 }
      );
    }

    const confirmed = await confirmViatorBooking(body as ViatorBookingConfirmRequest);
    if (!confirmed) {
      return NextResponse.json(
        { error: "Viator confirm failed (upstream error or timeout)" },
        { status: 502 }
      );
    }
    return NextResponse.json(confirmed);
  } catch (err) {
    console.error("Viator confirm route error:", err);
    return NextResponse.json(
      { error: "Failed to confirm Viator booking" },
      { status: 500 }
    );
  }
}
