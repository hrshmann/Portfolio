import { NextResponse } from "next/server";

// POST { name, email, message, score } -> { ok } | { ok: false, reason }
// Sends through Resend when RESEND_API_KEY and CONTACT_TO are set.
// Without them it answers reason "not-configured" and the form falls back to the visitor's mail app.
export async function POST(req: Request) {
  let body: { name?: string; email?: string; message?: string; score?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-request" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const message = String(body.message ?? "").trim().slice(0, 5000);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (!key || !to) return NextResponse.json({ ok: false, reason: "not-configured" }, { status: 503 });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>",
      to,
      reply_to: email,
      subject: `Portfolio message from ${name}`,
      text: `${message}\n\n— ${name} <${email}>\nPhishing score: ${body.score ?? "n/a"}%`,
    }),
  });

  if (!res.ok) return NextResponse.json({ ok: false, reason: "send-failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
