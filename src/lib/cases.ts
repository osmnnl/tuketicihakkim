import raw from "../data/cases.json";

export type Verdict = "var" | "yok" | "kosullu";

export interface Basis {
  law: string;
  article: string;
  note: string;
}

export interface Case {
  slug: string;
  title: string;
  question: string;
  verdict: Verdict;
  category: string;
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

export const cases: Case[] = (raw as Case[])
  .slice()
  .sort((a, b) => a.title.localeCompare(b.title, "tr"));

export const bySlug = new Map(cases.map((c) => [c.slug, c]));

export const categories: string[] = [...new Set(cases.map((c) => c.category))].sort((a, b) =>
  a.localeCompare(b, "tr")
);

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
