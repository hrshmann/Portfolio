"use client";

import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";
import { cases } from "@/lib/content";
import TransitionLink from "./TransitionLink";

export default function CaseFiles() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const mm = gsap.matchMedia();
      const track = root.current!.querySelector<HTMLElement>(".cases-track")!;
      const stamps = gsap.utils.toArray<HTMLElement>(".folder .stamp");
      const slam = { scale: 2.4, opacity: 0, rotate: -18 };
      const land = { scale: 1, opacity: 0.9, rotate: -9, duration: 0.5, ease: "back.out(2.2)" };

      // desktop: folders slide sideways while the section is pinned
      mm.add("(min-width: 900px)", () => {
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const slide = gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: ".cases-pin",
            start: "top top",
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        stamps.forEach((s) =>
          gsap.fromTo(s, slam, { ...land, scrollTrigger: { trigger: s, containerAnimation: slide, start: "left 80%", once: true } }),
        );
      });

      // phones and tablets: a plain stack
      mm.add("(max-width: 899px)", () => {
        stamps.forEach((s) => gsap.fromTo(s, slam, { ...land, scrollTrigger: { trigger: s, start: "top 80%", once: true } }));
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section className="cases-sec" id="cases" ref={root} aria-labelledby="cases-h">
      <div className="cases-pin">
        <div className="wrap">
          <header className="sec-head">
            <div className="sec-label">
              <span className="cap ink">Case files</span>
              <span className="cap">HM-2026 / C</span>
            </div>
            <h2 className="sec-title" id="cases-h">
              Case <em>files.</em>
            </h2>
            <p className="cases-count cap">
              {String(cases.length).padStart(2, "0")} files <span className="desk-only">· keep scrolling</span>
            </p>
          </header>
        </div>
        <div className="cases-track">
          {cases.map((c) => (
            <TransitionLink key={c.slug} href={`/case/${c.slug}`} label={`OPENING CASE ${c.no}`} className="folder" data-cursor="OPEN">
              <span className="f-tab">CASE NO. {c.no}</span>
              <span className="f-back" aria-hidden="true" />
              <span className="f-sheet" aria-hidden="true">
                <span>CONFIDENTIAL</span>
                <span>HM-2026-{c.no}</span>
              </span>
              <span className="f-front">
                <span className="f-title">{c.title}</span>
                <span className="f-short">{c.short}</span>
                <span className="f-stack">{c.stack.join(" · ")}</span>
                <span className="f-open">Open file →</span>
              </span>
              <span className="stamp" aria-hidden="true">
                {c.stamp}
              </span>
            </TransitionLink>
          ))}
        </div>
      </div>
    </section>
  );
}
