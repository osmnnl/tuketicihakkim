/** Alt dizinde (GitHub Pages) yayınlamayı destekleyen dahili bağlantı yardımcısı. */
const BASE = import.meta.env.BASE_URL; // her zaman "/" ile biter

/** url("/senaryolar/") → "/tuketicihakkim/senaryolar/" */
export function url(path: string): string {
  return (BASE + path.replace(/^\/+/, "")).replace(/\/{2,}/g, "/");
}

/** Tam (mutlak) adres — canonical, og:url ve sitemap için. */
export function absUrl(path: string): string {
  const site = import.meta.env.SITE?.replace(/\/$/, "") ?? "";
  return site + url(path);
}

export { BASE };
