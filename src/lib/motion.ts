import type { Transition } from "motion/react";

/** Shared motion vocabulary. One timing family for the whole site. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

/** Spatial morphs (card → detail, filter reflow). Interruptible, barely any bounce. */
export const SPRING_MORPH: Transition = { type: "spring", duration: 0.55, bounce: 0.12 };
/** Pointer-driven decoration (tilt, parallax). */
export const SPRING_POINTER = { stiffness: 150, damping: 18, mass: 0.6 };
/** Magnetic pull: critically damped, no wobble. */
export const SPRING_MAGNET = { stiffness: 220, damping: 22, mass: 0.5 };
