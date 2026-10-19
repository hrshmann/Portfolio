"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/** Ink dot that trails the pointer. Grows into a labelled disc over [data-cursor]. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = dot.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");

    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });

    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      el.classList.add("on");
    };
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const tagged = t?.closest("[data-cursor]");
      const text = tagged?.getAttribute("data-cursor");
      if (text && label.current) label.current.textContent = text;
      el.classList.toggle("big", !!text);
      el.classList.toggle("link", !text && !!t?.closest("a, button, [role=button], .redact"));
      el.classList.toggle("text", !!t?.closest("input, textarea"));
    };
    const leave = () => el.classList.remove("on");

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div className="cursor" ref={dot} aria-hidden="true">
      <span ref={label} />
    </div>
  );
}
