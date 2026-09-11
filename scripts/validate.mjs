#!/usr/bin/env node
/** cases.json bütünlük kontrolü — npm run validate */
import { readFileSync } from "node:fs";

const cases = JSON.parse(readFileSync(new URL("../src/data/cases.json", import.meta.url), "utf8"));
const REQ = ["slug","title","question","verdict","category","aliases","summary","situation","legal","rights","deadline","authority","steps","basis","related","updated"];
const VERDICTS = new Set(["var", "yok", "kosullu"]);
const slugs = new Set();
const errors = [];

for (const [i, c] of cases.entries()) {
  const id = c.slug || `#${i}`;
  for (const k of REQ) if (!(k in c)) errors.push(`${id}: "${k}" alanı eksik`);
  if (!/^[a-z0-9-]+$/.test(c.slug || "")) errors.push(`${id}: slug yalnız a-z, 0-9 ve - içerebilir`);
  if (slugs.has(c.slug)) errors.push(`${id}: slug tekrar ediyor`);
  slugs.add(c.slug);
  if (!VERDICTS.has(c.verdict)) errors.push(`${id}: verdict "var" | "yok" | "kosullu" olmalı`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.updated || "")) errors.push(`${id}: updated YYYY-MM-DD olmalı`);
  for (const arr of ["aliases", "rights", "steps", "basis", "related"])
    if (!Array.isArray(c[arr])) errors.push(`${id}: "${arr}" dizi olmalı`);
  if (Array.isArray(c.basis))
    for (const b of c.basis)
      if (!b.law || !("article" in b) || !b.note) errors.push(`${id}: basis kaydı law/article/note içermeli`);
  if (!c.summary || c.summary.length < 40) errors.push(`${id}: summary çok kısa (en az 40 karakter)`);
}

for (const c of cases)
  for (const r of c.related || [])
    if (!slugs.has(r)) errors.push(`${c.slug}: kırık related referansı → ${r}`);

if (errors.length) {
  console.error(`✖ ${errors.length} hata:\n` + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`✓ ${cases.length} senaryo geçerli · ${new Set(cases.map((c) => c.category)).size} kategori`);
