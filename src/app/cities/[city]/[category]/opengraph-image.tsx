import { ImageResponse } from "next/og";
import { allCities } from "../../cities-data";

export const runtime = "edge";

export const alt = "TicketMatch.ai — B2B Group Experiences";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ city: string; category: string }>;
}) {
  const { city: citySlug, category: catSlug } = await params;
  const city = allCities.find((c) => c.slug === citySlug);
  const cat = city?.topCategories.find((c) => c.slug === catSlug);

  if (!city || !cat) {
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
          Not found
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

        {/* Center: flag + category + city */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "52px", lineHeight: "1" }}>{city.flag}</span>
            <span style={{ fontSize: "40px", lineHeight: "1" }}>{cat.icon}</span>
          </div>

          {/* Category name */}
          <span
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-1px",
              lineHeight: "1.1",
              marginTop: "8px",
            }}
          >
            {cat.name}
          </span>

          {/* City + Country */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "2px" }}>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 600,
                color: "#cbd5e1",
              }}
            >
              {city.name}
            </span>
            <span style={{ fontSize: "24px", color: "#475569" }}>/</span>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 500,
                color: "#94a3b8",
              }}
            >
              {city.country}
            </span>
          </div>
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
                {cat.count}
              </span>
              <span style={{ fontSize: "16px", fontWeight: 500, color: "#93c5fd" }}>
                {cat.name.toLowerCase()}
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
                {city.experiences}
              </span>
              <span style={{ fontSize: "16px", fontWeight: 500, color: "#93c5fd" }}>
                total in {city.name}
              </span>
            </div>
          </div>

          {/* Category description snippet */}
          <span
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#64748b",
              maxWidth: "340px",
              textAlign: "right",
              lineHeight: "1.4",
            }}
          >
            {cat.description.length > 100
              ? cat.description.slice(0, 100) + "..."
              : cat.description}
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
