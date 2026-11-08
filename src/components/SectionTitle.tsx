"use client";

import { useInView } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { RevealText } from "./RevealText";

interface Props {
  title: string;
  /** Second clause, set light (same colour: weight does the work). */
  turn?: string;
  kicker?: React.ReactNode;
  id: string;
  className?: string;
  tone?: "ink" | "light";
}

/** Editorial header: one Bodoni sentence and a short kicker. No eyebrows, no numbering. */
export function SectionTitle({ title, turn, kicker, id, className, tone = "ink" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const light = tone === "light";
  return (
    <div ref={ref} className={cn("grid gap-6 md:grid-cols-12 md:items-end", className)}>
      <h2
        id={id}
        className={cn("headline text-[clamp(2.8rem,6.4vw,6rem)] [text-wrap:balance] md:col-span-8", light ? "text-white" : "text-ink")}
      >
        <RevealText text={title} play={inView} />
        {turn && (
          <>
            {" "}
            <RevealText text={turn} play={inView} delay={0.12} className="font-light" />
          </>
        )}
      </h2>
      {kicker && (
        <div className={cn("max-w-sm text-[16px] leading-relaxed md:col-span-4 md:justify-self-end", light ? "text-white/80" : "text-ink-2")}>
          {kicker}
        </div>
      )}
    </div>
  );
}
