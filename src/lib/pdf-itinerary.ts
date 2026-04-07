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

const BLUE = [37, 99, 235] as const;      // #2563eb
const DARK = [15, 23, 41] as const;       // #0f1729
const GRAY = [100, 116, 139] as const;    // #64748b
const LIGHT_GRAY = [241, 245, 249] as const; // #f1f5f9
const WHITE = [255, 255, 255] as const;

function formatDate(date: string) {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(date: string) {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function generateItineraryPDF(group: Group, bookings: Booking[], companyName?: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // ─── Helper: check if we need a new page ────────────────
  const checkNewPage = (needed: number) => {
    if (y + needed > pageHeight - 25) {
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  };

  // ─── Header band ────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pageWidth, 52, "F");

  // Logo block
  doc.setFillColor(...BLUE);
  doc.roundedRect(margin, 12, 14, 14, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...WHITE);
  doc.text("TM", margin + 7, 21, { align: "center" });

  // Title
  doc.setFontSize(18);
  doc.setTextColor(...WHITE);
  doc.text("TicketMatch", margin + 18, 18);

  doc.setFontSize(10);
  doc.setTextColor(150, 170, 200);
  doc.text("Itinerary", margin + 18, 25);

  // Company name (right side)
  if (companyName) {
    doc.setFontSize(9);
    doc.setTextColor(150, 170, 200);
    doc.text(companyName, pageWidth - margin, 16, { align: "right" });
  }

  // Generated date
  doc.setFontSize(8);
  doc.setTextColor(120, 140, 170);
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
    pageWidth - margin,
    23,
    { align: "right" }
  );

  // ─── Group info bar ─────────────────────────────────────
  doc.setFillColor(245, 247, 252);
  doc.roundedRect(margin, 40, contentWidth, 18, 3, 3, "F");

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(group.name, margin + 6, 50);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  const groupInfo = `${group.number_of_guests} guests`;
  const travelInfo = group.travel_date ? ` · ${formatShortDate(group.travel_date)}` : "";
  doc.text(groupInfo + travelInfo, margin + 6, 55);

  y = 66;

  // ─── Organize bookings by date ──────────────────────────
  const bookingsByDate: Record<string, Booking[]> = {};
  const unscheduled: Booking[] = [];

  bookings.forEach((b) => {
    if (b.scheduled_date) {
      if (!bookingsByDate[b.scheduled_date]) bookingsByDate[b.scheduled_date] = [];
      bookingsByDate[b.scheduled_date].push(b);
    } else {
      unscheduled.push(b);
    }
  });

  const sortedDates = Object.keys(bookingsByDate).sort();

  // ─── Day sections ───────────────────────────────────────
  sortedDates.forEach((date, dayIndex) => {
    const dayBookings = bookingsByDate[date];
    const dayHeight = 14 + dayBookings.length * 18;
    checkNewPage(dayHeight);

    // Day header
    doc.setFillColor(...BLUE);
    doc.roundedRect(margin, y, 10, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    doc.text(String(dayIndex + 1), margin + 5, y + 7, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text(`Day ${dayIndex + 1}`, margin + 14, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(formatDate(date), margin + 14, y + 10);

    y += 16;

    // Bookings for this day
    dayBookings.forEach((booking) => {
      checkNewPage(20);

      // Activity row background
      doc.setFillColor(...LIGHT_GRAY);
      doc.roundedRect(margin, y, contentWidth, 15, 2, 2, "F");

      // Category icon placeholder
      const catEmoji = booking.venue_category === "Museum" ? "🏛" :
                       booking.venue_category === "Restaurant" ? "🍽" :
                       booking.venue_category === "Tour" ? "🚶" :
                       booking.venue_category === "Transport" ? "🚌" :
                       booking.venue_category === "Activity" ? "🎯" : "📍";

      doc.setFontSize(10);
      doc.text(catEmoji, margin + 4, y + 10);

      // Venue name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.text(booking.venue_name, margin + 14, y + 6);

      // Details line
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      const details = [booking.venue_category, booking.venue_city, `${booking.number_of_guests} guests`]
        .filter(Boolean)
        .join(" · ");
      doc.text(details, margin + 14, y + 11);

      // Price (right side)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...BLUE);
      doc.text(`€ ${Number(booking.total_price).toFixed(2)}`, pageWidth - margin - 4, y + 6, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text(`€ ${Number(booking.unit_price).toFixed(2)} p.p.`, pageWidth - margin - 4, y + 11, { align: "right" });

      // Status badge
      if (booking.status === "confirmed") {
        doc.setFillColor(34, 197, 94);
        doc.roundedRect(pageWidth - margin - 44, y + 1, 16, 4, 1, 1, "F");
        doc.setFontSize(5);
        doc.setTextColor(...WHITE);
        doc.text("CONFIRMED", pageWidth - margin - 36, y + 4, { align: "center" });
      } else if (booking.status === "pending") {
        doc.setFillColor(245, 158, 11);
        doc.roundedRect(pageWidth - margin - 44, y + 1, 14, 4, 1, 1, "F");
        doc.setFontSize(5);
        doc.setTextColor(...WHITE);
        doc.text("PENDING", pageWidth - margin - 37, y + 4, { align: "center" });
      }

      y += 18;
    });

    y += 4;
  });

  // ─── Unscheduled activities ─────────────────────────────
  if (unscheduled.length > 0) {
    checkNewPage(14 + unscheduled.length * 18);

    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, y, contentWidth, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(180, 83, 9);
    doc.text("⏳ Unscheduled Activities", margin + 4, y + 7);
    y += 14;

    unscheduled.forEach((booking) => {
      checkNewPage(20);

      doc.setFillColor(255, 251, 235);
      doc.roundedRect(margin, y, contentWidth, 15, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.text(booking.venue_name, margin + 6, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      const details = [booking.venue_category, booking.venue_city].filter(Boolean).join(" · ");
      doc.text(details, margin + 6, y + 11);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...BLUE);
      doc.text(`€ ${Number(booking.total_price).toFixed(2)}`, pageWidth - margin - 4, y + 8, { align: "right" });

      y += 18;
    });

    y += 4;
  }

  // ─── Summary section ────────────────────────────────────
  checkNewPage(40);

  doc.setFillColor(...DARK);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, "F");

  const totalPerPerson = bookings.reduce((sum, b) => sum + Number(b.unit_price), 0);
  const totalAll = bookings.reduce((sum, b) => sum + Number(b.total_price), 0);
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  // Summary grid
  const colWidth = contentWidth / 4;

  const summaryItems = [
    { label: "Activities", value: String(bookings.length) },
    { label: "Confirmed", value: `${confirmedCount}/${bookings.length}` },
    { label: "Per Person", value: `€ ${totalPerPerson.toFixed(2)}` },
    { label: "Total", value: `€ ${totalAll.toFixed(2)}` },
  ];

  summaryItems.forEach((item, i) => {
    const x = margin + colWidth * i;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 170, 200);
    doc.text(item.label, x + colWidth / 2, y + 12, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(i === 3 ? 16 : 14);
    doc.setTextColor(i === 3 ? 96 : 255, i === 3 ? 165 : 255, i === 3 ? 250 : 255);
    doc.text(item.value, x + colWidth / 2, y + 24, { align: "center" });
  });

  y += 40;

  // ─── Footer ─────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(220, 225, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    // Footer text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(180, 185, 195);
    doc.text("Generated by TicketMatch.ai — B2B City Access Platform", margin, pageHeight - 10);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  }

  // ─── Download ───────────────────────────────────────────
  const fileName = `itinerary-${group.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
