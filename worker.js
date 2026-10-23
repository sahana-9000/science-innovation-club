const FEEDS = [
  { name: "NASA JPL", url: "https://www.jpl.nasa.gov/feeds/news/", category: "SPACE" },
  { name: "ESA", url: "https://www.esa.int/rssfeed/Our_Activities/Space_News", category: "SPACE" },
  { name: "NSF", url: "https://www.nsf.gov/rss/rss_www_news.xml", category: "INNOVATION" },
  { name: "arXiv AI", url: "https://rss.arxiv.org/rss/cs.AI", category: "ARTIFICIAL INTELLIGENCE" },
  { name: "arXiv Machine Learning", url: "https://rss.arxiv.org/rss/cs.LG", category: "ARTIFICIAL INTELLIGENCE" },
  { name: "arXiv Astronomy", url: "https://rss.arxiv.org/rss/astro-ph", category: "SPACE" },
];

const CACHE_KEY = "latest-news-v1";

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match?.[1] ?? "";
}

function linkFrom(block) {
  const atomLink = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?\s*>/i);
  if (atomLink) return atomLink[1];
  return decodeXml(tag(block, "link"));
}

async function readFeed(feed) {
  const response = await fetch(feed.url, {
    headers: { "user-agent": "ScienceInnovationClubNews/1.0 (RSS reader)" },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`${feed.name} returned ${response.status}`);
  const xml = await response.text();
  const entries = xml.match(/<(item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi) ?? [];
  return entries.map((entry) => {
    const dateText = tag(entry, "pubDate") || tag(entry, "published") || tag(entry, "updated");
    const parsedDate = new Date(decodeXml(dateText));
    const summary = decodeXml(tag(entry, "description") || tag(entry, "summary") || tag(entry, "content"));
    return {
      id: linkFrom(entry) || decodeXml(tag(entry, "guid")) || decodeXml(tag(entry, "id")),
      category: feed.category,
      source: feed.name,
      title: decodeXml(tag(entry, "title")) || "Untitled story",
      description: summary || "Open the original source for the full story.",
      url: linkFrom(entry),
      publishedAt: Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString(),
      tag: feed.category === "SPACE" ? "ASTRONOMY" : feed.category === "ARTIFICIAL INTELLIGENCE" ? "AI & COMPUTING" : "SCIENCE",
    };
  }).filter((item) => item.title && item.url && /^https?:\/\//i.test(item.url));
}

async function collectNews() {
  const results = await Promise.allSettled(FEEDS.map(readFeed));
  const items = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
  const unique = [...new Map(items.map((item) => [item.url, item])).values()];
  unique.sort((a, b) => (Date.parse(b.publishedAt ?? "") || 0) - (Date.parse(a.publishedAt ?? "") || 0));
  return { updatedAt: new Date().toISOString(), items: unique.slice(0, 48) };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300" },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/news") {
      try {
        if (env.NEWS_CACHE) {
          const cached = await env.NEWS_CACHE.get(CACHE_KEY, "json");
          if (cached?.items?.length && Date.now() - Date.parse(cached.updatedAt) < 2 * 60 * 60 * 1000) return json(cached);
        }
        const news = await collectNews();
        if (env.NEWS_CACHE) await env.NEWS_CACHE.put(CACHE_KEY, JSON.stringify(news), { expirationTtl: 60 * 60 * 3 });
        return json(news);
      } catch {
        return json({ updatedAt: null, items: [], error: "News sources are temporarily unavailable." }, 503);
      }
    }
    return env.ASSETS.fetch(request);
  },

  async scheduled(_event, env, ctx) {
    if (!env.NEWS_CACHE) return;
    ctx.waitUntil(collectNews().then((news) => env.NEWS_CACHE.put(CACHE_KEY, JSON.stringify(news), { expirationTtl: 60 * 60 * 3 })));
  },
};
