import jsPDF from "jspdf";

interface Booking {
  id: string;
  venue_name: string;
  venue_category: string | null;
  venue_city: string | null;
  scheduled_date: string | null;
  number_of_guests: number;
  unit_price: number;
  total_price: number;
  status: string;
}

interface Group {
  id: string;
  name: string;
  travel_date: string | null;
  number_of_guests: number;
}

interface CompanyInfo {
  name: string;
  address?: string;
  city?: string;
  country?: string;
  kvk_number?: string;
  vat_number?: string;
  website?: string;
  phone?: string;
}

interface InvoiceOptions {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  group: Group;
  bookings: Booking[];
  company: CompanyInfo;
}

const NAVY = [15, 23, 41] as const;       // #0f1729
const BLUE = [37, 99, 235] as const;      // #2563eb
const GRAY = [100, 116, 139] as const;    // #64748b
const LIGHT_GRAY = [241, 245, 249] as const;
const WHITE = [255, 255, 255] as const;
const TABLE_HEADER_BG = [30, 41, 59] as const; // #1e293b
const TABLE_ALT_BG = [248, 250, 252] as const; // #f8fafc
const BORDER = [226, 232, 240] as const;  // #e2e8f0

function formatEUR(amount: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function generateInvoicePDF(options: InvoiceOptions): ArrayBuffer {
  const { invoiceNumber, invoiceDate, dueDate, group, bookings, company } = options;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  const checkNewPage = (needed: number) => {
    if (y + needed > pageHeight - 30) {
      addFooter(doc, pageWidth, pageHeight, margin);
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  };

  // ────────────────────────────────────────────────────────────
  //  HEADER BAND
  // ────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 44, "F");

  // Blue accent line at the very top
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, pageWidth, 3, "F");

  // Logo block
  doc.setFillColor(...BLUE);
  doc.roundedRect(margin, 12, 14, 14, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text("TM", margin + 7, 21, { align: "center" });

  // Company name
  doc.setFontSize(16);
  doc.setTextColor(...WHITE);
  doc.text("TicketMatch", margin + 18, 19);

  doc.setFontSize(8);
  doc.setTextColor(150, 170, 200);
  doc.text("B2B City Access Platform", margin + 18, 25);

  // INVOICE title (right side)
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text("INVOICE", pageWidth - margin, 22, { align: "right" });

  y = 56;

  // ────────────────────────────────────────────────────────────
  //  FROM / TO section
  // ────────────────────────────────────────────────────────────
  const colLeft = margin;
  const colRight = margin + contentWidth / 2 + 10;
  const colWidth = contentWidth / 2 - 10;

  // FROM
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BLUE);
  doc.text("FROM", colLeft, y);
  y += 5;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text("TicketMatch B.V.", colLeft, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  const fromLines = [
    "Keizersgracht 520",
    "1017 EK Amsterdam",
    "The Netherlands",
    "",
    "KVK: 90123456",
    "BTW: NL864532109B01",
    "info@ticketmatch.ai",
  ];
  fromLines.forEach((line) => {
    if (line === "") {
      y += 2;
      return;
    }
    doc.text(line, colLeft, y);
    y += 4;
  });

  // TO (positioned to the right, aligned with FROM start)
  let yTo = 56;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BLUE);
  doc.text("BILL TO", colRight, yTo);
  yTo += 5;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text(company.name || "—", colRight, yTo);
  yTo += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  const toLines: string[] = [];
  if (company.address) toLines.push(company.address);
  if (company.city || company.country) {
    toLines.push([company.city, company.country].filter(Boolean).join(", "));
  }
  toLines.push("");
  if (company.kvk_number) toLines.push(`KVK: ${company.kvk_number}`);
  if (company.vat_number) toLines.push(`BTW: ${company.vat_number}`);
  if (company.phone) toLines.push(`Tel: ${company.phone}`);

  toLines.forEach((line) => {
    if (line === "") {
      yTo += 2;
      return;
    }
    doc.text(line, colRight, yTo);
    yTo += 4;
  });

  y = Math.max(y, yTo) + 8;

  // ────────────────────────────────────────────────────────────
  //  INVOICE DETAILS BAR
  // ────────────────────────────────────────────────────────────
  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(margin, y, contentWidth, 20, 3, 3, "F");

  const detailCols = 4;
  const detailColW = contentWidth / detailCols;

  const details = [
    { label: "Invoice Number", value: invoiceNumber },
    { label: "Invoice Date", value: formatDate(invoiceDate) },
    { label: "Due Date", value: formatDate(dueDate) },
    { label: "Group", value: group.name },
  ];

  details.forEach((d, i) => {
    const x = margin + detailColW * i + 6;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(d.label, x, y + 8);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    // Truncate long values
    const val = d.value.length > 20 ? d.value.substring(0, 18) + "..." : d.value;
    doc.text(val, x, y + 14);
  });

  y += 28;

  // ────────────────────────────────────────────────────────────
  //  LINE ITEMS TABLE
  // ────────────────────────────────────────────────────────────

  // Column definitions (x positions relative to margin)
  const cols = {
    venue: { x: 0, w: 52 },
    category: { x: 52, w: 28 },
    date: { x: 80, w: 24 },
    guests: { x: 104, w: 18 },
    unitPrice: { x: 122, w: 24 },
    total: { x: 146, w: 24 },
  };

  // Table header
  doc.setFillColor(...TABLE_HEADER_BG);
  doc.roundedRect(margin, y, contentWidth, 10, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);

  doc.text("VENUE", margin + cols.venue.x + 4, y + 6.5);
  doc.text("CATEGORY", margin + cols.category.x + 2, y + 6.5);
  doc.text("DATE", margin + cols.date.x + 2, y + 6.5);
  doc.text("GUESTS", margin + cols.guests.x + 2, y + 6.5);
  doc.text("UNIT PRICE", margin + cols.unitPrice.x + 2, y + 6.5);
  doc.text("TOTAL", margin + cols.total.x + 2, y + 6.5);

  y += 12;

  // Table rows
  bookings.forEach((booking, index) => {
    checkNewPage(10);

    const rowH = 9;

    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(...TABLE_ALT_BG);
      doc.rect(margin, y, contentWidth, rowH, "F");
    }

    // Bottom border
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...NAVY);

    // Venue name (truncate if needed)
    const venueName = booking.venue_name.length > 28
      ? booking.venue_name.substring(0, 26) + "..."
      : booking.venue_name;
    doc.setFont("helvetica", "bold");
    doc.text(venueName, margin + cols.venue.x + 4, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);

    // Category & city
    const catCity = [booking.venue_category, booking.venue_city].filter(Boolean).join(", ");
    const catCityTrunc = catCity.length > 16 ? catCity.substring(0, 14) + "..." : catCity;
    doc.text(catCityTrunc, margin + cols.category.x + 2, y + 6);

    // Date
    doc.text(formatShortDate(booking.scheduled_date), margin + cols.date.x + 2, y + 6);

    // Guests
    doc.text(String(booking.number_of_guests), margin + cols.guests.x + 8, y + 6, { align: "center" });

    // Unit price
    doc.setTextColor(...NAVY);
    doc.text(formatEUR(Number(booking.unit_price)), margin + cols.unitPrice.x + cols.unitPrice.w, y + 6, { align: "right" });

    // Total
    doc.setFont("helvetica", "bold");
    doc.text(formatEUR(Number(booking.total_price)), margin + cols.total.x + cols.total.w, y + 6, { align: "right" });

    y += rowH;
  });

  y += 6;

  // ────────────────────────────────────────────────────────────
  //  TOTALS SECTION
  // ────────────────────────────────────────────────────────────
  checkNewPage(50);

  const totalsX = margin + contentWidth - 80;
  const totalsW = 80;
  const labelX = totalsX + 4;
  const valueX = totalsX + totalsW - 4;

  const subtotal = bookings.reduce((sum, b) => sum + Number(b.total_price), 0);
  const vatRate = 0.21;
  const vatAmount = subtotal * vatRate;
  const grandTotal = subtotal + vatAmount;

  // Subtotal
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(totalsX, y, totalsX + totalsW, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("Subtotal", labelX, y);
  doc.setTextColor(...NAVY);
  doc.text(formatEUR(subtotal), valueX, y, { align: "right" });

  y += 6;
  doc.setTextColor(...GRAY);
  doc.text("VAT (21%)", labelX, y);
  doc.setTextColor(...NAVY);
  doc.text(formatEUR(vatAmount), valueX, y, { align: "right" });

  y += 4;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.5);
  doc.line(totalsX, y, totalsX + totalsW, y);

  y += 7;
  doc.setFillColor(...NAVY);
  doc.roundedRect(totalsX, y - 5, totalsW, 12, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...WHITE);
  doc.text("TOTAL DUE", labelX, y + 2);
  doc.text(formatEUR(grandTotal), valueX, y + 2, { align: "right" });

  y += 16;

  // ────────────────────────────────────────────────────────────
  //  PAYMENT INFO
  // ────────────────────────────────────────────────────────────
  checkNewPage(50);

  doc.setFillColor(239, 246, 255); // light blue bg
  doc.roundedRect(margin, y, contentWidth, 36, 3, 3, "F");

  // Blue left accent bar
  doc.setFillColor(...BLUE);
  doc.rect(margin, y, 3, 36, "F");

  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text("Payment Information", margin + 8, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);

  const paymentLines = [
    "Bank: ABN AMRO Bank N.V.",
    "IBAN: NL91 ABNA 0417 1643 00",
    "BIC/SWIFT: ABNANL2A",
    `Reference: ${invoiceNumber}`,
  ];

  paymentLines.forEach((line) => {
    doc.text(line, margin + 8, y);
    y += 4.5;
  });

  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BLUE);
  doc.text("Online payment: https://pay.ticketmatch.ai/invoice/" + invoiceNumber, margin + 8, y);

  y += 12;

  // ────────────────────────────────────────────────────────────
  //  TERMS
  // ────────────────────────────────────────────────────────────
  checkNewPage(30);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text("Terms & Conditions", margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);

  const terms = [
    "1. Payment is due within 30 days of the invoice date. Late payments may incur interest at the statutory rate.",
    "2. All prices are in EUR and exclusive of VAT unless stated otherwise. VAT is charged at 21% (Netherlands).",
    "3. Cancellation policy applies as per the booking terms agreed upon confirmation.",
    "4. This invoice is generated electronically and is valid without signature.",
  ];

  terms.forEach((t) => {
    const lines = doc.splitTextToSize(t, contentWidth);
    lines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += 3.5;
    });
    y += 1;
  });

  // ────────────────────────────────────────────────────────────
  //  FOOTER (all pages)
  // ────────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, pageWidth, pageHeight, margin);
  }

  return doc.output("arraybuffer");
}

function addFooter(doc: jsPDF, pageWidth: number, pageHeight: number, margin: number) {
  // Footer band
  doc.setFillColor(...NAVY);
  doc.rect(0, pageHeight - 18, pageWidth, 18, "F");

  // Blue accent line above footer
  doc.setFillColor(...BLUE);
  doc.rect(0, pageHeight - 18, pageWidth, 1, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(150, 170, 200);
  doc.text(
    "TicketMatch B.V.  |  Keizersgracht 520, 1017 EK Amsterdam  |  info@ticketmatch.ai  |  www.ticketmatch.ai",
    pageWidth / 2,
    pageHeight - 11,
    { align: "center" }
  );

  doc.setFontSize(6);
  doc.setTextColor(100, 120, 150);
  doc.text(
    "KVK: 90123456  |  BTW: NL864532109B01  |  IBAN: NL91 ABNA 0417 1643 00",
    pageWidth / 2,
    pageHeight - 7,
    { align: "center" }
  );

  // Page number
  const currentPage = doc.getCurrentPageInfo().pageNumber;
  const totalPages = doc.getNumberOfPages();
  doc.setFontSize(7);
  doc.setTextColor(150, 170, 200);
  doc.text(`Page ${currentPage} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
}
