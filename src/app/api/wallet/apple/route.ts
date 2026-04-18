import { NextRequest, NextResponse } from "next/server";
import { PKPass } from "passkit-generator";
import fs from "fs";
import path from "path";

// ════════════════════════════════════════════════════════════
// Apple Wallet API — 3 pass types:
// 1. Booking Voucher (eventTicket) — activity ticket with QR
// 2. Membership Card (generic) — subscription proof
// 3. Event Ticket (eventTicket) — per-guest ticket
// ════════════════════════════════════════════════════════════

const TEAM_ID = "T5792RB2LA";
const PASS_TYPE_ID = "pass.ai.ticketmatch";

// Certificate paths (relative to project root)
const CERT_DIR = path.join(process.cwd(), "certificates");

function getCertificates() {
  return {
    signerCert: fs.readFileSync(path.join(CERT_DIR, "pass.pem")),
    signerKey: fs.readFileSync(path.join(CERT_DIR, "pass-key.pem")),
    wwdr: fs.readFileSync(path.join(CERT_DIR, "wwdr.pem")),
    signerKeyPassphrase: process.env.APPLE_PASS_KEY_PASSPHRASE || "igtmLN_2025",
  };
}

function getPassImages(): Record<string, Buffer> {
  const modelDir = path.join(CERT_DIR, "pass-model");
  const images: Record<string, Buffer> = {};

  const files = fs.readdirSync(modelDir);
  for (const file of files) {
    if (file.endsWith(".png")) {
      images[file] = fs.readFileSync(path.join(modelDir, file));
    }
  }

  return images;
}

// ════════════════════════════════════════════════════════════
// PASS TYPE 1: Booking Voucher
// ════════════════════════════════════════════════════════════
async function buildBookingVoucher(data: {
  bookingId: string;
  venueName: string;
  venueCity: string;
  date: string;
  time: string;
  guests: number;
  voucherCode: string;
  qrValue: string;
}) {
  const certs = getCertificates();
  const images = getPassImages();

  const pass = new PKPass(
    {},
    {
      signerCert: certs.signerCert,
      signerKey: certs.signerKey,
      wwdr: certs.wwdr,
      signerKeyPassphrase: certs.signerKeyPassphrase,
    },
    {
      formatVersion: 1,
      serialNumber: `voucher-${data.bookingId}`,
      passTypeIdentifier: PASS_TYPE_ID,
      teamIdentifier: TEAM_ID,
      organizationName: "TicketMatch",
      description: `Booking: ${data.venueName}`,
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(30, 58, 95)",
      labelColor: "rgb(148, 163, 184)",
      logoText: "TicketMatch",
    }
  );

  // Add images
  for (const [name, buffer] of Object.entries(images)) {
    pass.addBuffer(name, buffer);
  }

  // Set as eventTicket type
  pass.type = "eventTicket";

  // Primary fields
  pass.primaryFields.push({
    key: "venue",
    label: "VENUE",
    value: data.venueName,
  });

  // Secondary fields
  pass.secondaryFields.push(
    {
      key: "date",
      label: "DATE",
      value: data.date,
    },
    {
      key: "time",
      label: "TIME",
      value: data.time,
    }
  );

  // Auxiliary fields
  pass.auxiliaryFields.push(
    {
      key: "guests",
      label: "GUESTS",
      value: `${data.guests} people`,
    },
    {
      key: "voucher",
      label: "VOUCHER",
      value: data.voucherCode,
    },
    {
      key: "city",
      label: "CITY",
      value: data.venueCity,
    }
  );

  // QR code barcode
  pass.setBarcodes({
    format: "PKBarcodeFormatQR",
    message: data.qrValue,
    messageEncoding: "iso-8859-1",
    altText: data.voucherCode,
  });

  return pass;
}

// ════════════════════════════════════════════════════════════
// PASS TYPE 2: Membership Card
// ════════════════════════════════════════════════════════════
async function buildMembershipCard(data: {
  memberId: string;
  memberName: string;
  companyName: string;
  plan: string;
  memberSince: string;
  validUntil: string;
}) {
  const certs = getCertificates();
  const images = getPassImages();

  const pass = new PKPass(
    {},
    {
      signerCert: certs.signerCert,
      signerKey: certs.signerKey,
      wwdr: certs.wwdr,
      signerKeyPassphrase: certs.signerKeyPassphrase,
    },
    {
      formatVersion: 1,
      serialNumber: `member-${data.memberId}`,
      passTypeIdentifier: PASS_TYPE_ID,
      teamIdentifier: TEAM_ID,
      organizationName: "TicketMatch",
      description: `Membership: ${data.memberName}`,
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(124, 58, 237)",
      labelColor: "rgb(196, 181, 253)",
      logoText: "TicketMatch",
    }
  );

  for (const [name, buffer] of Object.entries(images)) {
    pass.addBuffer(name, buffer);
  }

  pass.type = "generic";

  pass.primaryFields.push({
    key: "member",
    label: "MEMBER",
    value: data.memberName,
  });

  pass.secondaryFields.push(
    {
      key: "plan",
      label: "PLAN",
      value: data.plan,
    },
    {
      key: "company",
      label: "COMPANY",
      value: data.companyName,
    }
  );

  pass.auxiliaryFields.push(
    {
      key: "memberSince",
      label: "MEMBER SINCE",
      value: data.memberSince,
    },
    {
      key: "validUntil",
      label: "VALID UNTIL",
      value: data.validUntil,
    }
  );

  pass.backFields.push({
    key: "memberId",
    label: "MEMBER ID",
    value: data.memberId,
  });

  pass.setBarcodes({
    format: "PKBarcodeFormatQR",
    message: data.memberId,
    messageEncoding: "iso-8859-1",
    altText: data.memberId,
  });

  return pass;
}

