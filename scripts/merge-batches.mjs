#!/usr/bin/env node
/** .batches/*.json dosyalarını cases.json ile birleştirir (slug tekrarlarını atlar). */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const casesPath = join(root, "src/data/cases.json");
const batchDir = join(root, ".batches");

const cases = JSON.parse(readFileSync(casesPath, "utf8"));
const seen = new Set(cases.map((c) => c.slug));
let added = 0, skipped = 0;

if (!existsSync(batchDir)) { console.log("parti klasörü yok"); process.exit(0); }

for (const file of readdirSync(batchDir).filter((f) => f.endsWith(".json")).sort()) {
  const batch = JSON.parse(readFileSync(join(batchDir, file), "utf8"));
  let n = 0;
  for (const c of batch) {
    if (seen.has(c.slug)) { skipped++; continue; }
    seen.add(c.slug);
    cases.push(c);
    n++; added++;
  }
  console.log(`  ${file}: +${n}`);
}

writeFileSync(casesPath, JSON.stringify(cases, null, 2) + "\n");
console.log(`✓ ${added} senaryo eklendi${skipped ? `, ${skipped} tekrar atlandı` : ""} → toplam ${cases.length}`);
