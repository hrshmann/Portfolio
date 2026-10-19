"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, reducedMotion } from "@/lib/gsap";
import { epochs } from "@/lib/content";
import SectionHead from "./SectionHead";

// chart geometry (SVG units)
const X0 = 44, X1 = 404, Y0 = 24, Y1 = 220;
const xAt = (i: number) => X0 + ((i + 1) * (X1 - X0)) / epochs.length; // i = -1 is the origin
const yAt = (loss: number) => Y1 - loss * (Y1 - Y0);
const pts: [number, number][] = [[xAt(-1), yAt(1)], ...epochs.map((e, i) => [xAt(i), yAt(e.loss)] as [number, number])];

/** Monotone cubic through the points, so the curve never dips below a value it didn't reach. */
function monotonePath(p: [number, number][]) {
  const n = p.length;
  const d = p.slice(0, -1).map((a, i) => (p[i + 1][1] - a[1]) / (p[i + 1][0] - a[0]));
  const m = p.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  let s = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const h = (p[i + 1][0] - p[i][0]) / 3;
    s += ` C${p[i][0] + h},${p[i][1] + m[i] * h} ${p[i + 1][0] - h},${p[i + 1][1] - m[i + 1] * h} ${p[i + 1][0]},${p[i + 1][1]}`;
  }
  return s;
}
const curve = monotonePath(pts);
const fmt = (l: number) => (l < 0.01 ? l.toFixed(4) : l.toFixed(3));

export default function TrainingLog() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(-1);

  useGSAP(
    () => {
      if (reducedMotion()) {
        setActive(epochs.length - 1);
        return;
      }
      const path = root.current!.querySelector<SVGPathElement>(".tl-curve")!;
      const len = path.getTotalLength();
      gsap.fromTo(
        path,
        { strokeDasharray: len, strokeDashoffset: len },
        { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".tl-epochs", start: "top 65%", end: "bottom 55%", scrub: 0.6 } },
      );
      gsap.utils.toArray<HTMLElement>(".epoch").forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 65%",
          end: "bottom 65%",
          onEnter: () => setActive(i),
          onEnterBack: () => setActive(i),
          onLeaveBack: () => i === 0 && setActive(-1),
        });
        gsap.fromTo(
          el.querySelectorAll(".chips li"),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.035, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 75%", once: true } },
        );
      });
    },
    { scope: root },
  );

  const shown = active < 0 ? null : epochs[active];

  return (
    <section className="sec wrap" id="training" ref={root} aria-labelledby="training-h">
      <SectionHead label="Training log" refNo="HM-2026 / B" id="training-h">
        Training <em>log.</em>
      </SectionHead>

      <div className="tl-grid">
        <div className="tl-chart">
          <svg viewBox="0 0 420 262" role="img" aria-label="Training loss falling across five epochs, one per skill group">
            <line className="tl-axis" x1={X0} y1={Y0} x2={X0} y2={Y1} />
            <line className="tl-axis" x1={X0} y1={Y1} x2={X1} y2={Y1} />
            {[0, 0.5, 1].map((v) => (
              <g key={v}>
                <line className="tl-grid-line" x1={X0} x2={X1} y1={yAt(v)} y2={yAt(v)} />
                <text className="tl-tick" x={X0 - 8} y={yAt(v) + 4} textAnchor="end">
                  {v.toFixed(1)}
                </text>
              </g>
            ))}
            {epochs.map((_, i) => (
              <text key={i} className="tl-tick" x={xAt(i)} y={Y1 + 20} textAnchor="middle">
                {i + 1}
              </text>
            ))}
            <text className="tl-tick" x={X0} y={12}>
              loss
            </text>
            <text className="tl-tick" x={X1} y={258} textAnchor="end">
              epoch
            </text>
            <path className="tl-curve" d={curve} />
            {epochs.map((e, i) => (
              <circle key={i} className={`tl-dot${i <= active ? " on" : ""}${i === active ? " now" : ""}`} cx={xAt(i)} cy={yAt(e.loss)} r={i === active ? 5 : 3.5} />
            ))}
          </svg>
          <div className="tl-readout cap" aria-live="polite">
            <span>
              Epoch <b>{shown ? String(active + 1).padStart(2, "0") : "--"}</b> / {String(epochs.length).padStart(2, "0")}
            </span>
            <span>
              Loss <b>{shown ? fmt(shown.loss) : "-.---"}</b>
            </span>
            <span className="tl-now">{shown ? shown.title : "Waiting for data"}</span>
          </div>
        </div>

        <ol className="tl-epochs">
          {epochs.map((e, i) => (
            <li key={e.title} className={`epoch${i === active ? " is-active" : ""}`}>
              <div className="ep-head cap">
                <span>
                  Epoch {String(i + 1).padStart(2, "0")}/{String(epochs.length).padStart(2, "0")}
                </span>
                <span>loss {fmt(e.loss)}</span>
              </div>
              <h3>{e.title}</h3>
              <ul className="chips">
                {e.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
