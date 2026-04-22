import jsPDF from "jspdf";
import QRCode from "qrcode";

// ═══════════════════════════════════════════════════════════════
// Ticket PDF generator
// One A4 page per ticket. Large QR, booking metadata, branding header.
// ═══════════════════════════════════════════════════════════════

export interface TicketPDFTicket {
  guest_name?: string | null;
  qr_data: string;
  seat?: string | null;
  notes?: string | null;
}

export interface TicketPDFInput {
  venueName: string;
  venueCity: string | null;
  scheduledDate: string | null;
  groupName: string | null;
  bookingRef: string;
  tickets: TicketPDFTicket[];
  // Branding
  brandingMode: "white_label_light" | "co_branded" | "full_managed";
  companyName: string;
  primaryColor: string; // hex
  supportEmail?: string | null;
  supportPhone?: string | null;
  logoDataUrl?: string | null; // optional PNG base64 data URL for header logo
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  return [r, g, b];
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateTicketPDF(input: TicketPDFInput): Promise<ArrayBuffer> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = 210;
  const pageH = 297;
  const margin = 18;
  const [br, bg, bb] = hexToRgb(input.primaryColor);

  const tickets = input.tickets.length ? input.tickets : [{ qr_data: input.bookingRef }];

  for (let i = 0; i < tickets.length; i++) {
    if (i > 0) doc.addPage();
    const t = tickets[i];

    // ── Colored header band ──
    doc.setFillColor(br, bg, bb);
    doc.rect(0, 0, pageW, 35, "F");

    // ── Header text ──
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    const headerTitle =
      input.brandingMode === "full_managed" ? "TicketMatch.ai" : input.companyName;
    doc.text(headerTitle, margin, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Je ticket is klaar", margin, 26);

    // ── Ticket number (top right) ──
    doc.setFontSize(9);
    doc.text(
      `Ticket ${i + 1} / ${tickets.length}`,
      pageW - margin,
      18,
      { align: "right" }
    );
    doc.text(`Ref: ${input.bookingRef.slice(0, 12)}`, pageW - margin, 26, {
      align: "right",
    });

    // ── Body: venue name ──
    doc.setTextColor(15, 23, 41);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(input.venueName, margin, 55);

    // ── Metadata row ──
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    let y = 68;

    if (input.scheduledDate) {
      doc.text(`Datum: ${formatDate(input.scheduledDate)}`, margin, y);
      y += 7;
    }
    if (input.venueCity) {
      doc.text(`Locatie: ${input.venueCity}`, margin, y);
      y += 7;
    }
    if (t.guest_name) {
      doc.setTextColor(15, 23, 41);
      doc.setFont("helvetica", "bold");
      doc.text(`Gast: ${t.guest_name}`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      y += 7;
    }
    if (input.groupName) {
      doc.text(`Groep: ${input.groupName}`, margin, y);
      y += 7;
    }
    if (t.seat) {
      doc.text(`Zitplaats: ${t.seat}`, margin, y);
      y += 7;
    }

    // ── QR code (centered) ──
    const qrDataUrl = await QRCode.toDataURL(t.qr_data, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 400,
    });
    const qrSize = 90; // mm
    const qrX = (pageW - qrSize) / 2;
    const qrY = y + 15;
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    // ── Instruction below QR ──
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(
      "Toon deze QR-code bij de ingang.",
      pageW / 2,
      qrY + qrSize + 8,
      { align: "center" }
    );

    if (t.notes) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(t.notes, pageW / 2, qrY + qrSize + 16, { align: "center" });
    }

    // ── Footer ──
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageH - 32, pageW - margin, pageH - 32);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    if (input.brandingMode === "full_managed") {
      doc.text("TicketMatch Support", margin, pageH - 24);
      if (input.supportEmail) {
        doc.text(`${input.supportEmail}`, margin, pageH - 18);
      }
      if (input.supportPhone) {
        doc.text(`${input.supportPhone}`, margin, pageH - 12);
      }
    } else {
      doc.text(`Met vriendelijke groet, ${input.companyName}`, margin, pageH - 24);
      // Powered-by only on co_branded; white_label_light hides it
      if (input.brandingMode === "co_branded") {
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          "Verzonden via TicketMatch — ticketmatch.ai",
          pageW - margin,
          pageH - 12,
          { align: "right" }
        );
      }
    }
  }

  return doc.output("arraybuffer");
}
