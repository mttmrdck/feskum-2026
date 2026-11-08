import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Dates are stored as YYYY-MM-DD in campus local time; parse without TZ drift.
const toDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts }).format(toDate(iso));

export const formatDay = (iso: string) => fmt(iso, { day: "2-digit" });
export const formatMonth = (iso: string) => fmt(iso, { month: "short" });
export const formatWeekday = (iso: string) => fmt(iso, { weekday: "short" });
// Composed from single-field formats: multi-field punctuation differs between
// ICU builds (Node vs browser), which caused a hydration mismatch.
export const formatLongDate = (iso: string) =>
  `${fmt(iso, { weekday: "long" })} ${fmt(iso, { day: "numeric" })} ${fmt(iso, { month: "long" })} ${fmt(iso, { year: "numeric" })}`;
export const formatShortDate = (iso: string) => fmt(iso, { day: "numeric", month: "short" });

export const formatTimeRange = (start: string, end: string) => `${start}–${end}`;
