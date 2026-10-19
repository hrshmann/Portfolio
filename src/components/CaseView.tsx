"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";
import type { CaseFile } from "@/lib/content";
import TransitionLink from "./TransitionLink";

export default function CaseView({ c, next }: { c: CaseFile; next: CaseFile }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap
        .timeline({ delay: 0.55 })
        .fromTo(".cv-title .ch", { yPercent: 115 }, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.03 })
        .fromTo(".cv-stamp", { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 0.9, duration: 0.5, ease: "back.out(2.2)" }, 0.6)
        .fromTo("[data-fade]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.07 }, 0.4);

      // prints develop top to bottom as they scroll in
      gsap.utils.toArray<HTMLElement>(".plate-img").forEach((el) =>
        gsap.fromTo(
          el,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power2.inOut", scrollTrigger: { trigger: el, start: "top 85%", once: true } },
        ),
      );
      gsap.utils.toArray<HTMLElement>(".cv-findings li").forEach((li) =>
        gsap.fromTo(li, { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: li, start: "top 88%", once: true } }),
      );
    },
    { scope: root, dependencies: [c.slug] },
  );

  return (
    <article className="case-view wrap" ref={root}>
      <div className="cv-bar cap">
        <TransitionLink href="/#cases" label="FILE CLOSED" className="cv-back">
          ← All case files
        </TransitionLink>
        <span>
          Case no. {c.no} · File HM-2026-{c.no}
        </span>
      </div>

      <header className="cv-head">
        <h1 className="cv-title" aria-label={c.title}>
          {c.title.split(" ").map((w, wi) => (
            <span className="line" key={wi}>
              {Array.from(w).map((ch, i) => (
                <span className="ch" key={i} aria-hidden="true">
                  {ch}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <span className="stamp cv-stamp" aria-hidden="true">
          {c.stamp}
        </span>
      </header>

      <p className="cv-lead" data-fade>
        {c.lead}
      </p>

      <dl className="cv-meta" data-fade>
        {c.meta.map(([k, v]) => (
          <div key={k}>
            <dt className="cap">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
        <div className="wide">
          <dt className="cap">Stack</dt>
          <dd>{c.stack.join(" · ")}</dd>
        </div>
        {c.links.length > 0 && (
          <div className="wide">
            <dt className="cap">{c.links.length > 1 ? "Links" : "Link"}</dt>
            <dd className="cv-links">
              {c.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label} ↗
                </a>
              ))}
            </dd>
          </div>
        )}
      </dl>

      {c.shots && c.shots.length > 0 && (
        <section className="cv-section cv-photos" aria-labelledby="photos-h">
          <h2 className="cap ink" id="photos-h">
            Evidence photographs
          </h2>
          <div className={`plates n${c.shots.length}`}>
            {c.shots.map((s, i) => (
              <figure className="plate" key={s.src}>
                <div className="plate-img">
                  <Image src={s.src} alt={`Screenshot of ${s.caption}`} width={1440} height={900} sizes={c.shots!.length > 1 && i > 0 ? "(max-width: 760px) 92vw, 45vw" : "92vw"} />
                </div>
                <figcaption className="cap">
                  <span>Exhibit {c.no}-{String.fromCharCode(65 + i)}</span>
                  <span>{s.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="cv-section" aria-labelledby="findings-h">
        <h2 className="cap ink" id="findings-h">
          Findings
        </h2>
        <ul className="cv-findings">
          {c.findings.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      <TransitionLink href={`/case/${next.slug}`} label={`OPENING CASE ${next.no}`} className="cv-next" data-cursor="NEXT">
        <span className="cap">Next file · Case no. {next.no}</span>
        <span className="cv-next-title">{next.title} →</span>
      </TransitionLink>
    </article>
  );
}
