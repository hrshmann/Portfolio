const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/#";

/** Decrypts el's text into `final`, letter by letter. Returns a cancel function. */
export function scramble(el: HTMLElement, final: string, duration = 900): () => void {
  const n = final.length;
  const t0 = performance.now();
  const settle = Array.from(final, (_, i) => t0 + (i / n) * duration * 0.85 + Math.random() * 160);
  let raf = 0;

  const frame = (now: number) => {
    let out = "";
    let done = true;
    for (let i = 0; i < n; i++) {
      const ch = final[i];
      if (ch === " " || now >= settle[i]) out += ch;
      else {
        done = false;
        out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
    }
    el.textContent = out;
    if (!done) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    el.textContent = final;
  };
}
