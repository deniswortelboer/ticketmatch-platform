import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import crypto from "crypto";

// ════════════════════════════════════════════════════════════
// SECURITY: Voucher endpoint
// - Authenticated users can access their own company's vouchers
// - Public access requires a valid HMAC signature token
// - No more open ?public=1 bypass
// - UUID format validation on booking ID
// ════════════════════════════════════════════════════════════

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

// Generate a HMAC token for public voucher access
function generateVoucherToken(bookingId: string): string {
  const secret = process.env.SHARE_SECRET || "tm-share-default-key-2024";
  return crypto.createHmac("sha256", secret).update(`voucher:${bookingId}`).digest("hex").slice(0, 24);
}

// GET: Generate voucher data + QR code for a booking
export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get("id");
  const token = req.nextUrl.searchParams.get("token"); // signed token for public access

  if (!bookingId) {
    return NextResponse.json({ error: "Missing booking ID" }, { status: 400 });
  }

  // Validate UUID format (prevent enumeration with random strings)
  if (!UUID_REGEX.test(bookingId)) {
    return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
  }

  // ── SECURITY: Authentication check ──
  let isAuthorized = false;
  let userCompanyId: string | null = null;

  // Option 1: Valid signed token (for public/venue access)
  if (token) {
    const expectedToken = generateVoucherToken(bookingId);
    if (token === expectedToken) {
      isAuthorized = true;
    }
  }

  // Option 2: Authenticated user (dashboard access)
  if (!isAuthorized) {
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() { return cookieStore.getAll(); },
            setAll(cookiesToSet) {
              try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
            },
          },
        }
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get user's company for ownership check
        const admin = getAdminClient();
        const { data: profile } = await admin
          .from("profiles")
          .select("company_id")
          .eq("id", user.id)
          .single();
        userCompanyId = profile?.company_id || null;
        isAuthorized = true;
      }
    } catch {}
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized — login or provide a valid voucher token" }, { status: 401 });
  }

  const admin = getAdminClient();

  // Fetch booking with relations
  const { data: booking, error } = await admin
    .from("bookings")
    .select("*, groups(name, travel_date, contact_person), companies(name, phone)")
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // If authenticated user (not token), verify they own this booking
  if (userCompanyId && booking.company_id !== userCompanyId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Generate voucher code from booking ID
  const voucherCode = `TM-${bookingId.slice(0, 8).toUpperCase()}`;

  // Generate QR code — the QR URL includes a signed token for venue scanning
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ticketmatch.ai";
  const voucherToken = generateVoucherToken(bookingId);
  const voucherUrl = `${siteUrl}/voucher/${bookingId}?token=${voucherToken}`;
  const qrDataUrl = await QRCode.toDataURL(voucherUrl, {
    width: 200,
    margin: 1,
    color: { dark: "#1a2744", light: "#ffffff" },
  });

  const group = Array.isArray(booking.groups) ? booking.groups[0] : booking.groups;
  const company = Array.isArray(booking.companies) ? booking.companies[0] : booking.companies;

  return NextResponse.json({
    voucher_code: voucherCode,
    qr_code: qrDataUrl,
    qr_url: voucherUrl,
    token: voucherToken,
    booking: {
      id: booking.id,
      venue_name: booking.venue_name,
      venue_category: booking.venue_category,
      venue_city: booking.venue_city,
      scheduled_date: booking.scheduled_date,
      number_of_guests: booking.number_of_guests,
      unit_price: booking.unit_price,
      total_price: booking.total_price,
      status: booking.status,
      notes: booking.notes,
    },
    group: {
      name: group?.name || null,
      travel_date: group?.travel_date || null,
      contact_person: group?.contact_person || null,
    },
    company: {
      name: company?.name || null,
      phone: company?.phone || null,
    },
  });
}
