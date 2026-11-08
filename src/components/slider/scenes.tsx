"use client";

import Image from "next/image";
import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import type { ConvoEvent, Scene } from "@/data/events";
import { venueById } from "@/data/venues";
import type { Palette } from "@/lib/palette";
import { imageLayoutId } from "@/lib/selection";
import { cn, formatDay, formatMonth, formatTimeRange, formatWeekday } from "@/lib/utils";
import { RevealBlock, RevealText } from "@/components/RevealText";

export interface SceneProps {
  event: ConvoEvent;
  palette: Palette;
  /** True for the slide at the front. Drives typography choreography. */
  active: boolean;
  /** Signed distance from the front (0 = active). Drives layer parallax. */
  depth: MotionValue<number>;
  index: number;
  total: number;
  onOpen: () => void;
}

/* ───────────────────────────── Shared pieces ───────────────────────────── */

/** The event photograph, shared with the detail view, with depth parallax. */
function SlideImage({
  event,
  depth,
  className,
  sizes,
  shift = 10,
  imgClassName,
  priority,
}: {
  event: ConvoEvent;
  depth: MotionValue<number>;
  className?: string;
  sizes: string;
  shift?: number;
  imgClassName?: string;
  priority?: boolean;
}) {
  const reduce = useReducedMotion();
  const x = useTransform(depth, [-1, 0, 1], [`${shift}%`, "0%", `-${shift}%`]);
  return (
    <motion.div layoutId={imageLayoutId("slider", event.id)} className={cn("overflow-hidden", className)}>
      <motion.div className="absolute -inset-x-[14%] inset-y-0" style={reduce ? undefined : { x }}>
        <Image
          src={event.image}
          alt=""
          fill
          sizes={sizes}
          preload={priority}
          draggable={false}
          className={cn("select-none object-cover", imgClassName)}
        />
      </motion.div>
    </motion.div>
  );
}