// ════════════════════════════════════════════════════════════
// PASS TYPE 3: Event Ticket (per-guest)
// ════════════════════════════════════════════════════════════
async function buildEventTicket(data: {
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
  const certs = getCertificates();
  const images = getPassImages();

  const pass = new PKPass(
    {},
    {
      signerCert: certs.signerCert,
      signerKey: certs.signerKey,
      wwdr: certs.wwdr,
      signerKeyPassphrase: certs.signerKeyPassphrase,
    },
    {
      formatVersion: 1,
      serialNumber: `ticket-${data.ticketId}`,
      passTypeIdentifier: PASS_TYPE_ID,
      teamIdentifier: TEAM_ID,
      organizationName: "TicketMatch",
      description: `${data.eventName} — Guest ${data.guestNumber}`,
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(5, 150, 105)",
      labelColor: "rgb(167, 243, 208)",
      logoText: "TicketMatch",
    }
  );

  for (const [name, buffer] of Object.entries(images)) {
    pass.addBuffer(name, buffer);
  }

  pass.type = "eventTicket";

  pass.primaryFields.push({
    key: "event",
    label: "EVENT",
    value: data.eventName,
  });

  pass.secondaryFields.push(
    {
      key: "date",
      label: "DATE",
      value: data.date,
    },
    {
      key: "time",
      label: "TIME",
      value: data.time,
    }
  );

  pass.auxiliaryFields.push(
    {
      key: "guest",
      label: "GUEST",
      value: `${data.guestNumber} of ${data.totalGuests}`,
    },
    {
      key: "location",
      label: "LOCATION",
      value: data.location,
    },
    {
      key: "operator",
      label: "OPERATOR",
      value: data.tourOperator,
    }
  );

  if (data.seat) {
    pass.auxiliaryFields.push({
      key: "seat",
      label: "SEAT",
      value: data.seat,
    });
  }

  pass.setBarcodes({
    format: "PKBarcodeFormatQR",
    message: data.ticketId,
    messageEncoding: "iso-8859-1",
    altText: data.ticketId,
  });

  return pass;
}

// ════════════════════════════════════════════════════════════
// API ROUTES
// ════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    let pass: PKPass;

    switch (type) {
      case "voucher":
        pass = await buildBookingVoucher(
          data as Parameters<typeof buildBookingVoucher>[0]
        );
        break;
      case "membership":
        pass = await buildMembershipCard(
          data as Parameters<typeof buildMembershipCard>[0]
        );
        break;
      case "ticket":
        pass = await buildEventTicket(
          data as Parameters<typeof buildEventTicket>[0]
        );
        break;
      default:
        return NextResponse.json(
          {
            error: `Unknown pass type: ${type}. Use: voucher, membership, ticket`,
          },
          { status: 400 }
        );
    }

    // Generate the .pkpass buffer
    const buffer = pass.getAsBuffer();

    // Return the .pkpass file
    return new Response(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="${type}-${Date.now()}.pkpass"`,
      },
    });
  } catch (err) {
    console.error("Apple Wallet pass creation error:", err);
    return NextResponse.json(
      { error: "Failed to create Apple Wallet pass", details: String(err) },
      { status: 500 }
    );
  }
}

// GET: Health check + info
export async function GET() {
  const certsExist = {
    passPem: fs.existsSync(path.join(CERT_DIR, "pass.pem")),
    passKey: fs.existsSync(path.join(CERT_DIR, "pass-key.pem")),
    wwdr: fs.existsSync(path.join(CERT_DIR, "wwdr.pem")),
  };

  return NextResponse.json({
    service: "TicketMatch Apple Wallet API",
    passTypes: ["voucher", "membership", "ticket"],
    passTypeIdentifier: PASS_TYPE_ID,
    teamIdentifier: TEAM_ID,
    certificatesConfigured: Object.values(certsExist).every(Boolean),
    certificates: certsExist,
    usage: {
      method: "POST",
      headers: { "x-api-key": "your-service-role-key" },
      body: {
        type: "voucher | membership | ticket",
        data: "{ ... pass-specific fields }",
      },
      response: "Returns .pkpass file (application/vnd.apple.pkpass)",
    },
  });
}
