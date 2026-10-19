"use client";

import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";
import { evidence } from "@/lib/content";
import SectionHead from "./SectionHead";

const TILT = [-2.2, 1.6, -1, 2.4, -1.8];
const DEPTH = [14, 24, 10, 20, 16];

export default function Evidence() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const items = gsap.utils.toArray<HTMLElement>(".ex");
      gsap.fromTo(
        items,
        // the resting tilt is the CSS `rotate` property; this adds extra spin while falling
        { opacity: 0, y: -50, rotate: (i) => TILT[i % TILT.length] * 3 },
        {
          opacity: 1,
          y: 0,
          rotate: 0,
          duration: 1,
          ease: "back.out(1.4)",
          stagger: 0.09,
          scrollTrigger: { trigger: ".board", start: "top 72%", once: true },
        },
      );

      // pinned papers shift a little with the pointer, each at its own depth
      if (!window.matchMedia("(hover: hover)").matches) return;
      const board = root.current!.querySelector<HTMLElement>(".board")!;
      const movers = items.map((el, i) => ({
        x: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3" }),
        d: DEPTH[i % DEPTH.length],
      }));
      const move = (e: PointerEvent) => {
        const r = board.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        movers.forEach((m) => {
          m.x(nx * m.d);
          m.y(ny * m.d);
        });
      };
      board.addEventListener("pointermove", move);
      return () => board.removeEventListener("pointermove", move);
    },
    { scope: root },
  );

  return (
    <section className="sec wrap" id="evidence" ref={root} aria-labelledby="evidence-h">
      <SectionHead label="Evidence" refNo="HM-2026 / E" id="evidence-h">
        The <em>evidence.</em>
      </SectionHead>
      <div className="board">
        {evidence.map((e, i) => (
          <article className="ex" key={e.tag} style={{ rotate: `${TILT[i % TILT.length]}deg` }}>
            <span className="pin" aria-hidden="true" />
            <span className="cap">{e.tag}</span>
            <div className="ex-big">{e.big}</div>
            <h3>{e.title}</h3>
            <p>{e.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
