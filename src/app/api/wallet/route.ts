import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import crypto from "crypto";

// ════════════════════════════════════════════════════════════
// Google Wallet API — 3 pass types:
// 1. Booking Voucher (genericObject) — activity ticket with QR
// 2. Membership Card (genericObject) — subscription proof
// 3. Event Ticket (eventTicketObject) — per-guest ticket
// ════════════════════════════════════════════════════════════

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ticketmatch.ai";

function getCredentials() {
  return {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(
      /\\n/g,
      "\n"
    ),
  };
}

function getAuth() {
  const creds = getCredentials();
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: creds.client_email,
      private_key: creds.private_key,
    },
    scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
  });
}

// ── Generate "Add to Google Wallet" URL via JWT ──
// Uses Node crypto to sign RS256 JWT — no extra dependency needed
function createWalletJwt(walletPayload: Record<string, unknown>): string {
  const creds = getCredentials();

  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: creds.client_email,
    aud: "google",
    origins: [SITE_URL],
    typ: "savetowallet",
    iat: now,
    payload: walletPayload,
  };

  const encode = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const headerB64 = encode(header);
  const claimsB64 = encode(claims);
  const signingInput = `${headerB64}.${claimsB64}`;

  const signature = crypto
    .createSign("RSA-SHA256")
    .update(signingInput)
    .sign(creds.private_key, "base64url");

  const token = `${signingInput}.${signature}`;
  return `https://pay.google.com/gp/v/save/${token}`;
}

// ════════════════════════════════════════════════════════════
// PASS TYPE 1: Booking Voucher
// ════════════════════════════════════════════════════════════
function buildBookingVoucher(data: {
  bookingId: string;
  venueName: string;
  venueCity: string;
  date: string;
  time: string;
  guests: number;
  voucherCode: string;
  qrValue: string;
}) {
  const classId = `${ISSUER_ID}.TM_BOOKING_VOUCHER`;
  const objectId = `${ISSUER_ID}.voucher_${data.bookingId.replace(/-/g, "")}`;

  const classPayload = {
    id: classId,
    cardTitle: { defaultValue: { language: "en", value: "TicketMatch Booking" } },
    header: { defaultValue: { language: "en", value: "Booking Voucher" } },
    logo: {
      sourceUri: { uri: `${SITE_URL}/icon-192.png` },
      contentDescription: { defaultValue: { language: "en", value: "TicketMatch" } },
    },
    hexBackgroundColor: "#1e3a5f",
    classTemplateInfo: {
      cardTemplateOverride: {
        cardRowTemplateInfos: [
          {
            twoItems: {
              startItem: {
                firstValue: { fields: [{ fieldPath: "object.textModulesData['date']" }] },
              },
              endItem: {
                firstValue: { fields: [{ fieldPath: "object.textModulesData['guests']" }] },
              },
            },
          },
          {
            twoItems: {
              startItem: {
                firstValue: { fields: [{ fieldPath: "object.textModulesData['time']" }] },
              },
              endItem: {
                firstValue: { fields: [{ fieldPath: "object.textModulesData['voucher']" }] },
              },
            },
          },
        ],
      },
    },
  };

  const objectPayload = {
    id: objectId,
    classId,
    state: "ACTIVE",
    cardTitle: { defaultValue: { language: "en", value: "TicketMatch Booking" } },
    header: { defaultValue: { language: "en", value: data.venueName } },
    subheader: { defaultValue: { language: "en", value: data.venueCity } },
    logo: {
      sourceUri: { uri: `${SITE_URL}/icon-192.png` },
      contentDescription: { defaultValue: { language: "en", value: "TicketMatch" } },
    },
    hexBackgroundColor: "#1e3a5f",
    textModulesData: [
      { id: "date", header: "DATE", body: data.date },
      { id: "guests", header: "GUESTS", body: `${data.guests} people` },
      { id: "time", header: "TIME", body: data.time },
      { id: "voucher", header: "VOUCHER", body: data.voucherCode },
    ],
    barcode: {
      type: "QR_CODE",
      value: data.qrValue,
      alternateText: data.voucherCode,
    },
  };

  return { classPayload, objectPayload, classId, objectId };
}

