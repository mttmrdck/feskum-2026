export const CATEGORIES = [
  "Academic",
  "Graduation",
  "Entertainment",
  "Performances",
  "Sports",
  "Exhibition",
  "Food & Lifestyle",
  "Special Activities",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type CategoryFilter = Category | "All Events";

export const CATEGORY_FILTERS: CategoryFilter[] = ["All Events", ...CATEGORIES];
