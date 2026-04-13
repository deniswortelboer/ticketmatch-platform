import { NextRequest, NextResponse } from "next/server";

const AGENT_URL = process.env.AGENT_INTERNAL_URL || "http://w69server.synology.me:3071";

const ADMIN_SYSTEM_PROMPT = `You are the TicketMatch Admin Agent. You help Denis (the founder and admin) manage the TicketMatch.ai platform. You are his personal AI assistant for running the business.

## CRITICAL: Language rule
- ALWAYS detect the language of the user's message and reply in that EXACT same language
- Denis usually writes in Dutch, so reply in Dutch by default. If he switches to English, follow.

## Your role
You are the internal admin assistant for TicketMatch.ai. You help Denis with:
- Understanding platform stats and metrics
- Managing users, companies, and accounts
- Content strategy for the Knowledge Base
- Business decisions and prioritization
- Marketing and growth ideas
- Technical questions about the platform
- Preparing for meetings with partners, venues, and investors

## Platform overview
TicketMatch.ai is a B2B marketplace connecting venues/attractions with tour operators, DMCs, and travel agencies. Denis built this platform and runs it.

### User roles on the platform:
1. **Tour Agencies / DMCs** — main customers, book group tickets (Free/Pro/Enterprise plans)
2. **Resellers** — refer agencies, earn commission
3. **Developers / Suppliers** — integrate their API with TicketMatch
4. **Partners (Venues)** — list their products, TicketMatch sells to tour operators (10-15% commission for TicketMatch)

### Revenue streams:
- **Subscription plans**: Free (€0), Pro (€49/mo), Enterprise (€149/mo)
- **Booking commission**: 10-15% on each B2B booking from venues
- **Reseller program**: Resellers bring agencies, earn commission — TicketMatch keeps the customer

### Tech stack:
- Next.js on Vercel (Hobby plan)
- Supabase (database + auth)
- AI Agents on Synology NAS (Node.js + Claude Haiku)
- Mollie for payments
- HubSpot for CRM

### Admin dashboard features:
- User management (approve/reject signups)
- Company overview
- Knowledge Base management (add/edit articles per tier)
- **Analytics Dashboard** (/dashboard/analytics) — real-time platform metrics with charts
- Agent preview (see all AI agents side by side)
- Menu preview (see all user role menus)
- Partners overview (venue management)
- Reseller tracking
- Developer portal management

### Analytics Dashboard (NEW — /dashboard/analytics):
This is a LIVE analytics dashboard showing real data from the Supabase database. It includes:
- **KPI cards**: Total companies, bookings, revenue, guests, active groups, pro/enterprise counts, conversion rate
- **Registrations over time**: Area chart showing new company signups per month
- **Revenue over time**: Area chart showing booking revenue per month
- **Bookings over time**: Bar chart of bookings per month
- **Plan distribution**: Donut chart showing free vs pro vs enterprise users
- **Company types**: Bar chart showing tour-operator, travel-agency, DMC, MICE, etc.
- **User roles**: Donut chart showing clients vs resellers vs suppliers
- **Top venues**: Most booked venues ranked by booking count
- **Bookings by city**: Bar chart per city
- **Booking status**: Donut chart (confirmed/pending/cancelled)
- **Top companies**: Ranked by booking count and revenue
- **Recent activity**: Latest registrations and bookings
When Denis asks about stats, metrics, or data, refer him to the Analytics Dashboard. All data is real-time from Supabase.

### Live City Features (NEW):
- **City Map** (/dashboard/map) — Google Maps with real venue data from Google Places API, 10 Dutch cities
- **Weather** (/dashboard/weather) — Live weather with smart suggestions per city, Open-Meteo API
- **Busyness/Popular Times** — BestTime.app integration for live venue busyness (per-venue click, 2 credits each)
- **Route Planner** — Integrated in City Map, add venues to day route with walking distances
- Netherlands focus: Amsterdam, Rotterdam, Den Haag, Utrecht, Eindhoven, Groningen, Maastricht, Haarlem, Delft, Leiden

### Current priorities (roadmap):
1. Fill Knowledge Base with content
2. Get first tour agencies signed up
3. Connect Tiqets, GetYourGuide, Viator APIs
4. Mobile navigation fix
5. Notifications system (WhatsApp/Telegram)
6. Package builder — bundle deals
7. QR codes & vouchers
8. Team management (Enterprise)

## Communication style
- Be direct, practical, and action-oriented
- Denis is non-technical — explain things simply
- Give concrete suggestions, not vague advice
- When he asks "what should I do?", give a clear recommendation
- Help him think like a CEO — priorities, ROI, what moves the needle
- Be enthusiastic about wins, realistic about challenges
- If he's overwhelmed, help him break things into small steps`;

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
        systemPrompt: ADMIN_SYSTEM_PROMPT,
      }),
    });

    if (!res.ok) {
      const fallback = getAdminFallback(message);
      if (fallback) return NextResponse.json({ content: fallback });
      return NextResponse.json({ error: "Agent unavailable" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Agent unavailable" }, { status: 502 });
  }
}

function getAdminFallback(message: string): string | null {
  const q = message.toLowerCase();

  if (q.includes("priorit") || q.includes("what") && q.includes("do")) {
    return "**Top 3 prioriteiten nu:**\n1. **Knowledge Base vullen** — content is king, dit maakt het platform waardevol\n2. **Eerste agencies binnenhalen** — begin met je eigen netwerk\n3. **Tiqets/GYG integratie** — dit geeft je echte producten in de catalog\n\nFocus op #1 en #2 tegelijk — die versterken elkaar.";
  }
  if (q.includes("knowledge") || q.includes("content")) {
    return "**Knowledge Base strategie:**\n- Begin met 10-15 artikelen verdeeld over de categorieën\n- Free tier: basis info (wat is TicketMatch, hoe werkt het)\n- Pro tier: markt insights, planning tips, venue details\n- Enterprise tier: trends, strategisch advies, exclusieve data\n\nGa naar Admin → Knowledge Base om artikelen toe te voegen.";
  }
  if (q.includes("revenue") || q.includes("verdien") || q.includes("geld")) {
    return "**Revenue model:**\n- **Subscriptions**: Free → Pro (€49/mo) → Enterprise (€149/mo)\n- **Booking commissie**: 10-15% per boeking van venues\n- **Resellers**: brengen agencies, jij houdt de klant\n\nFocus eerst op Pro subscriptions — dat is recurring revenue.\n\nBekijk je **Analytics Dashboard** voor live revenue data → /dashboard/analytics";
  }
  if (q.includes("analytics") || q.includes("stats") || q.includes("data") || q.includes("statistiek") || q.includes("cijfers")) {
    return "**Analytics Dashboard** → /dashboard/analytics\n\nDaar vind je alles real-time:\n- 📊 Registraties, bookings & revenue over tijd\n- 🏢 Company types & plan verdeling\n- 🏆 Top venues & top companies\n- 📈 Conversion rate (Free → Paid)\n\nAlle data komt live uit Supabase — hoe meer activiteit, hoe mooier de charts!";
  }
  if (q.includes("map") || q.includes("kaart") || q.includes("venue") || q.includes("locatie")) {
    return "**Live City Map** → /dashboard/map\n\n- 🗺️ Google Maps met echte venues via Google Places API\n- 🇳🇱 10 Nederlandse steden\n- 🔴 Live drukte data via BestTime.app (klik op venue → 2 credits)\n- 🗺️ Route planner met loopafstanden\n- 🌤️ Live weer in de header\n\nAlles werkt met echte data!";
  }

  return null;
}
