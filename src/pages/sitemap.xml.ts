import type { APIRoute } from "astro";
import { cases } from "../lib/cases";

const SITE = "https://tuketicihakkim.com";
const statics = ["/", "/senaryolar/", "/basvuru-rehberi/", "/hakkinda/"];

export const GET: APIRoute = () => {
  const urls = [
    ...statics.map((p) => ({ loc: SITE + p, lastmod: new Date().toISOString().slice(0, 10), pri: p === "/" ? "1.0" : "0.7" })),
    ...cases.map((c) => ({ loc: `${SITE}/${c.slug}/`, lastmod: c.updated, pri: "0.8" })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.pri}</priority></url>`).join("\n")}
</urlset>`;

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
