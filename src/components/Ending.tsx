"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";
import { epochs, profile } from "@/lib/content";
import { useShell } from "./Shell";

const STEPS = ["Packaging model…", "Running final checks… passed", "Deployed. Signing the file."];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Ending() {
  const { scrollTo } = useShell();
  const root = useRef<HTMLElement>(null);
  const sig = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState("");
  const [state, setState] = useState<"idle" | "running" | "signed">("idle");
  const last = epochs[epochs.length - 1];

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.fromTo(
        ".end-big .ch",
        { yPercent: 115 },
        { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.035, scrollTrigger: { trigger: ".end-big", start: "top 80%", once: true } },
      );
    },
    { scope: root },
  );

  const deploy = async () => {
    if (state === "running") return;
    setState("running");
    const fast = reducedMotion();
    for (const s of STEPS) {
      setLog(s);
      await sleep(fast ? 0 : 700);
    }
    setState("signed");
    if (!fast && sig.current) {
      // ink flows left to right behind a soft-edged mask
      await gsap.fromTo(sig.current, { "--p": "0%" }, { "--p": "115%", duration: 2.4, ease: "power1.inOut" });
    }
    setLog(`Signed. Write to ${profile.email} and I'll reply.`);
  };

  const word = (w: string) =>
    Array.from(w).map((ch, i) => (
      <span className="ch" key={i}>
        {ch}
      </span>
    ));

  return (
    <section className="ending wrap" ref={root} aria-labelledby="end-h">
      <p className="cap">
        loss {last.loss} · {epochs.length} epochs · ready
      </p>
      <h2 className="end-big" id="end-h">
        <span className="line">{word("Model")}</span> <span className="line ital">{word("converged.")}</span>
      </h2>

      <button type="button" className="btn solid deploy" onClick={deploy} disabled={state === "running"} data-cursor="DEPLOY">
        {state === "signed" ? "Deployed ✓" : "Deploy Harshdeep?"}
      </button>
      <p className="dlog" aria-live="polite">
        {log}
      </p>

      <div className="sig-block">
        <div className={`sig${state === "signed" ? " is-signed" : ""}`} ref={sig} aria-label={state === "signed" ? "Signed: Harshdeep" : "Awaiting signature"}>
          {profile.signature ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.signature} alt="" />
          ) : (
            <span className="sig-font">Harshdeep</span>
          )}
        </div>
        <div className="sig-line">
          <span aria-hidden="true">×</span>
          <span className="cap">{state === "signed" ? "Signed · Dubai · 2026" : "Signature pending deployment"}</span>
        </div>
      </div>

      <footer className="credits">
        <div className="cap">Designed and built by Harshdeep Maan in Dubai · 2026</div>
        <div className="credits-links cap">
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={profile.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              scrollTo(0);
            }}
          >
            Back to top ↑
          </a>
        </div>
      </footer>
    </section>
  );
}
