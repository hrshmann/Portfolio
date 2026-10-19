// Checks the TypeScript port against real Python scores.
// usage: node scripts/check-model.mjs   (after python scripts/export-model.py)
import { readFileSync } from "node:fs";
import { createModel } from "../src/lib/hackforge-model.ts";

const root = new URL("..", import.meta.url);
const data = JSON.parse(readFileSync(new URL("src/data/hackforge-text-model.json", root), "utf8"));
const fixtures = JSON.parse(readFileSync(new URL("scripts/model-fixtures.json", root), "utf8"));
const model = createModel(data);

let worst = 0;
let flips = 0;
for (const f of fixtures) {
  const { decision, probability } = model.score(f.text);
  const diff = Math.abs(decision - f.decision);
  worst = Math.max(worst, diff);
  if ((decision > 0 ? 1 : 0) !== f.prediction) flips++;
  console.log(`${diff < 1e-6 ? "ok  " : "DIFF"} py=${f.decision.toFixed(6)} ts=${decision.toFixed(6)} p=${probability}%  ${f.text.slice(0, 60)}`);
}
console.log(`\n${fixtures.length} messages · largest difference ${worst.toExponential(2)} · prediction flips ${flips}`);
process.exit(worst < 1e-6 && flips === 0 ? 0 : 1);
