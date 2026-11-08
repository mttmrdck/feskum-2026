"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CATEGORIES } from "@/data/categories";
import { EVENTS, FESTIVAL_DATES, byChronology } from "@/data/events";
import { VENUES, venueById } from "@/data/venues";
import { EASE_OUT } from "@/lib/motion";
import { PALETTES, paletteFor, paletteVars } from "@/lib/palette";
import type { ShowInSlider } from "@/lib/selection";
import { formatDay, formatMonth, formatWeekday } from "@/lib/utils";
import { UnderLight, type LightState } from "@/components/UnderLight";
import { Magnetic } from "@/components/Magnetic";

const FIRST_DAY = FESTIVAL_DATES[0];
const RIBBON = [...EVENTS].sort(byChronology);
/** Varied print widths so the ribbon reads as a hung exhibition, not a grid. */
const WIDTHS = ["w-[220px] md:w-[300px]", "w-[170px] md:w-[220px]", "w-[250px] md:w-[340px]", "w-[190px] md:w-[250px]"];
const PREVIEW = RIBBON.filter((e) => e.featured || e.kind === "performance" || e.kind === "exhibition");

function useDaysToGo() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      const [y, m, d] = FIRST_DAY.split("-").map(Number);
      return Math.ceil((Date.UTC(y, m - 1, d) - 8 * 3600_000 - Date.now()) / 86_400_000);
    },
    () => null,
  );
}

