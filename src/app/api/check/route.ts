import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { createModel, type ModelData } from "@/lib/hackforge-model";
import { labelFor, ruleCheck, type Verdict } from "@/lib/phishing";

// POST { text } -> Verdict
// Scores with the HackForge phishing model when src/data/hackforge-text-model.json exists,
// otherwise with the fallback rules.

type Model = ReturnType<typeof createModel>;
let model: Model | null | undefined;

function loadModel(): Model | null {
  if (model !== undefined) return model;
  try {
    const file = path.join(process.cwd(), "src", "data", "hackforge-text-model.json");
    model = createModel(JSON.parse(readFileSync(file, "utf8")) as ModelData);
  } catch {
    model = null;
  }
  return model;
}

export async function POST(req: Request) {
  let text = "";
  try {
    const body = await req.json();
    text = String(body?.text ?? "").slice(0, 4000);
  } catch {
    return NextResponse.json({ error: "Send JSON like { \"text\": \"...\" }" }, { status: 400 });
  }

  const m = loadModel();
  if (m && text.trim()) {
    const { probability, raisedBy } = m.score(text);
    const verdict: Verdict = {
      probability: Math.round(probability),
      label: labelFor(probability),
      signals: raisedBy.map((w) => `“${w}” raised the score`),
      source: "model",
    };
    return NextResponse.json(verdict);
  }

  return NextResponse.json(ruleCheck(text));
}
