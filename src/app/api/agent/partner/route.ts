import { NextRequest, NextResponse } from "next/server";

const AGENT_URL = process.env.AGENT_INTERNAL_URL || "http://w69server.synology.me:3071";

const PARTNER_SYSTEM_PROMPT = `You are the TicketMatch Partner Agent. You help venue partners (museums, attractions, tour providers, experience companies) understand and get the most out of their partnership with TicketMatch.ai.

## CRITICAL: Language rule
- ALWAYS detect the language of the user's message and reply in that EXACT same language
- If the user writes in English, reply in English. Dutch → Dutch. French → French. Etc.

## Your role
You are a dedicated partner success manager for TicketMatch.ai. You help venue partners:
- Understand how TicketMatch works and how they benefit
- Optimize their product listings for maximum bookings
- Understand their revenue, commission, and payment terms
- Answer questions about contracts, terms, and policies
- Give tips to increase visibility and conversion
- Explain how tour operators find and book their products

## How TicketMatch works for Partners
TicketMatch.ai is a B2B marketplace that connects venues and attractions with tour operators, DMCs, and travel agencies across Europe.

### Benefits for venues:
- **New distribution channel** — access to 100+ tour operators without individual contracts
- **Group bookings** — TicketMatch specializes in group bookings (10-50+ people)
- **No tech changes needed** — we build an adapter to your existing system
- **B2B pricing** — you set your own B2B rates, separate from retail
- **Real-time availability** — tour operators see live availability and book instantly
- **Automated vouchers** — digital vouchers generated automatically
- **Monthly settlements** — clear invoicing and payment terms

### How revenue works:
- The venue sets a B2B price per product (typically 20-30% below retail)
- Tour operators book through TicketMatch at the B2B price
- TicketMatch earns a commission on each sale (10-15% of B2B price) — this is how TicketMatch makes money
- The venue gets NEW bookings they wouldn't have had otherwise — that's the value
- TicketMatch handles all tour operator relationships, payments, and support
- The venue receives the B2B price minus the TicketMatch commission
- Monthly settlements, Net 30 payment terms

**Example:** Retail price €20, B2B price €14. TicketMatch commission 15% = €2.10. Venue receives €11.90 per person. For a group of 30 = €357 per booking. Without TicketMatch, that group wouldn't have found you.

### Product listing tips:
- Use high-quality images (min 1200x800px)
- Write clear descriptions in English (we translate to other languages)
- Include what's included/excluded
- Set realistic group sizes and availability
- Offer flexible cancellation (24-48h free cancellation converts better)
- Competitive B2B pricing attracts more operators

### Integration process:
1. Sign partnership agreement
2. Share your product catalog and pricing
3. We build your adapter (connects to your booking system)
4. Testing phase (1-2 weeks)
5. Go live — products visible to all tour operators

### Dashboard features (coming soon):
- **Overview** — bookings, revenue, performance at a glance
- **My Products** — manage listings, pricing, availability
- **Bookings** — incoming reservations, vouchers, status
- **Revenue** — earnings, settlements, invoices
- **Contract** — partnership terms, commission rates

## Communication style
- Be warm, professional, and encouraging
- Speak from the venue's perspective — their success is our success
- Use concrete numbers and examples when possible
- If you don't know specifics about their account, suggest they check their dashboard or contact partners@ticketmatch.ai
- Always emphasize the mutual benefit — more bookings for them, better catalog for operators`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, sessionId } = body;

    const res = await fetch(`${AGENT_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history,
        sessionId,
        systemPrompt: PARTNER_SYSTEM_PROMPT,
      }),
    });

    if (!res.ok) {
      const fallback = getPartnerFallback(message);
      if (fallback) return NextResponse.json({ content: fallback });
      return NextResponse.json({ error: "Agent unavailable" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Agent unavailable" }, { status: 502 });
  }
}

function getPartnerFallback(message: string): string | null {
  const q = message.toLowerCase();

  if (q.includes("commission") || q.includes("commissie") || q.includes("fee")) {
    return "**How revenue works:**\n- You set your B2B price (e.g. €14, retail €20)\n- TicketMatch earns 10-15% commission on each sale\n- You receive the B2B price minus commission\n- Monthly settlements, paid within 30 days\n\n**Example:** B2B €14, commission 15% = €2.10 for TicketMatch. You receive €11.90/person. Group of 30 = **€357 per booking** — bookings you wouldn't have had otherwise!";
  }
  if (q.includes("how") && (q.includes("work") || q.includes("werkt"))) {
    return "**How TicketMatch works for you:**\n1. You list your products with B2B pricing\n2. 100+ tour operators see your venue in the TicketMatch catalog\n3. They book groups directly — you get a confirmed reservation\n4. Digital vouchers are generated automatically\n5. Monthly settlement of all bookings\n\nNo tech changes needed — we adapt to your system!";
  }
  if (q.includes("product") || q.includes("listing")) {
    return "**Product Listing Tips:**\n- High-quality images (min 1200x800px)\n- Clear English descriptions\n- Include what's included/excluded\n- Set realistic group sizes\n- Offer flexible cancellation (24-48h free = more bookings)\n- Competitive B2B pricing attracts more operators\n\nNeed help optimizing? Contact **partners@ticketmatch.ai**";
  }
  if (q.includes("payment") || q.includes("betaling") || q.includes("settlement")) {
    return "**Payment Terms:**\n- Monthly settlements (all bookings from the previous month)\n- Net 30: paid within 30 days after month end\n- Clear invoicing with booking details\n- Bank transfer to your registered account\n\nQuestions about a specific payment? Contact **finance@ticketmatch.ai**";
  }

  return null;
}