/** A glass layer that drifts against the slide as it moves (depth parallax). */
function Layer({
  depth,
  amount = 40,
  className,
  style,
  children,
}: {
  depth: MotionValue<number>;
  amount?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const x = useTransform(depth, [-1, 1], [amount, -amount]);
  return (
    <motion.div className={className} style={reduce ? style : { ...style, x }}>
      {children}
    </motion.div>
  );
}

function Chip({ event, className }: { event: ConvoEvent; className?: string }) {
  return (
    <span className={cn("label inline-flex items-center gap-2 rounded-full px-3 py-1.5", className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {event.category}
    </span>
  );
}

function ExploreButton({
  onOpen,
  active,
  className,
  style,
  label = "Explore event",
}: {
  onOpen: () => void;
  active: boolean;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      tabIndex={active ? 0 : -1}
      aria-hidden={!active}
      style={style}
      className={cn(
        "pressable group/btn relative z-10 inline-flex min-h-12 items-center gap-3 rounded-full py-2 pl-5 pr-2 text-[14px] font-semibold",
        className,
      )}
    >
      {label}
      <span className="grid size-9 place-items-center rounded-full bg-current/15 transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)] group-hover/btn:translate-x-0.5">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  );
}

function MetaRows({ event, className }: { event: ConvoEvent; className?: string }) {
  const venue = venueById(event.venue);
  return (
    <dl className={cn("grid gap-3 text-[14px]", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <dt className="label opacity-70">Date</dt>
        <dd className="font-medium">
          {formatWeekday(event.date)} {formatDay(event.date)} {formatMonth(event.date)}
        </dd>
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <dt className="label opacity-70">Time</dt>
        <dd className="tnum font-medium">{formatTimeRange(event.startTime, event.endTime)}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <dt className="label opacity-70">Venue</dt>
        <dd className="text-right font-medium">{venue.shortName}</dd>
      </div>
    </dl>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

/* ───────────────────────────── 1 · Full-bleed photograph ───────────────────────────── */
function FullBleed({ event, palette, active, depth, onOpen, index }: SceneProps) {
  return (
    <div className="absolute inset-0">
      <SlideImage event={event} depth={depth} className="absolute inset-0" sizes="(max-width: 768px) 100vw, 70vw" priority={index === 0} />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${palette.stage} 4%, color-mix(in oklab, ${palette.stage} 55%, transparent) 38%, transparent 70%)`,
        }}
      />
      <div className="absolute inset-0 flex flex-col justify-between p-5 @3xl:p-9" style={{ color: palette.fg }}>
        <div className="flex items-start justify-between gap-4">
          <Chip event={event} className="glass glass-ink text-white" />
          <span className="label glass glass-ink rounded-full px-3 py-1.5 text-white">{venueById(event.venue).shortName}</span>
        </div>

        <div className="grid items-end gap-5 @3xl:grid-cols-12">
          <div className="@3xl:col-span-8">
            <RevealText
              as="h3"
              play={active}
              text={event.title}
              className="poster block text-[clamp(2.4rem,8.4cqw,7.4rem)] [text-wrap:balance]"
            />
            <RevealBlock play={active} delay={0.25}>
              <p className="serif mt-4 max-w-[30ch] text-[clamp(1.1rem,2.2cqw,1.6rem)] opacity-90">{event.tagline}</p>
            </RevealBlock>
          </div>
          <Layer depth={depth} amount={60} className="hidden @3xl:col-span-4 @3xl:block">
            <RevealBlock play={active} delay={0.35} className="glass glass-clear glass-prism specular rounded-[26px] p-5 text-white">
              <p className="headline tnum text-[3.4rem] leading-none">
                {formatDay(event.date)}
                <span className="serif ml-2 text-2xl">{formatMonth(event.date)}</span>
              </p>
              <MetaRows event={event} className="mt-4 border-t border-white/25 pt-4" />
              <ExploreButton onOpen={onOpen} active={active} className="mt-5 w-full justify-between bg-white text-ink" />
            </RevealBlock>
          </Layer>
          <div className="flex items-center justify-between gap-3 @3xl:hidden">
            <p className="label tnum">
              {formatDay(event.date)} {formatMonth(event.date)}, {event.startTime}
            </p>
            <ExploreButton onOpen={onOpen} active={active} label="Explore" className="bg-white text-ink" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── 2 · Asymmetric split ───────────────────────────── */
function Split({ event, palette, active, depth, onOpen }: SceneProps) {
  return (
    <div className="absolute inset-0 grid grid-rows-[1.1fr_1fr] @3xl:grid-cols-[1.35fr_1fr] @3xl:grid-rows-1" style={{ color: palette.fg }}>
      <div className="relative p-3 @3xl:p-4">
        <SlideImage event={event} depth={depth} className="absolute inset-3 rounded-[22px] @3xl:inset-4" sizes="(max-width: 768px) 100vw, 45vw" />
        <span
          className="glass glass-tint label absolute left-6 top-6 rounded-full px-3 py-1.5 @3xl:left-8 @3xl:top-8"
          style={{ "--tint": palette.accent, color: palette.onAccent } as React.CSSProperties}
        >
          {event.category}
        </span>
      </div>

      <div className="relative flex flex-col justify-between gap-4 p-5 pt-2 @3xl:p-9 @3xl:pl-4">
        <div>
          <p className="label opacity-75">{formatWeekday(event.date)} {formatDay(event.date)} {formatMonth(event.date)}</p>
          <RevealText as="h3" play={active} text={event.title} className="headline mt-3 block text-[clamp(2rem,5.4cqw,4.6rem)] [text-wrap:balance]" />
          <RevealBlock play={active} delay={0.2}>
            <p className="serif mt-3 text-[clamp(1.05rem,1.9cqw,1.45rem)] opacity-85">{event.tagline}</p>
          </RevealBlock>
        </div>

        {/* Tinted glass slab overlapping the photograph: colour transmits through it. */}
        <Layer depth={depth} amount={50} className="@3xl:-ml-24">
          <RevealBlock
            play={active}
            delay={0.3}
            className="glass glass-tint specular rounded-[24px] p-5"
            style={{ "--tint": palette.accent, color: palette.onAccent } as React.CSSProperties}
          >
            <MetaRows event={event} className="hidden @3xl:grid" />
            <ExploreButton onOpen={onOpen} active={active} className="w-full justify-between @3xl:mt-5" />
          </RevealBlock>
        </Layer>
      </div>
    </div>
  );
}

/* ───────────────────────────── 3 · Editorial typography ───────────────────────────── */
function Typographic({ event, palette, active, depth, onOpen, index, total }: SceneProps) {
  const words = event.title.split(" ");
  return (
    <div className="absolute inset-0 overflow-hidden p-5 @3xl:p-10" style={{ color: palette.fg }}>
      <div className="flex items-start justify-between">
        <Chip event={event} className="border border-current/30" />
        <span className="label tnum opacity-70">
          No. {pad(index + 1)} / {pad(total)}
        </span>
      </div>

      {/* Photo as a tilted glass-mounted print, layered over the type. */}
      <Layer
        depth={depth}
        amount={90}
        className="absolute right-[6%] top-[9%] z-[2] w-[34%] rotate-[4deg] @3xl:right-[7%] @3xl:top-[12%] @3xl:w-[30%]"
      >
        <div className="glass glass-clear glass-prism rounded-[20px] p-2.5">
          <SlideImage event={event} depth={depth} shift={6} className="relative aspect-[4/5] rounded-[14px]" sizes="(max-width: 768px) 50vw, 25vw" />
        </div>
      </Layer>

      <div className="absolute inset-x-5 bottom-5 z-[1] @3xl:inset-x-10 @3xl:bottom-10">
        <h3 className="poster text-[clamp(3rem,12.5cqw,11rem)] [overflow-wrap:anywhere]">
          {words.map((w, i) => (
            <span key={i} className={cn("block", i % 2 === 1 && "outline-text")} style={{ "--stroke": palette.fg } as React.CSSProperties}>
              <RevealText text={w} play={active} delay={i * 0.08} />{" "}
            </span>
          ))}
        </h3>
        <RevealBlock play={active} delay={0.35} className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-[40ch] text-[15px] leading-relaxed opacity-85">
            <span className="label tnum mr-3 opacity-100" style={{ color: palette.accent }}>
              {formatDay(event.date)} {formatMonth(event.date)}, {formatTimeRange(event.startTime, event.endTime)}
            </span>
            <span className="hidden @3xl:inline">{event.tagline}</span>
          </p>
          <ExploreButton onOpen={onOpen} active={active} style={{ background: palette.accent2, color: palette.stage }} />
        </RevealBlock>
      </div>
    </div>
  );
}

/* ───────────────────────────── 4 · Layered glass collage ───────────────────────────── */
function Collage({ event, palette, active, depth, onOpen }: SceneProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ color: palette.fg }}>
      <div className="pool -left-[10%] -top-[20%] size-[70%] opacity-35" style={{ background: `radial-gradient(closest-side, ${palette.accent}, transparent)` }} />

      {/* Main print */}
      <Layer depth={depth} amount={30} className="absolute left-[5%] top-[7%] h-[52%] w-[62%] -rotate-[3deg] @3xl:left-[6%] @3xl:top-[10%] @3xl:h-[74%] @3xl:w-[46%]">
        <SlideImage event={event} depth={depth} className="absolute inset-0 rounded-[22px] shadow-[0_30px_60px_-20px_rgba(0,0,0,.5)]" sizes="(max-width: 768px) 70vw, 40vw" />
      </Layer>

      {/* Second crop, a detail of the same photograph, behind tinted glass */}
      <Layer depth={depth} amount={80} className="absolute right-[5%] top-[12%] h-[34%] w-[38%] rotate-[5deg] @3xl:right-[30%] @3xl:top-[46%] @3xl:h-[42%] @3xl:w-[24%]">
        <div className="relative size-full overflow-hidden rounded-[18px]">
          <Image src={event.image} alt="" fill sizes="25vw" draggable={false} className="scale-[1.9] select-none object-cover object-[70%_40%]" />
        </div>
        <div
          className="glass glass-tint absolute -inset-x-3 bottom-[-12%] h-[46%] rounded-[16px]"
          style={{ "--tint": palette.accent2 } as React.CSSProperties}
        />
      </Layer>

      {/* Clear glass strip crossing the composition */}
      <Layer depth={depth} amount={120} className="absolute left-[30%] top-[38%] hidden h-[18%] w-[40%] -rotate-[8deg] @3xl:block">
        <div className="glass glass-clear glass-holo size-full rounded-full" />
      </Layer>

      {/* Title card */}
      <div className="absolute inset-x-4 bottom-4 @3xl:inset-x-auto @3xl:bottom-auto @3xl:right-[5%] @3xl:top-[10%] @3xl:w-[38%]">
        <RevealBlock play={active} delay={0.1} className="glass lum-panel rounded-[24px] p-5 @3xl:p-7">
          <Chip event={event} className="border border-current/25" />
          <RevealText as="h3" play={active} delay={0.15} text={event.title} className="headline mt-4 block text-[clamp(1.9rem,4.4cqw,3.8rem)] [text-wrap:balance]" />
          <p className="serif mt-3 hidden text-[1.25rem] opacity-80 @3xl:block">{event.tagline}</p>
          <MetaRows event={event} className="mt-5 hidden border-t border-white/10 pt-4 @3xl:grid" />
          <div className="mt-4 flex items-center justify-between gap-3 @3xl:mt-5">
            <p className="label tnum opacity-70 @3xl:hidden">
              {formatDay(event.date)} {formatMonth(event.date)}, {event.startTime}
            </p>
            <ExploreButton
              onOpen={onOpen}
              active={active}
              label="Explore"
              className="@3xl:w-full @3xl:justify-between"
              style={{ background: palette.accent, color: palette.onAccent }}
            />
          </div>
        </RevealBlock>
      </div>
    </div>
  );
}

/* ───────────────────────────── 5 · Bold poster ───────────────────────────── */
function Poster({ event, palette, active, depth, onOpen }: SceneProps) {
  const venue = venueById(event.venue);
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ color: palette.fg }}>
      {/* Duotone photograph: greyscale print multiplied into the poster colour. */}
      <div className="absolute inset-x-0 top-0 h-[44%] @3xl:inset-y-0 @3xl:left-auto @3xl:h-full @3xl:w-[58%]">
        <SlideImage
          event={event}
          depth={depth}
          className="absolute inset-0"
          sizes="(max-width: 768px) 100vw, 45vw"
          imgClassName="grayscale contrast-125 brightness-75"
        />
        <div className="absolute inset-0 mix-blend-multiply" style={{ background: palette.accent }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${palette.stage} 0%, transparent 40%)` }} />
      </div>

      {/* Print grid lines */}
      <div className="pointer-events-none absolute inset-0 hidden @3xl:block" aria-hidden>
        <div className="absolute inset-y-0 left-[42%] w-px bg-current opacity-20" />
        <div className="absolute inset-x-0 top-[22%] h-px bg-current opacity-20" />
      </div>

      <div className="absolute inset-x-0 bottom-0 top-[44%] flex flex-col justify-between p-5 @3xl:inset-y-0 @3xl:left-0 @3xl:top-0 @3xl:w-[42%] @3xl:p-9">
        <div className="hidden items-start justify-between @3xl:flex">
          <span className="label">{formatWeekday(event.date)}</span>
          <span className="label">{event.category}</span>
        </div>
        <div>
          <p className="poster tnum text-[clamp(4.5rem,24cqw,20rem)] leading-[0.78]" style={{ color: palette.accent, textShadow: `0 0 40px ${palette.accent}55` }}>
            {formatDay(event.date)}
          </p>
          <p className="caps mt-3 text-[clamp(0.8rem,1.6cqw,1.05rem)]" style={{ color: palette.accent2 }}>
            {formatMonth(event.date)} 2026
          </p>
        </div>
        <div>
          <RevealText as="h3" play={active} text={event.title} className="headline block text-[clamp(1.8rem,4.6cqw,3.6rem)] [text-wrap:balance]" />
          <RevealBlock play={active} delay={0.25} className="mt-5 flex flex-wrap items-center gap-3">
            <ExploreButton onOpen={onOpen} active={active} style={{ background: palette.accent, color: palette.onAccent }} />
            <p className="label tnum">{venue.shortName}</p>
          </RevealBlock>
        </div>
      </div>

      {/* Time badge in smoked glass, floating over the photograph */}
      <Layer depth={depth} amount={70} className="absolute right-5 top-5 @3xl:right-9 @3xl:top-9">
        <div className="glass glass-ink glass-holo grid size-24 place-items-center rounded-full text-center text-white @3xl:size-32">
          <span>
            <span className="label block text-[11.5px] opacity-80">Starts</span>
            <span className="headline tnum block text-[1.7rem] @3xl:text-[2.3rem]">{event.startTime}</span>
          </span>
        </div>
      </Layer>
    </div>
  );
}

/* ───────────────────────────── 6 · Immersive exhibition ───────────────────────────── */
function Exhibition({ event, palette, active, depth, onOpen, index }: SceneProps) {
  const venue = venueById(event.venue);
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ color: palette.fg }}>
      {/* Gallery spotlight cone */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(60% 75% at 38% 0%, color-mix(in oklab, ${palette.accent} 45%, transparent), transparent 70%)` }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[18%] bg-black/15" aria-hidden />

      <div className="relative grid h-full grid-rows-[1fr_auto] gap-4 p-5 @3xl:grid-cols-12 @3xl:grid-rows-1 @3xl:items-center @3xl:gap-10 @3xl:p-12">
        {/* The framed work */}
        <Layer depth={depth} amount={25} className="flex items-center justify-center @3xl:col-span-7">
          <div className="w-[78%] bg-[#f7f2e8] p-[4%] shadow-[0_40px_80px_-30px_rgba(0,0,0,.7),0_0_0_10px_#20180f] @3xl:w-[82%]">
            <SlideImage event={event} depth={depth} shift={4} className="relative aspect-[4/3]" sizes="(max-width: 768px) 70vw, 40vw" />
          </div>
        </Layer>

        {/* Museum plaque in solid glass */}
        <Layer depth={depth} amount={70} className="@3xl:col-span-5">
          <RevealBlock play={active} delay={0.15} className="glass glass-solid specular rounded-[22px] p-5 text-ink @3xl:p-7">
            <p className="label flex justify-between text-ink-3">
              <span>Cat. no. {pad(index + 1)}</span>
              <span>{event.category}</span>
            </p>
            <RevealText as="h3" play={active} delay={0.2} text={event.title} className="serif mt-4 block text-[clamp(1.9rem,4.2cqw,3.6rem)] leading-[1] [text-wrap:balance]" />
            <p className="mt-3 hidden text-[14.5px] leading-relaxed text-ink-2 @3xl:block">{event.tagline}</p>
            <p className="label tnum mt-5 text-ink-2">
              {formatWeekday(event.date)} {formatDay(event.date)} {formatMonth(event.date)}, {formatTimeRange(event.startTime, event.endTime)}
              <br />
              {venue.name}
            </p>
            <ExploreButton onOpen={onOpen} active={active} className="mt-5 bg-ink text-cream" label="Enter the room" />
          </RevealBlock>
        </Layer>
      </div>
    </div>
  );
}

export const SCENES: Record<Scene, (p: SceneProps) => React.JSX.Element> = {
  fullbleed: FullBleed,
  split: Split,
  typographic: Typographic,
  collage: Collage,
  poster: Poster,
  exhibition: Exhibition,
};
