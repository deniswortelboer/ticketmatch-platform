import { ImageResponse } from "next/og";
import { allCities } from "../cities-data";

export const runtime = "edge";

export const alt = "TicketMatch.ai — B2B Group Experiences";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = allCities.find((c) => c.slug === slug);

  if (!city) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            color: "#fff",
            fontSize: 48,
          }}
        >
          City not found
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 56px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a2744 50%, #0a0a0a 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top row: logo + B2B label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                fontSize: "22px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-1px",
              }}
            >
              TM
            </div>
            <span
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#e2e8f0",
                letterSpacing: "-0.5px",
              }}
            >
              TicketMatch.ai
            </span>
          </div>

          {/* B2B label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 20px",
              borderRadius: "20px",
              background: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              fontSize: "16px",
              fontWeight: 600,
              color: "#93c5fd",
            }}
          >
            B2B Group Experiences
          </div>
        </div>

        {/* Center: flag + city name + country */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "60px", lineHeight: "1" }}>{city.flag}</span>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "16px",
              marginTop: "4px",
            }}
          >
            <span
              style={{
                fontSize: "52px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-1px",
                lineHeight: "1.1",
              }}
            >
              {city.name}
            </span>
          </div>
          <span
            style={{
              fontSize: "24px",
              fontWeight: 500,
              color: "#94a3b8",
              marginTop: "2px",
            }}
          >
            {city.country}
          </span>
        </div>

        {/* Bottom row: stats + tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Stats */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "12px",
                background: "rgba(59, 130, 246, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.35)",
              }}
            >
              <span style={{ fontSize: "22px", fontWeight: 700, color: "#60a5fa" }}>
                {city.experiences}
              </span>
              <span style={{ fontSize: "16px", fontWeight: 500, color: "#93c5fd" }}>
                experiences
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "12px",
                background: "rgba(59, 130, 246, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.35)",
              }}
            >
              <span style={{ fontSize: "22px", fontWeight: 700, color: "#60a5fa" }}>
                {city.categories}
              </span>
              <span style={{ fontSize: "16px", fontWeight: 500, color: "#93c5fd" }}>
                categories
              </span>
            </div>
          </div>

          {/* Tagline */}
          <span
            style={{
              fontSize: "16px",
              fontWeight: 500,
              color: "#64748b",
              maxWidth: "360px",
              textAlign: "right",
            }}
          >
            {city.tagline}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      emoji: "twemoji",
    }
  );
}
