/**
 * Where an event was opened from. The detail view morphs out of that exact
 * element (shared layoutId). "direct" (deep link, lists) has no source
 * element, so it opens with a plain materialise instead.
 */
export type SelectionSource = "slider" | "featured" | "direct";

export interface Selection {
  id: string;
  source: SelectionSource;
}

export type OpenEvent = (id: string, source: SelectionSource) => void;

/** Scroll to the slider and bring an event to the front. */
export type ShowInSlider = (id: string) => void;

export const cardLayoutId = (source: SelectionSource, id: string) =>
  source === "direct" ? undefined : `card-${source}-${id}`;

export const imageLayoutId = (source: SelectionSource, id: string) =>
  source === "direct" ? undefined : `img-${source}-${id}`;
