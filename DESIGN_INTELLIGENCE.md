# Design Intelligence: FESKUM 2026 Convocation Explorer

> **Superseded (8 Nov 2026).** The dark smoked-glass direction below was replaced by a colourful, slide-based exhibition: category palettes, full-screen event slider, Bodoni Moda + Bricolage Grotesque, atmospheric background. See `DESIGN_REFINEMENT_AUDIT.md` for the current system. The research notes on libraries and motion principles below still apply.

Research record written before any visual code. Every claim below comes from source code or SKILL.md files in the cloned repositories (`.research/`, git-ignored). None of it comes from README copy alone.

---

## 1. Installation status (verified, not claimed)

| Tool | Method | Status |
| --- | --- | --- |
| **Design Taste** (madebymustafa) | `scripts/install.sh <project>/.claude/skills`, read first; scoped to this project so it does not write into Codex/Cursor global dirs | ✅ 24 skills installed |
| **Emil Kowalski skills** | `npx skills add emilkowalski/skills --agent claude-code -y` | ✅ installed. Removed afterwards: `animate-expo`, `mobile-native`, `write-swift`, `ask-sonner` (Expo/Swift/toast-specific, irrelevant to this web app) |
| **Appllama skills** | `npx skills add appllama/appllama-skills` | ✅ `appllama-app-design-skill`, `appllama-usage` |
| **Better Design** skill | `npx skills add …/better-design --skill better-design` | ✅ skill installed · ❌ **MCP not connected**. The skill's own rules say setup must be reviewed and run by the user (`npx better-design`). None of its MCP tools were called, so no Better Design MCP guidance is claimed. |
| **Superdesign** | `/plugin marketplace add superdesigndev/superdesign-skill` + `/plugin install superdesign@superdesign` | ⏸ **Needs you.** Plugin install is an interactive Claude Code command and the CLI requires a Superdesign account. SKILL.md and workflow were studied from source. |
| **Hyperiux** | `npx hyperiux init / login / add` | ⏸ The CLI requires `hyperiux login` (account) even for free effects. The free MPL-2.0 registry source was inspected locally. |
| Canvas UI, UI Layouts, Motion Primitives, Cursify, Trickle UI, Paper Shaders | `git clone --depth 1` for study | ✅ inspected |
| npm deps added | `motion@14.10.1`, `@paper-design/shaders-react@0.0.82`, `clsx`, `tailwind-merge` | ✅ |

Skill files live in `.claude/skills/` and are recorded in `skills-lock.json`. Claude Code picks them up in the next session.

## 2. Libraries inspected

- **Canvas UI** (MIT + Commons Clause). `src/lib/Glass/GlassVanilla.ts` renders real DOM into a `<canvas layoutsubtree>` via the experimental **HTML-in-Canvas** API (`ctx.drawElementImage`), then refracts it in a WebGL/WebGPU pass. Without the Chrome flag it falls back to plain children. Lesson taken: real refraction needs a texture of what's behind. On the open web that texture is the blurred backdrop (`backdrop-filter`), so we fake refraction with lighting rather than distortion.
- **Paper Shaders** (Apache-2.0). `mesh-gradient.ts` is a single fragment shader with up to 10 colour points, organic `u_distortion`, vortex `u_swirl` and grain. `ShaderMount` exposes `speed` (0 pauses rendering) and `minPixelRatio`/`maxPixelCount` caps, which is ideal for a single, throttled hero atmosphere.
- **Motion Primitives** (MIT). `tilt.tsx`: pointer → `useMotionValue` → `useSpring` → `useTransform(rotateX/Y)` → `perspective()` template. `magnetic.tsx`: distance-scaled pull with a very loose spring (`damping 4.1`, too bouncy for us). `morphing-dialog.tsx`: `layoutId` shared-element pattern.
- **UI Layouts / Cursify**: timeline-animation, progressive-blur, cursor trails, magnetic cursors.
- **Trickle UI Kit** (MIT): 50 text primitives (char-stagger, text-reveal, highlighter-sweep, decrypt-scramble …).
- **Hyperiux** (free effects MPL-2.0): categories backgrounds/cursor/navigation/scroll/text/transitions/webgl.

