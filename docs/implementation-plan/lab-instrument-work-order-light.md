# Lab Instrument + Work Order Document: art direction and implementation plan (light, alternative)

> **Status:** alternative direction, **to try later** in the week-2 look test against the dark direction · **Working name:** WORKING ORDER (not final) · **Written:** 2026-11-08
> **Sister document:** [night-workshop-dark.md](./night-workshop-dark.md), the main direction. The brief, work orders, event log, pipeline and guardrails are shared and specified there. This document defines everything that **looks, moves and sounds** different, and the engineering differences.

---

## 0. In one sentence

A precision lab instrument stands in a bright white studio and fills in a real work order in front of you. The page you're reading *is* that work order: by the end it's complete, and a human has stamped it approved.

---

## 1. The brief

Same as the dark direction (see *night-workshop-dark.md* §1): AI Engineer & Creative Developer; agencies and studios; show the real technical side of AI automation and full stack; an inspectable machine; Exploded View case studies; clinic referral intake as the featured run; press-and-hold sign-off as the climax; healthcare in the data only; no AI slop.

**Why try this direction at all:**
- **Contrast:** almost every AI and 3D portfolio is dark. A light one stands out in the first second of a gallery scroll.
- **Name:** it makes the name literal. The site is a *working order*: a machine in working order, filling in a work order.
- **Paperwork:** a referral *is* paperwork, so the document form is honest rather than decorative.
- **Exploded View:** technical drawings are this direction's native language, so the case studies need no translation.
- **Trust:** bright, clean and calm reads as safe and reliable, which matters when the data is clinical admin.

---

## 2. The hero frame

> A warm paper-white page with faint hairline rules, like a well-designed engineering form. Top-left, in a condensed uppercase header: **WORK ORDER · WO-0142**. Top-right: **SHEET 1 OF 3**. In the middle of the page sits a framed plate captioned *Fig. 1, Intake line, three-quarter view*. Inside it, a long, low off-white instrument stands on a seamless white studio floor under a big soft overhead light. Soft, natural shadows pool beneath it, and small black knobs and bezels punctuate its pale body. A paper card is feeding into its intake slot. Bottom-right, an engineering-drawing **title block** holds the identity: *Your Name · AI Engineer & Creative Developer · Drawn 2026 · Scale 1:1*. One large sans-serif line is set above the plate: *Real AI workflows, made visible.* There's no colour at all yet, because nothing needs a human.

The frame is **paper, ink and one object in soft light.** Colour (vermilion) is withheld until the story needs a human.

---

## 3. Mood and references

**Look at these families of things, and don't copy any of them:**

| Family | What to steal |
|---|---|
| Lab analyzers and precision instruments photographed on a white studio backdrop | Pale enamel bodies, black knobs and bezels, soft, even light |
| Engineering drawings and their title blocks | Hairline rules, numbered balloons, section hatching, the title block as a signature |
| Swiss and German technical documentation, standardised forms | Numbered fields, strict grids, condensed uppercase headers |
| Archival index cards and library catalogue systems | Tabs, sheet numbers, the pleasure of a filed record |
| Rubber stamps and spot-colour printing | One ink colour that means "a person did this" |
| Museum-white exhibition design | Generous space, objects as specimens, small precise captions |

**Mood words:** exact, bright, calm, archival, trustworthy, quietly witty.

**Not:** sterile hospital, Apple-clone minimalism, spreadsheet, Teenage Engineering, retro-futurism, skeuomorphic paper with torn edges and coffee stains, typewriter kitsch.

---

## 4. Concept for type and colour: three voices

| Voice | Expressed by | Speaks |
|---|---|---|
| **The document** | IBM Plex Sans + IBM Plex Sans Condensed | Headlines, form structure, section headers, the title block |
| **The machine** | IBM Plex Mono, ink black | Data fields, readings, logs, timings |
| **The human** | **Vermilion**: stamps, flags, the sign-off key | Anything that needs or records a person's judgment |

The rule is simple: **ink is the machine, vermilion is the human.** Vermilion stays off the page until a human is needed.

---

## 5. Colour

