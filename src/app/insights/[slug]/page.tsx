import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ReadingProgressBar from "@/components/ui/ReadingProgressBar";
import ReadingTime from "@/components/ui/ReadingTime";
import ShareSave from "@/components/ui/ShareSave";
import EmmaSuggests from "@/components/ui/EmmaSuggests";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import { posts } from "../posts";

const categoryColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  Industry:   { bg: "bg-blue-500/10 dark:bg-blue-500/20",   text: "text-blue-600 dark:text-blue-400",   border: "border-l-blue-500",   gradient: "from-blue-500 to-blue-700" },
  Amsterdam:  { bg: "bg-orange-500/10 dark:bg-orange-500/20", text: "text-orange-600 dark:text-orange-400", border: "border-l-orange-500", gradient: "from-orange-500 to-red-600" },
  Technology: { bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-400", border: "border-l-purple-500", gradient: "from-purple-500 to-violet-700" },
  Guide:      { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", border: "border-l-emerald-500", gradient: "from-emerald-500 to-teal-700" },
  Data:       { bg: "bg-cyan-500/10 dark:bg-cyan-500/20",   text: "text-cyan-600 dark:text-cyan-400",   border: "border-l-cyan-500",   gradient: "from-cyan-500 to-blue-600" },
  Trends:     { bg: "bg-pink-500/10 dark:bg-pink-500/20",   text: "text-pink-600 dark:text-pink-400",   border: "border-l-pink-500",   gradient: "from-pink-500 to-rose-700" },
};
const defaultCat = { bg: "bg-surface-alt", text: "text-muted", border: "border-l-gray-400", gradient: "from-gray-500 to-gray-700" };

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: `${post.title} | TicketMatch.ai Insights`,
    description: post.description,
    alternates: { canonical: `/insights/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: ["TicketMatch.ai"],
    },
  };
}

function IconArrow() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default async function InsightPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const cat = categoryColors[post.category] || defaultCat;
  const readMinutes = parseInt(post.readTime) || 5;

  /* Series posts */
  const seriesPosts = post.series
    ? posts.filter((p) => p.series === post.series && p.slug !== post.slug)
    : [];

  /* Related posts (same category, excluding current and series) */
  const related = posts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 2);
  const moreInsights = related.length > 0 ? related : posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  /* Article JSON-LD — enhanced for AEO/GEO */
  const wordCount = post.content.split(/\s+/).length;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    wordCount,
    articleSection: post.category,
    inLanguage: "en",
    author: { "@type": "Organization", name: "TicketMatch.ai", url: "https://ticketmatch.ai" },
    publisher: {
      "@type": "Organization",
      name: "TicketMatch.ai",
      url: "https://ticketmatch.ai",
      logo: { "@type": "ImageObject", url: "https://ticketmatch.ai/icon-512.png", width: 512, height: 512 },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://ticketmatch.ai/insights/${post.slug}`,
    },
    isPartOf: { "@id": "https://ticketmatch.ai/#website" },
    about: {
      "@type": "Thing",
      name: "B2B group travel and city experiences in Europe",
    },
  };

  /* Parse markdown-ish content */
  const sections = post.content.split(/\n## /).map((s, i) => {
    if (i === 0) return { heading: null, body: s };
    const nl = s.indexOf("\n");
    return { heading: s.slice(0, nl), body: s.slice(nl + 1) };
  });

  return (
    <>
      <ReadingProgressBar />
      <Header />
      <div className="min-h-screen bg-background transition-colors">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* ════════════ ARTICLE HERO ════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[var(--hero-from)] via-background to-background transition-colors">
          <div className="absolute -left-20 top-10 h-[300px] w-[300px] rounded-full bg-accent/8 blur-[80px]" />
          <div className="absolute -right-20 top-20 h-[250px] w-[250px] rounded-full bg-purple-500/6 blur-[60px]" />

          <div className="relative mx-auto max-w-4xl px-6 pt-10 pb-8">
            <Breadcrumbs items={[{ label: "Insights", href: "/insights" }, { label: post.title }]} />

            {/* Meta row */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${cat.bg} ${cat.text}`}>
                {post.category}
              </span>
              {post.series && (
                <span className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-[11px] font-medium text-accent">
                  Series: {post.series}
                </span>
              )}
              <time className="text-[12px] text-muted" dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </time>
              <ReadingTime totalMinutes={readMinutes} />
            </div>

            {/* Title */}
            <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.15] tracking-tight md:text-[2.5rem]">
              {post.title}
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
              {post.description}
            </p>

            {/* Share & Save bar */}
            <div className="mt-6">
              <ShareSave title={post.title} />
            </div>
          </div>
        </section>

        {/* ════════════ CONTENT AREA ════════════ */}
        <div className="mx-auto max-w-7xl px-6 pb-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">

            {/* ──── Main article ──── */}
            <article id="article-content" className="min-w-0">
              <div className={`rounded-2xl border-l-4 ${cat.border} border border-card-border bg-card-bg p-6 md:p-8 lg:p-10`}>
                <div className="prose-custom space-y-5 text-[14.5px] leading-[1.8] text-muted">
                  {sections.map((section, i) => (
                    <div key={i}>
                      {section.heading && (
                        <h2 className="mb-3 mt-8 text-xl font-bold text-foreground first:mt-0">
                          {section.heading}
                        </h2>
                      )}
                      {section.body.split("\n\n").map((paragraph, j) => {
                        /* Subheading ### */
                        if (paragraph.startsWith("### ")) {
                          return (
                            <h3 key={j} className="mb-2 mt-6 text-[16px] font-bold text-foreground">
                              {paragraph.replace("### ", "")}
                            </h3>
                          );
                        }
                        /* List items */
                        if (paragraph.startsWith("- **") || paragraph.startsWith("- ")) {
                          const items = paragraph.split("\n").filter(Boolean);
                          return (
                            <ul key={j} className="my-3 space-y-2 pl-0">
                              {items.map((item, k) => (
                                <li key={k} className="flex gap-2.5">
                                  <span className="mt-[3px] shrink-0 text-accent/60">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.2" />
                                      <path d="M5.5 8L7.2 9.8L10.5 6.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </span>
                                  <span dangerouslySetInnerHTML={{
                                    __html: item
                                      .replace(/^- /, "")
                                      .replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground font-semibold'>$1</strong>"),
                                  }} />
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        /* Bold field (e.g., **Group capacity**: ...) */
                        if (paragraph.startsWith("**") && paragraph.includes("**:")) {
                          return (
                            <p key={j} className="text-[13px] text-muted/80" dangerouslySetInnerHTML={{
                              __html: paragraph.replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground font-semibold'>$1</strong>"),
                            }} />
                          );
                        }
                        /* Normal paragraph */
                        return paragraph.trim() ? (
                          <p key={j} dangerouslySetInnerHTML={{
                            __html: paragraph.replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground font-semibold'>$1</strong>"),
                          }} />
                        ) : null;
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* ──── Emma Suggests (below article) ──── */}
              {post.emmaQuestions && post.emmaQuestions.length > 0 && (
                <div className="mt-8">
                  <EmmaSuggests questions={post.emmaQuestions} />
                </div>
              )}

              {/* ──── Article Series ──── */}
              {post.series && seriesPosts.length > 0 && (
                <div className="mt-8 rounded-2xl border border-card-border bg-card-bg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-1 w-6 rounded-full bg-accent" />
                    <p className="text-[13px] font-bold">
                      More in <span className="text-accent">{post.series}</span>
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    {seriesPosts.map((p, i) => {
                      const pCat = categoryColors[p.category] || defaultCat;
                      return (
                        <Link
                          key={p.slug}
                          href={`/insights/${p.slug}`}
                          className="flex items-center gap-3 rounded-xl border border-card-border bg-card-bg p-3 transition-all hover:border-accent/20 hover:bg-accent/5 group"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-[11px] font-bold text-accent">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold truncate group-hover:text-accent transition-colors">{p.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[10px] font-semibold ${pCat.text}`}>{p.category}</span>
                              <span className="text-[10px] text-muted">{p.readTime}</span>
                            </div>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ──── Share bar (bottom) ──── */}
              <div className="mt-8 flex items-center justify-between rounded-xl border border-card-border bg-card-bg p-4">
                <p className="text-[12px] font-medium text-muted">Found this useful?</p>
                <ShareSave title={post.title} />
              </div>
            </article>

            {/* ──── Sidebar ──── */}
            <aside className="hidden lg:block space-y-6">
              {/* Sticky sidebar */}
              <div className="sticky top-6 space-y-6">

                {/* Newsletter */}
                <NewsletterSignup variant="card" />

                {/* Table of Contents */}
                <div className="rounded-2xl border border-card-border bg-card-bg p-5">
                  <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-accent mb-3">Contents</p>
                  <nav className="space-y-1.5">
                    {sections.filter(s => s.heading).map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-[12px] text-muted hover:text-foreground transition-colors">
                        <span className="mt-[2px] shrink-0 text-accent/40">{String(i + 1).padStart(2, "0")}</span>
                        <span className="leading-snug">{s.heading}</span>
                      </div>
                    ))}
                  </nav>
                </div>

                {/* Related posts */}
                <div className="rounded-2xl border border-card-border bg-card-bg p-5">
                  <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-accent mb-3">Related</p>
                  <div className="space-y-3">
                    {moreInsights.map((p) => {
                      const pCat = categoryColors[p.category] || defaultCat;
                      return (
                        <Link
                          key={p.slug}
                          href={`/insights/${p.slug}`}
                          className="block rounded-lg border border-card-border p-3 transition-all hover:border-accent/20 hover:bg-accent/5 group"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-semibold ${pCat.text}`}>{p.category}</span>
                            <span className="text-[10px] text-muted">{p.readTime}</span>
                          </div>
                          <p className="text-[12px] font-semibold leading-snug group-hover:text-accent transition-colors">
                            {p.title}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Emma mini CTA */}
                <div className="rounded-2xl bg-gradient-to-br from-[#0f1729] to-[#1a2744] p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-blue-700 shadow-md">
                      <span className="text-[10px] font-bold text-white">TM</span>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-white">Ask Emma</p>
                      <p className="text-[10px] text-white/40">AI Travel Intelligence</p>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-white/50 mb-3">
                    Have questions about this topic? Emma can provide deeper analysis and personalized recommendations.
                  </p>
                  <Link href="/" className="flex items-center justify-center gap-2 rounded-lg bg-white/10 py-2 text-[11px] font-semibold text-white transition-all hover:bg-white/20">
                    Talk to Emma <IconArrow />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* ════════════ CTA SECTION ════════════ */}
        <section className="bg-surface py-16 transition-colors">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <div className="rounded-3xl bg-gradient-to-br from-accent/5 to-cyan-500/5 border border-accent/10 p-8 md:p-12">
              <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">Join the Ecosystem</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight md:text-3xl">
                Ready to access the full intelligence?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
                300,000+ experiences. 10 supplier APIs. 8 AI agents. One membership.
              </p>
              <Link
                href="/auth/register"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-[13px] font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 hover:brightness-110"
              >
                Request Membership <IconArrow />
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
