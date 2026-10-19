"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, reducedMotion } from "@/lib/gsap";
import Cursor from "./Cursor";
import Header from "./Header";
import Preloader from "./Preloader";

type ShellCtx = {
  /** Ink-wipe page transition, then route change. */
  navigate: (href: string, label?: string) => void;
  /** Smooth scroll to a selector or y position on the current page. */
  scrollTo: (target: string | number) => void;
  introDone: boolean;
  finishIntro: () => void;
  lockScroll: (locked: boolean) => void;
};

const Ctx = createContext<ShellCtx | null>(null);

export function useShell() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useShell must be used inside <Shell>");
  return c;
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useRef<Lenis | null>(null);
  const wipe = useRef<HTMLDivElement>(null);
  const wipeLabel = useRef<HTMLSpanElement>(null);
  const pending = useRef<string | null>(null);
  const busy = useRef(false);
  const [introDone, setIntroDone] = useState(false);

  // smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync
  useEffect(() => {
    history.scrollRestoration = "manual";
    if (reducedMotion()) return;
    const l = new Lenis({ lerp: 0.09 });
    lenis.current = l;
    // the preloader may have locked scrolling before Lenis existed
    if (document.documentElement.classList.contains("locked")) l.stop();
    l.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      lenis.current = null;
    };
  }, []);

  const lockScroll = useCallback((locked: boolean) => {
    if (locked) lenis.current?.stop();
    else lenis.current?.start();
    document.documentElement.classList.toggle("locked", locked);
  }, []);

  const scrollTo = useCallback((target: string | number) => {
    if (lenis.current) lenis.current.scrollTo(target, { duration: 1.4 });
    else if (typeof target === "number") window.scrollTo({ top: target });
    else document.querySelector(target)?.scrollIntoView();
  }, []);

  const navigate = useCallback(
    (href: string, label = "OPENING FILE") => {
      if (busy.current) return;
      if (reducedMotion() || !wipe.current) {
        router.push(href);
        return;
      }
      busy.current = true;
      lockScroll(true);
      if (wipeLabel.current) wipeLabel.current.textContent = label;
      gsap
        .timeline()
        .set(wipe.current, { visibility: "visible", clipPath: "inset(100% 0% 0% 0%)" })
        .to(wipe.current, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "expo.inOut" })
        .fromTo(wipeLabel.current, { opacity: 0, letterSpacing: "0.6em" }, { opacity: 1, letterSpacing: "0.22em", duration: 0.5 }, "-=0.2")
        .add(() => {
          pending.current = href;
          router.push(href, { scroll: false });
        });
    },
    [router, lockScroll],
  );

  // the new page has mounted under the wipe: jump to the right spot, then lift the wipe
  useEffect(() => {
    const href = pending.current;
    if (!href || !wipe.current) return;
    pending.current = null;
    const hash = href.split("#")[1];
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const el = hash ? document.getElementById(hash) : null;
      lockScroll(false);
      // Lenis still holds the old page's height until it re-measures, which would clamp the jump
      lenis.current?.resize();
      if (lenis.current) lenis.current.scrollTo(el ?? 0, { immediate: true, force: true });
      else window.scrollTo(0, el ? el.getBoundingClientRect().top + window.scrollY : 0);
      gsap.to(wipe.current, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.8,
        delay: 0.2,
        ease: "expo.inOut",
        onComplete: () => {
          gsap.set(wipe.current, { visibility: "hidden" });
          busy.current = false;
        },
      });
    });
  }, [pathname, lockScroll]);

  const finishIntro = useCallback(() => setIntroDone(true), []);

  const value = useMemo(
    () => ({ navigate, scrollTo, introDone, finishIntro, lockScroll }),
    [navigate, scrollTo, introDone, finishIntro, lockScroll],
  );

  return (
    <Ctx.Provider value={value}>
      <Preloader />
      <Header />
      <main>{children}</main>
      <div className="wipe" ref={wipe} aria-hidden="true">
        <span ref={wipeLabel}>OPENING FILE</span>
      </div>
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </Ctx.Provider>
  );
}
