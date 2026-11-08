import type { Category } from "@/data/categories";

/**
 * Luminous identities. Each category is a colour of LIGHT, not paint:
 * a near-black stage tinted with its hue, a saturated light colour, and a
 * pale core that the light burns towards at its hottest.
 */
export interface Palette {
  /** Deep stage / glass body colour (near-black, tinted). */
  stage: string;
  /** Text colour on the stage. */
  fg: string;
  /** The light: saturated hue used for edges, glow and accents. */
  accent: string;
  /** The hot core: pale tint of the light, used where it is brightest. */
  accent2: string;
  /** Text colour on `accent`. */
  onAccent: string;
  /** Category colour that passes contrast as text on the light editorial ground. */
  onCream: string;
  /** Name of the light, shown on slides (as the reference names its cards). */
  mood: string;
  /** Light colour as RGB 0..1 for the WebGL under-light. */
  rgb: [number, number, number];
}

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const make = (p: Omit<Palette, "rgb">): Palette => ({ ...p, rgb: hex(p.accent) });

export const PALETTES: Record<Category, Palette> = {
  Graduation: make({ stage: "#0c0d12", fg: "#f4f5f8", accent: "#dfe4ee", accent2: "#ffffff", onAccent: "#0c0d12", onCream: "#2b3040", mood: "Silver" }),
  Academic: make({ stage: "#070b22", fg: "#eef2ff", accent: "#3d6bff", accent2: "#c9d8ff", onAccent: "#ffffff", onCream: "#2346d8", mood: "Cobalt" }),
  Entertainment: make({ stage: "#100820", fg: "#f4efff", accent: "#9b5cff", accent2: "#e6d9ff", onAccent: "#ffffff", onCream: "#5b2bd6", mood: "Amethyst" }),
  Performances: make({ stage: "#140d04", fg: "#fff6e6", accent: "#ffb43d", accent2: "#fff0cc", onAccent: "#1c1203", onCream: "#8a5300", mood: "Gold" }),
  Sports: make({ stage: "#04140d", fg: "#ecfff6", accent: "#22d38a", accent2: "#c9ffe6", onAccent: "#03170e", onCream: "#0b6b45", mood: "Emerald" }),
  Exhibition: make({ stage: "#041219", fg: "#eafaff", accent: "#3cc9f0", accent2: "#d6f6ff", onAccent: "#03141b", onCream: "#0a6b87", mood: "Glacier" }),
  "Food & Lifestyle": make({ stage: "#170805", fg: "#fff2ea", accent: "#ff6a2b", accent2: "#ffd9c4", onAccent: "#1d0803", onCream: "#b2361f", mood: "Ember" }),
  "Special Activities": make({ stage: "#16070f", fg: "#fff0f6", accent: "#ff7eb0", accent2: "#ffe0ec", onAccent: "#2a0716", onCream: "#a8245c", mood: "Rose" }),
};

export const paletteFor = (c: Category) => PALETTES[c];

/** CSS custom properties for a palette, to scope colour onto a subtree. */
export const paletteVars = (p: Palette) =>
  ({
    "--stage": p.stage,
    "--fg": p.fg,
    "--accent": p.accent,
    "--accent-2": p.accent2,
    "--on-accent": p.onAccent,
  }) as React.CSSProperties;