| Token | Hex | Role | Where |
|---|---|---|---|
| `--paper` | `#f1efe9` | The page | Background (with a subtle paper-fibre texture at 3% opacity) |
| `--paper-2` | `#e8e5dd` | Field wells | Inside boxed form fields, readout panels |
| `--rule` | `#16171a` at 18% opacity | Hairlines | Form rules, grid, callout lines, plate frames |
| `--ink` | `#16171a` | **The machine** | Text, data, linework, black controls on the instrument |
| `--ink-2` | `#5a5c61` | Secondary | Labels, captions, sheet numbers |
| `--vermilion` | `#e2401c` | **The human** | Flags, the waiting-for-sign-off state, the sign-off key cap, the APPROVED stamp |
| `--studio` | `#eeece6` | The 3D studio floor | The seamless backdrop, a hair darker than the paper so the plate reads as a figure |

**Rules:**
- No pure white (`#fff`) anywhere; even the brightest highlight is warm paper. No pure black either.
- Vermilion appears **only** for human judgment. If it's on screen, a human is needed or has acted.
- **Medical caution:** vermilion is an orange-red, never pure red, and **never forms a cross or plus shape.** No red-cross associations, ever.

---

## 6. Typography

All three faces are free on Google Fonts (`IBM_Plex_Sans`, `IBM_Plex_Sans_Condensed`, `IBM_Plex_Mono` via `next/font/google`). Plex was designed with an engineering heritage, so it suits technical documentation and isn't overused on Awwwards.

| Use | Face | Size (desktop → mobile) | Weight | Tracking | Case |
|---|---|---|---|---|---|
| Display headline | Plex Sans | `clamp(2.75rem, 6vw, 5.5rem)`, line height 1.0 | 500 | -0.03em | Sentence |
| Section headline | Plex Sans | `clamp(1.75rem, 3vw, 2.5rem)` | 500 | -0.02em | Sentence |
| Form header | Plex Sans Condensed | 12px | 600 | 0.08em | UPPERCASE |
| Body | Plex Sans | 16px, line height 1.55 | 400 | 0 | Sentence |
| Field number + label | Plex Mono | 10px | 400 | 0.1em | UPPERCASE, `--ink-2`, e.g. `03 · REFERRER` |
| Field value | Plex Mono | 14px | 400 | 0 | As data |
| Figure caption | Plex Mono | 11px | 400 | 0.02em | *Fig. 1, Intake line, three-quarter view* |
| Stamp | Plex Sans Condensed | 28–40px | 700 | 0.12em | UPPERCASE, vermilion, rotated −4° |

**Rules:**
- Tabular figures everywhere numbers change.
- One display line per screen at most.
- The title block always uses the same fixed layout: it's the signature.

---

## 7. The page as a work order

This is the defining idea of this direction: **the website is a document.**

- **The grid is visible.** Hairline rules divide the page into numbered fields, like a form. The 12-column grid has 24px gutters, but the rules make it *felt*: some boxes are filled, some are empty and waiting.
- **Header block** (top of every screen):
  - left: `WORK ORDER · WO-0142`
  - centre: the step name (`READ`, `CHECK`, …)
  - right: `SHEET 1 OF 3`, and **Skip to work** as a form link
- **Title block** (bottom-right, persistent):
  - **Contents:** name, title, `Drawn 2026`, `Rev. B`, `Scale 1:1`. It replaces the usual logo and header identity.
  - **Behaviour:** on scroll it reduces to one line.
- **The 3D stage is a figure.** The canvas sits inside a plate with corner crop marks and a caption (*Fig. 1*). In inspection shots the caption changes (*Fig. 3, Checker, detail*).
- **Fields fill in as the machine runs.** The extracted data doesn't only appear in floating readouts: it fills the form's numbered boxes on the page itself. By the end of the run, **the page is the completed record.**
- **Chapter index = sheet tabs.** Index-card tabs on the right edge (`01 READ`, `02 CHECK`, …) mark progress, and filled tabs turn ink-solid.
- **Perforations between chapters:** a dotted rule with small semicircle notches at the margins, like a tear-off form.
- **No drop shadows, no rounded cards, no gradients in the UI.** Paper is flat; depth lives only in the 3D figure.

---

## 8. The instrument: industrial design

**Same line, stations and mechanics as the dark direction** (see *night-workshop-dark.md* §8: Intake, Reader, Checker, Router, Writer, Sign-off, Out tray). What changes is the design language.

