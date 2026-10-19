// HackForge AI's phishing/scam text model, run in TypeScript.
// Mirrors modules/text_scanner.py from HackForge-AI-V2: same cleaning, NLTK Porter stems,
// TF-IDF (1–2 grams, l2 norm) and the LinearSVC decision function. The weights come from
// src/data/hackforge-text-model.json, exported by scripts/export-model.py.
// explicit .ts so scripts/check-model.mjs can run this file directly in Node
import { porterStem } from "./porter.ts";

export type ModelData = {
  intercept: number;
  /** NLTK English stopwords, removed before stemming (as in text_scanner.py) */
  stopwords: string[];
  /** stop words the TfidfVectorizer itself drops after cleaning, if any */
  vectorizerStopwords?: string[];
  /** term -> [idf, svm weight] */
  terms: Record<string, [number, number]>;
};

export type ModelResult = { decision: number; probability: number; raisedBy: string[] };

export function createModel(data: ModelData) {
  const stop = new Set(data.stopwords);
  const vecStop = new Set(data.vectorizerStopwords ?? []);
  const terms = new Map(Object.entries(data.terms));

  /** text_scanner.preprocess_text, returning [stem, original word] pairs */
  function clean(text: string): [string, string][] {
    let t = String(text);
    // these four patterns are copied as written in HackForge, quirks included
    t = t.replace(/http\\S+|www\\S+/g, " ");
    t = t.replace(/\\S+@\\S+/g, " ");
    t = t.replace(/escapenumber/g, " ");
    t = t.replace(/forwarded by|original message|subject|cc|sent|from|to/g, " ");
    t = t.replace(/[^a-zA-Z]/g, " ");
    return t
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w && !stop.has(w) && w.length > 2)
      .map((w) => [porterStem(w), w]);
  }

  function score(text: string): ModelResult {
    // TfidfVectorizer: token_pattern keeps 2+ char tokens, then 1- and 2-grams
    const toks = clean(text).filter(([s]) => s.length >= 2 && !vecStop.has(s));
    const counts = new Map<string, { n: number; label: string }>();
    const add = (term: string, label: string) => {
      const c = counts.get(term);
      if (c) c.n++;
      else counts.set(term, { n: 1, label });
    };
    toks.forEach(([s, w]) => add(s, w));
    for (let i = 0; i < toks.length - 1; i++) add(`${toks[i][0]} ${toks[i + 1][0]}`, `${toks[i][1]} ${toks[i + 1][1]}`);

    let sq = 0;
    const feats: { label: string; x: number; coef: number }[] = [];
    for (const [term, { n, label }] of counts) {
      const t = terms.get(term);
      if (!t) continue;
      const x = n * t[0];
      sq += x * x;
      feats.push({ label, x, coef: t[1] });
    }
    const norm = Math.sqrt(sq) || 1;
    let decision = data.intercept;
    for (const f of feats) decision += (f.x / norm) * f.coef;

    // only explain with words the visitor actually typed; the cleaning can leave
    // fragments (e.g. "account" -> "ount") that would read as nonsense
    const typed = (label: string) => new RegExp(`\\b${label.replace(/ /g, "\\W+")}\\b`, "i").test(text);
    const raisedBy = feats
      .map((f) => ({ label: f.label, c: (f.x / norm) * f.coef }))
      .filter((f) => f.c > 0.02 && typed(f.label))
      .sort((a, b) => b.c - a.c)
      .slice(0, 4)
      .map((f) => f.label);

    // same squashing HackForge uses for its confidence, kept signed so it reads as P(phishing)
    const probability = Math.round(1000 / (1 + Math.exp(-decision))) / 10;
    return { decision, probability, raisedBy };
  }

  return { score, clean };
}
