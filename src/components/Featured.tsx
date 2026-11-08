"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { EVENTS, byChronology, type ConvoEvent } from "@/data/events";
import { venueById } from "@/data/venues";
import { paletteFor } from "@/lib/palette";
import { cardLayoutId, imageLayoutId, type OpenEvent } from "@/lib/selection";
import { formatDay, formatMonth, formatTimeRange, formatWeekday } from "@/lib/utils";
import { SectionTitle } from "./SectionTitle";

const FEATURED = EVENTS.filter((e) => e.featured).sort(byChronology);

/**
 * Dispatch card. Pinned with a growing top offset so the deck piles up; each
 * card recedes (scale) as the next slides over it, and its cover zooms in
 * with a slight tilt as it arrives.
 */
function Dispatch({
  event,
  i,
  n,
  progress,
  onOpen,
}: {
  event: ConvoEvent;
  i: number;
  n: number;
  progress: MotionValue<number>;
  onOpen: OpenEvent;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const p = paletteFor(event.category);
  const venue = venueById(event.venue);
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const coverScale = useTransform(enter, [0, 1], [1.25, 1]);
  const tilt = useTransform(enter, [0, 1], [8, 0]);
  const scale = useTransform(progress, [i / n, 1], [1, 1 - (n - i - 1) * 0.045]);

  return (
    <div ref={ref} className="sticky h-[78svh] min-h-[540px]" style={{ top: `calc(92px + ${i * 26}px)` }}>
      <motion.article
        layoutId={reduce ? undefined : cardLayoutId("featured", event.id)}
        style={{ ...(reduce ? {} : { scale, rotateX: tilt }), borderRadius: 36, background: p.stage, color: p.fg, transformPerspective: 1400 }}
        className="relative flex h-[calc(100%-26px)] origin-top flex-col overflow-hidden shadow-[0_-20px_60px_-30px_rgba(14,20,51,.45),inset_0_1px_0_rgba(255,255,255,.12)] md:grid md:grid-cols-12"
      >
        {/* Light rising from the bottom edge of the dispatch, in its colour. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
          style={{ background: `linear-gradient(to top, color-mix(in oklab, ${p.accent} 38%, transparent), transparent 70%)` }}
        />
        <div className="relative flex flex-1 flex-col justify-between gap-5 p-6 md:col-span-5 md:p-10">
          <div className="flex items-center justify-between">
            <span className="label">Dispatch {String(i + 1).padStart(2, "0")}</span>
            <span className="label rounded-full px-3 py-1.5" style={{ background: p.accent, color: p.onAccent }}>
              {event.category}
            </span>
          </div>
          <div>
            <p className="poster tnum text-[clamp(5rem,12vw,11rem)] leading-[0.78]" style={{ color: p.accent }}>
              {formatDay(event.date)}
              <span className="ml-3 text-[0.42em]">{formatMonth(event.date)}</span>
            </p>
            <h3 className="headline mt-6 text-[clamp(2rem,3.6vw,3.4rem)] [text-wrap:balance]">{event.title}</h3>
            <p className="serif mt-3 text-[1.35rem] opacity-85">{event.tagline}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => onOpen(event.id, "featured")}
              className="pressable inline-flex min-h-12 items-center gap-3 rounded-full py-2 pl-5 pr-2 text-[14px] font-semibold"
              style={{ background: p.fg, color: p.stage }}
            >
              Read the dispatch
              <span className="grid size-9 place-items-center rounded-full" style={{ background: p.accent, color: p.onAccent }} aria-hidden>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            <p className="label tnum opacity-80">
              {formatWeekday(event.date)}, {formatTimeRange(event.startTime, event.endTime)} at {venue.shortName}
            </p>
          </div>
        </div>

        <div className="relative hidden p-3 md:col-span-7 md:block">
          <motion.div layoutId={reduce ? undefined : imageLayoutId("featured", event.id)} className="absolute inset-3 overflow-hidden rounded-[28px]">
            <motion.div className="absolute inset-0" style={reduce ? undefined : { scale: coverScale }}>
              <Image src={event.image} alt="" fill sizes="60vw" className="object-cover" />
            </motion.div>
          </motion.div>
          <div className="absolute bottom-8 left-8 right-8 flex flex-wrap gap-2">
            {event.highlights.slice(0, 3).map((h) => (
              <span key={h} className="glass glass-tint rounded-full px-4 py-2 text-[13px] font-semibold" style={{ "--tint": p.stage, color: p.fg } as React.CSSProperties}>
                <span className="relative z-[3]">{h}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Mobile cover strip */}
        <div className="relative -order-1 h-[30%] shrink-0 overflow-hidden md:hidden">
          <Image src={event.image} alt="" fill sizes="100vw" className="object-cover" />
        </div>
      </motion.article>
    </div>
  );
}

export function Featured({ onOpen }: { onOpen: OpenEvent }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="featured" aria-labelledby="featured-title" className="relative scroll-mt-20 overflow-x-clip px-2 py-24 sm:px-4 md:py-32">
      <div className="mx-auto max-w-[1500px] px-[calc(var(--gutter)-8px)]">
        <SectionTitle
          id="featured-title"
          title="Three moments"
          turn="you'll remember."
          kicker="Our editors' picks, the moments the whole festival builds towards. Keep scrolling and they stack like dispatches on a desk."
        />
      </div>
      <div ref={ref} className="relative mx-auto mt-14 max-w-[1500px] pb-[8svh]">
        {FEATURED.map((e, i) => (
          <Dispatch key={e.id} event={e} i={i} n={FEATURED.length} progress={scrollYProgress} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}
