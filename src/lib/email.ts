import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = "TicketMatch <notifications@ticketmatch.ai>";

// ─── Status config ────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string; description: string }> = {
  confirmed: {
    label: "Confirmed",
    color: "#22c55e",
    icon: "✅",
    description: "Your booking has been confirmed! The venue is expecting your group.",
  },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444",
    icon: "❌",
    description: "Unfortunately, this booking has been cancelled.",
  },
  pending: {
    label: "Pending",
    color: "#f59e0b",
    icon: "⏳",
    description: "Your booking is being reviewed. We'll notify you once it's confirmed.",
  },
  completed: {
    label: "Completed",
    color: "#3b82f6",
    icon: "🎉",
    description: "This booking has been completed. We hope your group had a great time!",
  },
};

// ─── Email template ───────────────────────────────────────────
function bookingStatusEmailHTML(data: {
  companyName: string;
  venueName: string;
  groupName: string;
  scheduledDate: string | null;
  numberOfGuests: number;
  status: string;
  notes?: string;
}) {
  const config = STATUS_CONFIG[data.status] || {
    label: data.status,
    color: "#6b7280",
    icon: "📋",
    description: `Your booking status has been updated to: ${data.status}`,
  };

  const dateStr = data.scheduledDate
    ? new Date(data.scheduledDate).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not scheduled yet";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f1729,#1a2744);padding:32px 40px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:linear-gradient(135deg,#60a5fa,#2563eb);border-radius:12px;padding:8px 12px;margin-bottom:12px;">
                      <span style="color:#fff;font-size:18px;font-weight:800;letter-spacing:-0.5px;">TM</span>
                    </div>
                    <h1 style="color:#fff;font-size:22px;margin:8px 0 4px;font-weight:600;">
                      Ticket<span style="color:#60a5fa;">Match</span>
                    </h1>
                    <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">Booking Status Update</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Badge -->
          <tr>
            <td style="padding:32px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:${config.color}12;border:1px solid ${config.color}30;border-radius:12px;padding:20px;">
                <tr>
                  <td align="center">
                    <span style="font-size:32px;">${config.icon}</span>
                    <h2 style="color:${config.color};font-size:20px;margin:8px 0 4px;font-weight:700;">
                      Booking ${config.label}
                    </h2>
                    <p style="color:#64748b;font-size:14px;margin:0;line-height:1.5;">
                      ${config.description}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding:24px 40px;">
              <h3 style="color:#0f1729;font-size:15px;margin:0 0 16px;font-weight:600;">Booking Details</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;background:#f8fafc;">
                    <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Venue</span>
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;background:#f8fafc;text-align:right;">
                    <span style="color:#0f1729;font-size:14px;font-weight:600;">${data.venueName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                    <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Group</span>
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;text-align:right;">
                    <span style="color:#0f1729;font-size:14px;font-weight:500;">${data.groupName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;background:#f8fafc;">
                    <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Date</span>
                  </td>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;background:#f8fafc;text-align:right;">
                    <span style="color:#0f1729;font-size:14px;font-weight:500;">📅 ${dateStr}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;">
                    <span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Guests</span>
                  </td>
                  <td style="padding:14px 16px;text-align:right;">
                    <span style="color:#0f1729;font-size:14px;font-weight:500;">👥 ${data.numberOfGuests} people</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${data.notes ? `
          <!-- Notes -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="background:#f8fafc;border-radius:10px;padding:16px;border:1px solid #e2e8f0;">
                <p style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 6px;">Notes</p>
                <p style="color:#475569;font-size:14px;margin:0;line-height:1.5;">${data.notes}</p>
              </div>
            </td>
          </tr>` : ""}

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 32px;" align="center">
              <a href="https://ticketmatch.ai/dashboard/bookings"
                 style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(37,99,235,0.3);">
                View in Dashboard →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
                      This email was sent to ${data.companyName} via
                      <a href="https://ticketmatch.ai" style="color:#2563eb;text-decoration:none;">TicketMatch.ai</a>
                    </p>
                    <p style="color:#cbd5e1;font-size:11px;margin:8px 0 0;">
                      © ${new Date().getFullYear()} TicketMatch. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Send booking status email ────────────────────────────────
export async function sendBookingStatusEmail(params: {
  to: string[];
  companyName: string;
  venueName: string;
  groupName: string;
  scheduledDate: string | null;
  numberOfGuests: number;
  status: string;
  notes?: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return { success: false, reason: "no_api_key" };
  }

  if (!params.to.length) {
    console.warn("No recipients — skipping email");
    return { success: false, reason: "no_recipients" };
  }

  const config = STATUS_CONFIG[params.status];
  const statusLabel = config?.label || params.status;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `${config?.icon || "📋"} Booking ${statusLabel}: ${params.venueName}`,
      html: bookingStatusEmailHTML(params),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, reason: error.message };
    }

    console.log("Email sent:", data?.id);
    return { success: true, emailId: data?.id };
  } catch (err) {
    console.error("Email send failed:", err);
    return { success: false, reason: "send_failed" };
  }
}
