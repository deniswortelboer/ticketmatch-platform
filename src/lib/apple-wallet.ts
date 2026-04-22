import { PKPass } from "passkit-generator";
import fs from "fs";
import path from "path";

// ═══════════════════════════════════════════════════════════════
// Apple Wallet helper — env-based certs with filesystem fallback.
// Works on Vercel (env vars) and local dev (filesystem).
// ═══════════════════════════════════════════════════════════════

const TEAM_ID = "T5792RB2LA";
const PASS_TYPE_ID = "pass.ai.ticketmatch";

function decodeBase64EnvCert(envName: string): Buffer | null {
  const b64 = process.env[envName];
  if (!b64) return null;
  try {
    return Buffer.from(b64, "base64");
  } catch {
    return null;
  }
}

function readFileSafe(p: string): Buffer | null {
  try {
    return fs.readFileSync(p);
  } catch {
    return null;
  }
}

export function getAppleCerts() {
  const certDir = path.join(process.cwd(), "certificates");

  const signerCert =
    decodeBase64EnvCert("APPLE_PASS_PEM_BASE64") ??
    readFileSafe(path.join(certDir, "pass.pem"));
  const signerKey =
    decodeBase64EnvCert("APPLE_PASS_KEY_BASE64") ??
    readFileSafe(path.join(certDir, "pass-key.pem"));
  const wwdr =
    decodeBase64EnvCert("APPLE_WWDR_BASE64") ??
    readFileSafe(path.join(certDir, "wwdr.pem"));

  if (!signerCert || !signerKey || !wwdr) {
    throw new Error(
      "Apple Wallet certs not configured. Set APPLE_PASS_PEM_BASE64 / APPLE_PASS_KEY_BASE64 / APPLE_WWDR_BASE64 or place files in /certificates/."
    );
  }

  return {
    signerCert,
    signerKey,
    wwdr,
    signerKeyPassphrase: process.env.APPLE_PASS_KEY_PASSPHRASE || "igtmLN_2025",
  };
}

export function getAppleImages(): Record<string, Buffer> {
  // Try public folder first (works on Vercel because public is deployed),
  // then fall back to certificates/pass-model for local dev.
  const candidates = [
    path.join(process.cwd(), "public", "pass-model"),
    path.join(process.cwd(), "certificates", "pass-model"),
  ];
  const images: Record<string, Buffer> = {};
  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.match(/\.(png|jpe?g)$/i)) continue;
      if (!images[file]) {
        images[file] = fs.readFileSync(path.join(dir, file));
      }
    }
    if (Object.keys(images).length > 0) break;
  }
  return images;
}

export type BookingVoucherInput = {
  bookingId: string;
  venueName: string;
  venueCity: string;
  date: string;       // displayable (e.g., "12 May 2026")
  time?: string;      // displayable (e.g., "14:00")
  guests: number;
  voucherCode: string;
  qrValue: string;
  passengerName?: string | null;
  organizationName?: string;
  logoText?: string;
  backgroundColor?: string; // "rgb(r,g,b)"
};

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return `rgb(${r}, ${g}, ${b})`;
}

export async function buildBookingVoucher(
  data: BookingVoucherInput
): Promise<PKPass> {
  const certs = getAppleCerts();
  const images = getAppleImages();

  const background = data.backgroundColor?.startsWith("#")
    ? hexToRgb(data.backgroundColor)
    : data.backgroundColor || "rgb(30, 58, 95)";

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
      organizationName: data.organizationName || "TicketMatch",
      description: `Booking: ${data.venueName}`,
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: background,
      labelColor: "rgb(203, 213, 225)",
      logoText: data.logoText || "TicketMatch",
    }
  );

  for (const [name, buffer] of Object.entries(images)) {
    pass.addBuffer(name, buffer);
  }

  pass.type = "eventTicket";

  pass.primaryFields.push({
    key: "venue",
    label: "VENUE",
    value: data.venueName,
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
      value: data.time || "—",
    }
  );

  pass.auxiliaryFields.push(
    {
      key: "guest",
      label: "GUEST",
      value: data.passengerName || `${data.guests} guests`,
    },
    {
      key: "city",
      label: "CITY",
      value: data.venueCity,
    }
  );

  pass.setBarcodes({
    format: "PKBarcodeFormatQR",
    message: data.qrValue,
    messageEncoding: "iso-8859-1",
    altText: data.voucherCode,
  });

  return pass;
}
