import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background transition-colors">
      <Header />

      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -left-20 top-10 h-[400px] w-[400px] rounded-full bg-accent/12 blur-[100px]" />
        <div className="pointer-events-none absolute -right-20 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[80px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.1fr]">

            {/* ═══════ LEFT: Content ═══════ */}
            <div className="mx-auto w-full max-w-xl text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[12px] font-semibold text-accent uppercase tracking-[0.15em]">Lost in the City</span>
              </div>

              <div className="mb-4 text-[6rem] md:text-[8rem] font-black leading-none tracking-tighter bg-gradient-to-r from-accent via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                404
              </div>

              <h1 className="text-[1.8rem] font-extrabold leading-[1.1] tracking-tight md:text-[2.2rem]">
                Oops! This page went{" "}
                <span className="bg-gradient-to-r from-accent via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  off the map
                </span>
              </h1>
              <p className="mt-4 text-[15px] leading-[1.7] text-muted">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
                Don&apos;t worry — there are 300,000+ experiences waiting for you.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:scale-[1.02] hover:shadow-accent/40"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Back to Homepage
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-card-bg px-6 py-3 text-sm font-semibold text-foreground transition-all hover:shadow-md"
                >
                  Visit FAQ
                </Link>
              </div>

              {/* Quick links */}
              <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs text-muted lg:justify-start">
                <Link href="/about" className="hover:text-accent transition-colors">About</Link>
                <Link href="/partners" className="hover:text-accent transition-colors">Partners</Link>
                <Link href="/become-reseller" className="hover:text-accent transition-colors">Resellers</Link>
                <Link href="/auth/register" className="hover:text-accent transition-colors">Register</Link>
                <Link href="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-accent transition-colors">Terms</Link>
              </div>
            </div>

            {/* ═══════ RIGHT: Visual (desktop only) ═══════ */}
            <div className="hidden lg:block">
              <div className="flex justify-center">
                <svg viewBox="0 0 360 320" className="w-full max-w-[380px]" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="nf-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="nf-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>

                  <circle cx="180" cy="160" r="130" fill="url(#nf-glow)" />
                  <circle cx="180" cy="160" r="120" fill="none" stroke="url(#nf-ring)" strokeWidth="1" strokeDasharray="6 5"
                    style={{ animation: "nf-spin 28s linear infinite", transformOrigin: "180px 160px" }} />
                  <circle cx="180" cy="160" r="75" fill="none" stroke="var(--color-accent)" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 4"
                    style={{ animation: "nf-spin-rev 20s linear infinite", transformOrigin: "180px 160px" }} />

                  {/* Center: compass */}
                  <circle cx="180" cy="160" r="44" fill="var(--color-accent)" fillOpacity="0.08" stroke="var(--color-accent)" strokeWidth="1.5" strokeOpacity="0.3" />
                  <text x="180" y="152" textAnchor="middle" fontSize="22">🧭</text>
                  <text x="180" y="172" textAnchor="middle" className="fill-accent" fontSize="7" fontWeight="700" letterSpacing="1">EXPLORING</text>

                  {/* Orbiting city nodes */}
                  {[
                    { cx: 180, cy: 35, label: "Amsterdam", emoji: "🏛️", color: "#60a5fa" },
                    { cx: 305, cy: 100, label: "Barcelona", emoji: "⛪", color: "#10b981" },
                    { cx: 305, cy: 225, label: "Paris", emoji: "🗼", color: "#f59e0b" },
                    { cx: 180, cy: 285, label: "Rome", emoji: "🏟️", color: "#a78bfa" },
                    { cx: 55, cy: 225, label: "London", emoji: "🎡", color: "#06b6d4" },
                    { cx: 55, cy: 100, label: "Prague", emoji: "🏰", color: "#ec4899" },
                  ].map((node, i) => (
                    <g key={i} style={{ animation: `nf-breathe 4s ease-in-out ${i * 0.4}s infinite` }}>
                      <line x1={node.cx} y1={node.cy} x2="180" y2="160" stroke={node.color} strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="3 3" />
                      <circle cx={node.cx} cy={node.cy} r="26" fill={node.color} fillOpacity="0.07" stroke={node.color} strokeWidth="0.8" strokeOpacity="0.3" />
                      <text x={node.cx} y={node.cy - 2} textAnchor="middle" fontSize="16">{node.emoji}</text>
                      <text x={node.cx} y={node.cy + 16} textAnchor="middle" className="fill-muted" fontSize="6.5" fontWeight="600">{node.label}</text>
                    </g>
                  ))}

                  {/* Orbiting dots */}
                  {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                    <circle key={`o-${i}`} cx="180" cy="40" r="2.5"
                      fill={["#60a5fa", "#10b981", "#f59e0b", "#a78bfa", "#06b6d4", "#ec4899"][i]}
                      fillOpacity="0.6"
                      style={{ animation: "nf-spin 28s linear infinite", transformOrigin: "180px 160px", transform: `rotate(${deg}deg)` }} />
                  ))}

                  <style>{`
                    @keyframes nf-spin { to { transform: rotate(360deg) } }
                    @keyframes nf-spin-rev { to { transform: rotate(-360deg) } }
                    @keyframes nf-breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.06) } }
                  `}</style>
                </svg>
              </div>

              <div className="max-w-md mx-auto text-center mt-6">
                <h2 className="text-xl font-extrabold tracking-tight">Still so much to explore</h2>
                <p className="mt-2 text-[13px] text-muted leading-relaxed">
                  300,000+ experiences across 3,000+ cities are just one click away.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { value: "3K+", label: "Cities" },
                    { value: "300K+", label: "Experiences" },
                    { value: "10", label: "API Sources" },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3.5 text-center shadow-lg">
                      <p className="text-lg font-extrabold text-white">{s.value}</p>
                      <p className="mt-0.5 text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
