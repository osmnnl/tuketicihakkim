import rawCases from "../data/cases.json";
import rawFrames from "../data/frames.json";

export type Verdict = "var" | "yok" | "kosullu";

export interface Basis {
  law: string;
  article: string;
  note: string;
}

/** Kategori düzeyinde ortak hukuki çerçeve — senaryolarda tekrarlanmaz. */
export interface Frame {
  category: string;
  rights: string[];
  deadline: string;
  authority: string;
  steps: string[];
  basis: Basis[];
}

/** cases.json'daki ham kayıt: çerçeveden gelen alanlar burada isteğe bağlıdır. */
interface RawCase {
  slug: string;
  title: string;
  question: string;
  verdict: Verdict;
  frame?: string;
  category?: string;
  aliases?: string[];
  summary: string;
  situation: string;
  legal: string;
  rights?: string[];
  deadline?: string;
  authority?: string;
  steps?: string[];
  basis?: Basis[];
  related?: string[];
  updated?: string;
}

export interface Case {
  slug: string;
  title: string;
  question: string;
  verdict: Verdict;
  category: string;
  frame: string;
  aliases: string[];
  summary: string;
  situation: string;
  legal: string;
  rights: string[];
  deadline: string;
  authority: string;
  steps: string[];
  basis: Basis[];
  related: string[];
  updated: string;
}

export const frames = rawFrames as Record<string, Frame>;

const DEFAULT_UPDATED = "2026-09-11";

/** Çerçeveyi kategoriden geri bulur — eski kayıtlarda "frame" alanı olmayabilir. */
const frameIdByCategory = new Map(
  Object.entries(frames).map(([id, f]) => [f.category, id])
);

function resolve(raw: RawCase): Case {
  const frameId = raw.frame ?? (raw.category ? frameIdByCategory.get(raw.category) : undefined);
  const f = frameId ? frames[frameId] : undefined;

  if (!f) throw new Error(`"${raw.slug}" için çerçeve bulunamadı (frame: ${raw.frame}, category: ${raw.category})`);

  return {
    slug: raw.slug,
    title: raw.title,
    question: raw.question,
    verdict: raw.verdict,
    category: raw.category ?? f.category,
    frame: frameId!,
    aliases: raw.aliases ?? [],
    summary: raw.summary,
    situation: raw.situation,
    legal: raw.legal,
    rights: raw.rights ?? f.rights,
    deadline: raw.deadline ?? f.deadline,
    authority: raw.authority ?? f.authority,
    steps: raw.steps ?? f.steps,
    basis: raw.basis ?? f.basis,
    related: raw.related ?? [],
    updated: raw.updated ?? DEFAULT_UPDATED,
  };
}

const resolved: Case[] = (rawCases as RawCase[]).map(resolve);

export const cases: Case[] = resolved
  .slice()
  .sort((a, b) => a.title.localeCompare(b.title, "tr"));

export const bySlug = new Map(cases.map((c) => [c.slug, c]));

export const categories: string[] = [...new Set(cases.map((c) => c.category))].sort((a, b) =>
  a.localeCompare(b, "tr")
);

/** Elle yazılmamış "benzer senaryolar" listesini aynı çerçeveden deterministik olarak doldurur. */
const byFrame = new Map<string, Case[]>();
for (const c of cases) {
  const list = byFrame.get(c.frame) ?? [];
  list.push(c);
  byFrame.set(c.frame, list);
}

for (const c of cases) {
  if (c.related.length) continue;
  const siblings = byFrame.get(c.frame) ?? [];
  const i = siblings.findIndex((x) => x.slug === c.slug);
  const picked: string[] = [];
  // komşulardan başlayarak halka şeklinde 6 kardeş seç
  for (let step = 1; picked.length < 6 && step < siblings.length; step++) {
    const next = siblings[(i + step) % siblings.length];
    if (next.slug !== c.slug) picked.push(next.slug);
  }
  c.related = picked;
}

export const verdictLabel: Record<Verdict, string> = {
  var: "Hakkınız var",
  yok: "Hakkınız yok",
  kosullu: "Duruma göre değişir",
};

export const verdictShort: Record<Verdict, string> = {
  var: "HAKKINIZ VAR",
  yok: "HAKKINIZ YOK",
  kosullu: "DURUMA GÖRE",
};

export function related(c: Case): Case[] {
  return c.related.map((s) => bySlug.get(s)).filter((x): x is Case => Boolean(x));
}

export function neighbours(c: Case): { prev: Case | null; next: Case | null } {
  const i = cases.findIndex((x) => x.slug === c.slug);
  return {
    prev: i > 0 ? cases[i - 1] : null,
    next: i < cases.length - 1 ? cases[i + 1] : null,
  };
}

/** Arama motoruna gidecek küçük indeks — istemciye JSON olarak gömülür. */
export const searchIndex = cases.map((c) => ({
  s: c.slug,
  t: c.title,
  q: c.question,
  c: c.category,
  v: c.verdict,
  a: c.aliases.join(" "),
}));
