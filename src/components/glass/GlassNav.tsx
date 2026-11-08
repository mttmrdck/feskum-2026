"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "explore", label: "Events" },
  { id: "featured", label: "Featured" },
  { id: "schedule", label: "Schedule" },
  { id: "venues", label: "Venues" },
  { id: "information", label: "Visit" },
] as const;

/** Four-colour monogram: the festival's palette in one glyph. */
export function Monogram({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid size-10 shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-[12px]", className)} aria-hidden>
      <span className="bg-cobalt" />
      <span className="bg-orange" />
      <span className="bg-yellow" />
      <span className="bg-emerald" />
      <span className="poster absolute inset-0 grid place-items-center text-[15px] text-white mix-blend-normal [text-shadow:0_1px_6px_rgba(0,0,0,.35)]">
        FK
      </span>
    </span>
  );
}

export function GlassNav() {
  const [active, setActive] = useState<string>("overview");
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const els = NAV_ITEMS.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-[var(--gutter)] md:pt-4"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT }}
    >
      <nav aria-label="Primary" className="glass glass-solid mx-auto flex max-w-[1500px] items-center justify-between gap-3 rounded-[22px] p-2">
        <a href="#overview" className="pressable relative z-[3] flex items-center gap-3 rounded-[14px] pr-3">
          <Monogram />
          <span className="flex flex-col leading-none">
            <span className="headline text-[17px] tracking-[-0.01em] text-ink">FESKUM</span>
            <span className="label mt-1 text-[11.5px] text-ink-3">Convocation Festival 2026</span>
          </span>
        </a>

        <ul className="relative z-[3] hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.id} className="relative">
              {active === item.id && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", duration: 0.45, bounce: 0.08 }}
                />
              )}
              <a
                href={`#${item.id}`}
                aria-current={active === item.id ? "true" : undefined}
                className={cn(
                  "relative block rounded-full px-4 py-2.5 text-[14px] font-medium transition-colors duration-200",
                  active === item.id ? "text-cream" : "text-ink-2 hover:text-ink",
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="relative z-[3] flex items-center gap-2">
          <a href="#explore" className="pressable hidden rounded-[14px] bg-cobalt px-5 py-3 text-[14px] font-semibold text-white sm:inline-flex sm:items-center sm:gap-2">
            28 Nov – 3 Dec
            <span className="size-1.5 rounded-full bg-yellow" aria-hidden />
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="pressable grid size-11 place-items-center rounded-[14px] bg-ink text-cream lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className="relative block h-3 w-5" aria-hidden>
              <span className={cn("absolute left-0 h-[1.5px] w-5 bg-current transition-transform duration-300", open ? "top-1.5 rotate-45" : "top-0")} />
              <span className={cn("absolute left-0 h-[1.5px] w-5 bg-current transition-transform duration-300", open ? "top-1.5 -rotate-45" : "top-3")} />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="glass glass-solid mx-auto mt-2 max-w-[1500px] origin-top rounded-[24px] p-2 lg:hidden"
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
          >
            <ul className="relative z-[3]">
              {NAV_ITEMS.map((item, i) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between rounded-2xl px-4 py-3.5 active:bg-ink/5"
                  >
                    <span className="headline text-[2rem] text-ink">{item.label}</span>
                    <span className="label text-ink-3">0{i + 1}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
