"use client";

import { motion, useReducedMotion } from "motion/react";
import { Fragment } from "react";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  /** When this flips to true the words rise in; otherwise they render static. */
  play: boolean;
  delay?: number;
  stagger?: number;
  className?: string;
  as?: "span" | "h2" | "h3" | "p";
  id?: string;
}

/**
 * Masked word-by-word rise. Only plays on the element that just became the
 * focus (active slide, section in view), so the choreography is never
 * repeated on things the visitor is already looking at.
 */
export function RevealText({ text, play, delay = 0, stagger = 0.045, className, as = "span", id }: Props) {
  const reduce = useReducedMotion();
  const Tag = as;
  const words = text.split(" ");
  return (
    // The visible words ARE the accessible text: no aria-label or hidden copy,
    // so screen readers, reader mode and copy-paste each get the text once.
    <Tag className={className} id={id}>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            {play && !reduce ? (
              <motion.span
                className="inline-block"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.75, delay: delay + i * stagger, ease: EASE_OUT }}
              >
                {w}
              </motion.span>
            ) : (
              <span className="inline-block">{w}</span>
            )}
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}

/** Fades + lifts a block in when `play` turns on. */
export function RevealBlock({
  play,
  delay = 0,
  className,
  children,
  y = 14,
  style,
}: {
  play: boolean;
  style?: React.CSSProperties;
  delay?: number;
  className?: string;
  children: React.ReactNode;
  y?: number;
}) {
  const reduce = useReducedMotion();
  if (!play || reduce)
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  return (
    <motion.div
      className={cn(className)}
      style={style}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