## 3. Animation principles adopted (from the actual SKILL.md files)

From `emil-design-eng`, `choreograph`, `apple-design`, `animation-performance`:

1. **Frequency decides motion.** Filter chips and search are used many times, so they get no stagger and stay quick (≤220 ms). The hero entrance is seen once, so it gets 100–150 ms steps.
2. **Custom curves only.** `--ease-out: cubic-bezier(.23,1,.32,1)`, `--ease-in-out: cubic-bezier(.77,0,.175,1)`. Never `ease-in`.
3. **Springs for anything pointer-driven or interruptible** (tilt, parallax, magnetic, shared-element morph): `{type:"spring", duration:.55, bounce:.12}`. Bounce stays under 0.2.
4. **One entrance per container.** When the detail panel morphs in, its content is already there. Only the text block gets a single short rise.
5. **Leaving elements stop taking space immediately.** Filter exits use `AnimatePresence mode="popLayout"`, so siblings close the gap while the leaver fades.
6. **Materialise glass, don't fade it.** Glass panes enter by animating `blur → 0` and `scale .96 → 1` together (apple-design §12).
7. **Press feedback:** `scale(.97)` on `:active`, triggered on pointer-down.
8. **Hover gated** behind `@media (hover:hover) and (pointer:fine)`. No hover-only functionality.
9. **Reduced motion collapses choreography.** No tilt, parallax, float or shader time. Opacity crossfades only.
10. **Only transform/opacity animate.** Layout animations (`layoutId`) are used solely for the card→detail morph and the filter reflow, where spatial continuity is the point.

## 4. Glassmorphism recommendations

The design-taste skill bans "glassmorphism everywhere" as an AI-slop fingerprint, and this brief makes glass mandatory. The resolution comes from `apple-design` §12: **material weight encodes hierarchy.** Glass becomes an information system, not decoration:

| Material | Token | Used for | Recipe |
| --- | --- | --- | --- |
| **Chrome** | `.glass-chrome` | floating nav, mobile dock | lightest frost, blur 18 px saturate 170 %, bright top edge |
| **Slab** | `.glass-slab` | event cards | richer tint gradient, blur 22 px, angled light-catching rim (masked gradient border), inset top highlight, 3-layer drop shadow, pointer-tracked specular |
| **Deep** | `.glass-deep` | featured card, detail panel, venue panel | dark smoked glass rgba(8,12,24,.55), blur 36 px, stronger rim, deeper shadow |
| **Control** | `.glass-control` | chips, date pills, search, accordion rows | compact, blur 12 px, low tint, 1 px rim |
| **Plate** | `.glass-plate` | captions over photography | dark frosted plate. This is where *colour transmission* is most visible, as the photo bleeds through. |

Rules:
- Never stack a light glass on a light glass. Nested surfaces alternate light ↔ dark (slab → plate).
- Text on glass uses heavier weight and higher contrast (vibrancy rule). Body text never sits on bare transparency.
- Glass needs light behind it. Every section has art-directed light pools (navy/steel/one warm gold) so blur has something to transmit.
- Fallbacks: `@supports not (backdrop-filter)` raises opacity. `prefers-reduced-transparency` makes surfaces near-solid. `prefers-contrast: more` adds a defined border.
- Budget: ~20 backdrop-filtered surfaces max on screen. Mobile shows fewer at once (carousel).

## 5. Design rationale and reference board

**Design read:** *University convocation festival explorer for graduates, families and visitors. A spatial exhibition in dark smoked glass: editorial serif display, one warm "convocation gold" accent, restrained cinematic motion.*