- **Body:** pale off-white enamel with generous radii (softer than the dark version, about 5% of height). It reads like lab equipment you'd trust with samples.
- **Accents:**
  - **Ink-black controls:** knobs, the dial, lamp bezels, the print head and the key's bezel. The black punctuation gives the pale body its rhythm and contrast.
  - **Satin stainless:** the rails, the Reader's bridge and the card channel.
- **Lamps:** a black bezel around a frosted lens. **Off:** frosted white. **Machine working:** crisp cool-white light behind the frost. **Human needed:** vermilion behind the frost. The black bezel keeps lamps readable against the pale body.
- **Labels:** screen-printed in ink (Plex Mono and Plex Sans Condensed, uppercase), with small field numbers matching the page's form fields. The machine and the page share the same numbering.
- **The sign-off key:** a square key with a **vermilion cap** in a black bezel, the only vermilion object on the machine. It's visible from the start, but unlit: the one thing waiting for you.
- **The work order card:** slightly brighter paper than the machine so it always pops. It's printed in ink with the same form layout as the page, a miniature of the page itself.

---

## 9. Materials (three.js values)

| Material | Base colour | Metalness | Roughness | Extras | Used for |
|---|---|---|---|---|---|
| Off-white enamel | `#e6e2d9` | 0 | 0.42 | clearcoat 0.6, clearcoatRoughness 0.25 | Station bodies, plinth |
| Satin stainless | `#c8cbcf` | 1 | 0.3 | anisotropy 0.4 (brushed along the line) | Rails, bridge, channel |
| Ink anodized | `#1b1c1f` | 1 | 0.35 | none | Knobs, dial, bezels, print head |
| Black rubber | `#151516` | 0 | 0.9 | none | Feet, rollers, gaskets |
| Frosted lens | `#f4f3ef` | 0 | 0.6 | transparent, opacity 0.6; emissive core behind it when lit | Lamp lenses, intake lid |
| Vermilion enamel | `#e2401c` | 0 | 0.5 | clearcoat 0.4 | The sign-off key cap only |
| Card paper | `#f6f3ec` | 0 | 0.85 | canvas texture for the print | Work order cards |
| Studio floor | `#eeece6` | 0 | 1.0 | a curved seamless backdrop (cyclorama) | Floor and backdrop |

Optional: real glass transmission (drei `MeshTransmissionMaterial`) on the intake lid only, desktop only, if the look test shows it's worth the cost.

---

## 10. Lighting

Light scenes live or die on soft shadows and ambient occlusion. Without them, everything goes flat.

| Light | Type | Colour | Intensity (relative) | Purpose |
|---|---|---|---|---|
| **Overhead softbox** | Large rectangular light in the environment, above and slightly behind | `#fffaf2` | 1.0 | The main soft light. Gives the enamel its gentle gradient. |
| **Side strips** | Two tall, thin rectangular lights, left and right (in the environment) | neutral | 0.4 each | Long specular highlights down the sides of stainless and black parts |
| **Key** | Directional light, high and front-left | `#fff4e6` | 0.6 | Defines form. Its shadow is baked once into the soft-shadow pass. |
| **Bounce** | The white floor and backdrop | none | none | Natural fill; the cyclorama does the work |

- **Shadows:**
  - The static machine gets soft, accumulated shadows (drei `AccumulativeShadows` + `RandomizedLight`), baked once at load and then free.
  - The moving card gets a live contact shadow.
- **Ambient occlusion:** an N8AO pass, small radius, to darken every crevice, panel gap and the meeting of a part with the floor. **This is what makes it look real.**
- **Tone mapping:** Neutral (Khronos PBR Neutral; keeps whites and the vermilion true, like product photography). Exposure about 1.05, tuned so the paper never clips.
- **No fog.** The cyclorama's curve fades the floor into the backdrop naturally.

---

## 11. Camera

- **Lens:** vertical FOV 22° (about a 62mm lens) for the establishing plate; FOV 14° (about a 100mm lens) for inspection details. Even longer than the dark direction, to feel closer to a technical illustration.
- **Shots:** the same named shots as the dark direction (establishing, inspection per station, frontal sign-off, top-down delivery). Each shot change also changes the **figure caption**, so the page keeps describing what the camera shows.
- **Moves:** the same rules (dolly and truck only, ease-in-out, no orbit, no drift).
- **Exploded View:** uses an **orthographic camera** at a true axonometric angle (dimetric: about 30° elevation, 45° rotation). Technical drawings are orthographic, so this is the honest choice.

