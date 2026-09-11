import type { APIRoute } from "astro";

const SITE = (import.meta.env.SITE ?? "").replace(/\/$/, "");
const BASE = import.meta.env.BASE_URL;

export const GET: APIRoute = () => {
  const sitemap = SITE + (BASE + "sitemap.xml").replace(/\/{2,}/g, "/");
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
