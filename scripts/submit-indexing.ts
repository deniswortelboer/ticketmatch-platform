import { google } from "googleapis";
import { allCities } from "../src/app/cities/cities-data";
import { posts } from "../src/app/blog/posts";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const PROGRESS_FILE = join(__dirname, "indexing-progress.json");

const auth = new google.auth.GoogleAuth({
  keyFile: "/Users/w69aiconsultancy/Downloads/ticketmatch-492516-98aa54a5a04c.json",
  scopes: ["https://www.googleapis.com/auth/indexing"],
});

const base = "https://ticketmatch.ai";
const urls: string[] = [
  `${base}/`,
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

function loadProgress(): Set<string> {
  try {
    const data = JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
    return new Set(data.submitted);
  } catch {
    return new Set();
  }
}

function saveProgress(submitted: Set<string>) {
  writeFileSync(
    PROGRESS_FILE,
    JSON.stringify(
      { submitted: [...submitted], lastRun: new Date().toISOString() },
      null,
      2
    )
  );
}

async function main() {
  const alreadyDone = loadProgress();
  const remaining = urls.filter((u) => !alreadyDone.has(u));

  console.log(`Total URLs: ${urls.length}`);
  console.log(`Already submitted: ${alreadyDone.size}`);
  console.log(`Remaining: ${remaining.length}`);

  if (remaining.length === 0) {
    console.log("All URLs already submitted!");
    return;
  }

  const client = await auth.getClient();
  const tokenRes = await client.getAccessToken();
  const token = tokenRes.token;

  let success = 0;
  let failed = 0;

  for (let i = 0; i < remaining.length; i++) {
    try {
      const res = await fetch(
        "https://indexing.googleapis.com/v3/urlNotifications:publish",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url: remaining[i], type: "URL_UPDATED" }),
        }
      );

      if (res.status === 200) {
        success++;
        alreadyDone.add(remaining[i]);
      } else if (res.status === 429) {
        console.log(`⚠️  Rate limited at URL #${i + 1}`);
        console.log("Daily quota reached. Run again tomorrow!");
        break;
      } else {
        failed++;
        const data = await res.json();
        console.log(`❌ ${res.status} ${remaining[i]}`, JSON.stringify(data));
      }

      if ((i + 1) % 50 === 0) {
        console.log(`📊 Progress: ${i + 1} (${success} ok, ${failed} failed)`);
        saveProgress(alreadyDone);
      }
    } catch (e: any) {
      failed++;
      console.log(`❌ Error: ${remaining[i]} ${e.message}`);
    }
  }

  saveProgress(alreadyDone);

  console.log("");
  console.log("=== DONE ===");
  console.log(`✅ Today: ${success} submitted`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total done: ${alreadyDone.size}/${urls.length}`);
  console.log(`📋 Remaining: ${urls.length - alreadyDone.size}`);
}

main();