export function Hero({ onShow }: { onShow: ShowInSlider }) {
  const reduce = useReducedMotion();
  const days = useDaysToGo();
  const ref = useRef<HTMLElement>(null);
  const [preview, setPreview] = useState(0);
  const [paused, setPaused] = useState(false);

  // Interactive preview cycles through highlights until the visitor engages.
  useEffect(() => {
    if (paused || reduce) return;
    const t = window.setInterval(() => setPreview((p) => (p + 1) % PREVIEW.length), 3800);
    return () => window.clearInterval(t);
  }, [paused, reduce]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const wordY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const ribbonX = useTransform(scrollYProgress, [0, 1], [0, -160]);

  // The gallery is a plane in space: tilted back, and it leans toward the pointer.
  const px = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const py = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const planeY = useTransform(px, (v) => -9 + v * 6);
  const planeX = useTransform(py, (v) => 11 - v * 5);
  const scrollTilt = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const planeXWithScroll = useTransform([planeX, scrollTilt] as const, ([a, b]: number[]) => a + b);
  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    px.set(e.clientX / window.innerWidth - 0.5);
    py.set(e.clientY / window.innerHeight - 0.5);
  };

  const ev = PREVIEW[preview];
  const p = paletteFor(ev.category);

  // The lens sits on a lamp. Its light eases toward each previewed event's
  // colour (exponential smoothing per frame), so hues travel, never swap.
  const bandRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const target = useRef(p.rgb);
  const lit = useRef<[number, number, number]>([...p.rgb]);
  const last = useRef(0);
  useEffect(() => {
    target.current = p.rgb;
  }, [p.rgb]);
  const readLight = useCallback((): LightState => {
    const now = performance.now();
    const dt = last.current ? Math.min(0.1, (now - last.current) / 1000) : 0.016;
    last.current = now;
    const k = 1 - Math.exp(-dt * 2.6);
    for (let i = 0; i < 3; i++) lit.current[i] += (target.current[i] - lit.current[i]) * k;
    const band = bandRef.current;
    const lens = lensRef.current;
    const w = band?.clientWidth ?? 0;
    const h = band?.clientHeight ?? 0;
    if (band && lens && lens.offsetParent) {
      const b = band.getBoundingClientRect();
      const r = lens.getBoundingClientRect();
      return { rgb: lit.current, intensity: 1, cx: r.left - b.left + r.width / 2, edge: r.bottom - b.top, half: r.width / 2 };
    }
    return { rgb: lit.current, intensity: 0.8, cx: w / 2, edge: h * 0.78, half: w * 0.32 };
  }, []);
  const status =
    days === null ? "Convocation week" : days > 1 ? `${days} days to go` : days === 1 ? "Opens tomorrow" : days > -6 ? "Happening now" : "See you next year";

  const rise = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: EASE_OUT },
  });

  return (
    <section id="overview" ref={ref} onPointerMove={onPointerMove} aria-labelledby="hero-title" className="relative isolate overflow-hidden pb-8 pt-24 md:pt-28">
      <div className="mx-auto max-w-[1500px] px-[var(--gutter)]">
        <motion.div {...rise(0.1)} className="label flex flex-wrap items-center justify-between gap-3 text-ink-2">
          <span className="flex items-center gap-3">
            <span className="flex gap-1" aria-hidden>
              {["bg-cobalt", "bg-orange", "bg-yellow", "bg-emerald", "bg-lavender"].map((c) => (
                <span key={c} className={`size-2 rounded-full ${c}`} />
              ))}
            </span>
            Universiti Malaya Convocation Festival
          </span>
          <span className="tnum">
            28 Nov to 3 Dec 2026 <span className="ml-3 text-cobalt">{status}</span>
          </span>
        </motion.div>

        <motion.h1
          id="hero-title"
          style={reduce ? undefined : { y: wordY }}
          className="mt-6 flex flex-wrap items-end justify-between gap-x-6 text-ink"
        >
          <span
            className="poster block overflow-hidden text-[clamp(4.4rem,18.5vw,20rem)] leading-[0.8]"
            style={{ fontStretch: "100%", fontVariationSettings: "'opsz' 96, 'wdth' 100" }}
          >
            <motion.span
              className="block"
              initial={reduce ? { opacity: 0 } : { y: "100%" }}
              animate={reduce ? { opacity: 1 } : { y: "0%" }}
              transition={{ duration: 1.1, delay: 0.15, ease: EASE_OUT }}
            >
              FESKUM
            </motion.span>
          </span>{" "}
          <motion.span
            className="serif ml-auto block pb-[0.08em] text-[clamp(3rem,9vw,9.5rem)] font-extralight leading-none tracking-[-0.05em] text-cobalt"
            initial={reduce ? { opacity: 0 } : { opacity: 0, rotate: -6, y: 30 }}
            animate={{ opacity: 1, rotate: -6, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: EASE_OUT }}
          >
            2026
          </motion.span>
        </motion.h1>

        <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-12 md:items-end">
          <motion.p {...rise(0.45)} className="headline text-[clamp(1.9rem,4vw,3.4rem)] text-ink md:col-span-7">
            Six days. Countless moments. <span className="font-light">One celebration.</span>
          </motion.p>
          <motion.div {...rise(0.55)} className="flex flex-wrap items-center gap-3 md:col-span-5 md:justify-end">
            <Magnetic>
            <a href="#explore" className="pressable inline-flex min-h-14 items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-[15px] font-semibold text-cream">
              Enter the exhibition
              <span className="grid size-10 place-items-center rounded-full bg-yellow text-ink" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M2 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
            </Magnetic>
            <a href="#schedule" className="pressable inline-flex min-h-14 items-center rounded-full border-2 border-ink/15 px-6 text-[15px] font-semibold text-ink hover:border-ink">
              Full schedule
            </a>
          </motion.div>
        </div>
      </div>

      {/* Light-box: event prints drift through a dark room; a luminous glass
          lens previews one event at a time, lit from beneath in its colour. */}
      <motion.div {...rise(0.7)} className="relative mt-10 md:mt-14">
        <div ref={bandRef} className="relative mx-2 overflow-hidden rounded-[36px] bg-[#04040a] [perspective:1600px] sm:mx-4">
          <UnderLight read={readLight} fallbackColor={p.accent} className="absolute inset-0 size-full" />
          <motion.div style={reduce ? undefined : { x: ribbonX, rotateX: planeXWithScroll, rotateY: planeY, scale: 1.06 }} className="relative origin-center pb-24 pt-8 md:pb-28 md:pt-12">
            <ul
              className="marquee flex w-max gap-4 md:gap-5"
              style={{ "--marquee-dur": "70s" } as React.CSSProperties}
              aria-label="Festival highlights"
            >
              {[...RIBBON, ...RIBBON].map((e, i) => {
                const pal = paletteFor(e.category);
                const dup = i >= RIBBON.length;
                return (
                  <li key={`${e.id}-${i}`} aria-hidden={dup || undefined} className={`${WIDTHS[i % WIDTHS.length]} shrink-0`}>
                    <button
                      type="button"
                      tabIndex={dup ? -1 : 0}
                      onClick={() => onShow(e.id)}
                      aria-label={`${e.title}, ${e.category}, ${formatDay(e.date)} ${formatMonth(e.date)}. Show in the events slider`}
                      className="pressable group block w-full text-left"
                      style={{ transform: `rotate(${((i * 37) % 7) - 3}deg)` }}
                    >
                      <span className="relative block h-[200px] overflow-hidden rounded-[20px] shadow-[0_0_0_1px_rgba(255,255,255,.08),0_30px_50px_-20px_rgba(0,0,0,.8)] md:h-[270px]" style={{ background: pal.stage }}>
                        <Image
                          src={e.image}
                          alt=""
                          fill
                          sizes="340px"
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(.23,1,.32,1)] group-hover:scale-105"
                        />
                        <span
                          className="glass glass-tint label absolute inset-x-2 bottom-2 flex items-center justify-between rounded-[14px] px-3 py-2"
                          style={{ "--tint": pal.stage, color: pal.fg } as React.CSSProperties}
                        >
                          <span className="relative z-[3] truncate">{e.category}</span>
                          <span className="tnum relative z-[3] hidden md:inline">{formatDay(e.date)} {formatMonth(e.date)}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          {/* The lens: clear glass with a live preview, refracting the ribbon behind it. */}
          <div
            ref={lensRef}
            className="pointer-events-none absolute bottom-[26%] right-4 top-6 hidden w-[380px] md:block lg:right-10"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
          >
            <div
              className="glass lum-glass pointer-events-auto flex h-full flex-col justify-between overflow-hidden rounded-[26px] p-5 text-white"
              style={paletteVars(p)}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] mix-blend-screen transition-[background] duration-700"
                style={{ background: `linear-gradient(to top, ${p.accent2} 0%, ${p.accent} 8%, color-mix(in oklab, ${p.accent} 30%, transparent) 26%, transparent 100%)` }}
              />
              <div className="relative z-[4] flex items-center justify-between">
                <span className="caps" style={{ color: p.accent2 }}>
                  {p.mood}
                </span>
                <span className="flex gap-1" aria-hidden>
                  {PREVIEW.map((x, i) => (
                    <span key={x.id} className="h-1 rounded-full transition-all duration-500" style={{ width: i === preview ? 18 : 6, background: i === preview ? "#ffffff" : "#ffffff40" }} />
                  ))}
                </span>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={ev.id}
                  className="relative z-[4]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                >
                  <p className="label text-white/60">
                    {formatWeekday(ev.date)} {formatDay(ev.date)} {formatMonth(ev.date)}, {ev.startTime} at {venueById(ev.venue).shortName}
                  </p>
                  <p className="headline mt-2 text-[2rem] [text-wrap:balance]">{ev.title}</p>
                  <p className="serif mt-1 text-[1.1rem] text-white/70">{ev.tagline}</p>
                </motion.div>
              </AnimatePresence>
              <div className="relative z-[4] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onShow(ev.id)}
                  className="pressable flex-1 rounded-full px-5 py-3 text-[14px] font-semibold transition-colors duration-700"
                  style={{ background: p.accent2, color: p.stage }}
                >
                  See it in the exhibition
                </button>
                <button
                  type="button"
                  aria-label="Next preview"
                  onClick={() => {
                    setPaused(true);
                    setPreview((x) => (x + 1) % PREVIEW.length);
                  }}
                  className="pressable grid size-12 place-items-center rounded-full border border-white/20 bg-white/5 text-white"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <dl className="mx-auto mt-6 grid max-w-[1500px] grid-cols-2 gap-x-6 gap-y-4 px-[var(--gutter)] sm:grid-cols-4">
          {[
            { k: "Days", v: String(FESTIVAL_DATES.length), c: PALETTES.Academic.onCream },
            { k: "Events", v: String(EVENTS.length), c: PALETTES.Entertainment.onCream },
            { k: "Venues", v: String(VENUES.length), c: PALETTES.Sports.onCream },
            { k: "Categories", v: String(CATEGORIES.length), c: PALETTES.Exhibition.onCream },
          ].map((s) => (
            <div key={s.k} className="flex flex-row-reverse items-baseline justify-end gap-3 border-t-2 pt-3" style={{ borderColor: s.c }}>
              <dt className="label text-ink-2">{s.k}</dt>
              <dd className="poster tnum text-[3rem]" style={{ color: s.c }}>
                {s.v}
              </dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </section>
  );
}
