// @ts-check
import { defineConfig } from "astro/config";

/**
 * Yayın hedefi ortam değişkenleriyle belirlenir:
 *   SITE_URL   → kök adres (varsayılan: GitHub Pages)
 *   BASE_PATH  → alt dizin; kendi alan adında yayınlarken "/" yapın
 *
 * Örn. özel alan adı:  SITE_URL=https://tuketicihakkim.com BASE_PATH=/ npm run build
 */
const site = process.env.SITE_URL || "https://osmnnl.github.io";
const base = process.env.BASE_PATH || "/tuketicihakkim";

export default defineConfig({
  site,
  base,
  trailingSlash: "always",
  build: { format: "directory" },
  compressHTML: true,
});
