// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://tuketicihakkim.com",
  trailingSlash: "always",
  build: { format: "directory" },
  compressHTML: true,
});
