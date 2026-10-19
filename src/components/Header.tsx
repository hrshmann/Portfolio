"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useShell } from "./Shell";

const LINKS = [
  ["subject", "Subject"],
  ["training", "Skills"],
  ["cases", "Cases"],
  ["record", "Record"],
  ["contact", "Contact"],
] as const;

const dubaiTime = () =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit" }).format(new Date());

export default function Header() {
  const { navigate, scrollTo } = useShell();
  const pathname = usePathname();
  const [time, setTime] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    setTime(dubaiTime());
    const id = setInterval(() => setTime(dubaiTime()), 20_000);
    return () => clearInterval(id);
  }, []);

  // hide while reading downwards, come back on any scroll up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHidden(y > 240 && y > lastY.current);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === "/") scrollTo(id === "top" ? 0 : `#${id}`);
    else navigate(id === "top" ? "/" : `/#${id}`, "BACK TO THE FILE");
  };

  return (
    <header className={`site-head${hidden ? " is-hidden" : ""}${solid ? " is-solid" : ""}`}>
      <div className="wrap site-head-in">
        <a href="/" className="brand" onClick={go("top")}>
          HARSH<span>//</span>SCAN
        </a>
        <span className="head-clock cap" suppressHydrationWarning>
          File HM-2026 · Dubai {time ?? "--:--"}
        </span>
        <nav aria-label="Sections">
          <ul>
            {LINKS.map(([id, text]) => (
              <li key={id} className={id === "contact" ? "keep" : undefined}>
                <a href={`/#${id}`} onClick={go(id)}>
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
