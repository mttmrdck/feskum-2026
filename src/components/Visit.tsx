"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { FAQ, VISITOR_NOTES } from "@/data/faq";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { SectionTitle } from "./SectionTitle";

/** Notes sit on coloured glass over a campus photograph: tint over image, colour transmits. */
const NOTE_TINTS = [
  { tint: "#1f3bff", fg: "#ffffff" },
  { tint: "#ff6a2b", fg: "#1d0a40" },
  { tint: "#19c27a", fg: "#06301f" },
  { tint: "#bba9ff", fg: "#1b1f6b" },
];
const FAQ_COLOURS = ["#1f3bff", "#ff6a2b", "#0b5a3c", "#5b2bd6", "#b2361f", "#101a46"];

function FaqItem({ q, a, n, colour, defaultOpen }: { q: string; a: string; n: number; colour: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const id = useId();
  return (
    <li className={cn("rounded-[24px] transition-colors duration-300", open ? "glass glass-solid" : "bg-ink/[.035]")}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="relative z-[3] flex w-full items-center gap-5 px-5 py-5 text-left md:px-6"
        >
          <span className="poster tnum text-[1.9rem]" style={{ color: colour }}>
            {String(n).padStart(2, "0")}
          </span>
          <span className="flex-1 text-[17px] font-semibold text-ink">{q}</span>
          <span
            aria-hidden
            className={cn("relative grid size-9 shrink-0 place-items-center rounded-full text-white transition-transform duration-300 ease-[cubic-bezier(.23,1,.32,1)]", open && "rotate-45")}
            style={{ background: colour }}
          >
            <span className="absolute h-[2px] w-3.5 bg-current" />
            <span className="absolute h-3.5 w-[2px] bg-current" />
          </span>
        </button>
      </h3>
      <div id={id} role="region" className={cn("relative z-[3] grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.23,1,.32,1)]", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden" inert={!open}>
          <p className="max-w-[62ch] px-5 pb-6 pl-[4.6rem] text-[15.5px] leading-relaxed text-ink-2 md:px-6 md:pl-[5.1rem]">{a}</p>
        </div>
      </div>
    </li>
  );
}

export function Visit() {
  const reduce = useReducedMotion();
  return (
    <section id="information" aria-labelledby="information-title" className="relative scroll-mt-20 px-2 py-24 sm:px-4 md:py-32">
      <div className="mx-auto max-w-[1500px] px-[calc(var(--gutter)-8px)]">
        <SectionTitle
          id="information-title"
          title="Before you"
          turn="arrive."
          kicker="Practical guidance for graduands, families and visitors. Confirm session-specific details with the Convocation Secretariat."
        />
      </div>

      {/* Notes on coloured glass over the campus */}
      <div className="relative mx-auto mt-12 max-w-[1600px] overflow-hidden rounded-[40px]">
        <Image src="/images/campus-lawn.jpg" alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/25" />
        <ul className="relative grid gap-3 p-3 sm:grid-cols-2 md:p-6 lg:grid-cols-4 lg:gap-4 lg:p-10 lg:pt-40">
          {VISITOR_NOTES.map((n, i) => (
            <motion.li
              key={n.label}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: EASE_OUT }}
              className={cn("glass glass-tint specular rounded-[28px] p-6", i % 2 === 1 && "lg:translate-y-10")}
              style={{ "--tint": NOTE_TINTS[i].tint, color: NOTE_TINTS[i].fg } as React.CSSProperties}
            >
              <p className="poster tnum relative z-[4] text-[3.4rem]">{String(i + 1).padStart(2, "0")}</p>
              <p className="headline relative z-[4] mt-6 text-[1.6rem]">{n.label}</p>
              <p className="relative z-[4] mt-2 text-[15px] font-medium leading-relaxed">{n.body}</p>
            </motion.li>
          ))}
        </ul>
        <div className="h-6 lg:h-16" />
      </div>

      <div className="mx-auto mt-20 grid max-w-[1500px] gap-8 px-[calc(var(--gutter)-8px)] lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="label text-ink-3">FAQs</p>
          <p className="headline mt-4 text-[clamp(2rem,3.6vw,3rem)] text-ink">
            Questions families <span className="serif text-cobalt">often ask.</span>
          </p>
        </div>
        <ul className="flex flex-col gap-2 lg:col-span-8">
          {FAQ.map((f, i) => (
            <FaqItem key={f.q} q={f.q} a={f.a} n={i + 1} colour={FAQ_COLOURS[i % FAQ_COLOURS.length]} defaultOpen={i === 0} />
          ))}
        </ul>
      </div>
    </section>
  );
}
