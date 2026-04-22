import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { generateInvoicePDF } from "@/lib/pdf-invoice";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function getAuthUser() {
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
  return user;
}

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  // Sequential based on timestamp to ensure uniqueness
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `TM-${year}${month}-${seq}`;
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { groupId } = body;

  if (!groupId) {
    return NextResponse.json({ error: "groupId is required" }, { status: 400 });
  }

  const admin = getAdminClient();

  // Get user's company
  const { data: profile } = await admin
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    return NextResponse.json({ error: "No company found" }, { status: 400 });
  }

  // Fetch group (verify ownership)
  const { data: group, error: groupError } = await admin
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .eq("company_id", profile.company_id)
    .single();

  if (groupError || !group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  // Fetch bookings for this group
  const { data: bookings } = await admin
    .from("bookings")
    .select("*")
    .eq("group_id", groupId)
    .eq("company_id", profile.company_id)
    .order("scheduled_date", { ascending: true });

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ error: "No bookings found for this group" }, { status: 400 });
  }

  // Fetch company info
  const { data: company } = await admin
    .from("companies")
    .select("name, phone, kvk_number, vat_number, message")
    .eq("id", profile.company_id)
    .single();

  // Parse company message JSON for address fields
  let companyMessage: Record<string, string> = {};
  if (company?.message) {
    if (typeof company.message === "string") {
      try {
        companyMessage = JSON.parse(company.message);
      } catch {
        companyMessage = {};
      }
    } else {
      companyMessage = company.message as Record<string, string>;
    }
  }

  const invoiceNumber = generateInvoiceNumber();
  const today = new Date();
  const invoiceDate = today.toISOString().split("T")[0];
  const dueDateObj = new Date(today);
  dueDateObj.setDate(dueDateObj.getDate() + 30);
  const dueDate = dueDateObj.toISOString().split("T")[0];

  // Calculate totals
  const subtotal = bookings.reduce((sum, b) => sum + Number(b.total_price), 0);
  const vatAmount = subtotal * 0.21;
  const grandTotal = subtotal + vatAmount;

  // Create Stripe Checkout Session so customer can pay online.
  // We use a one-time Checkout Session (not Payment Link) because Sessions
  // give us per-invoice metadata routing in the webhook for fulfillment.
  let paymentUrl: string | undefined;
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ticketmatch.ai";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "ideal", "bancontact"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Invoice ${invoiceNumber} — ${group.name}`,
              description: `${bookings.length} booking${bookings.length === 1 ? "" : "s"} · ${group.number_of_guests || ""} guests`,
            },
            // Stripe expects integer amount in smallest currency unit (cents)
            unit_amount: Math.round(grandTotal * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        kind: "ticket_invoice",
        invoiceNumber,
        groupId: group.id,
        companyId: profile.company_id,
        bookingIds: bookings.map((b) => b.id).join(","),
      },
      success_url: `${siteUrl}/pay/success?invoice=${invoiceNumber}`,
      cancel_url: `${siteUrl}/dashboard/bookings?cancelled=${invoiceNumber}`,
    });

    paymentUrl = session.url || undefined;
    console.log(`[invoice ${invoiceNumber}] Stripe checkout session created:`, session.id);
  } catch (err) {
    console.error(`[invoice ${invoiceNumber}] Failed to create Stripe checkout session:`, err);
  }

  // Generate PDF with real payment link
  const pdfBuffer = generateInvoicePDF({
    invoiceNumber,
    invoiceDate,
    dueDate,
    group: {
      id: group.id,
      name: group.name,
      travel_date: group.travel_date,
      number_of_guests: group.number_of_guests,
    },
    bookings: bookings.map((b) => ({
      id: b.id,
      venue_name: b.venue_name,
      venue_category: b.venue_category,
      venue_city: b.venue_city,
      scheduled_date: b.scheduled_date,
      number_of_guests: b.number_of_guests,
      unit_price: b.unit_price,
      total_price: b.total_price,
      status: b.status,
    })),
    company: {
      name: company?.name || "Unknown Company",
      address: companyMessage.address || undefined,
      city: companyMessage.city || undefined,
      country: companyMessage.country || undefined,
      kvk_number: company?.kvk_number || undefined,
      vat_number: company?.vat_number || undefined,
      website: companyMessage.website || undefined,
      phone: company?.phone || undefined,
    },
    paymentUrl,
  });

  const fileName = `invoice-${invoiceNumber}-${group.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.pdf`;

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": String(pdfBuffer.byteLength),
    },
  });
}
