"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";
import { profile } from "@/lib/content";
import type { Verdict } from "@/lib/phishing";
import SectionHead from "./SectionHead";

type SendState = { kind: "idle" | "sending" | "sent" | "fallback" | "error"; text: string };

const WORD: Record<Verdict["label"], string> = { safe: "Safe to send", suspicious: "Suspicious", phishing: "Likely phishing" };

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const pctEl = useRef<HTMLSpanElement>(null);
  const shown = useRef({ v: 0 });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [checking, setChecking] = useState(false);
  const [send, setSend] = useState<SendState>({ kind: "idle", text: "" });
  const [copied, setCopied] = useState(false);

  // check the message as the visitor types
  useEffect(() => {
    if (!message.trim()) {
      setVerdict(null);
      return;
    }
    const ctl = new AbortController();
    const id = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: message }),
          signal: ctl.signal,
        });
        if (res.ok) setVerdict(await res.json());
      } catch {
        /* aborted or offline: keep the last verdict */
      } finally {
        setChecking(false);
      }
    }, 380);
    return () => {
      clearTimeout(id);
      ctl.abort();
    };
  }, [message]);

  // count the percentage up or down to the new score
  useEffect(() => {
    const target = verdict?.probability ?? 0;
    const tween = gsap.to(shown.current, {
      v: target,
      duration: reducedMotion() ? 0 : 0.6,
      ease: "power3.out",
      onUpdate: () => {
        if (pctEl.current) pctEl.current.textContent = String(Math.round(shown.current.v));
      },
    });
    return () => {
      tween.kill();
    };
  }, [verdict]);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.fromTo(
        ".ct-form > *, .ct-direct > *",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.06, scrollTrigger: { trigger: ".ct-grid", start: "top 72%", once: true } },
      );
    },
    { scope: root },
  );

  const mailto = () =>
    `mailto:${profile.email}?subject=${encodeURIComponent(`Hello from ${name || "your portfolio"}`)}&body=${encodeURIComponent(`${message}\n\n${name}\n${email}`)}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSend({ kind: "sending", text: "Sending…" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, score: verdict?.probability }),
      });
      const data = await res.json();
      if (data.ok) {
        setSend({ kind: "sent", text: "Message received. I'll reply to the address you gave." });
        setMessage("");
      } else if (data.reason === "not-configured") {
        setSend({ kind: "fallback", text: "Direct sending isn't switched on yet. Your mail app will open with the message ready." });
        window.location.href = mailto();
      } else if (data.reason === "invalid") {
        setSend({ kind: "error", text: "Add your name, a valid email and a message, then send again." });
      } else {
        setSend({ kind: "error", text: `The message didn't go through. Email me directly at ${profile.email}.` });
      }
    } catch {
      setSend({ kind: "error", text: `You seem to be offline. Email me directly at ${profile.email}.` });
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard refused: the address is visible and selectable */
    }
  };

  const label = verdict?.label;

  return (
    <section className="sec wrap" id="contact" ref={root} aria-labelledby="contact-h">
      <SectionHead label="Contact" refNo="HM-2026 / F" id="contact-h">
        Make <em>contact.</em>
      </SectionHead>

      <div className="ct-grid">
        <form className="ct-form" onSubmit={submit}>
          <p className="ct-intro">
            Every message gets a phishing check as you type, a small nod to HackForge AI, the security tool I built.
          </p>
          <div className="ct-row">
            <div className="field">
              <label htmlFor="ct-name" className="cap">
                Your name
              </label>
              <input id="ct-name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="ct-email" className="cap">
                Your email
              </label>
              <input id="ct-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
          </div>

          <div className="ct-check">
            <div className="field">
              <label htmlFor="ct-msg" className="cap">
                Message
              </label>
              <textarea
                id="ct-msg"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Hi Harshdeep, we're hiring for…"
              />
            </div>

            <div className={`verdict${label ? ` is-${label}` : ""}`} aria-live="polite">
              <div className="v-top">
                <div>
                  <div className="cap">Phishing probability</div>
                  <div className="v-num">
                    <span ref={pctEl}>0</span>
                    <small>%</small>
                  </div>
                </div>
                <span className="v-word">{checking && !verdict ? "Checking" : label ? WORD[label] : "Waiting"}</span>
              </div>
              <div className="meter">
                <span style={{ width: `${verdict?.probability ?? 0}%` }} />
              </div>
              <ul className="signals">
                {!verdict && <li className="none">Start typing and the check runs live.</li>}
                {verdict && verdict.signals.length === 0 && <li className="none">No warning signs found.</li>}
                {verdict?.signals.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <p className="v-source cap">
                {verdict?.source === "model" ? "Scored by the HackForge phishing model" : "Checked against common phishing signs"}
              </p>
            </div>
          </div>

          <div className="ct-send">
            <button type="submit" className="btn solid" disabled={send.kind === "sending"}>
              {label === "phishing" ? "Send anyway" : "Send message"}
            </button>
            <p className={`send-status ${send.kind}`} aria-live="polite">
              {send.text}
            </p>
          </div>
        </form>

        <aside className="ct-direct" aria-label="Direct contact">
          <div className="cap ink">Direct lines</div>
          <div className="line-item">
            <span className="cap">Email</span>
            <span className="line-val">
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <button type="button" className="btn-link" onClick={copy}>
                {copied ? "Copied" : "Copy"}
              </button>
            </span>
          </div>
          <div className="line-item">
            <span className="cap">LinkedIn</span>
            <a className="line-val" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              harshdeep-maan ↗
            </a>
          </div>
          <div className="line-item">
            <span className="cap">GitHub</span>
            <a className="line-val" href={profile.github} target="_blank" rel="noopener noreferrer">
              hrshmann ↗
            </a>
          </div>
          {profile.resume && (
            <div className="line-item">
              <span className="cap">Resume</span>
              <a className="line-val" href={profile.resume} download>
                Download PDF ↓
              </a>
            </div>
          )}
          <div className="line-item">
            <span className="cap">Status</span>
            <span className="line-val">{profile.status} · {profile.visa}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
