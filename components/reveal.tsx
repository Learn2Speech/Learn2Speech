"use client"; // watches the scroll position
// Wraps content that should animate in when you scroll down to it (each step on the home page).
// Its direct children start hidden and slide up one after another; the CSS is in globals.css (.reveal).
// If the content is already on screen when the page loads, or JavaScript is off, it is simply shown.
import { useEffect, useRef } from "react";

export default function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add("reveal");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-in");
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
