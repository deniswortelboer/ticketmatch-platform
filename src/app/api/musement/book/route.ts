import { NextRequest, NextResponse } from "next/server";
import { createCart, addToCart, setCartCustomer, confirmOrder } from "@/lib/musement";

/**
 * Musement Booking Route - Merchant of Record
 *
 * Flow:
 * 1. Create cart
 * 2. Add activity item to cart
 * 3. Set customer info
 * 4. Confirm order -> receive E-tickets
 *
 * Payment is handled by TicketMatch (via Stripe) BEFORE calling this route.
 * This route sends the Reservation Notification to Musement.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      activityUuid,
      dateId,
      quantity,
      customer,
      language = "en",
    } = body;

    // Validate required fields
    if (!activityUuid || !dateId || !quantity || !customer) {
      return NextResponse.json(
        { error: "activityUuid, dateId, quantity, and customer are required" },
        { status: 400 }
      );
    }

    if (!customer.firstName || !customer.lastName || !customer.email) {
      return NextResponse.json(
        { error: "customer.firstName, customer.lastName, and customer.email are required" },
        { status: 400 }
      );
    }

    // Step 1: Create cart
    const cartUuid = await createCart(language);
    if (!cartUuid) {
      return NextResponse.json(
        { error: "Failed to create Musement cart" },
        { status: 502 }
      );
    }

    // Step 2: Add item to cart
    const added = await addToCart(cartUuid, activityUuid, dateId, quantity, language);
    if (!added) {
      return NextResponse.json(
        { error: "Failed to add activity to cart" },
        { status: 502 }
      );
    }

    // Step 3: Set customer info
    const customerSet = await setCartCustomer(cartUuid, customer, language);
    if (!customerSet) {
      return NextResponse.json(
        { error: "Failed to set customer information" },
        { status: 502 }
      );
    }

    // Step 4: Confirm order (sends Reservation Notification to Musement)
    const order = await confirmOrder(cartUuid, language);
    if (!order) {
      return NextResponse.json(
        { error: "Failed to confirm Musement order" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error("Musement booking route error:", err);
    return NextResponse.json(
      { error: "Failed to complete Musement booking" },
      { status: 502 }
    );
  }
}
