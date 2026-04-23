import { NextRequest, NextResponse } from "next/server";
import { cancelOrderItem } from "@/lib/musement";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, itemId, reason, language = "en" } = body;

    if (!orderId || !itemId) {
      return NextResponse.json(
        { error: "orderId and itemId are required" },
        { status: 400 }
      );
    }

    const success = await cancelOrderItem(orderId, itemId, reason, language);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to cancel order item. It may be non-refundable or already cancelled." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Musement cancel route error:", err);
    return NextResponse.json(
      { error: "Failed to process cancellation" },
      { status: 502 }
    );
  }
}