---

## 12. Post-processing

In this order: **N8AO** (ambient occlusion: radius small, intensity about 1.5) → **tone mapping (Neutral)** → **SMAA** (thin dark edges on light backgrounds shimmer without it).

- **No bloom** (lit lamps read through the frost without glow).
- **No vignette** (paper is flat and even).
- **No film grain on the canvas.** The paper texture lives in the page's CSS, not in the 3D render.

---

## 13. Readouts and interface

- **Form fields are the readouts.**
  - Each extracted field fills its numbered box on the page: a `--paper-2` well, a hairline border, the number and label top-left (`03 · REFERRER`), the value in Plex Mono.
  - A thin callout line runs from the active field to its station in the figure, straight with one 90° bend.
- **Filling animation:** the value types in at the run's recorded speed, and a short ink underline draws under it when the field is complete.
- **Flags:**
  - **The box:** a vermilion corner tick on the field box.
  - **The note:** set in the margin beside the box, in Plex Mono, with a vermilion leader line.
- **Rejections:** the wrong value is struck through with a single ink line, a `RE-READ 1/2` margin note appears, and the corrected value is typed on the line below. Exactly how a careful clerk would correct a form.
- **The run bar:** a ruler along the bottom of the figure, with millimetre-style ticks for events (ink for machine events, vermilion for human ones). The scroll position is the playhead, and clicking a tick jumps there.
- **Sign-off:**
  - **On the page:** a signature box at the bottom of the form, labelled `APPROVED BY`, with a square **Hold to approve** key in vermilion outline.
  - **While holding:** the outline fills clockwise.
  - **On completion:** the **APPROVED stamp** lands across the signature box: vermilion, rotated −4°, with slightly uneven ink (an SVG mask), plus the date, time and `VISITOR`.
- **Buttons:** text with a hairline underline; the primary action is a hairline box. No fills, no rounded pills.

---

## 14. Motion language

The same motion tokens as the dark direction (`actuate`, `travel`, `detent`, `camera`, `reveal`, `stagger`) and the same rules (nothing moves without an event, firm stops, one thing at a time). This direction adds:

| Token | Curve | Duration | Use |
|---|---|---|---|
| `draw` | `cubic-bezier(0.4, 0, 0.2, 1)` | 300–900ms (by length) | Hairlines, rules, callouts and drawing linework drawing on (stroke-dashoffset) |
| `type` | none (recorded timing) | As recorded | Field values and the draft typing in |
| `stamp` | `cubic-bezier(0.7, 0, 1, 1)` down, instant ink | 120ms down, 0ms ink, 200ms lift | The APPROVED stamp: hits hard, no bounce, ink appears at contact |
| `sheet` | `cubic-bezier(0.83, 0, 0.17, 1)` | 700ms | Moving between sheets: a clean horizontal wipe like paper feeding through |

- **On arrival, the page draws itself:** rules draw on in reading order (staggered by 40ms), then the title block fills, then the figure fades up from paper white as the studio light rises. About 1.8s in total.

---

## 15. Sound design

This direction is **daylight**: no ambient music. It uses a near-silent room tone (filtered noise at −40 dB) and dry, close paper and mechanism sounds, synthesised with Tone.js. Off by default and opt-in.

| Event | Sound |
|---|---|
| Card feed | Paper sliding over steel, then a soft stop |
| Field filled | A soft pencil-tick (short filtered noise), one per field |
| Check pass | Small relay click |
| Check flag | A single soft wooden knock (low, warm) |
| Reject / re-read | A pencil strike-through scratch, then the relay click |
| Dial detent | Crisp clicks, one per step |
| Draft line | A soft paper-feed tick per line |
| Awaiting sign-off | Silence: the room tone drops out. The absence is the cue. |
| Holding | A low, rising tone, very quiet |
| **Stamp** | A **solid rubber-stamp thump**, the loudest sound on the site, then silence |
| Deliver | Sheets settling into the tray |

---

## 16. Storyboard

The same beats as the dark direction (see *night-workshop-dark.md* §16: arrival, origin, choose, read, check, route, draft, sign-off, delivered, selected work, working together). Here's how this direction stages them:

