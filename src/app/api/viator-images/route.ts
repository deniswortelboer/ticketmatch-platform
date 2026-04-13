import { NextResponse } from "next/server";
import { getCategoryImages } from "@/lib/viator-images";

/**
 * GET /api/viator-images?categories=museums,tours,attractions,water,food,transport
 * Returns arrays of image URLs per category for client-side sliding display
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cats = (searchParams.get("categories") || "museums,tours,attractions,water,food,transport").split(",");
  const count = Math.min(parseInt(searchParams.get("count") || "4", 10), 8);

  const results: Record<string, string[]> = {};

  await Promise.all(
    cats.map(async (cat) => {
      const images = await getCategoryImages(cat.trim(), "amsterdam", count);
      if (images.length > 0) {
        results[cat.trim()] = images.map((img) => img.url);
      }
    })
  );

  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}
