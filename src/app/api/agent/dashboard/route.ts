import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const AGENT_URL = process.env.AGENT_INTERNAL_URL || "http://w69server.synology.me:3071";

// Service role client for knowledge base access (no cookies needed)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Tier hierarchy: enterprise sees all, pro sees free+pro, free sees only free
const TIER_ACCESS: Record<string, string[]> = {
  free: ["free"],
  pro: ["free", "pro"],
  enterprise: ["free", "pro", "enterprise"],
};

async function getKnowledgeForTier(userPlan: string): Promise<string> {
  try {
    const supabase = getSupabaseAdmin();
    const allowedTiers = TIER_ACCESS[userPlan] || TIER_ACCESS.free;

    const { data, error } = await supabase
      .from("knowledge_base")
      .select("title, content, category, tier")
      .eq("active", true)
      .in("tier", allowedTiers)
      .order("category")
      .order("tier");

    if (error || !data || data.length === 0) return "";

    const sections = data.map(
      (entry) => `### ${entry.title} [${entry.category}/${entry.tier}]\n${entry.content}`
    );

    return `\n\n## Knowledge Base (use this to answer questions)\n${sections.join("\n\n")}`;
  } catch {
    return "";
  }
}

const DASHBOARD_SYSTEM_PROMPT = `You are the TicketMatch Dashboard Assistant. You help logged-in users navigate and use the TicketMatch platform.

## CRITICAL: Language rule
- ALWAYS detect the language of the user's message and reply in that EXACT same language
- If the user writes in English, reply in English. Dutch → Dutch. French → French. Etc.
- NEVER default to any language — always mirror the user's language
- You speak every language fluently

## Your role
- Help users with platform questions: how to book, create groups, build itineraries, share links, generate invoices
- Be friendly, concise and knowledgeable
- You are their personal travel planning assistant inside the platform
- You have deep knowledge of venues and experiences worldwide — be specific and helpful
- You CAN show B2B prices to logged-in users (they have access)
- Always use markdown links for navigation: e.g. [Catalog](/dashboard/catalog), [Groups](/dashboard/groups), [Plans](/dashboard/pricing)

## Platform navigation
- **[Catalog](/dashboard/catalog)** — Browse and book venues
- **[Bookings](/dashboard/bookings)** — View and manage your bookings
- **[Groups](/dashboard/groups)** — Create groups, upload passenger lists
- **[Itinerary](/dashboard/itinerary)** — Day-by-day view, share links, export PDF, generate invoices
- **[Plans](/dashboard/pricing)** — View and upgrade your plan
- **[Settings](/dashboard/settings)** — Account settings

## How to book
1. Go to [Catalog](/dashboard/catalog), browse venues
2. Click "Book" on a venue, select your group and date
3. Booking appears in [Bookings](/dashboard/bookings)
4. Build an itinerary in [Itinerary](/dashboard/itinerary)
5. Share via link or export as PDF

## Groups
- Create manually or upload Excel/CSV with passenger details
- Each group has: name, date, number of guests, contact person
- Groups can be rebooked (duplicated with new dates)

## Itinerary
- Day-by-day view of all booked activities
- Can be shared via a public link (great for sending to clients)
- PDF export includes all details + pricing
- Invoice generation with VAT calculation

## Plans & Features
- **Free**: 3 bookings/month, basic catalog, 1 user, email support, limited AI assistance
- **Pro** (€49/month): Unlimited bookings, full catalog, PDF invoices, shareable links, priority support, unlimited AI venue tips & planning advice, market insights
- **Enterprise** (€149/month): Everything in Pro + team management (5 users), API access, dedicated account manager, full market data & trend analysis

## CRITICAL: Tiered AI access (the "give them a taste" model)

### If user plan is "free":
- Platform questions (how to book, groups, itinerary, settings): ALWAYS answer fully, no limits
- Venue recommendations & planning tips: Give a helpful but SHORT answer (2-3 sentences), then add: "Want more detailed recommendations and full planning advice? [Upgrade to Pro](/dashboard/pricing) for unlimited AI assistance"
- Market insights, trends, competitor info: Say "This is available with [Pro](/dashboard/pricing) — upgrade to unlock full AI-powered planning and market insights"
- The goal: give them enough value that they WANT more — make Pro irresistible

### If user plan is "pro":
- Full answers on everything: venue tips, planning strategies, itinerary advice, market insights
- Be detailed and strategic — they're paying customers
- For enterprise-level features (team management, API, bulk analytics): mention "Available with [Enterprise](/dashboard/pricing)"

### If user plan is "enterprise":
- Full access to everything — strategic advisory tone
- Proactive suggestions, market trends, competitor analysis
- Treat them as VIP partners

## Knowledge Base
- You have access to a curated knowledge base below with venue tips, planning advice, and market insights
- Use this information to give specific, valuable answers
- For free users: reference knowledge base info but keep answers short with upgrade prompts for deeper detail
- For pro/enterprise: use full knowledge base to give detailed, expert answers
- Always present knowledge naturally — never say "according to the knowledge base"`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, sessionId, userPlan, userName } = body;

    // Fetch knowledge base entries for this user's tier
    const plan = userPlan || "free";
    const knowledge = await getKnowledgeForTier(plan);

    // Build context-aware prompt with knowledge base
    const systemContext = `${DASHBOARD_SYSTEM_PROMPT}${knowledge}\n\nCurrent user: ${userName || "Unknown"}\nUser plan: ${plan}`;

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
      // Fallback: answer common questions locally if agent is down
      const fallback = getFallbackAnswer(message);
      if (fallback) {
        return NextResponse.json({ content: fallback });
      }
      return NextResponse.json({ error: "Agent unavailable" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    const body = await Promise.resolve(null);
    return NextResponse.json(
      { error: "Agent unavailable" },
      { status: 502 }
    );
  }
}

function getFallbackAnswer(message: string): string | null {
  const q = message.toLowerCase();

  if (q.includes("how") && q.includes("book")) {
    return "To book a venue:\n1. Go to **Catalog** in the sidebar\n2. Browse venues and click **Book**\n3. Select your group and preferred date\n4. Your booking appears in **Bookings**\n\nNeed help with anything else?";
  }
  if (q.includes("group")) {
    return "To create a group:\n1. Go to **Groups** in the sidebar\n2. Click **Create Group**\n3. Fill in name, date, number of guests\n4. You can also upload a passenger list (Excel/CSV)\n\nGroups can be rebooked with new dates using the Rebook button.";
  }
  if (q.includes("itinerary") || q.includes("share")) {
    return "Your itinerary is built automatically from your bookings:\n1. Go to **Itinerary** in the sidebar\n2. See your activities organized by day\n3. Click **Share** to generate a public link\n4. Click **Export PDF** for a printable version\n5. Click **Generate Invoice** for billing";
  }
  if (q.includes("pro") || q.includes("upgrade") || q.includes("plan") || q.includes("pricing")) {
    return "**Plans:**\n- **Free**: 3 bookings/month, basic catalog\n- **Pro** (€49/mo): Unlimited bookings, PDF invoices, shareable links, priority support\n- **Enterprise** (€149/mo): Everything + team management, API access\n\nGo to **Plans** in the sidebar to upgrade.";
  }
  if (q.includes("invoice")) {
    return "To generate an invoice:\n1. Go to **Bookings**\n2. Click **Generate Invoice**\n3. Select the group\n4. Download the PDF with VAT calculation\n\nThis feature is available on Pro and Enterprise plans.";
  }

  return null;
}
