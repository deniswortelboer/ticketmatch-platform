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

// ─── Approval email template ─────────────────────────────────
function approvalEmailHTML(companyName: string) {
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
                    <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">Account Approved</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Success Badge -->
          <tr>
            <td style="padding:32px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#22c55e12;border:1px solid #22c55e30;border-radius:12px;padding:20px;">
                <tr>
                  <td align="center">
                    <div style="width:56px;height:56px;border-radius:50%;background:#22c55e20;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
                      <span style="font-size:28px;">&#10003;</span>
                    </div>
                    <h2 style="color:#16a34a;font-size:20px;margin:0 0 8px;font-weight:700;">
                      You're Approved!
                    </h2>
                    <p style="color:#64748b;font-size:14px;margin:0;line-height:1.5;">
                      Great news! Your account for <strong>${companyName}</strong> has been reviewed and approved.
                      You can now log in and start booking activities for your groups.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's next -->
          <tr>
            <td style="padding:24px 40px;">
              <h3 style="color:#0f1729;font-size:15px;margin:0 0 16px;font-weight:600;">What you can do now</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;background:#f8fafc;">
                    <span style="color:#2563eb;font-weight:600;">1.</span>
                    <span style="color:#0f1729;font-size:14px;margin-left:8px;">Browse the catalog of activities and venues</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                    <span style="color:#2563eb;font-weight:600;">2.</span>
                    <span style="color:#0f1729;font-size:14px;margin-left:8px;">Create groups and manage your travelers</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;background:#f8fafc;">
                    <span style="color:#2563eb;font-weight:600;">3.</span>
                    <span style="color:#0f1729;font-size:14px;margin-left:8px;">Book tickets and track everything in your dashboard</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 32px;" align="center">
              <a href="https://ticketmatch.ai/dashboard"
                 style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(37,99,235,0.3);">
                Go to Dashboard &rarr;
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
                      This email was sent to ${companyName} via
                      <a href="https://ticketmatch.ai" style="color:#2563eb;text-decoration:none;">TicketMatch.ai</a>
                    </p>
                    <p style="color:#cbd5e1;font-size:11px;margin:8px 0 0;">
                      &copy; ${new Date().getFullYear()} TicketMatch. All rights reserved.
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

// ─── Send approval email ─────────────────────────────────────
export async function sendApprovalEmail(params: {
  to: string[];
  companyName: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return { success: false, reason: "no_api_key" };
  }

  if (!params.to.length) {
    console.warn("No recipients — skipping approval email");
    return { success: false, reason: "no_recipients" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Your TicketMatch account has been approved!`,
      html: approvalEmailHTML(params.companyName),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, reason: error.message };
    }

    console.log("Approval email sent:", data?.id);
    return { success: true, emailId: data?.id };
  } catch (err) {
    console.error("Approval email send failed:", err);
    return { success: false, reason: "send_failed" };
  }
}

// ─── Admin notification: new registration ────────────────────
function newRegistrationEmailHTML(data: { contactName: string; companyName: string; companyType: string; email: string; phone?: string; isReseller?: boolean; message?: string }) {
  const type = data.isReseller ? "Reseller" : "Company";
  const badgeColor = data.isReseller ? "#16a34a" : "#2563eb";
  const badgeBg = data.isReseller ? "#f0fdf4" : "#eff6ff";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#0f1729,#1a2744);padding:24px 40px;text-align:center;">
          <div style="display:inline-block;background:linear-gradient(135deg,#60a5fa,#2563eb);border-radius:12px;padding:8px 12px;">
            <span style="color:#fff;font-size:18px;font-weight:800;">TM</span>
          </div>
          <h1 style="color:#fff;font-size:20px;margin:8px 0 0;font-weight:600;">New ${type} Registration</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <div style="background:${badgeBg};border:1px solid ${badgeColor}30;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
            <span style="font-size:36px;">${data.isReseller ? "🤝" : "🏢"}</span>
            <h2 style="color:${badgeColor};font-size:18px;margin:8px 0 4px;">${data.companyName}</h2>
            <p style="color:#64748b;font-size:14px;margin:0;">wants to join as <strong>${type}</strong></p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
            <tr><td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;background:#f8fafc;"><span style="color:#94a3b8;font-size:12px;text-transform:uppercase;">Contact</span></td>
                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;background:#f8fafc;text-align:right;"><strong style="color:#0f1729;font-size:14px;">${data.contactName}</strong></td></tr>
            <tr><td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;"><span style="color:#94a3b8;font-size:12px;text-transform:uppercase;">Email</span></td>
                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;"><a href="mailto:${data.email}" style="color:#2563eb;font-size:14px;">${data.email}</a></td></tr>
            <tr><td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;background:#f8fafc;"><span style="color:#94a3b8;font-size:12px;text-transform:uppercase;">Type</span></td>
                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;background:#f8fafc;text-align:right;"><span style="color:#0f1729;font-size:14px;">${data.companyType}</span></td></tr>
            ${data.phone ? `<tr><td style="padding:12px 16px;"><span style="color:#94a3b8;font-size:12px;text-transform:uppercase;">Phone</span></td>
                <td style="padding:12px 16px;text-align:right;"><span style="color:#0f1729;font-size:14px;">${data.phone}</span></td></tr>` : ""}
          </table>
          ${data.message ? `<div style="margin-top:16px;background:#f8fafc;border-radius:10px;padding:16px;border:1px solid #e2e8f0;"><p style="color:#94a3b8;font-size:12px;text-transform:uppercase;margin:0 0 6px;">Message</p><p style="color:#475569;font-size:14px;margin:0;">${data.message}</p></div>` : ""}
        </td></tr>
        <tr><td style="padding:0 40px 32px;" align="center">
          <a href="https://ticketmatch.ai/dashboard/admin" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(37,99,235,0.3);">
            Review in Admin Panel &rarr;
          </a>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:16px 40px;border-top:1px solid #e2e8f0;">
          <p style="color:#cbd5e1;font-size:11px;margin:0;text-align:center;">&copy; ${new Date().getFullYear()} TicketMatch. Admin notification.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendAdminNewRegistrationEmail(params: {
  contactName: string;
  companyName: string;
  companyType: string;
  email: string;
  phone?: string;
  isReseller?: boolean;
  message?: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping admin notification");
    return { success: false, reason: "no_api_key" };
  }

  const ADMIN_EMAILS = ["wortelboerdenis@gmail.com", "patekrolexvc@gmail.com"];
  const type = params.isReseller ? "Reseller" : "Company";

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAILS,
      subject: `🆕 New ${type}: ${params.companyName} — ${params.contactName}`,
      html: newRegistrationEmailHTML(params),
    });

    if (error) {
      console.error("Admin notification error:", error);
      return { success: false, reason: error.message };
    }

    console.log("Admin notification sent:", data?.id);
    return { success: true, emailId: data?.id };
  } catch (err) {
    console.error("Admin notification failed:", err);
    return { success: false, reason: "send_failed" };
  }
}

// ─── Registration confirmation email (to the applicant) ──────
const REGISTRATION_CONTENT: Record<string, { emoji: string; title: string; subtitle: string; steps: string[] }> = {
  "tour-operator": {
    emoji: "🎯",
    title: "Application Received!",
    subtitle: "Thank you for applying as a Tour Operator on TicketMatch.",
    steps: [
      "We're reviewing your application now",
      "You'll hear back from us within 24 hours",
      "Once approved, you can browse our catalog and book tickets for your groups",
    ],
  },
  "travel-agency": {
    emoji: "✈️",
    title: "Application Received!",
    subtitle: "Thank you for applying as a Travel Agency on TicketMatch.",
    steps: [
      "We're reviewing your application now",
      "You'll hear back from us within 24 hours",
      "Once approved, you can upload group lists and start earning commission on bookings",
    ],
  },
  "dmc": {
    emoji: "🌍",
    title: "Application Received!",
    subtitle: "Thank you for applying as a DMC on TicketMatch.",
    steps: [
      "We're reviewing your destination management profile",
      "You'll hear back from us within 24 hours",
      "Once approved, you can manage destinations and book activities for your groups",
    ],
  },
  "mice": {
    emoji: "🎪",
    title: "Application Received!",
    subtitle: "Thank you for applying as a MICE / Event Agency on TicketMatch.",
    steps: [
      "We're reviewing your application now",
      "You'll hear back from us within 24 hours",
      "Once approved, you can book venues and activities for your corporate events",
    ],
  },
  "reseller": {
    emoji: "🤝",
    title: "Reseller Application Received!",
    subtitle: "Thank you for applying as a TicketMatch Reseller.",
    steps: [
      "We're reviewing your reseller application",
      "You'll hear back from us within 24 hours",
      "Once approved, you'll get your own reseller link and start earning commission",
    ],
  },
  "supplier": {
    emoji: "🔧",
    title: "Integration Request Received!",
    subtitle: "Thank you for your interest in integrating with TicketMatch.",
    steps: [
      "Our tech team is reviewing your integration request",
      "You'll receive API documentation and access within 48 hours",
      "Once set up, your products will be available to all TicketMatch operators",
    ],
  },
  "default": {
    emoji: "📩",
    title: "Application Received!",
    subtitle: "Thank you for registering on TicketMatch.",
    steps: [
      "We're reviewing your application",
      "You'll hear back from us within 24 hours",
      "Once approved, you'll have full access to the platform",
    ],
  },
};

function registrationConfirmationHTML(data: { contactName: string; companyName: string; companyType: string }) {
  const content = REGISTRATION_CONTENT[data.companyType] || REGISTRATION_CONTENT["default"];
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0f1729,#1a2744);padding:32px 40px;text-align:center;">
          <div style="display:inline-block;background:linear-gradient(135deg,#60a5fa,#2563eb);border-radius:12px;padding:8px 12px;margin-bottom:12px;">
            <span style="color:#fff;font-size:18px;font-weight:800;">TM</span>
          </div>
          <h1 style="color:#fff;font-size:22px;margin:8px 0 4px;font-weight:600;">Ticket<span style="color:#60a5fa;">Match</span></h1>
          <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">Registration Confirmation</p>
        </td></tr>

        <!-- Welcome -->
        <tr><td style="padding:32px 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:24px;">
            <tr><td align="center">
              <span style="font-size:40px;">${content.emoji}</span>
              <h2 style="color:#1e40af;font-size:20px;margin:12px 0 8px;font-weight:700;">${content.title}</h2>
              <p style="color:#64748b;font-size:14px;margin:0;line-height:1.6;">
                Hi <strong>${data.contactName}</strong>,<br>${content.subtitle}
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Company info -->
        <tr><td style="padding:24px 40px 0;">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;">
            <p style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Your Registration</p>
            <p style="color:#0f1729;font-size:16px;font-weight:600;margin:0;">${data.companyName}</p>
            <p style="color:#64748b;font-size:13px;margin:4px 0 0;">${data.companyType.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
          </div>
        </td></tr>

        <!-- What happens next -->
        <tr><td style="padding:24px 40px;">
          <h3 style="color:#0f1729;font-size:15px;margin:0 0 16px;font-weight:600;">What happens next?</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
            ${content.steps.map((step, i) => `
            <tr><td style="padding:14px 16px;${i < content.steps.length - 1 ? "border-bottom:1px solid #f1f5f9;" : ""}${i % 2 === 0 ? "background:#f8fafc;" : ""}">
              <span style="color:#2563eb;font-weight:700;margin-right:8px;">${i + 1}.</span>
              <span style="color:#0f1729;font-size:14px;">${step}</span>
            </td></tr>`).join("")}
          </table>
        </td></tr>

        <!-- Contact -->
        <tr><td style="padding:0 40px 32px;">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;text-align:center;">
            <p style="color:#166534;font-size:14px;margin:0;">Questions? Reach us at <a href="mailto:hello@ticketmatch.ai" style="color:#2563eb;font-weight:600;">hello@ticketmatch.ai</a></p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
          <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
            This email was sent to ${data.companyName} via <a href="https://ticketmatch.ai" style="color:#2563eb;text-decoration:none;">TicketMatch.ai</a>
          </p>
          <p style="color:#cbd5e1;font-size:11px;margin:8px 0 0;">&copy; ${new Date().getFullYear()} TicketMatch. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendRegistrationConfirmationEmail(params: {
  to: string;
  contactName: string;
  companyName: string;
  companyType: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping confirmation email");
    return { success: false, reason: "no_api_key" };
  }

  const content = REGISTRATION_CONTENT[params.companyType] || REGISTRATION_CONTENT["default"];

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject: `${content.emoji} ${content.title} — TicketMatch.ai`,
      html: registrationConfirmationHTML(params),
    });

    if (error) {
      console.error("Registration confirmation error:", error);
      return { success: false, reason: error.message };
    }

    console.log("Registration confirmation sent:", data?.id);
    return { success: true, emailId: data?.id };
  } catch (err) {
    console.error("Registration confirmation failed:", err);
    return { success: false, reason: "send_failed" };
  }
}

// ─── Smart approval email (type-specific) ────────────────────
const APPROVAL_CONTENT: Record<string, { emoji: string; title: string; description: string; steps: string[]; ctaText: string; ctaUrl: string }> = {
  "tour-operator": {
    emoji: "🎉",
    title: "You're Approved!",
    description: "Your Tour Operator account has been approved. Start booking activities for your groups!",
    steps: ["Browse the catalog of museums, attractions and experiences", "Create groups and manage your travelers", "Book tickets at exclusive B2B rates"],
    ctaText: "Browse Catalog",
    ctaUrl: "https://ticketmatch.ai/dashboard/catalog",
  },
  "travel-agency": {
    emoji: "🎉",
    title: "You're Approved!",
    description: "Your Travel Agency account is now active. Upload group lists and start booking!",
    steps: ["Upload your group passenger lists", "Book tickets for your groups at B2B rates", "Earn commission on every booking"],
    ctaText: "Go to Dashboard",
    ctaUrl: "https://ticketmatch.ai/dashboard",
  },
  "dmc": {
    emoji: "🌍",
    title: "Welcome, DMC Partner!",
    description: "Your Destination Management account is approved. Let's get your groups booked!",
    steps: ["Set up your destination services", "Create and manage tour groups", "Book venues and activities across multiple cities"],
    ctaText: "Go to Dashboard",
    ctaUrl: "https://ticketmatch.ai/dashboard",
  },
  "reseller": {
    emoji: "🤝",
    title: "Welcome, Reseller!",
    description: "You're now an official TicketMatch Reseller. Share your link and start earning!",
    steps: ["Copy your unique reseller link from your dashboard", "Share it with travel agencies in your network", "Earn commission on every booking they make"],
    ctaText: "Open Reseller Dashboard",
    ctaUrl: "https://ticketmatch.ai/dashboard/reseller",
  },
  "supplier": {
    emoji: "🔧",
    title: "Integration Approved!",
    description: "Your supplier account is approved. Let's get your API connected!",
    steps: ["Access your Partner Portal to configure your API", "Submit your API credentials and product catalog", "Go live and reach all TicketMatch operators"],
    ctaText: "Open Partner Portal",
    ctaUrl: "https://ticketmatch.ai/dashboard/partner",
  },
};

function smartApprovalEmailHTML(companyName: string, companyType: string) {
  const content = APPROVAL_CONTENT[companyType] || {
    emoji: "🎉",
    title: "You're Approved!",
    description: `Your account for ${companyName} has been approved. You now have full access to TicketMatch.`,
    steps: ["Browse the catalog of activities and venues", "Create groups and manage your travelers", "Book tickets and track everything in your dashboard"],
    ctaText: "Go to Dashboard",
    ctaUrl: "https://ticketmatch.ai/dashboard",
  };

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6fa;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <tr><td style="background:linear-gradient(135deg,#0f1729,#1a2744);padding:32px 40px;text-align:center;">
          <div style="display:inline-block;background:linear-gradient(135deg,#60a5fa,#2563eb);border-radius:12px;padding:8px 12px;margin-bottom:12px;">
            <span style="color:#fff;font-size:18px;font-weight:800;">TM</span>
          </div>
          <h1 style="color:#fff;font-size:22px;margin:8px 0 4px;font-weight:600;">Ticket<span style="color:#60a5fa;">Match</span></h1>
          <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;">Account Approved</p>
        </td></tr>

        <tr><td style="padding:32px 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;">
            <tr><td align="center">
              <span style="font-size:40px;">${content.emoji}</span>
              <h2 style="color:#16a34a;font-size:22px;margin:12px 0 8px;font-weight:700;">${content.title}</h2>
              <p style="color:#64748b;font-size:14px;margin:0;line-height:1.6;">
                Great news! <strong>${companyName}</strong><br>${content.description}
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:24px 40px;">
          <h3 style="color:#0f1729;font-size:15px;margin:0 0 16px;font-weight:600;">Get started</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
            ${content.steps.map((step, i) => `
            <tr><td style="padding:14px 16px;${i < content.steps.length - 1 ? "border-bottom:1px solid #f1f5f9;" : ""}${i % 2 === 0 ? "background:#f8fafc;" : ""}">
              <span style="color:#16a34a;font-weight:700;margin-right:8px;">${i + 1}.</span>
              <span style="color:#0f1729;font-size:14px;">${step}</span>
            </td></tr>`).join("")}
          </table>
        </td></tr>

        <tr><td style="padding:0 40px 32px;" align="center">
          <a href="${content.ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(22,163,74,0.3);">
            ${content.ctaText} &rarr;
          </a>
        </td></tr>

        <tr><td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">This email was sent to ${companyName} via <a href="https://ticketmatch.ai" style="color:#2563eb;text-decoration:none;">TicketMatch.ai</a></p>
          <p style="color:#cbd5e1;font-size:11px;margin:8px 0 0;">&copy; ${new Date().getFullYear()} TicketMatch. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendSmartApprovalEmail(params: {
  to: string[];
  companyName: string;
  companyType: string;
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping approval email");
    return { success: false, reason: "no_api_key" };
  }

  if (!params.to.length) return { success: false, reason: "no_recipients" };

  const content = APPROVAL_CONTENT[params.companyType] || APPROVAL_CONTENT["tour-operator"];

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `${content.emoji} ${content.title} — TicketMatch.ai`,
      html: smartApprovalEmailHTML(params.companyName, params.companyType),
    });

    if (error) {
      console.error("Smart approval error:", error);
      return { success: false, reason: error.message };
    }

    console.log("Smart approval email sent:", data?.id);
    return { success: true, emailId: data?.id };
  } catch (err) {
    console.error("Smart approval email failed:", err);
    return { success: false, reason: "send_failed" };
  }
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
