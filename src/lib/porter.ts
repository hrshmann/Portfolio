// Port of NLTK's PorterStemmer (nltk 3.8.1, default NLTK_EXTENSIONS mode).
// HackForge's phishing model was trained on words stemmed by that class, so this
// must match it exactly; scripts/check-stemmer.mjs compares the two.

// a Map, not an object literal, so words like "constructor" don't hit Object.prototype
const POOL = new Map<string, string>(
  Object.entries({
    sky: "sky", skies: "sky", dying: "die", lying: "lie", tying: "tie", news: "news",
    innings: "inning", inning: "inning", outings: "outing", outing: "outing",
    cannings: "canning", canning: "canning", howe: "howe",
    proceed: "proceed", exceed: "exceed", succeed: "succeed",
  }),
);

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function isConsonant(w: string, i: number): boolean {
  if (VOWELS.has(w[i])) return false;
  if (w[i] === "y") return i === 0 ? true : !isConsonant(w, i - 1);
  return true;
}

function measure(stem: string): number {
  let seq = "";
  for (let i = 0; i < stem.length; i++) seq += isConsonant(stem, i) ? "c" : "v";
  return seq.split("vc").length - 1;
}

const positive = (stem: string) => measure(stem) > 0;

function containsVowel(stem: string): boolean {
  for (let i = 0; i < stem.length; i++) if (!isConsonant(stem, i)) return true;
  return false;
}

const endsDoubleConsonant = (w: string) =>
  w.length >= 2 && w[w.length - 1] === w[w.length - 2] && isConsonant(w, w.length - 1);

function endsCVC(w: string): boolean {
  const n = w.length;
  return (
    (n >= 3 && isConsonant(w, n - 3) && !isConsonant(w, n - 2) && isConsonant(w, n - 1) && !"wxy".includes(w[n - 1])) ||
    (n === 2 && !isConsonant(w, 0) && isConsonant(w, 1))
  );
}

const cut = (w: string, suffix: string) => (suffix ? w.slice(0, -suffix.length) : w);

type Rule = [suffix: string, replacement: string, cond: ((stem: string) => boolean) | null];

function applyRules(w: string, rules: Rule[]): string {
  for (const [suffix, rep, cond] of rules) {
    if (suffix === "*d" && endsDoubleConsonant(w)) {
      const stem = w.slice(0, -2);
      return !cond || cond(stem) ? stem + rep : w;
    }
    if (w.endsWith(suffix)) {
      const stem = cut(w, suffix);
      return !cond || cond(stem) ? stem + rep : w;
    }
  }
  return w;
}

function step1a(w: string): string {
  if (w.endsWith("ies") && w.length === 4) return cut(w, "ies") + "ie";
  return applyRules(w, [
    ["sses", "ss", null],
    ["ies", "i", null],
    ["ss", "ss", null],
    ["s", "", null],
  ]);
}

function step1b(w: string): string {
  if (w.endsWith("ied")) return w.length === 4 ? cut(w, "ied") + "ie" : cut(w, "ied") + "i";
  if (w.endsWith("eed")) {
    const stem = cut(w, "eed");
    return measure(stem) > 0 ? stem + "ee" : w;
  }
  let mid: string | null = null;
  for (const suffix of ["ed", "ing"]) {
    if (w.endsWith(suffix)) {
      const s = cut(w, suffix);
      if (containsVowel(s)) {
        mid = s;
        break;
      }
    }
  }
  if (mid === null) return w;
  const last = mid[mid.length - 1];
  return applyRules(mid, [
    ["at", "ate", null],
    ["bl", "ble", null],
    ["iz", "ize", null],
    ["*d", last, () => !"lsz".includes(last)],
    ["", "e", (stem) => measure(stem) === 1 && endsCVC(stem)],
  ]);
}

const step1c = (w: string) =>
  applyRules(w, [["y", "i", (stem) => stem.length > 1 && isConsonant(stem, stem.length - 1)]]);

function step2(w: string): string {
  if (w.endsWith("alli") && positive(cut(w, "alli"))) return step2(cut(w, "alli") + "al");
  return applyRules(w, [
    ["ational", "ate", positive],
    ["tional", "tion", positive],
    ["enci", "ence", positive],
    ["anci", "ance", positive],
    ["izer", "ize", positive],
    ["bli", "ble", positive],
    ["alli", "al", positive],
    ["entli", "ent", positive],
    ["eli", "e", positive],
    ["ousli", "ous", positive],
    ["ization", "ize", positive],
    ["ation", "ate", positive],
    ["ator", "ate", positive],
    ["alism", "al", positive],
    ["iveness", "ive", positive],
    ["fulness", "ful", positive],
    ["ousness", "ous", positive],
    ["aliti", "al", positive],
    ["iviti", "ive", positive],
    ["biliti", "ble", positive],
    ["fulli", "ful", positive],
    ["logi", "log", () => positive(w.slice(0, -3))],
  ]);
}

const step3 = (w: string) =>
  applyRules(w, [
    ["icate", "ic", positive],
    ["ative", "", positive],
    ["alize", "al", positive],
    ["iciti", "ic", positive],
    ["ical", "ic", positive],
    ["ful", "", positive],
    ["ness", "", positive],
  ]);

function step4(w: string): string {
  const m1 = (stem: string) => measure(stem) > 1;
  return applyRules(w, [
    ["al", "", m1],
    ["ance", "", m1],
    ["ence", "", m1],
    ["er", "", m1],
    ["ic", "", m1],
    ["able", "", m1],
    ["ible", "", m1],
    ["ant", "", m1],
    ["ement", "", m1],
    ["ment", "", m1],
    ["ent", "", m1],
    ["ion", "", (stem) => measure(stem) > 1 && (stem.endsWith("s") || stem.endsWith("t"))],
    ["ou", "", m1],
    ["ism", "", m1],
    ["ate", "", m1],
    ["iti", "", m1],
    ["ous", "", m1],
    ["ive", "", m1],
    ["ize", "", m1],
  ]);
}

function step5a(w: string): string {
  if (w.endsWith("e")) {
    const stem = cut(w, "e");
    if (measure(stem) > 1) return stem;
    if (measure(stem) === 1 && !endsCVC(stem)) return stem;
  }
  return w;
}

const step5b = (w: string) => applyRules(w, [["ll", "l", () => measure(w.slice(0, -1)) > 1]]);

export function porterStem(word: string): string {
  const w = word.toLowerCase();
  const irregular = POOL.get(w);
  if (irregular) return irregular;
  if (word.length <= 2) return w;
  return step5b(step5a(step4(step3(step2(step1c(step1b(step1a(w))))))));
}
