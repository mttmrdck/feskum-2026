# FESKUM 2026: Design refinement audit

Date: 8 Nov 2026. Scope: refine the colourful slide-based redesign without rebuilding it.

## 1. Existing functionality (preserved)

| Feature | Where | Status after refinement |
| --- | --- | --- |
| Floating glass nav with active-section indicator, mobile menu, Esc to close | `components/glass/GlassNav.tsx` | ✅ kept (now the solid glass treatment so it reads over dark sections) |
| Hero: wordmark, countdown, CTA, photo ribbon, glass preview lens | `components/hero/Hero.tsx` | ✅ kept, ribbon now a 3D plane |
| Event slider: drag with inertia, keyboard, trackpad, prev/next, counter, progress, index strip, colour-morphing stage | `components/slider/EventSlider.tsx` | ✅ kept, plus pointer tilt and contact shadow |
| Six art-directed scene compositions | `components/slider/scenes.tsx` + `scene` field in `data/events.ts` | ✅ kept |
| Category, day and text search filters (slider) | `EventSlider.tsx` | ✅ kept |
| Shared-element detail view, focus trap, Esc, deep link `#event=<id>`, `.ics` export, copy link, directions | `components/EventDetail.tsx`, `FestivalApp.tsx` | ✅ kept |
| Featured experiences (pinned stacking dispatches) | `components/Featured.tsx` | ✅ kept |
| Schedule day tabs (arrow-key navigable) and "View slide" | `components/Schedule.tsx` | ✅ kept |
| Interactive timeline (pinned horizontal on desktop, swipe on mobile) | `components/Timeline.tsx` | ✅ kept |
| Venue tabs with clip-path photo reveal and programme | `components/Venues.tsx` | ✅ kept |
| Visitor notes on tinted glass, FAQ accordion | `components/Visit.tsx` | ✅ kept |
| Central data | `data/events.ts`, `venues.ts`, `categories.ts`, `faq.ts` | ✅ unchanged content |

There is no campus map in the project, so there are no map overlays to refine. None was invented.

## 2. Tools and skills

| Tool | Action | Result |
| --- | --- | --- |
| Anthropic `frontend-design` | `npx skills add anthropics/skills --skill frontend-design --agent claude-code` | ✅ installed in `.claude/skills/frontend-design`, read in full |
| Addy Osmani agent skills | `npx skills add addyosmani/agent-skills --skill frontend-ui-engineering --skill browser-testing-with-devtools --skill code-review-and-quality --skill debugging-and-error-recovery` | ✅ installed. `browser-testing-with-devtools` expects a Chrome DevTools MCP, which is not configured; browser testing was done with headless Chromium (Playwright) instead |
| Taste skill (`Leonxlnx/taste-skill`, MIT, owner verified via GitHub API) | `npx skills add Leonxlnx/taste-skill --agent claude-code` | ✅ installed as `design-taste-frontend` (v2.5.1). Its bundled scripts were reviewed: they only launch a local Chrome and talk to `127.0.0.1`. **Note:** v2.5.1 has no `DESIGN_VARIANCE` / `MOTION_INTENSITY` / `VISUAL_DENSITY` dials (those were in earlier versions), and its house rules forbid carousels and tilt. The brief explicitly requires both, so the brief wins; its anti-template and photo-first principles were applied |
| 21st plugin (`21st-dev/claude-code-plugin`) | Inspected README | ⏸ **Not installed: needs you.** It requires a metered `API_KEY_21ST` from 21st.dev/settings/api-keys, then `/plugin marketplace add 21st-dev/claude-code-plugin` and `/plugin install 21st@21st` inside Claude Code |
| `openai/plugins` | Inspected repository | ℹ️ A catalogue of **Codex** plugins (adobe, figma, vercel…), not a Claude Code integration. Nothing installed. A Figma connector is already connected in this Claude session; it wasn't needed for this work |
| Skillry (previous pass) | Logged in via the official CLI | ✅ authenticated; all relevant skills are $4.99 paid, none purchased |

## 3. Design problems found, and fixes

### A. Typography read as generated
- **Found:** four families (Geist, Geist Mono, Instrument Serif, Bricolage). Geist and Instrument Serif are default picks; mono all-caps labels, `A · B · C` meta strings, `01 —` eyebrows on every heading and a coloured italic word in every title are template tells (named explicitly in the `frontend-design` skill).
- **Superseded (luminous pass):** Bodoni Moda's hairlines looked spindly on standard screens and clashed with the luminous-glass direction, so it was removed. The site now uses **one family, Bricolage Grotesque**: the display optical size for headlines, light weights for the "turn" clause (no synthetic italics, since Bricolage has none), condensed heavy for poster numerals, and tracked caps (`.caps`) only for light names on glass.
- **Original fix:** two families. **Bodoni Moda** (high-contrast didone, optical sizes 6–96) gives ceremonial headlines; **Bricolage Grotesque** gives festival energy for body, UI and the condensed poster numerals. Labels are now sentence case with tabular figures. Meta strings read as phrases ("Sun 29 Nov, 10:00 at Plaza"). Section titles are one Bodoni sentence with an italic second clause in the same ink. Eyebrows and non-sequence numbering are removed (Day, Dispatch and slide counters stay because they are real sequences).
- **Bug caught in testing:** a forced `opsz 96` made Bodoni hairlines vanish on 1× screens ("M" read as "V"). Switched to `font-optical-sizing: auto`.

