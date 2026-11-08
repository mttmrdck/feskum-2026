"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EVENTS, FESTIVAL_DATES, byChronology } from "@/data/events";
import { venueById } from "@/data/venues";
import { useMediaQuery } from "@/lib/hooks";
import { paletteFor } from "@/lib/palette";
import type { OpenEvent } from "@/lib/selection";
import { formatDay, formatMonth, formatWeekday } from "@/lib/utils";
import { SectionTitle } from "./SectionTitle";

const DAY_W = 460;
const TICKET_W = 220;
const HOURS = [6, 9, 12, 15, 18, 21, 24];
const toHour = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
};

const DAYS = FESTIVAL_DATES.map((date) => ({
  date,
  events: EVENTS.filter((e) => e.date === date).sort(byChronology),
}));

/** The week as a map: days run left→right, the hour of day runs top→bottom. */
function Track({ onOpen }: { onOpen: OpenEvent }) {
  return (
    <div className="relative h-full" style={{ width: DAYS.length * DAY_W + 160 }}>
      {/* Hour grid */}
      {HOURS.map((h) => (
        <div
          key={h}
          className="absolute inset-x-0 border-t border-dashed border-white/12"
          style={{ top: `calc(${((h - 6) / 18) * 100}% * (1 - 0.18))` }}
        >
        </div>
      ))}

      {DAYS.map((d, di) => (
        <div key={d.date} className="absolute inset-y-0" style={{ left: 120 + di * DAY_W, width: DAY_W }}>
          <div className="absolute inset-y-0 left-0 w-px bg-white/15" />
          <p className="poster tnum pointer-events-none absolute -bottom-2 left-3 select-none text-[9rem] leading-none text-white/[.06]" aria-hidden>
            {formatDay(d.date)}
          </p>
          <p className="label absolute bottom-3 left-4 text-white/70">
            {formatWeekday(d.date)} {formatDay(d.date)} {formatMonth(d.date)}
          </p>
          {d.events.map((e, k) => {
            const p = paletteFor(e.category);
            const top = ((toHour(e.startTime) - 6) / 18) * 82;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => onOpen(e.id, "direct")}
                className="glass glass-tint pressable group absolute flex items-center gap-3 rounded-[18px] p-2 pr-3 text-left"
                style={
                  {
                    top: `${top}%`,
                    left: 18 + (k % 2) * (TICKET_W - 20),
                    width: TICKET_W,
                    "--tint": p.accent,
                    color: p.onAccent,
                  } as React.CSSProperties
                }
              >
                <span className="relative z-[3] size-14 shrink-0 overflow-hidden rounded-[12px]">
                  <Image src={e.image} alt="" fill sizes="56px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                </span>
                <span className="relative z-[3] min-w-0">
                  <span className="label tnum block opacity-80">{e.startTime}–{e.endTime}</span>
                  <span className="mt-0.5 block truncate text-[14px] font-semibold">{e.title}</span>
                  <span className="label block truncate text-[11.5px] opacity-70">{venueById(e.venue).shortName}</span>
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function Timeline({ onOpen }: { onOpen: OpenEvent }) {
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const pinned = desktop && !reduce;
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);

  useEffect(() => {
    if (!pinned) return;
    const measure = () => {
      const w = trackRef.current?.scrollWidth ?? 0;
      setTravel(Math.max(0, w - window.innerWidth + 96));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], [0, -travel]);
  const bar = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);

  return (
    <section
      ref={sectionRef}
      id="timeline"
      aria-labelledby="timeline-title"
      className="relative mx-2 rounded-[40px] bg-[#0b1033] text-white sm:mx-4"
      style={pinned ? { height: `calc(100vh + ${travel}px)` } : undefined}
    >
      <div className={pinned ? "sticky top-0 flex h-screen flex-col overflow-hidden pb-8 pt-28" : "flex flex-col py-20"}>
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[40px]">
          <div className="pool -left-[10%] top-[10%] size-[50vw] bg-[radial-gradient(closest-side,rgba(31,59,255,.45),transparent)]" />
          <div className="pool -right-[10%] bottom-[-20%] size-[50vw] bg-[radial-gradient(closest-side,rgba(255,106,43,.3),transparent)]" />
        </div>
        <div className="relative mx-auto w-full max-w-[1500px] px-[var(--gutter)]">
          <SectionTitle
            id="timeline-title"
            title="The week,"
            turn="as a map."
            tone="light"
            kicker={pinned ? "Keep scrolling to travel through the week. Each ticket sits at its start time." : "Swipe sideways to travel through the week. Each ticket sits at its start time."}
          />
        </div>
        <div className={pinned ? "relative mt-8 min-h-0 flex-1" : "no-scrollbar relative mt-8 h-[560px] overflow-x-auto overscroll-x-contain"}>
          <motion.div ref={trackRef} className="h-full w-max" style={pinned ? { x } : undefined}>
            <Track onOpen={onOpen} />
          </motion.div>
          {/* Hour scale stays put while the week travels past it. */}
          <div aria-hidden className={pinned ? "pointer-events-none absolute inset-y-0 left-0 w-[88px] bg-gradient-to-r from-[#0b1033] via-[#0b1033]/90 to-transparent" : "pointer-events-none sticky left-0 -mt-[560px] h-[560px] w-[88px] bg-gradient-to-r from-[#0b1033] via-[#0b1033]/90 to-transparent"}>
            {HOURS.map((h) => (
              <span key={h} className="label tnum absolute left-4 -translate-y-1/2 text-white/60" style={{ top: `calc(${((h - 6) / 18) * 100}% * (1 - 0.18))` }}>
                {String(h % 24).padStart(2, "0")}:00
              </span>
            ))}
          </div>
        </div>
        {pinned && (
          <div className="relative mx-[var(--gutter)] mt-4 h-[3px] overflow-hidden rounded-full bg-white/15">
            <motion.div className="absolute inset-0 origin-left bg-yellow" style={{ scaleX: bar }} />
          </div>
        )}
      </div>
    </section>
  );
}
