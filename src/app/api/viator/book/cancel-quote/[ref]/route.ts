import { NextRequest, NextResponse } from "next/server";
import { getViatorCancelQuote } from "@/lib/viator";

/**
 * POST /api/viator/book/cancel-quote/{ref}
 *
 * Estimate a refund without actually cancelling. Used by the UI to show
 * the customer/reseller exactly how much they'll get back BEFORE they
 * confirm the cancellation. If past the free-cancellation window, the
 * quote will indicate refundable=false.
 */
export async function POST(
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

    const quote = await getViatorCancelQuote(ref);
    if (!quote) {
      return NextResponse.json(
        { error: "Cancel quote unavailable (booking not found or upstream error)" },
        { status: 404 }
      );
    }
    return NextResponse.json(quote);
  } catch (err) {
    console.error("Viator cancel-quote route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch cancel quote" },
      { status: 500 }
    );
  }
}