### B. Flat background
- **Found:** a single flat cream (#F4EEE2), close to the "AI cream" default.
- **Fix:** `components/Atmosphere.tsx`, a fixed layer of four drifting light fields (lavender, peach, pale cobalt, soft blue, butter) that re-tint per section. Colours are `@property`-registered, so the browser interpolates them and only that layer repaints. Reduced motion stops the drift.

### C. Depth
- Hero ribbon is now a 3D plane: tilted back, leaning toward the pointer, and tilting further as you scroll, with layered print shadows.
- Front slide: pointer tilt (≤ 6°), specular and holographic rim follow the light, contact shadow grounds it on the stage, and neighbours rotate 18° for spatial context.
- Magnetic pull on primary actions only (hero CTA, slider arrows), critically damped.

### D. Glass treatments per role
Nav: **solid** (always legible over dark sections). Slides: **holographic rim + specular**. Floating controls: **clear**. Detail: **solid** info + **tinted** registration + **smoked** close button over photography. Timeline tickets: **tinted** by category. Visitor notes: **tinted** over a campus photograph. Footer notice: **clear** over colour.

## 4. Content and duplication audit

| Issue | Root cause | Fix |
| --- | --- | --- |
| Titles announced twice ("Convocation Convocation") | `RevealText` put `aria-label` on a generic `<span>` and hid the words; nested inside an `<h3 aria-label>` in the typographic scene this doubled | Visible words are now the accessible text; no labels or hidden copies |
| Hero `<h1>` and detail title duplicated in copy-paste / reader mode | Visually hidden `sr-only` copy beside the visible title | Removed the hidden copies; the detail `<h2>` carries the dialog's id |
| Slide group label repeated the event title its heading already gives | `aria-label="n of N: title"` | Now `"n of N"` |
| "exhibition Exhibition" in the text stream | Ribbon buttons ended with a hidden "show in the exhibition" span, next to the next print's "Exhibition" chip | One `aria-label` per button |
| Hydration mismatch (React #418) | `Intl` long-date punctuation differs between Node and Chromium ICU | `formatLongDate` composed from single-field formats |
| Hero ribbon list rendered twice | **Intentional** (seamless marquee loop); the second copy is `aria-hidden` and untabbable | Kept |

Automated scan at every width: no duplicate ids, no doubled words in headings, no doubled adjacent words in rendered text.

## 5. Not used, and why
- **GSAP:** Motion already covers scroll-linked, spring and layout animation. A second runtime would add weight without new capability.
- **React Three Fiber:** depth comes from CSS 3D on photographs, which is cheaper and keeps the photographs as the subject. The only WebGL is the hero colour field (Paper Shaders), paused offscreen.

## 6. Luminous glass pass (reference: user video `threadsdownloader.com_d5e4e7.mp4`)

What the reference does, frame by frame: a pure black stage; near-black translucent cards with a 1px edge lit in their hue; a white-hot lip of light right under the card's bottom edge, bleeding up into the glass as a saturated band and fanning down into darkness; colour crossfades continuously as cards move (purple → emerald mid-transition), never swaps; the previous card stays as a dim ghost; minimal UI (name, "02 / 06", "Scroll, drag or use").

Implemented:
- **Light identities** (`lib/palette.ts`): Silver (Graduation), Cobalt (Academic), Amethyst (Entertainment), Gold (Performances), Emerald (Sports), Glacier (Exhibition), Ember (Food & Lifestyle), Rose (Special Activities). Each has a near-black tinted stage, a saturated light colour and a pale hot core.
- **`components/UnderLight.tsx`**: one custom WebGL1 fragment shader, no new dependency. It models the light as a **liquid, not a gas**: a crisp rippling meniscus under the card, a hot core, and smooth domain-warped ribbons flowing down the fan (quintic value noise, low frequency, no grain). It **sloshes** (the surface tilts and the flow leans) with the slider's real drag velocity through a damped spring, then settles flat. Colour is mixed from the two neighbouring slides by fractional track position, so hues blend continuously. Pixel ratio is capped at 1.25, it pauses offscreen, stops breathing and sloshing under reduced motion, and falls back to CSS gradients without WebGL.
- **Material** `.lum-glass`: translucent near-black body, faint diagonal sheen, an edge cool at the top that burns in the hue at the bottom, and the light band entering the slab (screen-blended inside the card only).
- **Slider**: black stage, reference-style header (light name, count, hint, controls), slab proportions narrowed, neighbours fall into shadow, snap spring softened to a damping ratio of about 0.88 (one barely visible settle, no bounce).
- **Hero**: the colourful shader band became a dark light-box; the preview lens is a luminous glass card whose light eases toward each previewed event's hue (exponential smoothing per frame). `@paper-design/shaders-react` was removed.
- **Detail, Featured, Schedule, Timeline, Venues**: luminous accents (light pooling under the detail photograph, light rising from dispatch edges, glowing category dots and day markers, tickets tinted by their light). Bright editorial sections stay light; the dark treatment is reserved for the immersive scenes.

Bugs found while verifying: `half` is a reserved word in GLSL ES, so the first shader silently fell back to CSS (dev builds now log compile errors); a template-literal backtick in a shader comment broke the build; the poster month line overlapped inside the giant numeral's line box (now its own element).

Motion and scroll decisions:
- **No Lenis.** Native scrolling is already smooth on trackpads and touch; scroll hijacking is the most common cause of a site "fighting" input and it breaks sticky and scroll-linked measurement. Fluidity comes from continuous scroll-linked transforms (hero plane, featured stack, timeline) instead.
- **No GSAP / R3F.** Motion covers springs, layout morphs and scroll-linked values; the only 3D rendering need (the light) is a single fullscreen-triangle shader, far cheaper than a Three.js scene.
- Only transforms, opacity and shader uniforms animate per frame; the shader reads state through a ref, so animating it causes no React renders.

Not applicable: there is no campus map in this project, so there are no monochrome 3D map highlights to add. The "HorizonX" and "Tunnel Fold" references weren't supplied, so they weren't used.