| # | Beat | What's different in this direction |
|---|---|---|
| 00 | **Arrival** | The blank sheet draws its own rules; the header and title block fill in; *Fig. 1* rises from paper white. Display line: *Real AI workflows, made visible.* |
| 01 | **Origin** | Set as a short **margin note** beside the figure, in Plex Mono, like a note on a file: *2020: hospital by day, first client site by night.* |
| 02 | **Choose a work order** | Three **index cards** on the page (Referral as the featured top card, Brief, Lead). The chosen card's form number becomes the page header. |
| 03–06 | **Read → Check → Route → Draft** | The page's form fields fill in step by step; the figure caption names each station; flags and corrections appear in the margin in vermilion and ink. |
| 07 | **Sign-off** | The camera frames the vermilion key; on the page, the signature box. Display line: *Nothing leaves without a human.* Hold, then the **stamp**. |
| 08 | **Delivered** | The figure shrinks to a thumbnail; **the completed, stamped work order is the hero.** It's the page itself, now fully filled in. Summary row: `6.2 S · 9 FIELDS · 3 CHECKS · 1 FLAG · 1 RE-READ · 1 APPROVAL`. Actions: Inspect any step · Run it live · New work order. |
| 09 | **Selected work** | A **drawing register** (a table of sheets): project, sheet number, discipline (WebGL / AI / Automation), year. Each opens its Exploded View. |
| 10 | **Working together** | A **specification sheet**: language (IELTS 8.0), time zone, tools, how you work with studios, a testimonial as a quoted note, contact. |

---

## 17. Exploded View (case studies)

This is where the direction is strongest: **every case study is a technical drawing.**

- **Drawing style:**
  - Orthographic axonometric. Parts are solid off-white with **ink outlines** (drei `Edges` or an outline pass), 1px hairlines at screen resolution.
  - Where a part is cut open, the cut face shows **45° section hatching**, the classic engineering convention.
- **Scroll 1, explode:**
  - Parts separate along the drawing's axes, with **dashed explosion lines** showing where each came from.
  - **Numbered balloons** (circles with item numbers) label the real services.
- **Scroll 2, flow:**
  - The data path draws on as a single ink line through the real connections, in request order.
  - Human touchpoints are marked with a vermilion balloon.
- **Scroll 3, assemble:** the parts close up, and a screen part shows the running product (a real recording or screenshot) set into the drawing.
- **Bill of materials (BOM):** the stack becomes a table in the drawing's corner: item no. · part · specification · notes (for example `04 · LLM · structured output, zod-validated · retries once on schema failure`). Credits go in the title block: role · agency · client · year.
- **Below the drawing:** a spec sheet with Problem → Approach → Result, constraints, your contribution, and "Private NDA work available on request."
- **Same honesty rules as the dark direction:** real architecture only. A simple system gets a simple drawing.

---

## 18. Mobile

- **The document reflows naturally:**
  - Form fields stack into one column, and the margin notes move inline below their fields.
  - The title block becomes a compact footer.
- **The figure:** a full-width plate with the instrument line turned vertical (the card travels down), like the dark direction.
- **Sign-off:** the signature box and hold key sit at thumb height. The stamp is full width.
- **Cost:**
  - Soft shadows are baked once and AO is cheaper (half resolution). There's no transmission material.
  - Device pixel ratio is capped at 1.5, with SMAA kept on (light backgrounds show aliasing).

---

## 19. Reduced motion and no WebGL (planned, polish later)

- **Reduced motion:**
  - Rules and fields appear without drawing or typing.
  - The camera cuts between shots instead of moving.
  - The stamp appears without the hit.
  - Hold-to-approve becomes a single press.
- **No WebGL:** the figures become still renders (exported at build time) with the same captions. Because the story lives in the document itself, this direction degrades the most gracefully of the two.

---

## 20. Implementation differences from the dark direction

The engine is shared: the event log, `stateAt(run, t)`, the pipeline, live-run guardrails, the parts library and named camera shots are all as in *night-workshop-dark.md* §21. What changes:

