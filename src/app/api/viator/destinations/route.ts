import { NextRequest, NextResponse } from "next/server";
import { searchDestinations } from "@/lib/viator";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) {
    return NextResponse.json({ destinations: [] });
  }

  const destinations = await searchDestinations(query);
  return NextResponse.json({ destinations });
}
