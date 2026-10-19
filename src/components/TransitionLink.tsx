"use client";

import { useShell } from "./Shell";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; label?: string };

/** An internal link that plays the ink wipe before changing page. */
export default function TransitionLink({ href, label, onClick, children, ...rest }: Props) {
  const { navigate } = useShell();
  return (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href, label);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
