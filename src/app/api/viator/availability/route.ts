import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/lib/viator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productCode, startDate, endDate, currency } = body;

    if (!productCode || !startDate || !endDate) {
      return NextResponse.json(
        { error: "productCode, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const availability = await getAvailability(
      productCode,
      startDate,
      endDate,
      currency || "EUR"
    );

    return NextResponse.json(availability);
  } catch {
    return NextResponse.json({ error: "Availability unavailable" }, { status: 502 });
  }
}
