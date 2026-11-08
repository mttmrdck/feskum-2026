"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { eventById } from "@/data/events";
import { venueById } from "@/data/venues";
import { downloadIcs } from "@/lib/calendar";
import { EASE_OUT, SPRING_MORPH } from "@/lib/motion";
import { paletteFor } from "@/lib/palette";
import { cardLayoutId, imageLayoutId, type Selection } from "@/lib/selection";
import { formatLongDate, formatTimeRange } from "@/lib/utils";
import { RevealText } from "@/components/RevealText";

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The slide becomes a room: the frame and photograph share layoutIds with the
 * element that was clicked and grow into a full page in the event's colours.
 */
export function EventDetail({ selection, onClose }: { selection: Selection; onClose: () => void }) {
  const event = eventById(selection.id);
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);
  const source = reduce ? "direct" : selection.source;
  const morphs = source !== "direct";

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.add("scroll-locked");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("scroll-locked");
      previous?.focus({ preventScroll: true });
    };
  }, [onClose]);

  if (!event) return null;
  const venue = venueById(event.venue);
  const p = paletteFor(event.category);

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#event=${event.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  const info = [
    { k: "Date", v: formatLongDate(event.date) },
    { k: "Time", v: `${formatTimeRange(event.startTime, event.endTime)} MYT` },
    { k: "Venue", v: venue.name },
    { k: "Organiser", v: event.organiser },
  ];

  return (
    <div className="fixed inset-0 z-[60]">
      <motion.div
        className="absolute inset-0 bg-ink/50 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.25 } }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        onClick={onClose}
        aria-hidden
      />

      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
        layoutId={cardLayoutId(source, event.id)}
        transition={SPRING_MORPH}
        initial={morphs ? undefined : { opacity: 0, scale: 0.96, y: 20 }}
        animate={morphs ? undefined : { opacity: 1, scale: 1, y: 0 }}
        exit={morphs ? undefined : { opacity: 0, scale: 0.98, transition: { duration: 0.18 } }}
        style={{ borderRadius: 34, background: p.stage, color: p.fg }}
        className="absolute inset-2 overflow-hidden shadow-[0_60px_120px_-40px_rgba(0,0,0,.7)] md:inset-4"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="glass glass-ink pressable absolute right-4 top-4 z-20 flex h-12 items-center gap-2 rounded-full pl-5 pr-4 text-[14px] font-semibold text-white md:right-6 md:top-6"
        >
          <span className="relative z-[3]">Close</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="relative z-[3]">
            <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <div className="no-scrollbar relative z-[3] h-full overflow-y-auto overscroll-contain">
          {/* Photograph */}
          <div className="relative h-[52svh] min-h-[320px] md:h-[62svh]">
            <motion.div layoutId={imageLayoutId(source, event.id)} transition={SPRING_MORPH} className="absolute inset-0 overflow-hidden">
              <Image src={event.image} alt="" fill sizes="100vw" className="object-cover" preload />
            </motion.div>
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${p.stage} 2%, transparent 55%)` }} />
            {/* The room's light pools where the photograph meets the page. */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2/3 mix-blend-screen"
              style={{ background: `radial-gradient(65% 55% at 50% 100%, color-mix(in oklab, ${p.accent} 55%, transparent), transparent 70%)` }}
            />
            <span
              className="label absolute left-5 top-5 rounded-full px-3 py-1.5 md:left-8 md:top-7"
              style={{ background: p.accent, color: p.onAccent }}
            >
              {event.category}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.55, delay: morphs ? 0.18 : 0.05, ease: EASE_OUT }}
            className="relative -mt-[14svh] px-5 pb-12 md:px-12"
          >
            <RevealText
              as="h2"
              id="event-detail-title"
              play
              delay={morphs ? 0.25 : 0.1}
              text={event.title}
              className="poster block max-w-[16ch] text-[clamp(3rem,9vw,8.5rem)] [text-wrap:balance]"
            />
            <p className="serif mt-4 text-[clamp(1.3rem,2.4vw,2rem)]" style={{ color: p.accent }}>
              {event.tagline}
            </p>

            <div className="mt-10 grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="max-w-[60ch] text-[17px] leading-relaxed opacity-90">{event.description}</p>
                {event.highlights.length > 0 && (
                  <>
                    <h3 className="label mt-10 opacity-75">Highlights</h3>
                    <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                      {event.highlights.map((h) => (
                        <li
                          key={h}
                          className="glass glass-clear flex items-start gap-3 rounded-[18px] px-4 py-3.5 text-[15px] font-medium"
                        >
                          <span aria-hidden className="relative z-[3] mt-[0.45em] size-2 shrink-0 rounded-full" style={{ background: p.accent }} />
                          <span className="relative z-[3]">{h}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <aside className="flex flex-col gap-3 lg:col-span-5">
                <dl className="glass glass-solid rounded-[26px] p-6 text-ink">
                  {info.map((row, i) => (
                    <div key={row.k} className={i ? "relative z-[3] mt-4 border-t border-ink/10 pt-4" : "relative z-[3]"}>
                      <dt className="label text-ink-3">{row.k}</dt>
                      <dd className="tnum mt-1 text-[16px] font-medium">{row.v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="glass glass-tint rounded-[26px] p-6" style={{ "--tint": p.accent, color: p.onAccent } as React.CSSProperties}>
                  <p className="label relative z-[3] opacity-80">Registration</p>
                  <p className="relative z-[3] mt-2 text-[15.5px] font-medium leading-relaxed">{event.registration}</p>
                  {event.registrationUrl && (
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pressable relative z-[3] mt-4 inline-flex min-h-12 items-center rounded-full px-5 text-[14px] font-semibold"
                      style={{ background: p.onAccent, color: p.accent }}
                    >
                      Register now
                    </a>
                  )}
                </div>

                {event.announcement && (
                  <p className="rounded-[26px] border-2 border-current/30 p-6 text-[15px] leading-relaxed">
                    <span className="label mb-2 block" style={{ color: p.accent }}>
                      Notice
                    </span>
                    {event.announcement}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Get directions", href: venue.mapUrl },
                    { label: "Add to calendar", onClick: () => downloadIcs(event, venue.name) },
                    { label: copied ? "Link copied" : "Copy link", onClick: copyLink, live: true },
                  ].map((a) =>
                    a.href ? (
                      <a
                        key={a.label}
                        href={a.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass glass-clear pressable inline-flex min-h-12 items-center rounded-full px-5 text-[14px] font-semibold"
                      >
                        <span className="relative z-[3]">{a.label}</span>
                      </a>
                    ) : (
                      <button
                        key={a.label.startsWith("Link") || a.label.startsWith("Copy") ? "copy" : a.label}
                        type="button"
                        onClick={a.onClick}
                        className="glass glass-clear pressable inline-flex min-h-12 items-center rounded-full px-5 text-[14px] font-semibold"
                      >
                        <span className="relative z-[3]" aria-live={a.live ? "polite" : undefined}>
                          {a.label}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </aside>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
