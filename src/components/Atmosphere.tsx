"use client";

import { useEffect, useRef } from "react";

/**
 * The page's light. Four soft colour fields drift behind everything and
 * re-tint as the visitor moves between sections, so the ground is never one
 * flat colour and every section has its own weather.
 *
 * Colours are registered custom properties (see globals.css @property), so
 * the browser interpolates them; only this fixed layer repaints.
 */
const MOODS: Record<string, [string, string, string, string]> = {
  //            top-left    top-right   bottom-left bottom-right
  overview: ["#cfc2ff", "#ffc9ae", "#bcd3ff", "#ffe3a3"],
  explore: ["#ffcfb8", "#c9d6ff", "#e3d4ff", "#ffd9a8"],
  featured: ["#c3d4ff", "#e2cfff", "#ffd2bf", "#cde9ff"],
  schedule: ["#ffd6bd", "#c6f0d9", "#ffe7a6", "#d7ccff"],
  timeline: ["#b8c6ff", "#d9c9ff", "#bfd7ff", "#ffcbb6"],
  venues: ["#d8ccff", "#bcd0ff", "#ffd3c4", "#e6dcff"],
  information: ["#ffd0b6", "#ffe39b", "#cfdcff", "#ffc9d2"],
};

export function Atmosphere() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apply = (id: string) => {
      const mood = MOODS[id];
      if (!mood || !ref.current) return;
      mood.forEach((c, i) => ref.current!.style.setProperty(`--atm-${i + 1}`, c));
    };
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && apply(e.target.id)),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    Object.keys(MOODS).forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="atmosphere pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="atm-field atm-1" />
      <div className="atm-field atm-2" />
      <div className="atm-field atm-3" />
      <div className="atm-field atm-4" />
      {/* Fine light diffusion: a pale sheen across the middle of the screen */}
      <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_45%,rgba(255,255,255,.55),transparent_70%)]" />
    </div>
  );
}
