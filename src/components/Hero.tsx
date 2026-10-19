"use client";

import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";
import { scramble } from "@/lib/scramble";
import { profile } from "@/lib/content";
import { useShell } from "./Shell";

const Letters = ({ text }: { text: string }) => (
  <>
    {Array.from(text).map((ch, i) => (
      <span className="ch" key={i} aria-hidden="true">
        {ch}
      </span>
    ))}
  </>
);

export default function Hero() {
  const { introDone, scrollTo } = useShell();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!introDone) return;
      const scr = gsap.utils.toArray<HTMLElement>("[data-scramble]", root.current);
      if (reducedMotion()) {
        gsap.set(".ch, [data-fade]", { clearProps: "all", opacity: 1 });
        return;
      }
      const cancels: (() => void)[] = [];
      gsap
        .timeline({ delay: 0.35 })
        // y: 0 drops the offset GSAP reads from the CSS starting state, so yPercent alone moves the letter
        .fromTo(".ch", { y: 0, yPercent: 118, rotate: 5 }, { y: 0, yPercent: 0, rotate: 0, duration: 1.3, ease: "expo.out", stagger: 0.045 })
        .fromTo(".hero-rule", { scaleX: 0, opacity: 1 }, { scaleX: 1, opacity: 1, duration: 1.4, ease: "expo.inOut" }, 0.3)
        .fromTo("[data-fade]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }, 0.9)
        .add(() => scr.forEach((el, i) => cancels.push(scramble(el, el.dataset.scramble ?? "", 900 + i * 350))), 0.75);

      // name drifts up slower than the page
      gsap.to(".hero-name", {
        yPercent: -22,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      return () => cancels.forEach((c) => c());
    },
    { scope: root, dependencies: [introDone] },
  );

  return (
    <section className="hero wrap" ref={root} id="top">
      <dl className="hero-meta" data-fade>
        <div>
          <dt className="cap">Status</dt>
          <dd>{profile.status}</dd>
        </div>
        <div>
          <dt className="cap">Work permit</dt>
          <dd>{profile.visa}</dd>
        </div>
        <div>
          <dt className="cap">Location</dt>
          <dd>{profile.location}</dd>
        </div>
      </dl>

      <h1 className="hero-name" aria-label={`${profile.first} ${profile.last}`}>
        <span className="line">
          <Letters text={profile.first} />
        </span>
        <span className="line ital">
          <Letters text={profile.last} />
        </span>
      </h1>

      <div className="hero-rule" />
      <div className="hero-subs">
        <p data-scramble={profile.tags} data-fade>
          {profile.tags}
        </p>
        <p data-scramble={`DUBAI ${profile.coords}`} data-fade>
          DUBAI {profile.coords}
        </p>
      </div>
      <a
        className="hero-cue cap"
        href="#subject"
        data-fade
        onClick={(e) => {
          e.preventDefault();
          scrollTo("#subject");
        }}
      >
        Open the file <span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}
