"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useRef } from "react";
import { SPRING_MAGNET } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Magnetic pull for primary actions only. Distance-scaled, critically damped
 * (no wobble), fine pointers only. The child keeps its own semantics: this is
 * a wrapper, not a button.
 */
export function Magnetic({ children, strength = 12, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), SPRING_MAGNET);
  const y = useSpring(useMotionValue(0), SPRING_MAGNET);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set(((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * strength);
    y.set(((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * strength * 0.6);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={{ x, y }} className={cn("inline-flex", className)}>
      {children}
    </motion.div>
  );
}
