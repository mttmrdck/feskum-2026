"use client";

import { AnimatePresence, LayoutGroup } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { eventById } from "@/data/events";
import { Atmosphere } from "@/components/Atmosphere";
import { GlassNav } from "@/components/glass/GlassNav";
import { Hero } from "@/components/hero/Hero";
import { EventSlider, type SliderHandle } from "@/components/slider/EventSlider";
import { EventDetail } from "@/components/EventDetail";
import { Featured } from "@/components/Featured";
import { Schedule } from "@/components/Schedule";
import { Timeline } from "@/components/Timeline";
import { Venues } from "@/components/Venues";
import { Visit } from "@/components/Visit";
import { Footer } from "@/components/Footer";
import type { OpenEvent, Selection, ShowInSlider } from "@/lib/selection";

const HASH_PREFIX = "#event=";

const readHash = (): Selection | null => {
  const hash = window.location.hash;
  if (!hash.startsWith(HASH_PREFIX)) return null;
  const id = decodeURIComponent(hash.slice(HASH_PREFIX.length));
  return eventById(id) ? { id, source: "direct" } : null;
};

/**
 * Owns the shared state: which event is open (and from which element, for
 * the shared-element morph). Deep-linkable via #event=<id>.
 */
export function FestivalApp() {
  const [selection, setSelection] = useState<Selection | null>(null);
  const slider = useRef<SliderHandle>(null);

  const open: OpenEvent = useCallback((id, source) => {
    setSelection({ id, source });
    history.replaceState(null, "", `${HASH_PREFIX}${encodeURIComponent(id)}`);
  }, []);

  const close = useCallback(() => {
    setSelection(null);
    if (window.location.hash.startsWith(HASH_PREFIX)) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  const show: ShowInSlider = useCallback((id) => slider.current?.show(id), []);

  useEffect(() => {
    const sync = () => setSelection(readHash());
    const frame = requestAnimationFrame(sync);
    window.addEventListener("hashchange", sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  return (
    <LayoutGroup>
      <a
        href="#explore"
        className="fixed left-4 top-4 z-[70] -translate-y-24 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream transition-transform focus-visible:translate-y-0"
      >
        Skip to events
      </a>
      <Atmosphere />
      <GlassNav />
      <main>
        <Hero onShow={show} />
        <EventSlider ref={slider} onOpen={open} />
        <Featured onOpen={open} />
        <Schedule onOpen={open} onShow={show} />
        <Timeline onOpen={open} />
        <Venues onOpen={open} />
        <Visit />
      </main>
      <Footer />

      <AnimatePresence>
        {selection && <EventDetail key={`${selection.source}-${selection.id}`} selection={selection} onClose={close} />}
      </AnimatePresence>
    </LayoutGroup>
  );
}
