import { NextResponse } from "next/server";
import { google } from "googleapis";
import { allCities } from "@/app/cities/cities-data";
import { posts } from "@/app/blog/posts";

const BATCH_SIZE = 100;
const RATE_LIMIT_DELAY = 1000; // 1 second between batches

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
    },
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });
}

function getAllUrls(): string[] {
  const base = "https://ticketmatch.ai";
  const urls: string[] = [
    base,
    `${base}/cities`,
    `${base}/partners`,
    `${base}/partners/tech`,
    `${base}/partners/advertise`,
    `${base}/become-reseller`,
    `${base}/about`,
    `${base}/faq`,
    `${base}/developers`,
    `${base}/insights`,
    `${base}/blog`,
    `${base}/auth/login`,
    `${base}/auth/register`,
    `${base}/privacy`,
    `${base}/terms`,
  ];

  for (const city of allCities) {
    urls.push(`${base}/cities/${city.slug}`);
    for (const cat of city.topCategories) {
      urls.push(`${base}/cities/${city.slug}/${cat.slug}`);
    }
  }

  for (const post of posts) {
    urls.push(`${base}/blog/${post.slug}`);
    urls.push(`${base}/insights/${post.slug}`);
  }

  return urls;
}

async function submitUrl(
  token: string,
  url: string,
  type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED"
) {
  const res = await fetch(
    "https://indexing.googleapis.com/v3/urlNotifications:publish",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url, type }),
    }
  );
  const data = await res.json();
  return { url, status: res.status, data };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const singleUrl = body.url as string | undefined;

  const auth = getAuth();
  const client = await auth.getClient();
  const tokenRes = await client.getAccessToken();
  const token = tokenRes.token!;

  const results: { url: string; status: number; data: unknown }[] = [];
  const errors: { url: string; error: string }[] = [];

  if (singleUrl) {
    // Submit a single URL
    try {
      const result = await submitUrl(token, singleUrl);
      results.push(result);
    } catch (err) {
      errors.push({ url: singleUrl, error: String(err) });
    }
  } else {
    // Bulk submit all URLs
    const urls = getAllUrls();

    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map((url) => submitUrl(token, url))
      );

      for (const r of batchResults) {
        if (r.status === "fulfilled") {
          results.push(r.value);
        } else {
          errors.push({ url: "unknown", error: String(r.reason) });
        }
      }

      // Rate limit between batches
      if (i + BATCH_SIZE < urls.length) {
        await sleep(RATE_LIMIT_DELAY);
      }
    }
  }

  return NextResponse.json({
    totalUrls: singleUrl ? 1 : getAllUrls().length,
    submitted: results.length,
    succeeded: results.filter((r) => r.status === 200).length,
    failed: results.filter((r) => r.status !== 200).length + errors.length,
    errors: errors.length > 0 ? errors : undefined,
    sampleResults: results.slice(0, 5),
  });
}

export async function GET() {
  const urls = getAllUrls();
  return NextResponse.json({
    totalUrls: urls.length,
    sampleUrls: urls.slice(0, 20),
  });
}