| Area | Dark | This direction |
|---|---|---|
| Theme tokens | `--bg`, `--fg`, `--machine`, `--human` … | `--paper`, `--ink`, `--vermilion` … (a theme switch in `globals.css`) |
| Fonts | Instrument Serif, Geist, Geist Mono | IBM Plex Sans, Plex Sans Condensed, Plex Mono |
| Materials | `materials.ts` (graphite, anodized) | `materials.light.ts` (enamel, stainless, ink accents) |
| Lighting | Spot key, rim, fog | `lighting.light.tsx`: softbox environment, cyclorama, `AccumulativeShadows` baked once |
| Post | Bloom, AgX, grain, vignette | N8AO, Neutral tone mapping, SMAA |
| Readouts | Floating glass panels | `components/form/`: numbered field boxes in the page grid, margin notes, signature box, stamp (SVG) |
| Exploded View | Perspective camera, cool light flow, off-white linework | Orthographic camera, `Edges` outlines, section hatching, balloons, BOM table |
| Extra components | none | `TitleBlock`, `SheetTabs`, `FigurePlate` (crop marks + caption), `Perforation`, `Stamp` |

**Performance budget:** the same as the dark direction (≤ 120 draw calls, ≤ 250k triangles), plus:
- **AO:** the N8AO pass, at half resolution on mobile.
- **Shadows:** baked once. Re-bake only if the machine's layout changes, never per frame.

---

## 21. The look test (week 2): how we'll decide

| Setting | Value |
|---|---|
| **Subject** | The **Checker** station, which has the most states: pass, flag, reject, retry |
| **Event slice** | One recorded slice: 3 checks, 1 flag, 1 reject → retry |
| **Setup** | Both directions at 1440×900, side by side in the browser, then one at a time at full screen, plus a phone view each |

**Judged on:**

| Criterion | Question |
|---|---|
| Distinctive | Would you remember it after scrolling past 50 other portfolios? |
| Premium | Does it look like a real, expensive object, not a toy or a render demo? |
| Legible | Can you read every field and flag at 100% zoom without effort? |
| Story | Is it obvious, without explanation, that something checked the data and a human is needed? |
| AI and engineering | Does an agency person think "this person builds real AI systems"? |
| Two-minute test | Would you happily watch this for two minutes? |
| Performance | 60fps on a laptop, 30fps on a phone? |

You pick from the real renders. The losing direction's document stays here for reference.

---

## 22. Art director's checklist (this direction)

- [ ] **Squint test:** the figure and one display line are the only focal points.
- [ ] Vermilion appears **only** when a human is needed or has acted. Point at any vermilion and name the human moment.
- [ ] No cross or plus shapes anywhere, especially in vermilion.
- [ ] No clipped whites: the brightest highlight is still warm paper.
- [ ] Every crevice and panel gap has AO; every part sits in a soft shadow. Nothing looks pasted on.
- [ ] Hairlines are 1px, straight, with at most one 90° bend. No curves in the UI.
- [ ] Every figure has a caption that matches what the camera shows.
- [ ] Fields on the page and labels on the machine share the same numbers.
- [ ] **Nothing moves without an event;** the idle page is perfectly still.
- [ ] No drop shadows, rounded cards or gradients in the UI.
- [ ] By the end of the run, the page is a complete, stamped work order.
- [ ] Not a spreadsheet: one display line per screen and generous empty paper.
- [ ] The healthcare run says "made up" and "admin only" where the visitor chooses it.

---

## 23. Risks specific to this direction

| Risk | Mitigation |
|---|---|
| Looks **sterile** or clinical-cold | Warm paper (never white), warm softbox light, the wit of the document conventions (title block, stamp, margin notes) |
| Looks **flat** (white on white) | Ink-black accents on the instrument, strong AO, soft shadows, a cyclorama a hair darker than the paper |
| **Spreadsheet** boredom | Strict limit of one display line per screen, big empty paper, the figure always dominant |
| Loses v1's continuity (you liked v1's dark look) | That's what the look test is for. If dark wins, this document stays as a reference. |
| Aliasing on light backgrounds | SMAA always on; hairlines snapped to whole pixels in the DOM |
| Vermilion reads as "medical red" | Orange-leaning hue, never a cross, used only for human moments |
| AO and soft-shadow cost on phones | Half-resolution AO, shadows baked once, no transmission material |

**Still open (same as the dark direction):** the final name, merging the AI guide into the machine's input, the referral wording and clinic names.
