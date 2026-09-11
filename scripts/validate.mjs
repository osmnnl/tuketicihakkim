#!/usr/bin/env node
/** cases.json + frames.json bütünlük kontrolü — npm run validate */
import { readFileSync } from "node:fs";

const read = (f) => JSON.parse(readFileSync(new URL(`../src/data/${f}`, import.meta.url), "utf8"));
const cases = read("cases.json");
const frames = read("frames.json");

const CASE_REQ = ["slug", "title", "question", "verdict", "frame", "summary", "situation", "legal"];
const FRAME_REQ = ["category", "rights", "deadline", "authority", "steps", "basis"];
const OPTIONAL_OVERRIDE = ["rights", "deadline", "authority", "steps", "basis", "aliases", "related", "updated", "category"];
const VERDICTS = new Set(["var", "yok", "kosullu"]);

const errors = [];
const warnings = [];

// ---- çerçeveler ----
for (const [id, f] of Object.entries(frames)) {
  for (const k of FRAME_REQ) if (!(k in f)) errors.push(`çerçeve ${id}: "${k}" eksik`);
  if (Array.isArray(f.basis))
    for (const b of f.basis)
      if (!b.law || !("article" in b) || !b.note) errors.push(`çerçeve ${id}: basis kaydı law/article/note içermeli`);
}

// ---- senaryolar ----
const slugs = new Set();
const titles = new Map();

for (const [i, c] of cases.entries()) {
  const id = c.slug || `#${i}`;
  for (const k of CASE_REQ) if (!(k in c)) errors.push(`${id}: "${k}" alanı eksik`);
  for (const k of Object.keys(c))
    if (![...CASE_REQ, ...OPTIONAL_OVERRIDE].includes(k)) warnings.push(`${id}: bilinmeyen alan "${k}"`);

  if (!/^[a-z0-9-]+$/.test(c.slug || "")) errors.push(`${id}: slug yalnız a-z, 0-9 ve - içerebilir`);
  if (slugs.has(c.slug)) errors.push(`${id}: slug tekrar ediyor`);
  slugs.add(c.slug);

  if (!VERDICTS.has(c.verdict)) errors.push(`${id}: verdict "var" | "yok" | "kosullu" olmalı`);
  if (!frames[c.frame]) errors.push(`${id}: tanımsız çerçeve "${c.frame}"`);
  if (c.updated && !/^\d{4}-\d{2}-\d{2}$/.test(c.updated)) errors.push(`${id}: updated YYYY-MM-DD olmalı`);

  for (const arr of ["aliases", "rights", "steps", "basis", "related"])
    if (arr in c && !Array.isArray(c[arr])) errors.push(`${id}: "${arr}" dizi olmalı`);

  if (!c.summary || c.summary.length < 40) errors.push(`${id}: summary çok kısa (en az 40 karakter)`);
  if (!c.situation || c.situation.length < 60) errors.push(`${id}: situation çok kısa (en az 60 karakter)`);
  if (!c.legal || c.legal.length < 60) errors.push(`${id}: legal çok kısa (en az 60 karakter)`);
  if (!c.question || !c.question.includes("?")) errors.push(`${id}: question soru işareti içermeli`);

  const key = (c.title || "").toLocaleLowerCase("tr").trim();
  if (titles.has(key)) warnings.push(`${id}: başlık "${c.title}" ile ${titles.get(key)} çakışıyor`);
  else titles.set(key, c.slug);
}

for (const c of cases)
  for (const r of c.related || [])
    if (!slugs.has(r)) errors.push(`${c.slug}: kırık related referansı → ${r}`);

// ---- rapor ----
if (warnings.length) console.warn(`⚠ ${warnings.length} uyarı:\n` + warnings.slice(0, 15).map((w) => "  - " + w).join("\n"));
if (errors.length) {
  console.error(`✖ ${errors.length} hata:\n` + errors.slice(0, 40).map((e) => "  - " + e).join("\n"));
  process.exit(1);
}

const byFrame = {};
for (const c of cases) byFrame[c.frame] = (byFrame[c.frame] || 0) + 1;
const cats = new Set(cases.map((c) => frames[c.frame].category));
console.log(`✓ ${cases.length} senaryo · ${cats.size} kategori · ${Object.keys(frames).length} çerçeve`);
console.log("  " + Object.entries(byFrame).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join("  "));
