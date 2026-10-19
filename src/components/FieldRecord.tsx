"use client";

import { useRef } from "react";
import { gsap, useGSAP, reducedMotion } from "@/lib/gsap";
import { education, experience, type Entry } from "@/lib/content";
import SectionHead from "./SectionHead";

function Log({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <div className="rec-group">
      <h3 className="cap ink rec-group-title">{title}</h3>
      <ol className="rec-list">
        {entries.map((e) => (
          <li className="rec" key={e.role + e.dates}>
            <div className="rec-dates cap">{e.dates}</div>
            <div className="rec-body">
              <h4>{e.role}</h4>
              <p className="rec-org">{e.org}</p>
              <ul>
                {e.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function FieldRecord() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(".rec-list").forEach((list) => {
        gsap.fromTo(list, { "--line": 0 }, { "--line": 1, ease: "none", scrollTrigger: { trigger: list, start: "top 75%", end: "bottom 60%", scrub: true } });
      });
      gsap.utils.toArray<HTMLElement>(".rec").forEach((el) => {
        gsap.fromTo(
          el.children,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 80%", once: true } },
        );
      });
    },
    { scope: root },
  );

  return (
    <section className="sec wrap" id="record" ref={root} aria-labelledby="record-h">
      <SectionHead label="Field record" refNo="HM-2026 / D" id="record-h">
        Field <em>record.</em>
      </SectionHead>
      <div className="rec-wrap">
        <Log title="Experience" entries={experience} />
        <Log title="Education" entries={education} />
      </div>
    </section>
  );
}
