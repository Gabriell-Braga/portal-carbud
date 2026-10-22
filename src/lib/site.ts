/** Origem pública do portal (canonical, sitemap, Open Graph). */
export function siteUrl(): string {
  const raw = (process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "localhost:3200").trim();
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `${raw.startsWith("localhost") ? "http" : "https"}://${raw}`;
  return withScheme.replace(/\/+$/, "");
}
