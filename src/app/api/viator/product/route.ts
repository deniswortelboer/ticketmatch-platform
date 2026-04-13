import { NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/lib/viator";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const lang = searchParams.get("lang") || "en";

    if (!code) {
      return NextResponse.json({ error: "Product code is required" }, { status: 400 });
    }

    const product = await getProduct(code, lang);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Product unavailable" }, { status: 502 });
  }
}
