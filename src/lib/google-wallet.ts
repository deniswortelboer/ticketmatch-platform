import { google } from "googleapis";
import crypto from "crypto";

// ═══════════════════════════════════════════════════════════════
// Google Wallet helper — creates a genericClass (if not exists) and
// signs a save-to-wallet JWT. Shared between /t and /p public routes.
// Requires:
//   GOOGLE_WALLET_ISSUER_ID
//   GOOGLE_SERVICE_ACCOUNT_EMAIL
//   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (with literal \n in value)
// And the service account must be added to the issuer in Google Pay
// Console as 'Admin' or 'Viewer'.
// ═══════════════════════════════════════════════════════════════

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ticketmatch.ai";
const CLASS_SUFFIX = "TM_BOOKING_VOUCHER"; // reuses the already-Active class in Google Pay Console

function getCredentials() {
  return {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    private_key: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "").replace(
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

function signJwt(payload: Record<string, unknown>): string {
  const creds = getCredentials();
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: creds.client_email,
    aud: "google",
    origins: [SITE_URL],
    typ: "savetowallet",
    iat: now,
    payload,
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
  return `${signingInput}.${signature}`;
}

export type GoogleWalletTicketInput = {
  ticketId: string;          // unique — used in objectId
  venueName: string;
  venueCity: string;
  date: string;              // formatted
  time?: string;
  voucherCode: string;
  qrValue: string;
  passengerName?: string | null;
  organizationName?: string;
  backgroundColor?: string;  // hex (#RRGGBB) or ignored
};

function normalizeColor(c?: string): string {
  if (!c) return "#1e3a5f";
  return c.startsWith("#") ? c : `#${c}`;
}

function safeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 60);
}

/**
 * Build a Google Wallet generic ticket pass for a single booking/passenger,
 * create the class if needed, and return the save-to-wallet URL.
 */
export async function buildGoogleWalletSaveUrl(
  input: GoogleWalletTicketInput
): Promise<string> {
  if (!ISSUER_ID) throw new Error("GOOGLE_WALLET_ISSUER_ID not set");

  const classId = `${ISSUER_ID}.${CLASS_SUFFIX}`;
  const objectId = `${ISSUER_ID}.obj_${safeId(input.ticketId)}`;
  const bgHex = normalizeColor(input.backgroundColor);
  const orgName = input.organizationName || "TicketMatch";

  const classPayload = {
    id: classId,
    cardTitle: { defaultValue: { language: "en", value: orgName } },
    header: { defaultValue: { language: "en", value: "Booking Voucher" } },
    logo: {
      sourceUri: { uri: `${SITE_URL}/icon-192.png` },
      contentDescription: {
        defaultValue: { language: "en", value: orgName },
      },
    },
    hexBackgroundColor: bgHex,
    classTemplateInfo: {
      cardTemplateOverride: {
        cardRowTemplateInfos: [
          {
            twoItems: {
              startItem: {
                firstValue: {
                  fields: [{ fieldPath: "object.textModulesData['date']" }],
                },
              },
              endItem: {
                firstValue: {
                  fields: [{ fieldPath: "object.textModulesData['guest']" }],
                },
              },
            },
          },
          {
            twoItems: {
              startItem: {
                firstValue: {
                  fields: [{ fieldPath: "object.textModulesData['city']" }],
                },
              },
              endItem: {
                firstValue: {
                  fields: [{ fieldPath: "object.textModulesData['voucher']" }],
                },
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
    cardTitle: { defaultValue: { language: "en", value: orgName } },
    header: { defaultValue: { language: "en", value: input.venueName } },
    subheader: { defaultValue: { language: "en", value: input.venueCity } },
    logo: {
      sourceUri: { uri: `${SITE_URL}/icon-192.png` },
      contentDescription: {
        defaultValue: { language: "en", value: orgName },
      },
    },
    hexBackgroundColor: bgHex,
    textModulesData: [
      { id: "date", header: "DATE", body: input.date },
      {
        id: "guest",
        header: "GUEST",
        body: input.passengerName || "Booking",
      },
      { id: "city", header: "CITY", body: input.venueCity },
      { id: "voucher", header: "VOUCHER", body: input.voucherCode },
    ],
    barcode: {
      type: "QR_CODE",
      value: input.qrValue,
      alternateText: input.voucherCode,
    },
  };

  // Ensure the class exists (ignore 409 = already exists).
  try {
    const auth = getAuth();
    const client = await auth.getClient();
    const tokenRes = await client.getAccessToken();
    const token = tokenRes.token!;

    const classRes = await fetch(
      "https://walletobjects.googleapis.com/walletobjects/v1/genericClass",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(classPayload),
      }
    );

    if (
      classRes.status !== 200 &&
      classRes.status !== 409 &&
      classRes.status !== 400
    ) {
      // 400 can mean "already exists with different fields" — we accept and proceed.
      const err = await classRes.json().catch(() => ({}));
      console.warn("Wallet class create warning:", classRes.status, err);
    }
  } catch (err) {
    // Non-fatal: the save URL may still work if the class was created before.
    console.warn("Wallet class create threw:", err);
  }

  // Sign the save-to-wallet JWT.
  const jwt = signJwt({
    genericClasses: [classPayload],
    genericObjects: [objectPayload],
  });
  return `https://pay.google.com/gp/v/save/${jwt}`;
}
