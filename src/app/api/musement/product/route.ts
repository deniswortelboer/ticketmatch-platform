import { NextRequest, NextResponse } from "next/server";
import { getActivity } from "@/lib/musement";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get("uuid");
  const language = searchParams.get("lang") || "en";
  const currency = searchParams.get("currency") || "EUR";

  if (!uuid) {
    return NextResponse.json(
      { error: "Activity UUID is required" },
      { status: 400 }
    );
  }

  try {
    const product = await getActivity(uuid, language, currency);

    if (!product) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error("Musement product route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Musement activity" },
      { status: 502 }
    );
  }
}
