export type Verdict = {
  probability: number; // 0–100
  label: "safe" | "suspicious" | "phishing";
  signals: string[];
  source: "model" | "rules";
};

// Fallback used only when the HackForge model data is missing; these rules just keep
// the form working without it.
const RULES: [RegExp, number, string][] = [
  [/\burgent|immediately|within \d+ ?(hours?|hrs|minutes?)|act now/i, 17, "Puts you under time pressure"],
  [/verify|confirm your|update your (details|account|information)/i, 15, "Asks you to verify details"],
  [/password|\botp\b|\bpin\b|cvv|card number|login details/i, 22, "Asks for login or card details"],
  [/suspend|locked|unusual activity|blocked|deactivat/i, 15, "Threatens your account"],
  [/you('ve| have)? won|winner|prize|lottery|reward|gift card|free money/i, 18, "Offer that is too good to be true"],
  [/https?:\/\/\S+|www\.\S+/i, 8, "Contains a link"],
  [/bit\.ly|tinyurl|\.xyz\b|\.top\b|\.click\b|-login|secure-?login|login-?update/i, 18, "Link domain looks disguised"],
  [/dear (customer|user|sir|madam|client)/i, 8, "Generic greeting"],
  [/bank|wire transfer|western union|crypto wallet|bitcoin/i, 9, "Mentions moving money"],
];

// 50% is where the model's own prediction flips to "Dangerous Communication"
export const labelFor = (p: number): Verdict["label"] =>
  p >= 50 ? "phishing" : p >= 30 ? "suspicious" : "safe";

export function ruleCheck(text: string): Verdict {
  const t = text.trim();
  const hits = RULES.filter(([re]) => re.test(t));
  const probability = t ? Math.min(97, 2 + hits.reduce((s, r) => s + r[1], 0)) : 0;
  return { probability, label: labelFor(probability), signals: hits.map((h) => h[2]), source: "rules" };
}
