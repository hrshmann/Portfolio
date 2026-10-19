"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, reducedMotion } from "@/lib/gsap";
import { useShell } from "./Shell";

function browserName() {
  const u = navigator.userAgent;
  const b = /Edg\//.test(u) ? "Edge" : /OPR\//.test(u) ? "Opera" : /Firefox\//.test(u) ? "Firefox" : /Chrome\//.test(u) ? "Chrome" : /Safari\//.test(u) ? "Safari" : "Unknown browser";
  const o = /Windows/.test(u) ? "Windows" : /Android/.test(u) ? "Android" : /iPhone|iPad/.test(u) ? "iOS" : /Mac OS X/.test(u) ? "macOS" : /Linux/.test(u) ? "Linux" : "unknown system";
  return `${b} on ${o}`;
}

function scanLines(): [string, string][] {
  const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  let tz = "";
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {}
  return [
    ["Incoming visitor", "logged"],
    ["Local time", tz ? `${t} · ${tz}` : t],
    ["Browser", browserName()],
    ["Screen", `${screen.width} × ${screen.height}`],
    ["Subject file", "HM-2026"],
    ["Clearance", "granted"],
  ];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** First-visit intro: scans the visitor, then lifts like a curtain. Once per session. */
export default function Preloader() {
  const { finishIntro, lockScroll } = useShell();
  const root = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<[string, string][]>([]);
  const [typed, setTyped] = useState<string[]>([]);
  const [active, setActive] = useState(-1);
  const exiting = useRef(false);

  const exit = () => {
    if (exiting.current || !root.current) return;
    exiting.current = true;
    try {
      sessionStorage.setItem("hs-intro", "1");
    } catch {}
    finishIntro();
    lockScroll(false);
    gsap.to(root.current, {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: 1.1,
      ease: "expo.inOut",
      onComplete: () => document.documentElement.classList.add("seen"),
    });
  };

  useEffect(() => {
    if (document.documentElement.classList.contains("seen") || reducedMotion()) {
      document.documentElement.classList.add("seen");
      finishIntro();
      return;
    }
    let cancelled = false;
    lockScroll(true);
    const data = scanLines();
    setLines(data);
    setTyped(data.map(() => ""));

    const total = data.reduce((s, [, v]) => s + v.length, 0);
    const progress = { v: 0 };
    gsap.to(progress, {
      v: 100,
      duration: (total * 26 + data.length * 170 + 400) / 1000,
      ease: "power1.inOut",
      onUpdate: () => {
        if (pct.current) pct.current.textContent = String(Math.round(progress.v)).padStart(3, "0");
        if (bar.current) bar.current.style.transform = `scaleX(${progress.v / 100})`;
      },
    });

    (async () => {
      await sleep(400);
      for (let i = 0; i < data.length; i++) {
        if (cancelled) return;
        setActive(i);
        const v = data[i][1];
        for (let k = 1; k <= v.length; k++) {
          if (cancelled) return;
          setTyped((prev) => prev.map((p, j) => (j === i ? v.slice(0, k) : p)));
          await sleep(26);
        }
        await sleep(170);
      }
      setActive(-1);
      await sleep(450);
      if (!cancelled) exit();
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="preloader" ref={root} role="status" aria-label="Loading">
      <div className="pre-top cap">
        <span>HARSH//SCAN</span>
        <button type="button" className="pre-skip" onClick={exit}>
          Skip intro
        </button>
      </div>
      <div className="pre-term">
        {lines.map(([k], i) => (
          <div key={k} className={`t-line${!typed[i] && i !== active ? " wait" : ""}${i === active ? " typing" : ""}`}>
            <span className="k">{k}</span>
            <span className="dots" aria-hidden="true" />
            <span className="v">{typed[i]}</span>
          </div>
        ))}
      </div>
      <div className="pre-bottom">
        <span className="cap">Scanning visitor</span>
        <span className="pre-pct" ref={pct}>
          000
        </span>
        <span className="pre-bar" ref={bar} />
      </div>
    </div>
  );
}
