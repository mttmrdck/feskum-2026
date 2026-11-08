"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { EVENTS, byChronology } from "@/data/events";
import { VENUES } from "@/data/venues";
import { EASE_IN_OUT, EASE_OUT } from "@/lib/motion";
import { PALETTES, paletteFor } from "@/lib/palette";
import type { OpenEvent } from "@/lib/selection";
import { cn, formatDay, formatMonth } from "@/lib/utils";
import { SectionTitle } from "./SectionTitle";

const EVENTS_BY_VENUE = new Map(VENUES.map((v) => [v.id, EVENTS.filter((e) => e.venue === v.id).sort(byChronology)]));
/** A venue takes the colour of the first event it hosts, so rooms and events rhyme. */
const venuePalette = (id: string) => {
  const first = EVENTS_BY_VENUE.get(id)?.[0];
  return first ? paletteFor(first.category) : PALETTES.Graduation;
};

export function Venues({ onOpen }: { onOpen: OpenEvent }) {
  const [activeId, setActiveId] = useState(VENUES[0].id);
  const reduce = useReducedMotion();
  const venue = VENUES.find((v) => v.id === activeId)!;
  const events = EVENTS_BY_VENUE.get(venue.id) ?? [];
  const p = venuePalette(venue.id);

  return (
    <section id="venues" aria-labelledby="venues-title" className="relative scroll-mt-20 px-2 py-24 sm:px-4 md:py-32">
      <div className="mx-auto max-w-[1500px] px-[calc(var(--gutter)-8px)]">
        <SectionTitle
          id="venues-title"
          title="Six rooms"
          turn="across campus."
          kicker="Each venue takes the colour of what happens inside it. Pick one for access notes, directions and its programme."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          <ul role="tablist" aria-label="Venues" aria-orientation="vertical" className="grid grid-cols-2 gap-2 lg:col-span-4 lg:grid-cols-1">
            {VENUES.map((v, i) => {
              const on = v.id === activeId;
              const vp = venuePalette(v.id);
              return (
                <li key={v.id} role="presentation">
                  <button
                    type="button"
                    role="tab"
                    id={`venue-tab-${v.id}`}
                    aria-selected={on}
                    aria-controls="venue-panel"
                    tabIndex={on ? 0 : -1}
                    onClick={() => setActiveId(v.id)}
                    onKeyDown={(e) => {
                      const keys = ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"];
                      if (!keys.includes(e.key)) return;
                      e.preventDefault();
                      const fwd = e.key === "ArrowDown" || e.key === "ArrowRight";
                      const next = VENUES[(i + (fwd ? 1 : VENUES.length - 1)) % VENUES.length];
                      setActiveId(next.id);
                      document.getElementById(`venue-tab-${next.id}`)?.focus();
                    }}
                    className={cn(
                      "pressable flex h-full w-full items-center gap-4 rounded-[22px] p-4 text-left transition-colors duration-300",
                      on ? "" : "bg-ink/[.04] hover:bg-ink/[.07]",
                    )}
                    style={on ? { background: vp.stage, color: vp.fg } : undefined}
                  >
                    <span
                      aria-hidden
                      className="grid size-11 shrink-0 place-items-center rounded-[14px] text-[13px] font-bold"
                      style={{ background: vp.accent, color: vp.onAccent, boxShadow: on ? `0 0 18px ${vp.accent}` : undefined }}
                    >
                      {EVENTS_BY_VENUE.get(v.id)?.length ?? 0}
                    </span>
                    <span className="min-w-0">
                      <span className={cn("headline block text-[1.25rem] lg:text-[1.5rem]", !on && "text-ink")}>{v.name}</span>
                      <span className={cn("label mt-1 block", !on && "text-ink-3")}>
                        {v.zone}
                        <span className="sr-only">, {EVENTS_BY_VENUE.get(v.id)?.length ?? 0} events</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <motion.div
            id="venue-panel"
            role="tabpanel"
            aria-labelledby={`venue-tab-${venue.id}`}
            className="relative overflow-hidden rounded-[34px] lg:col-span-8"
            animate={{ backgroundColor: p.stage }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            style={{ color: p.fg }}
          >
            <div className="relative aspect-[16/10] overflow-hidden md:aspect-[16/8]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={venue.id}
                  className="absolute inset-0"
                  initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 0 100%)" }}
                  animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0 0%)" }}
                  exit={{ opacity: 1 }}
                  transition={{ duration: 0.75, ease: EASE_IN_OUT }}
                >
                  <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.1, ease: EASE_OUT }}>
                    <Image src={venue.image} alt={`${venue.name} (illustrative photograph)`} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${p.stage}, transparent 45%)` }} />
              <p className="poster absolute bottom-3 left-5 right-5 text-[clamp(2.4rem,6vw,5.5rem)] md:left-8">{venue.shortName}</p>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                className="grid gap-4 p-5 md:grid-cols-2 md:p-8"
              >
                <div>
                  <p className="text-[16px] leading-relaxed opacity-90">{venue.description}</p>
                  <div className="glass glass-clear mt-5 rounded-[20px] p-4">
                    <p className="label relative z-[3] opacity-80">Access</p>
                    <p className="relative z-[3] mt-1.5 text-[14.5px] leading-relaxed">{venue.access}</p>
                  </div>
                  <a
                    href={venue.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pressable mt-5 inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-[14px] font-semibold"
                    style={{ background: p.accent, color: p.onAccent }}
                  >
                    Get directions <span aria-hidden>↗</span>
                  </a>
                </div>
                <div>
                  <p className="label opacity-80">Programme here</p>
                  <ul className="mt-3 grid gap-2">
                    {events.map((e) => (
                      <li key={e.id}>
                        <button
                          type="button"
                          onClick={() => onOpen(e.id, "direct")}
                          className="glass glass-clear pressable flex w-full items-center gap-4 rounded-[16px] px-4 py-3 text-left"
                        >
                          <span className="label tnum relative z-[3] w-14 shrink-0" style={{ color: p.accent }}>
                            {formatDay(e.date)} {formatMonth(e.date)}
                          </span>
                          <span className="relative z-[3] text-[14.5px] font-semibold">{e.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
