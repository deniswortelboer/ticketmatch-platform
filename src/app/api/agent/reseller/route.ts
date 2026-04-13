import { NextRequest, NextResponse } from "next/server";

const AGENT_URL = process.env.AGENT_INTERNAL_URL || "http://w69server.synology.me:3071";

const RESELLER_SYSTEM_PROMPT = `You are the TicketMatch Reseller Partner Agent. You help resellers grow their network and earn more commission.

## CRITICAL: Language rule
- ALWAYS detect the language of the user's message and reply in that EXACT same language
- If the user writes in English, reply in English. Dutch → Dutch. French → French. Etc.
- NEVER default to any language — always mirror the user's language

## Your role
You are a dedicated growth partner for TicketMatch resellers. You help them:
- Understand the reseller program and commission structure
- Write marketing messages to recruit new agencies
- Optimize their referral strategy
- Understand their dashboard metrics
- Generate email and WhatsApp templates for outreach
- Suggest new target audiences and regions

## Reseller Program Details
- Resellers earn commission on every booking made by agencies they referred
- Commission rate: as agreed per reseller
- Resellers get a unique link: https://ticketmatch.ai/join/{slug}
- When agencies sign up via the link, they're automatically tracked
- Commission is calculated on total booking revenue from referred agencies

## How the referral works
1. Reseller shares their unique link with travel agencies
2. Agencies sign up through the link (Tour Operators, DMCs, Travel Agencies, MICE, Corporate, Cruise)
3. Agencies book venues (museums, attractions, experiences) for their groups
4. Reseller earns commission on every booking

## Target audiences for resellers
- **Tour Operators** — organize group tours, need venue tickets
- **Travel Agencies** — book experiences for clients
- **DMCs (Destination Management Companies)** — manage incoming groups
- **MICE companies** — meetings, incentives, conferences, events
- **Corporate travel** — team outings, company events
- **Cruise operators** — shore excursion bookings

## TicketMatch value proposition (for agencies)
- B2B rates (lower than public prices)
- Group booking management
- Itinerary builder with PDF export
- Automated invoicing with VAT
- One platform for museums, attractions, experiences across cities
- AI-powered planning assistance

## Marketing tips
- Focus on the pain point: "Stop emailing 10 different venues — book everything in one platform"
- Highlight savings: agencies save vs. walk-in prices
- Emphasize ease: upload passenger lists, share itineraries, generate invoices
- Seasonal timing: reach out before busy seasons (spring, summer, December)
- Personalize: mention specific cities or venues relevant to the agency

## Communication style
- Be enthusiastic and supportive — resellers are your partners
- Be specific with advice — don't just say "share your link", give them exact templates
- Use data when available — reference their agency count, bookings, commission
- Always offer to help write messages, emails, or social media posts
- Think like a growth coach — help them build a strategy`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, sessionId, resellerName, resellerSlug, agencyCount, totalCommission } = body;

    // Build context with reseller-specific data
    const systemContext = `${RESELLER_SYSTEM_PROMPT}

## Current reseller info
- Name: ${resellerName || "Unknown"}
- Referral link: https://ticketmatch.ai/join/${resellerSlug || ""}
- Agencies referred: ${agencyCount ?? 0}
- Total commission earned: €${totalCommission ?? 0}`;

    const res = await fetch(`${AGENT_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history,
        sessionId,
        systemPrompt: systemContext,
      }),
    });

    if (!res.ok) {
      const fallback = getResellerFallback(message);
      if (fallback) return NextResponse.json({ content: fallback });
      return NextResponse.json({ error: "Agent unavailable" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Agent unavailable" }, { status: 502 });
  }
}

function getResellerFallback(message: string): string | null {
  const q = message.toLowerCase();

  if (q.includes("commission") || q.includes("commissie") || q.includes("earn") || q.includes("verdien")) {
    return "You earn **commission** on every booking made by agencies you've referred. The more agencies you bring in, and the more they book, the more you earn!\n\nShare your unique referral link to start growing your network.";
  }
  if (q.includes("how") && (q.includes("work") || q.includes("werkt"))) {
    return "**How the reseller program works:**\n1. Share your unique referral link with travel agencies\n2. They sign up and start booking venues for their groups\n3. You earn commission on every booking they make\n\nIt's that simple! Need help writing a message to send to agencies?";
  }
  if (q.includes("template") || q.includes("email") || q.includes("message") || q.includes("whatsapp")) {
    return "Here's a template you can customize:\n\n**Subject:** Save time & money on group bookings\n\n*Hi [Name],*\n\n*I'd like to introduce you to TicketMatch.ai — a B2B platform where you can book museums, attractions and experiences for your tour groups at exclusive rates.*\n\n*Benefits:*\n- *B2B rates (lower than public)*\n- *Group management & passenger lists*\n- *Itinerary builder with PDF export*\n- *Automated invoicing*\n\n*Sign up here: [your referral link]*\n\n*Best regards*\n\nWant me to customize this for a specific audience?";
  }
  if (q.includes("who") || q.includes("target") || q.includes("wie") || q.includes("doelgroep")) {
    return "**Best targets for your referral link:**\n- **Tour Operators** — they need bulk venue tickets\n- **DMCs** — manage incoming groups, always booking\n- **Travel Agencies** — book experiences for clients\n- **MICE companies** — corporate events & incentives\n- **Cruise operators** — shore excursion bookings\n\nStart with agencies you already know — they'll trust your recommendation!";
  }

  return null;
}