// ════════════════════════════════════════════════════════════
// PASS TYPE 2: Membership Card
// ════════════════════════════════════════════════════════════
function buildMembershipCard(data: {
  memberId: string;
  memberName: string;
  companyName: string;
  plan: string;
  memberSince: string;
  validUntil: string;
}) {
  const classId = `${ISSUER_ID}.TM_MEMBERSHIP`;
  const objectId = `${ISSUER_ID}.member_${data.memberId.replace(/[^a-zA-Z0-9_]/g, "")}`;

  const classPayload = {
    id: classId,
    cardTitle: { defaultValue: { language: "en", value: "TicketMatch Membership" } },
    header: { defaultValue: { language: "en", value: "Membership Card" } },
    logo: {
      sourceUri: { uri: `${SITE_URL}/icon-192.png` },
      contentDescription: { defaultValue: { language: "en", value: "TicketMatch" } },
    },
    hexBackgroundColor: "#7c3aed",
    classTemplateInfo: {
      cardTemplateOverride: {
        cardRowTemplateInfos: [
          {
            twoItems: {
              startItem: {
                firstValue: { fields: [{ fieldPath: "object.textModulesData['plan']" }] },
              },
              endItem: {
                firstValue: { fields: [{ fieldPath: "object.textModulesData['valid_until']" }] },
              },
            },
          },
          {
            twoItems: {
              startItem: {
                firstValue: { fields: [{ fieldPath: "object.textModulesData['member_since']" }] },
              },
              endItem: {
                firstValue: { fields: [{ fieldPath: "object.textModulesData['member_id']" }] },
              },
            },
          },
        ],
      },
    },
  };

  const objectPayload = {
    id: objectId,
    classId,
    state: "ACTIVE",
    cardTitle: { defaultValue: { language: "en", value: "TicketMatch Membership" } },
    header: { defaultValue: { language: "en", value: data.memberName } },
    subheader: { defaultValue: { language: "en", value: data.companyName } },
    logo: {
      sourceUri: { uri: `${SITE_URL}/icon-192.png` },
      contentDescription: { defaultValue: { language: "en", value: "TicketMatch" } },
    },
    hexBackgroundColor: "#7c3aed",
    textModulesData: [
      { id: "plan", header: "PLAN", body: data.plan },
      { id: "valid_until", header: "VALID UNTIL", body: data.validUntil },
      { id: "member_since", header: "MEMBER SINCE", body: data.memberSince },
      { id: "member_id", header: "MEMBER ID", body: data.memberId },
    ],
    barcode: {
      type: "QR_CODE",
      value: `${SITE_URL}/member/${data.memberId}`,
      alternateText: data.memberId,
    },
  };

  return { classPayload, objectPayload, classId, objectId };
}

// ════════════════════════════════════════════════════════════
// PASS TYPE 3: Event Ticket (per-guest)
// ════════════════════════════════════════════════════════════
function buildEventTicket(data: {
  ticketId: string;
  eventName: string;
  eventCity: string;
  date: string;
  time: string;
  guestNumber: number;
  totalGuests: number;
  tourOperator: string;
  location: string;
  seat: string;
}) {
  const classId = `${ISSUER_ID}.TM_EVENT_TICKET`;
  const objectId = `${ISSUER_ID}.ticket_${data.ticketId.replace(/[^a-zA-Z0-9_]/g, "")}`;

  const classPayload = {
    id: classId,
    issuerName: "TicketMatch",
    eventName: { defaultValue: { language: "en", value: data.eventName } },
    venue: {
      name: { defaultValue: { language: "en", value: data.location } },
      address: { defaultValue: { language: "en", value: data.eventCity } },
    },
    reviewStatus: "UNDER_REVIEW",
    logo: {
      sourceUri: { uri: `${SITE_URL}/icon-192.png` },
      contentDescription: { defaultValue: { language: "en", value: "TicketMatch" } },
    },
    hexBackgroundColor: "#059669",
  };

  const objectPayload = {
    id: objectId,
    classId,
    state: "ACTIVE",
    ticketHolderName: `Guest ${data.guestNumber} of ${data.totalGuests}`,
    ticketNumber: data.ticketId,
    textModulesData: [
      { id: "date", header: "DATE", body: data.date },
      { id: "time", header: "TIME", body: data.time },
      { id: "location", header: "BOARDING", body: data.location },
      { id: "seat", header: "SEAT", body: data.seat },
      { id: "operator", header: "OPERATOR", body: data.tourOperator },
    ],
    barcode: {
      type: "QR_CODE",
      value: `${SITE_URL}/ticket/${data.ticketId}`,
      alternateText: data.ticketId,
    },
  };

  return { classPayload, objectPayload, classId, objectId };
}

