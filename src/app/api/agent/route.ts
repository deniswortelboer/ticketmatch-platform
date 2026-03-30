import { NextRequest, NextResponse } from "next/server";

const AGENT_URL = process.env.AGENT_INTERNAL_URL || "http://w69server.synology.me:3071";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${AGENT_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Agent unavailable" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Agent unavailable" },
      { status: 502 }
    );
  }
}
