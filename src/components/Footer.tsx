import { IS_SAMPLE_DATA } from "@/data/events";
import { Monogram, NAV_ITEMS } from "@/components/glass/GlassNav";

export function Footer() {
  return (
    <footer className="relative mx-2 mb-2 overflow-hidden rounded-[40px] bg-navy text-cream sm:mx-4 sm:mb-4">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="pool -left-[10%] -top-[30%] size-[60vw] bg-[radial-gradient(closest-side,rgba(31,59,255,.55),transparent)]" />
        <div className="pool -right-[15%] top-[10%] size-[50vw] bg-[radial-gradient(closest-side,rgba(255,106,43,.35),transparent)]" />
        <div className="pool bottom-[-40%] left-[30%] size-[50vw] bg-[radial-gradient(closest-side,rgba(25,194,122,.3),transparent)]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-[var(--gutter)] pb-8 pt-20">
        <p className="poster text-[clamp(3.6rem,13vw,13rem)]">
          See you <span className="text-yellow">at</span>
          <br />
          <span className="serif normal-case tracking-normal text-lavender">convocation.</span>
        </p>

        <div className="mt-16 grid gap-10 border-t border-white/15 pt-10 md:grid-cols-12">
          <div className="flex items-start gap-4 md:col-span-5">
            <Monogram />
            <div>
              <p className="headline text-[18px]">FESKUM 2026</p>
              <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-white/70">
                Festival Konvokesyen Universiti Malaya. Six days of ceremony and celebration in Kuala Lumpur.
              </p>
            </div>
          </div>
          <nav aria-label="Footer" className="md:col-span-3">
            <p className="label text-white/50">Navigate</p>
            <ul className="mt-4 grid gap-2">
              {NAV_ITEMS.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} className="text-[15px] text-white/80 transition-colors hover:text-yellow">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="md:col-span-4">
            <p className="label text-white/50">Official sources</p>
            <ul className="mt-4 grid gap-2">
              <li>
                <a href="https://umconvo.um.edu.my" target="_blank" rel="noopener noreferrer" className="text-[15px] text-white/80 transition-colors hover:text-yellow">
                  UM Convocation portal ↗
                </a>
              </li>
              <li>
                <a href="https://www.um.edu.my" target="_blank" rel="noopener noreferrer" className="text-[15px] text-white/80 transition-colors hover:text-yellow">
                  Universiti Malaya ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {IS_SAMPLE_DATA && (
          <p className="glass glass-clear mt-12 rounded-[22px] px-5 py-4 text-[13.5px] leading-relaxed text-white">
            <span className="label relative z-[3] mr-2 text-yellow">Concept preview</span>
            <span className="relative z-[3]">
              The programme on this site is sample content for design purposes and is not an official Universiti Malaya
              announcement. Photography is illustrative. Always confirm dates and venues on the official convocation portal.
            </span>
          </p>
        )}

        <p className="label mt-10 flex flex-wrap justify-between gap-4 text-white/50">
          <span>© 2026 FESKUM</span>
          <span>Kuala Lumpur, Malaysia Time (UTC+8)</span>
        </p>
      </div>
    </footer>
  );
}
