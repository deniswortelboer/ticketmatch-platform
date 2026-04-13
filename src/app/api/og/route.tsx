import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "default";

  const configs: Record<string, { bg: string; accent: string; emoji: string; title: string; subtitle: string; badge: string }> = {
    reseller: {
      bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
      accent: "#fbbf24",
      emoji: "🤝",
      title: "Reseller Program",
      subtitle: "Earn commission on every booking. Get your own dashboard, referral link and real-time insights.",
      badge: "BECOME A RESELLER",
    },
    developer: {
      bg: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)",
      accent: "#a78bfa",
      emoji: "💻",
      title: "Developer Program",
      subtitle: "Full API access, sandbox environment, Developer AI Agent. Build on top of our ecosystem.",
      badge: "JOIN AS DEVELOPER",
    },
    agency: {
      bg: "linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)",
      accent: "#4ade80",
      emoji: "🎫",
      title: "Group Booking Platform",
      subtitle: "Book tickets for 300+ museums, attractions and city experiences at exclusive B2B rates.",
      badge: "JOIN TICKETMATCH.AI",
    },
    default: {
      bg: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e3a8a 100%)",
      accent: "#60a5fa",
      emoji: "🎯",
      title: "The B2B Ecosystem",
      subtitle: "Connect your travel business to 300+ venues across 8+ European cities.",
      badge: "THE B2B ECOSYSTEM",
    },
  };

  const config = configs[type] || configs.default;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: config.bg,
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.2)",
              borderRadius: "20px",
              padding: "8px 20px",
              fontSize: "14px",
              fontWeight: 700,
              color: "white",
              letterSpacing: "2px",
            }}
          >
            {config.badge}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.1,
            marginBottom: "16px",
            display: "flex",
          }}
        >
          {config.emoji} {config.title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.4,
            maxWidth: "800px",
            display: "flex",
          }}
        >
          {config.subtitle}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "80px",
            right: "80px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 800,
                color: "white",
              }}
            >
              TM
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "white", display: "flex" }}>
              ticketmatch.ai
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "32px" }}>
            {[
              { n: "300+", l: "Venues" },
              { n: "8+", l: "Cities" },
              { n: "24/7", l: "AI Agents" },
            ].map((s) => (
              <div key={s.l} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color: config.accent }}>{s.n}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "1px" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
