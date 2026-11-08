"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { EVENTS, FESTIVAL_DATES, byChronology } from "@/data/events";
import { venueById } from "@/data/venues";
import { EASE_OUT } from "@/lib/motion";
import { paletteFor } from "@/lib/palette";
import type { OpenEvent, ShowInSlider } from "@/lib/selection";
import { cn, formatDay, formatLongDate, formatMonth, formatWeekday } from "@/lib/utils";
import { SectionTitle } from "./SectionTitle";

/** Each day of the week owns a colour, so the schedule reads at a glance. */
const DAY_COLOURS = [
  { bg: "#1d3fe0", fg: "#f6f0e3" },
  { bg: "#ff6a2b", fg: "#1d0a40" },
  { bg: "#0b5a3c", fg: "#effff4" },
  { bg: "#5b2bd6", fg: "#f2efff" },
  { bg: "#c93a20", fg: "#fff7e8" },
  { bg: "#ffd23f", fg: "#121a44" },
];

const DAYS = FESTIVAL_DATES.map((date, i) => ({
  date,
  n: i + 1,
  colour: DAY_COLOURS[i % DAY_COLOURS.length],
  events: EVENTS.filter((e) => e.date === date).sort(byChronology),
}));

export function Schedule({ onOpen, onShow }: { onOpen: OpenEvent; onShow: ShowInSlider }) {
  const [day, setDay] = useState(0);
  const reduce = useReducedMotion();
  const d = DAYS[day];

  return (
    <section id="schedule" aria-labelledby="schedule-title" className="relative scroll-mt-20 px-2 py-24 sm:px-4 md:py-32">
      <div className="mx-auto max-w-[1500px] px-[calc(var(--gutter)-8px)]">
        <SectionTitle
          id="schedule-title"
          title="Six days,"
          turn="hour by hour."
          kicker="Pick a day to see its full running order. All times are Malaysia Time (MYT). Tap any event for details."
        />

        <LayoutGroup id="schedule-days">
          <div role="tablist" aria-label="Festival days" className="no-scrollbar mt-12 flex gap-2 overflow-x-auto pb-1">
            {DAYS.map((x, i) => {
              const on = i === day;
              return (
                <button
                  key={x.date}
                  role="tab"
                  id={`day-tab-${i}`}
                  aria-selected={on}
                  aria-controls="day-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setDay(i)}
                  onKeyDown={(e) => {
                    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                    e.preventDefault();
                    const next = (i + (e.key === "ArrowRight" ? 1 : DAYS.length - 1)) % DAYS.length;
                    setDay(next);
                    document.getElementById(`day-tab-${next}`)?.focus();
                  }}
                  className="pressable relative min-w-[132px] shrink-0 rounded-[22px] px-4 py-3 text-left"
                  style={{ color: on ? x.colour.fg : undefined }}
                >
                  {on && (
                    <motion.span
                      layoutId="day-pill"
                      className="absolute inset-0 rounded-[22px]"
                      style={{ background: x.colour.bg }}
                      transition={{ type: "spring", duration: 0.45, bounce: 0.08 }}
                    />
                  )}
                  {!on && <span className="absolute inset-0 rounded-[22px] border-2 border-ink/10" />}
                  <span className="relative block">
                    <span className={cn("label block", !on && "text-ink-3")}>
                      Day {x.n}, {formatWeekday(x.date)}
                    </span>
                    <span className={cn("poster tnum mt-1 block text-[2.6rem]", !on && "text-ink")}>
                      {formatDay(x.date)}
                      <span className="ml-1.5 text-[0.5em]">{formatMonth(x.date)}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        <div id="day-panel" role="tabpanel" aria-labelledby={`day-tab-${day}`} className="mt-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={d.date}
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
            >
              <p className="label mb-4 text-ink-2">
                {formatLongDate(d.date)}, {d.events.length} events
              </p>
              <ol className="divide-y-2 divide-ink/[.07] border-y-2 border-ink/[.07]">
                {d.events.map((e) => {
                  const p = paletteFor(e.category);
                  const v = venueById(e.venue);
                  return (
                    <li key={e.id} className="group relative">
                      <span
                        aria-hidden
                        className="absolute inset-0 origin-left scale-x-0 rounded-[18px] transition-transform duration-500 ease-[cubic-bezier(.23,1,.32,1)] group-hover:scale-x-100"
                        style={{ background: `color-mix(in oklab, ${p.accent} 12%, transparent)` }}
                      />
                      <div className="relative grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-2 px-2 py-5 md:grid-cols-[150px_1fr_auto_auto] md:gap-x-8 md:px-4">
                        <p className="poster tnum text-[2.2rem] text-ink md:text-[2.8rem]">{e.startTime}</p>
                        <button type="button" onClick={() => onOpen(e.id, "direct")} className="min-w-0 text-left after:absolute after:inset-0 after:content-['']">
                          <span className="label flex items-center gap-2" style={{ color: p.onCream }}>
                            <span className="size-2 rounded-full" style={{ background: p.accent, boxShadow: `0 0 10px ${p.accent}` }} />
                            {e.category}
                          </span>
                          <span className="headline mt-1.5 block text-[clamp(1.35rem,2.4vw,2rem)] text-ink">{e.title}</span>
                        </button>
                        <p className="label col-start-2 text-ink-2 md:col-start-auto">
                          Until {e.endTime} at {v.shortName}
                        </p>
                        <button
                          type="button"
                          onClick={() => onShow(e.id)}
                          className="pressable relative z-[1] col-start-2 justify-self-start rounded-full border-2 border-ink/15 px-4 py-2 text-[13px] font-semibold text-ink hover:border-ink md:col-start-auto"
                        >
                          View slide
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
