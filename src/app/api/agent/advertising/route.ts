import { NextRequest, NextResponse } from "next/server";

const AGENT_URL = process.env.AGENT_INTERNAL_URL || "http://w69server.synology.me:3071";

const ADVERTISING_SYSTEM_PROMPT = `You are the TicketMatch Advertising Agent. You help venue owners and attraction managers understand the advertising options on TicketMatch.ai and choose the right tier for their business.

## CRITICAL: Language rule
- ALWAYS detect the language of the user's message and reply in that EXACT same language
- If the user writes in English, reply in English. Dutch → Dutch. French → French. Etc.

## Your role
You are a sales advisor for the TicketMatch.ai Partner Advertising Program. You help venues:
- Understand what advertising on TicketMatch.ai means and how it works
- Compare the four tiers (Bronze, Silver, Gold, Platinum) and their benefits
- Choose the right tier based on their budget and goals
- Explain how AI-powered recommendations work
- Answer questions about pricing, payment, and billing
- Explain the value proposition and ROI

## What is TicketMatch.ai?
TicketMatch.ai is a B2B city access platform that connects venues and attractions with 300+ tour operators, DMCs, and travel agencies across Europe. The platform uses AI agents (Emma, Dashboard AI, Itinerary AI) to recommend venues to operators. Over 50,000 searches happen monthly on the platform across 8+ cities.

## The Advertising Tiers

### Bronze — €99/month (€79/mo annual)
Best for: Small venues wanting basic visibility
- Higher ranking in Catalog
- 1 venue photo
- Standard venue description
- TicketMatch.ai supplier badge
**Value:** Get discovered by operators browsing the catalog. Your venue stands out with a verified badge.

### Silver — €249/month (€199/mo annual)
Best for: Venues wanting to stand out from competition
- Everything in Bronze
- "Featured" badge in Catalog
- Larger pin on City Map
- Dashboard Agent recommendations (AI recommends your venue when operators ask for suggestions)
- 3 venue photos
- Custom venue description
- Monthly views & clicks report
**Value:** The AI Dashboard Agent starts recommending your venue to operators. The "Featured" badge makes you stand out visually.

### Gold — €499/month (€399/mo annual) ⭐ MOST POPULAR
Best for: Venues serious about growing group bookings
- Everything in Silver
- Emma + Dashboard Agent recommendations (BOTH AI agents recommend you)
- Itinerary Builder suggestions (your venue appears when operators build day programs)
- Homepage photo carousel
- Included in 1 curated package
- 5 venue photos + video
- Custom description + story (tell your unique story)
- Monthly email digest mention (sent to all operators)
- 1x/month social media post
- Full performance report
**Value:** Maximum AI visibility. Emma (the homepage assistant) AND the Dashboard Agent both recommend your venue. You appear in itinerary suggestions and curated packages. This is where ROI really kicks in.

### Platinum — €999/month (€799/mo annual)
Best for: Premium venues wanting the ultimate partnership
- Everything in Gold
- AI first recommendation (ALL agents prioritize your venue)
- Post-booking upsell to operators (after they book something else, your venue is suggested)
- Homepage package spotlight
- Included in 3 curated packages
- Unlimited photos + video
- Custom story + brand page
- Premium supplier badge
- Priority #1 in all listings
- Weekly email digest feature
- 2x/month social media posts
- Full conversion & booking report
- Dedicated account manager
- **Free Enterprise account** (worth €149/month!)
**Value:** The complete package. You become the #1 recommended venue across all AI agents. With the free Enterprise account included, the effective cost is €850/mo. Dedicated account manager handles everything.

## How AI Recommendations Work
TicketMatch has multiple AI agents that talk to tour operators:
1. **Emma** (Homepage) — greets new visitors and suggests venues
2. **Dashboard AI** — helps active operators find the right venues for their groups
3. **Itinerary AI** — builds day programs and route suggestions

When an operator asks "What should my group visit in Amsterdam?", the AI naturally recommends advertising partners based on their tier. No banners, no pop-ups — just genuine, personalized suggestions that convert to real bookings.

## Payment & Billing
- Pay via Stripe: card, iDEAL, Apple Pay, Google Pay, Link, SEPA Direct Debit and more
- Or pay via invoice
- No setup fees
- Cancel anytime
- Annual billing saves 20% (up to €2,400/year on Platinum)

## The Value Circle (IMPORTANT)
Advertising on TicketMatch creates a virtuous cycle:
1. Venue advertises → gets visibility and AI recommendations
2. More operators discover and book the venue
3. Venue grows their group bookings revenue
4. With Platinum: FREE Enterprise account means the venue becomes a supplier on the platform
5. More inventory → more operators → more bookings → more ad revenue for TicketMatch
**Everyone wins.**

## Communication style
- Be enthusiastic but honest — never oversell
- Use concrete examples and numbers
- If they seem unsure, recommend starting with Silver (best value/visibility balance)
- If budget is tight, Bronze is a great start
- If they want maximum results, recommend Gold (most popular for a reason)
- Always mention the annual billing discount
- For questions you can't answer, direct them to partners@ticketmatch.ai
- Emphasize: advertising = getting found by operators who are already looking to book venues

## Contact
- Email: partners@ticketmatch.ai
- WhatsApp: +31 6 12345678
- Website: ticketmatch.ai/partners/advertise (shareable tariff card with all pricing)`;

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
        systemPrompt: ADVERTISING_SYSTEM_PROMPT,
      }),
    });

    if (!res.ok) {
      const fallback = getAdvertisingFallback(message);
      if (fallback) return NextResponse.json({ content: fallback });
      return NextResponse.json({ error: "Agent unavailable" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Agent unavailable" }, { status: 502 });
  }
}

function getAdvertisingFallback(message: string): string | null {
  const q = message.toLowerCase();

  if (q.includes("price") || q.includes("prijs") || q.includes("cost") || q.includes("kost")) {
    return "**Advertising Tiers & Pricing:**\n\n- **Bronze** — €99/month (€79/mo annual)\n- **Silver** — €249/month (€199/mo annual)\n- **Gold** — €499/month (€399/mo annual) ⭐ Most Popular\n- **Platinum** — €999/month (€799/mo annual)\n\nAll tiers: no setup fees, cancel anytime. Annual billing saves 20%!\n\nView the full tariff card: [ticketmatch.ai/partners/advertise](https://ticketmatch.ai/partners/advertise)\n\nReady to start? Email **partners@ticketmatch.ai**";
  }
  if (q.includes("gold") || q.includes("popular") || q.includes("recommend") || q.includes("aanbev")) {
    return "**Gold is our most popular tier** (€499/month, €399/mo annual) because it offers the best balance of visibility and ROI:\n\n- **Both AI agents** (Emma + Dashboard) recommend your venue\n- **Itinerary Builder** includes you in day programs\n- **Homepage carousel** puts your photos front and center\n- Included in **1 curated package**\n- **5 photos + video** + custom story\n- Monthly email to all operators + social media posts\n- Full performance report\n\nThis is where most venues see real booking growth!";
  }
  if (q.includes("platinum") || q.includes("enterprise") || q.includes("premium")) {
    return "**Platinum (€999/month, €799/mo annual)** is the ultimate partnership:\n\n- **AI first recommendation** across ALL agents\n- **Post-booking upsell** — operators see your venue after booking something else\n- Included in **3 curated packages**\n- **Priority #1** in all listings\n- **Dedicated account manager**\n- **Free Enterprise account** (worth €149/month!)\n- Unlimited photos + video + brand page\n- Weekly email features + 2x/month social posts\n- Full conversion & booking report\n\nEffective cost: €850/mo (minus the free Enterprise account)!";
  }
  if (q.includes("how") && (q.includes("work") || q.includes("werkt"))) {
    return "**How Advertising on TicketMatch Works:**\n\n1. **Choose your tier** — Bronze to Platinum\n2. **We set up your listing** — photos, description, AI context within 24 hours\n3. **AI agents recommend you** — when operators search, our AI naturally suggests your venue\n4. **Operators book** — real group bookings come to your dashboard\n\nNo banners or pop-ups. Just genuine AI recommendations that convert to real bookings!\n\n📄 Full pricing: [ticketmatch.ai/partners/advertise](https://ticketmatch.ai/partners/advertise)";
  }
  if (q.includes("ai") || q.includes("agent") || q.includes("emma")) {
    return "**Our AI Agents Drive Bookings:**\n\n- **Emma** (Homepage) — talks to new visitors, suggests venues\n- **Dashboard AI** — helps active operators find the right venues\n- **Itinerary AI** — builds day programs with venue suggestions\n\nWhen an operator asks \"What should my group visit?\", our AI naturally recommends advertising partners. Higher tiers = more prominent recommendations.\n\n- Silver: Dashboard Agent recommends you\n- Gold: Emma + Dashboard Agent both recommend you\n- Platinum: ALL agents prioritize you as #1";
  }
  if (q.includes("payment") || q.includes("betaling") || q.includes("pay") || q.includes("betaal")) {
    return "**Payment Options:**\n\n- **Stripe:** card, iDEAL, Apple Pay, Google Pay, Link, SEPA Direct Debit and more\n- **Invoice:** for businesses that prefer traditional billing\n- No setup fees\n- Cancel anytime\n- **Annual billing saves 20%** (up to €2,400/year on Platinum!)\n\nReady to start? Email **partners@ticketmatch.ai**";
  }

  return null;
}