| Reference direction | Technique extracted | How it's used here |
| --- | --- | --- |
| visionOS windows | glass that reads by its **rim light and shadow**, not its opacity; content floats at z-depths | angled gradient rim + 3-layer shadow; cards sit on 3 depth planes |
| macOS Sonoma/Tahoe materials | material thickness = hierarchy; vibrancy text | 5-tier material scale above |
| Awwwards editorial sites | oversized serif display, mono index labels, hairline grids, asymmetry | Instrument Serif display, `01 —` mono section indices, 7/5 splits |
| Digital exhibitions (museum microsites) | objects curated on a wall, not tiled | hand-placed 12-col composition with offsets per card, not a uniform grid |
| Premium event platforms | date-first scanning, clear filter state | sticky glass filter dock with live count |
| Shared-element apps (App Store "Today" cards) | card *becomes* the page | `layoutId` morph of slab + image into the detail sheet |

**Colour:** near-black `#05070d` → midnight navy `#0b1430` → steel `#2a3f6b`, muted silver text `#a9b2c4`, soft white `#eef1f6`, and a single accent, **convocation gold `#d8b26a`**. The gold echoes Universiti Malaya's blue-and-gold heraldry; the official logo and hex values should replace these placeholders once supplied. No neon purple or pink.

**Type:** *Instrument Serif* (display, tight −0.02em tracking, 0.92 leading) + *Geist* (UI/body) + *Geist Mono* (dates, times, indices, letterspaced uppercase). Tabular numerals for all times.

## 6. Architecture

```
src/
  data/        events.ts · venues.ts · categories.ts · faq.ts  ← single source of truth
  lib/         utils.ts (cn, date formatting) · motion.ts (shared springs/eases)
  components/
    glass/     GlassNav · MagneticButton
    hero/      Hero · HeroShader (Paper MeshGradient, paused offscreen)
    explorer/  Explorer (filters/search/date) · EventCard (tilt+parallax+float+specular) · EventDetail (shared element)
    Timeline · Venues · Information · Footer · SectionHeading
  app/         layout.tsx (fonts, metadata) · page.tsx · globals.css (design tokens + material classes)
```

State lives in `page.tsx`: the selected event plus the layoutId source (`explorer` or `timeline`), so the morph always starts from the card the visitor actually clicked. Deep-linkable via `#event=<id>`.

**No React Three Fiber.** The "3D" here is cards at depth with perspective tilt. CSS 3D transforms do this on the compositor. A WebGL scene graph would add ~150 KB and a second render loop with no visual gain. The only WebGL is the hero shader.

## 7. Selected

- Paper Shaders `MeshGradient`: hero atmosphere (navy/steel, a breath of gold), speed 0 when offscreen or reduced-motion
- Motion Primitives **Tilt** pattern: adapted (springier damping, rotation ≤ 7°, also drives specular)
- Motion Primitives **Magnetic** pattern: adapted with a critically damped spring (no wobble), CTA only
- Motion Primitives **MorphingDialog** pattern → `layoutId` shared-element detail
- `AnimatePresence mode="popLayout"` filter choreography (choreograph skill)
- Trickle-style **line mask reveal** for section titles (once per section)
- Emil's **clip-path image reveal** for venue imagery
- UI-Layouts **timeline progression** idea: scroll-linked line fill

## 8. Rejected, and why

| Rejected | Reason |
| --- | --- |
| Canvas UI Liquid/Glass components | Depend on experimental HTML-in-Canvas (Chrome flag). They would silently fall back for nearly every visitor, and the Commons Clause forbids redistributing the components. |
| Custom cursor / cursor trails (Cursify) | Brief says "don't make the cursor distracting". A pointer-following spotlight in the explorer gives the "background response" without replacing the OS cursor. |
| Hyperiux image trails, particle fields | Visual noise competing with the glass; account required for CLI. |
| Text scramble / glitch / rainbow text (Trickle) | Off-tone for a convocation; reads "tech demo". |
| R3F blob, WebGL particles | Second GPU loop; violates the "avoid unnecessary WebGL" constraint. |
| GSAP | Motion covers springs, layout and scroll. A second animation runtime adds weight without new capability. |
| shadcn init | No primitives needed beyond what's built; would add a config surface for nothing. |
| Infinite float on every card at the same speed | "Uniform stagger is forbidden". Float periods and amplitudes vary per depth plane, and stop under reduced motion. |