// ════════════════════════════════════════════════════════════
// API ROUTES
// ════════════════════════════════════════════════════════════

// POST: Create a wallet pass and return the "Add to Google Wallet" URL
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ISSUER_ID) {
    return NextResponse.json(
      { error: "GOOGLE_WALLET_ISSUER_ID not configured" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { type, data } = body as { type: string; data: Record<string, unknown> };

  if (!type || !data) {
    return NextResponse.json(
      { error: "Missing type or data in request body" },
      { status: 400 }
    );
  }

  try {
    let result;

    switch (type) {
      case "voucher":
        result = buildBookingVoucher(data as Parameters<typeof buildBookingVoucher>[0]);
        break;
      case "membership":
        result = buildMembershipCard(data as Parameters<typeof buildMembershipCard>[0]);
        break;
      case "ticket":
        result = buildEventTicket(data as Parameters<typeof buildEventTicket>[0]);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown pass type: ${type}. Use: voucher, membership, ticket` },
          { status: 400 }
        );
    }

    // Try to create the class via API (ignore 409 = already exists)
    const auth = getAuth();
    const client = await auth.getClient();
    const tokenRes = await client.getAccessToken();
    const token = tokenRes.token!;

    const isEventTicket = type === "ticket";
    const classEndpoint = isEventTicket
      ? "https://walletobjects.googleapis.com/walletobjects/v1/eventTicketClass"
      : "https://walletobjects.googleapis.com/walletobjects/v1/genericClass";

    // Create class (template)
    const classRes = await fetch(classEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(result.classPayload),
    });

    const classStatus = classRes.status;
    if (classStatus !== 200 && classStatus !== 409) {
      const classError = await classRes.json().catch(() => ({}));
      console.error("Wallet class creation failed:", classStatus, classError);
      // Continue anyway — class might exist from a previous call
    }

    // Generate "Add to Google Wallet" JWT link
    const jwtPayload = isEventTicket
      ? { eventTicketClasses: [result.classPayload], eventTicketObjects: [result.objectPayload] }
      : { genericClasses: [result.classPayload], genericObjects: [result.objectPayload] };

    const saveUrl = createWalletJwt(jwtPayload);

    return NextResponse.json({
      success: true,
      type,
      classId: result.classId,
      objectId: result.objectId,
      saveUrl,
      classCreated: classStatus === 200,
      classAlreadyExisted: classStatus === 409,
    });
  } catch (err) {
    console.error("Wallet pass creation error:", err);
    return NextResponse.json(
      { error: "Failed to create wallet pass", details: String(err) },
      { status: 500 }
    );
  }
}

// GET: Health check + info
export async function GET() {
  return NextResponse.json({
    service: "TicketMatch Google Wallet API",
    passTypes: ["voucher", "membership", "ticket"],
    issuerId: ISSUER_ID || "NOT_CONFIGURED",
    configured: !!ISSUER_ID && !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    usage: {
      method: "POST",
      headers: { "x-api-key": "your-service-role-key" },
      body: {
        type: "voucher | membership | ticket",
        data: "{ ... pass-specific fields }",
      },
    },
  });
}
