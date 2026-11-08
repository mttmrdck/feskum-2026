"use client";

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "motion/react";
import { useCallback, useDeferredValue, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { CATEGORY_FILTERS, type CategoryFilter } from "@/data/categories";
import { EVENTS, FESTIVAL_DATES, byChronology, type ConvoEvent } from "@/data/events";
import { venueById } from "@/data/venues";
import { PALETTES, paletteFor, paletteVars } from "@/lib/palette";
import { EASE_OUT } from "@/lib/motion";
import { cardLayoutId, type OpenEvent } from "@/lib/selection";
import { cn, formatDay, formatMonth, formatWeekday } from "@/lib/utils";
import { SCENES } from "./scenes";
import { UnderLight, type LightState } from "@/components/UnderLight";
import { Magnetic } from "@/components/Magnetic";

const SORTED = [...EVENTS].sort(byChronology);
/** Snap spring: a heavy slab settling. Damping ratio ≈0.88: one barely visible settle, no bounce. */
const SNAP = { type: "spring", stiffness: 130, damping: 20, mass: 1 } as const;
/** How many slides either side of the front stay mounted. */
const WINDOW = 3;

const normalise = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const pad = (n: number) => String(n).padStart(2, "0");

export interface SliderHandle {
  show: (id: string) => void;
}

/* ───────────────────────────── One slide on the depth track ───────────────────────────── */
function SlideFrame({
  event,
  index,
  total,
  position,
  spacing,
  active,
  onOpen,
  onFocusSlide,
}: {
  event: ConvoEvent;
  index: number;
  total: number;
  position: MotionValue<number>;
  spacing: number;
  active: boolean;
  onOpen: OpenEvent;
  onFocusSlide: (i: number) => void;
}) {
  const reduce = useReducedMotion();
  const palette = paletteFor(event.category);
  const Scene = SCENES[event.scene];
  const ref = useRef<HTMLDivElement>(null);

  // Signed distance from the front. Everything below derives from it.
  const depth = useTransform(position, (p) => index - p);
  const x = useTransform(depth, (o) => o * spacing);
  const scale = useTransform(depth, (o) => 1 - Math.min(Math.abs(o), 2.2) * 0.13);
  const rotateY = useTransform(depth, (o) => (reduce ? 0 : clamp(o, -2, 2) * -18));
  const z = useTransform(depth, (o) => 100 - Math.round(Math.abs(o) * 10));
  const shade = useTransform(depth, (o) => Math.min(Math.abs(o), 1) * 0.62);
  // Far slides fade out on the frame itself (only beyond the neighbours,
  // so glass on visible slides never sits under an opacity < 1 ancestor).
  const opacity = useTransform(depth, (o) => clamp(1 - (Math.abs(o) - 1.6) * 1.4, 0, 1));
  // How much of the under-light this slab receives: full at the front, none off to the side.
  const lit = useTransform(depth, (o) => clamp(1 - Math.abs(o) * 1.15, 0, 1));

  // The front slab answers the pointer: a few degrees of tilt, and the
  // specular highlight + holographic rim follow the light source.
  const tiltX = useSpring(0, { stiffness: 140, damping: 20, mass: 0.6 });
  const tiltY = useSpring(0, { stiffness: 140, damping: 20, mass: 0.6 });
  const onPointerMove = (e: React.PointerEvent) => {
    if (!active || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const fy = (e.clientY - r.top) / r.height;
    ref.current.style.setProperty("--mx", `${fx * 100}%`);
    ref.current.style.setProperty("--my", `${fy * 100}%`);
    if (!reduce) {
      tiltY.set((fx - 0.5) * 6);
      tiltX.set(-(fy - 0.5) * 4.5);
    }
  };
  const settle = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <motion.div
      className="absolute inset-y-0 left-1/2 w-[var(--slide-w)] -translate-x-1/2"
      style={{ x, scale, rotateY, zIndex: z, opacity }}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}`}
    >
      <motion.div className="absolute inset-0" style={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY, transformPerspective: 1800 }}>
      <motion.div
        ref={ref}
        data-scene={event.id}
        inert={!active}
        layoutId={reduce ? undefined : cardLayoutId("slider", event.id)}
        onPointerMove={onPointerMove}
        onPointerLeave={settle}
        style={{ borderRadius: 30, ...paletteVars(palette) }}
        className="glass lum-glass @container absolute inset-0 overflow-hidden"
      >
        <Scene
          event={event}
          palette={palette}
          active={active}
          depth={depth}
          index={index}
          total={total}
          onOpen={() => {
            tiltX.jump(0);
            tiltY.jump(0);
            onOpen(event.id, "slider");
          }}
        />
        {/* Light entering the slab from below: hue band burning to white at the edge. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-[46%] mix-blend-screen"
          style={{
            opacity: lit,
            background: `linear-gradient(to top, ${palette.accent2} 0%, ${palette.accent} 7%, color-mix(in oklab, ${palette.accent} 45%, transparent) 20%, color-mix(in oklab, ${palette.accent} 12%, transparent) 42%, transparent 100%)`,
          }}
        />
        {/* Side slides fall into shadow, and become a single "go to" target. */}
        <motion.div className="pointer-events-none absolute inset-0 z-20 bg-[#020205]" style={{ opacity: shade }} />
      </motion.div>
      </motion.div>
      {!active && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => onFocusSlide(index)}
          className="absolute inset-0 z-30 cursor-pointer rounded-[34px]"
        />
      )}
    </motion.div>
  );
}

/* ───────────────────────────── The slider section ───────────────────────────── */
export function EventSlider({ onOpen, ref }: { onOpen: OpenEvent; ref?: React.Ref<SliderHandle> }) {
  const reduce = useReducedMotion();
  const [category, setCategory] = useState<CategoryFilter>("All Events");
  const [date, setDate] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    const q = normalise(deferredQuery.trim());
    return SORTED.filter((e) => {
      if (category !== "All Events" && e.category !== category) return false;
      if (date && e.date !== date) return false;
      if (!q) return true;
      const v = venueById(e.venue);
      return normalise(`${e.title} ${e.tagline} ${e.category} ${v.name} ${v.shortName}`).includes(q);
    });
  }, [category, date, deferredQuery]);

  const total = results.length;
  const position = useMotionValue(0);
  const [active, setActive] = useState(0);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [spacing, setSpacing] = useState(900);

  useMotionValueEvent(position, "change", (v) => {
    const i = clamp(Math.round(v), 0, Math.max(0, total - 1));
    setActive((a) => (a === i ? a : i));
  });

  const goTo = useCallback(
    (i: number, velocity = 0) => {
      const target = clamp(i, 0, Math.max(0, total - 1));
      anim.current?.stop();
      anim.current = reduce
        ? animate(position, target, { duration: 0.35, ease: EASE_OUT })
        : animate(position, target, { ...SNAP, velocity });
    },
    [position, reduce, total],
  );

  // Filters changed: jump back to the first result without a long fly-by.
  const resetTrack = useCallback(() => {
    anim.current?.stop();
    position.jump(0);
    setActive(0);
  }, [position]);

  const setCategoryAndReset = (c: CategoryFilter) => {
    setCategory(c);
    resetTrack();
  };
  const setDateAndReset = (d: string | null) => {
    setDate(d);
    resetTrack();
  };
  const setQueryAndReset = (q: string) => {
    setQuery(q);
    resetTrack();
  };
  const clearFilters = () => {
    setCategory("All Events");
    setDate(null);
    setQuery("");
    resetTrack();
  };

  useImperativeHandle(ref, () => ({
    show: (id: string) => {
      let idx = results.findIndex((e) => e.id === id);
      if (idx === -1) {
        clearFilters();
        idx = SORTED.findIndex((e) => e.id === id);
      }
      sectionRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      // Let the scroll settle a beat, then glide the track.
      window.setTimeout(() => goTo(idx), reduce ? 0 : 450);
    },
  }));

  // Slide spacing follows the stage width (slide width + a sliver of gap).
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      const slideW = w < 768 ? w - 40 : Math.min(w * 0.62, 1040);
      el.style.setProperty("--slide-w", `${slideW}px`);
      setSpacing(slideW * (w < 768 ? 1.02 : 0.9));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── Pointer drag with velocity-projected inertia ── */
  const drag = useRef<{ x0: number; y0: number; p0: number; samples: { x: number; t: number }[]; moved: boolean; id: number } | null>(null);
  const suppressClick = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || total < 2) return;
    anim.current?.stop();
    drag.current = { x0: e.clientX, y0: e.clientY, p0: position.get(), samples: [{ x: e.clientX, t: e.timeStamp }], moved: false, id: e.pointerId };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x0;
    if (!d.moved) {
      if (Math.abs(dx) < 6) return;
      if (Math.abs(e.clientY - d.y0) > Math.abs(dx)) {
        drag.current = null; // vertical intent: let the page scroll
        return;
      }
      d.moved = true;
      stageRef.current?.setPointerCapture(e.pointerId);
    }
    let p = d.p0 - dx / spacing;
    // Rubber band past the ends.
    if (p < 0) p = p * 0.35;
    if (p > total - 1) p = total - 1 + (p - (total - 1)) * 0.35;
    position.set(p);
    d.samples.push({ x: e.clientX, t: e.timeStamp });
    if (d.samples.length > 6) d.samples.shift();
  };
  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.moved) return;
    suppressClick.current = true;
    window.setTimeout(() => (suppressClick.current = false), 0);
    stageRef.current?.releasePointerCapture?.(e.pointerId);
    const first = d.samples[0];
    const last = d.samples[d.samples.length - 1];
    const dt = Math.max(1, last.t - first.t);
    const vPx = (last.x - first.x) / dt; // px per ms
    const vSlides = (-vPx * 1000) / spacing; // slides per second
    const projected = position.get() + vSlides * 0.18;
    const start = Math.round(d.p0);
    let target = clamp(Math.round(projected), start - 3, start + 3);
    // A deliberate pull of ~15% of a slide commits to the neighbour even when slow.
    const pulled = position.get() - d.p0;
    if (target === start && Math.abs(pulled) > 0.15) target = start + Math.sign(pulled);
    goTo(target, vSlides);
  };

  /* ── Keyboard and horizontal trackpad ── */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") goTo(active + 1);
    else if (e.key === "ArrowLeft") goTo(active - 1);
    else if (e.key === "Home") goTo(0);
    else if (e.key === "End") goTo(total - 1);
    else return;
    e.preventDefault();
  };
  const wheelLock = useRef(0);
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return;
    const now = performance.now();
    if (now < wheelLock.current) return;
    wheelLock.current = now + 520;
    goTo(active + (e.deltaX > 0 ? 1 : -1));
  };

  // Under-light state, read by the shader every frame (no React renders).
  const slidesRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef(results);
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);
  const readLight = useCallback((): LightState => {
    const list = resultsRef.current;
    const stage = stageRef.current;
    const slides = slidesRef.current;
    const w = stage?.clientWidth ?? 0;
    const edge = slides ? slides.offsetTop + slides.offsetHeight : 0;
    const slideW = parseFloat(stage?.style.getPropertyValue("--slide-w") || "") || w * 0.7;
    if (!list.length) return { rgb: [0.6, 0.6, 0.7], intensity: 0.3, cx: w / 2, edge, half: slideW / 2 };
    const p = clamp(position.get(), 0, list.length - 1);
    const i0 = Math.floor(p);
    const i1 = Math.min(list.length - 1, i0 + 1);
    const f = p - i0;
    const t = f * f * (3 - 2 * f);
    const a = paletteFor(list[i0].category).rgb;
    const b = paletteFor(list[i1].category).rgb;
    return {
      rgb: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
      // Between slides the lamp has nothing to rest on: it dims a little, then returns.
      intensity: 1 - 0.22 * Math.sin(Math.PI * f),
      // Track velocity (slides/s) drives the liquid's slosh.
      flow: clamp(position.getVelocity() / 4, -1, 1),
      cx: w / 2,
      edge,
      half: slideW / 2,
    };
  }, [position]);

  const current = results[active];
  const palette = current ? paletteFor(current.category) : PALETTES.Graduation;
  const progress = useTransform(position, (p) => (total > 1 ? clamp(p / (total - 1), 0, 1) : 1));

  const from = Math.max(0, active - WINDOW);
  const to = Math.min(total, active + WINDOW + 1);

  return (
    <section
      id="explore"
      ref={sectionRef}
      aria-labelledby="explore-title"
      className="relative scroll-mt-20 px-2 pb-6 pt-24 sm:px-4 md:pt-28"
    >
      <div className="mx-auto mb-8 flex max-w-[1500px] flex-wrap items-end justify-between gap-6 px-[calc(var(--gutter)-8px)]">
        <h2 id="explore-title" className="headline max-w-[16ch] text-[clamp(2.8rem,6.4vw,6rem)] text-ink [text-wrap:balance]">
          Every event, <span className="font-light">one room at a time.</span>
        </h2>
        <p className="max-w-sm text-[15px] leading-relaxed text-ink-2">
          Drag, swipe or use the arrow keys to walk the exhibition. Filter by category or day, or search for
          something specific.
        </p>
      </div>

      {/* Filter rail */}
      <div className="relative z-40 mx-auto mb-4 max-w-[1500px] px-[calc(var(--gutter)-8px)]">
        <div className="glass glass-solid flex flex-col gap-2 rounded-[26px] p-2 lg:flex-row lg:items-center">
          <label className="relative z-[3] flex min-h-11 items-center gap-3 rounded-full bg-ink/[.05] px-4 lg:w-72">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-ink-3">
              <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
              <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="sr-only">Search events</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQueryAndReset(e.target.value)}
              placeholder="Search events or venues"
              className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3 [&::-webkit-search-cancel-button]:hidden"
            />
          </label>
          <ul aria-label="Filter by category" className="no-scrollbar relative z-[3] flex flex-1 gap-1 overflow-x-auto">
            {CATEGORY_FILTERS.map((c) => {
              const on = category === c;
              const p = c === "All Events" ? null : PALETTES[c];
              return (
                <li key={c} className="shrink-0">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setCategoryAndReset(c)}
                    style={on && p ? { background: p.stage, color: p.fg } : undefined}
                    className={cn(
                      "pressable flex min-h-11 items-center gap-2 rounded-full px-4 text-[13.5px] font-medium",
                      on ? (p ? "" : "bg-ink text-cream") : "text-ink-2 hover:bg-ink/[.06]",
                    )}
                  >
                    {p && <span className="size-2.5 rounded-full" style={{ background: p.accent, boxShadow: on ? `0 0 10px ${p.accent}` : undefined }} aria-hidden />}
                    {c}
                  </button>
                </li>
              );
            })}
          </ul>
          <ul aria-label="Filter by day" className="no-scrollbar relative z-[3] flex gap-1 overflow-x-auto border-t border-ink/10 pt-2 lg:border-l lg:border-t-0 lg:pl-2 lg:pt-0">
            {[null, ...FESTIVAL_DATES].map((d) => {
              const on = date === d;
              return (
                <li key={d ?? "all"} className="shrink-0">
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-label={d ? `${formatWeekday(d)} ${formatDay(d)} ${formatMonth(d)}` : "All days"}
                    onClick={() => setDateAndReset(d)}
                    className={cn(
                      "pressable flex min-h-11 min-w-11 flex-col items-center justify-center rounded-2xl px-2.5 leading-none",
                      on ? "bg-yellow text-ink" : "text-ink-2 hover:bg-ink/[.06]",
                    )}
                  >
                    {d ? (
                      <>
                        <span className="label text-[11.5px]">{formatWeekday(d)}</span>
                        <span className="tnum mt-1 text-[15px] font-semibold">{formatDay(d)}</span>
                      </>
                    ) : (
                      <span className="label">All</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* The stage: a dark room lit from beneath the front slab. The light's
          colour follows the track position continuously, so hues blend as
          slides pass rather than swapping. */}
      <div className="relative mx-auto max-w-[1600px] overflow-hidden rounded-[40px] bg-[#04040a] text-[#f4f4f7]">
        {total > 0 ? (
          <div
            ref={stageRef}
            role="region"
            aria-roledescription="carousel"
            aria-label="FESKUM events"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={(e) => {
              if (suppressClick.current) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            className="relative h-[min(88svh,900px)] min-h-[620px] cursor-grab touch-pan-y select-none overscroll-x-contain outline-none active:cursor-grabbing [perspective:1600px] focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-white/40"
          >
            <UnderLight read={readLight} fallbackColor={palette.accent} className="absolute inset-0 size-full" />

            {/* Header, as quiet as the reference: light name, count, hint, controls. */}
            <div className="absolute inset-x-0 top-0 z-[120] flex h-[76px] items-center gap-4 px-5 md:h-[84px] md:px-9">
              <p className="tnum flex min-w-0 items-baseline gap-3 text-[14px]" aria-live="polite">
                <span className="caps font-semibold transition-colors duration-700" style={{ color: palette.accent2 }}>
                  {palette.mood}
                </span>
                <span className="text-white/50">
                  {pad(active + 1)} / {pad(total)}
                </span>
              </p>
              <p className="label mx-auto hidden text-white/45 md:block">Drag, swipe or use ← →</p>
              <div className="ml-auto flex gap-2">
                <Magnetic strength={6}>
                  <button
                    type="button"
                    onClick={() => goTo(active - 1)}
                    disabled={active === 0}
                    className="pressable grid size-11 place-items-center rounded-full border border-white/15 bg-white/[.04] text-white transition-colors hover:border-white/40 disabled:opacity-30"
                  >
                    <span className="sr-only">Previous event</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M15 8H1M6 3 1 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </Magnetic>
                <Magnetic strength={6}>
                  <button
                    type="button"
                    onClick={() => goTo(active + 1)}
                    disabled={active >= total - 1}
                    className="pressable grid size-11 place-items-center rounded-full border border-white/15 bg-white/[.04] text-white transition-colors hover:border-white/40 disabled:opacity-30"
                  >
                    <span className="sr-only">Next event</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M1 8h14M10 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </Magnetic>
              </div>
              <div className="absolute inset-x-5 bottom-0 h-px overflow-hidden bg-white/10 md:inset-x-9">
                <motion.div className="absolute inset-0 origin-left bg-white/60" style={{ scaleX: progress }} />
              </div>
            </div>

            <div ref={slidesRef} className="absolute inset-x-0 bottom-[25%] top-[100px] md:top-[108px]">
              {results.slice(from, to).map((event, k) => {
                const i = from + k;
                return (
                  <SlideFrame
                    key={event.id}
                    event={event}
                    index={i}
                    total={total}
                    position={position}
                    spacing={spacing}
                    active={i === active}
                    onOpen={onOpen}
                    onFocusSlide={goTo}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="relative grid h-[min(60svh,560px)] place-items-center p-8 text-center">
            <div>
              <p className="poster text-[clamp(3rem,8vw,6rem)]">Empty room.</p>
              <p className="mx-auto mt-4 max-w-sm text-[16px] opacity-85">No events match those filters. Try another day, category or search.</p>
              <button type="button" onClick={clearFilters} className="pressable mt-6 rounded-full bg-cream px-6 py-3 text-[14px] font-semibold text-ink">
                Clear filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Index strip: every slide as a colour tick, clickable. */}
      {total > 1 && (
        <ol aria-label="Jump to event" className="no-scrollbar mx-auto mt-4 flex max-w-[1500px] gap-1.5 overflow-x-auto px-[calc(var(--gutter)-8px)] pb-2">
          {results.map((e, i) => {
            const p = paletteFor(e.category);
            const on = i === active;
            return (
              <li key={e.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={on ? "true" : undefined}
                  aria-label={`${i + 1}. ${e.title}`}
                  className="group flex h-11 items-center"
                >
                  <span
                    className={cn("block h-2 rounded-full transition-[width] duration-300 ease-[cubic-bezier(.23,1,.32,1)]", on ? "w-14" : "w-6 group-hover:w-9")}
                    style={{ background: on ? p.accent : `color-mix(in oklab, ${p.accent} 35%, transparent)`, boxShadow: on ? `0 0 12px ${p.accent}` : undefined }}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
