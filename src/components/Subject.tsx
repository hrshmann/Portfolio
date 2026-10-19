"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";
import { dossier, facts, profile } from "@/lib/content";
import SectionHead from "./SectionHead";

export default function Subject() {
  const root = useRef<HTMLElement>(null);
  const redactions = dossier.filter((s) => typeof s !== "string").length;
  const [open, setOpen] = useState<boolean[]>(() => Array(redactions).fill(false));

  useGSAP(
    () => {
      if (reducedMotion()) return;
      // photo develops top to bottom behind a scan line
      gsap
        .timeline({ scrollTrigger: { trigger: ".mugshot", start: "top 72%", once: true } })
        .fromTo(".mug-photo", { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "power2.inOut" })
        .fromTo(".scanline", { top: "0%", opacity: 1 }, { top: "100%", duration: 1.8, ease: "power2.inOut" }, 0)
        .to(".scanline", { opacity: 0, duration: 0.3 })
        .fromTo(".mugshot .stamp", { scale: 2.2, opacity: 0 }, { scale: 1, opacity: 0.9, duration: 0.5, ease: "back.out(2.2)" }, "-=0.2");

      gsap.fromTo(
        ".dossier, .facts > div",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.06, scrollTrigger: { trigger: ".subject-grid", start: "top 70%", once: true } },
      );
    },
    { scope: root },
  );

  const reveal = (i: number) => setOpen((o) => (o[i] ? o : o.map((v, j) => (j === i ? true : v))));
  let r = -1;

  return (
    <section className="sec wrap" id="subject" ref={root} aria-labelledby="subject-h">
      <SectionHead label="Subject file" refNo="HM-2026 / A" id="subject-h">
        The <em>subject.</em>
      </SectionHead>

      <div className="subject-grid">
        <figure className="mugshot">
          <span className="clip" aria-hidden="true" />
          <div className="mug-photo">
            <Image src={profile.portrait} alt="Portrait of Harshdeep Maan" width={900} height={1125} sizes="(max-width: 860px) 90vw, 36vw" priority={false} />
            <span className="scanline" aria-hidden="true" />
          </div>
          <figcaption className="cap">
            <span>Subject · HM-2026</span>
            <span>Dubai, UAE</span>
          </figcaption>
          <span className="stamp" aria-hidden="true">
            IDENTIFIED
          </span>
        </figure>

        <div className="subject-text">
          <div className="dossier">
            <div className="cap dossier-head">
              <span>Subject file · HM-2026-000</span>
              <span>Clearance: visitor</span>
            </div>
            <p className="dossier-txt">
              {dossier.map((seg, i) => {
                if (typeof seg === "string") return <span key={i}>{seg}</span>;
                const idx = ++r;
                return (
                  <span
                    key={i}
                    className={`redact${open[idx] ? " open" : ""}`}
                    tabIndex={0}
                    role="button"
                    aria-label={open[idx] ? seg.r : "Redacted. Press to reveal."}
                    onPointerEnter={() => reveal(idx)}
                    onFocus={() => reveal(idx)}
                    onClick={() => reveal(idx)}
                  >
                    {seg.r}
                  </span>
                );
              })}
            </p>
            <div className="dossier-foot">
              <span className="cap">Hover or tap a black bar to erase it.</span>
              <span className="dossier-btns">
                <button type="button" className="btn-link" onClick={() => setOpen((o) => o.map(() => true))}>
                  Declassify all
                </button>
                <button type="button" className="btn-link" onClick={() => setOpen((o) => o.map(() => false))}>
                  Redact again
                </button>
              </span>
            </div>
          </div>

          <dl className="facts">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="cap">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
