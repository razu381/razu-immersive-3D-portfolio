# Night Workshop: art direction and implementation plan (dark, main direction)

> **Status:** main direction · **Working name:** WORKING ORDER (not final) · **Written:** 2026-11-08
> **Sister document:** [lab-instrument-work-order-light.md](./lab-instrument-work-order-light.md), the light alternative, to be compared in a look test in week 2.

---

## 0. In one sentence

A precision machine stands in a dark workshop under one warm lamp, processing real work in front of you. You can stop it at any step to see exactly what it decided and why, and a human signs off at the end.

---

## 1. The brief (shared by both directions)

- **Who:** a freelance **AI Engineer & Creative Developer**, branded under their own name. They have built websites since 2020 (WordPress → frontend → full stack → AI automation and engineering), design directly in code, and offer high-end 3D/WebGL sites.
- **Audience:** agencies and studios hiring a freelance partner.
- **Goal:** Awwwards level and memorable. **Lead with AI** by showing the *technical* side of AI automation and full-stack work, artistically.
- **Principle:** **show the real thing, made beautiful.** Real automation runs, real data and real architecture, art-directed. No metaphors standing in for AI.
- **Never:** glowing brains, node graphs, particle faces, chrome blobs, purple-blue gradients, code rain, holographic HUDs, robot hands. Also nothing from v1's "strings and dancing".
- **Home page:** *the inspectable machine.* It runs a real automation; the visitor can scrub, pause at any step, see the real data, then open the implementation.
- **Case studies:** *Exploded View.* The same machine, opened up to show each project's real architecture.
- **Featured run:** clinic **referral intake** (made-up records, admin only). Two more work orders sit alongside it: an **agency brief** and an **inbound lead**.
- **Climax:** **press-and-hold sign-off.** The visitor plays the staff member and approves the AI's draft.
- **Healthcare:** lives *only in the data the machine processes*. It never appears in the visuals: no hearts, ECG lines, crosses or anatomy.

---

## 2. The hero frame

Describe this to anyone working on the site, and every other frame should feel like it belongs in the same film.

> Near-black room. A long, low machine sits on a heavy plinth, filmed from a three-quarter angle slightly above, the way you'd photograph a watch movement or a mixing desk at night. One warm key light falls from above-left, a pool of light rather than a wash. A thin cool rim light traces the back edges of every part, so the silhouettes read against the dark. Each part's chamfered edge catches the key light as a single bright line. On the left, a pale paper work order card is sliding into the intake slot. Its printed text is legible. Above the machine, in the empty dark, one serif line: *Real AI workflows, made visible.* Bottom left, small mono type: *WO-0142 · Referral intake · replay of a real run.* Only two things glow: the intake lamp, cool, because the machine is working, and nothing else yet.

The frame is **mostly darkness, one pool of warm light, one moving object and one sentence.** If a frame has more than one focal point, it's wrong.

---

## 3. Mood and references

**Look at these families of things, and don't copy any of them:**

| Family | What to steal |
|---|---|
| Product films for watches and precision instruments | Macro framing, slow camera, light raking across machined edges |
| Museum lighting of industrial objects at night | One pool of warm light, everything else falls into black |
| Mid-century lab and broadcast equipment | Honest controls, engraved labels, panels you could service |
| Industrial design in the Dieter Rams family | Restraint, proportion, "less but better", nothing decorative |
| Film noir chiaroscuro | Light as storytelling: what's lit matters |
| Editorial magazine typography | Big serif against small mono, generous white space (here, black space) |

**Mood words:** precise, quiet, heavy, nocturnal, warm under pressure, trustworthy.

**Not:** neon, cyberpunk, sci-fi, HUD, gamer RGB, toy, Rube Goldberg, steampunk, Teenage Engineering, "AI glow".

---

## 4. Concept for type: two voices

The page has two voices, and the type tells you which one is speaking.

| Voice | Typeface | Speaks |
|---|---|---|
| **The human** | Instrument Serif (from v1) | The story, headlines, the sign-off moment, testimonials |
| **The machine** | Geist Mono | Data fields, labels, logs, timings, state |
| **Neutral** | Geist (sans) | Body text, buttons, case study prose |

This keeps v1's typography you liked, and gives it a reason to exist: serif = human, mono = machine.

---

## 5. Colour

Colour is **light, not paint.** The machine and page are almost colourless. Hue only appears where a light is actually on, and every hue means a state.

| Token | Hex | Role | Where it appears | Share of frame |
|---|---|---|---|---|
| `--bg` | `#07080a` | Night | Page background, fog colour, floor falloff | ~80% |
| `--surface` | `#0e1013` | Raised surfaces | Readout panels, cards in the UI | ~6% |
| `--line` | `#23262b` | Hairlines | Dividers, callout lines, panel borders | ~1% |
| `--fg` | `#ece8e1` | Warm off-white text | Headlines, body text, the work order card paper | ~8% |
| `--muted` | `#8b8f96` | Secondary text | Labels, captions, timestamps | ~4% |
| `--machine` | `#bdebff` | **The machine is working** | Active-step lamp, data flowing, live field highlight | <1% |
| `--human` | `#ffb070` | **A human is needed** | Flags, waiting for approval, the sign-off key and its ring | <1% |
| `--fused` | `#f4efe6` | **Signed off and delivered** | Approved lamp, delivered record | <1% |

**Rules:**
- No pure black (`#000`) or pure white (`#fff`) anywhere, in the scene or the page.
- Cool and warm never appear on the same object at the same time. A step is either working (cool) or waiting for a human (warm).
- Warm is rarer than cool. When warm appears, the visitor should feel "this needs me."
- The warm key light is a *light* colour (about 3200K, `#ffcf9a`), not a state. It's the room, not the machine.

---

## 6. Typography

| Use | Face | Size (desktop → mobile) | Weight | Tracking | Case |
|---|---|---|---|---|---|
| Display headline | Instrument Serif | `clamp(2.5rem, 5vw, 4.5rem)` | 400 | -0.01em | Sentence |
| Section headline | Instrument Serif | `clamp(1.875rem, 3.2vw, 3rem)` | 400 | -0.005em | Sentence |
| Italic emphasis | Instrument Serif Italic | inherit | 400 | 0 | Use once per screen at most |
| Body | Geist | 15–17px, line height 1.55 | 400 | 0 | Sentence |
| Label / chapter | Geist Mono | 11px | 400 | 0.2em | UPPERCASE |
| Data field label | Geist Mono | 11px | 400 | 0.12em | UPPERCASE, `--muted` |
| Data field value | Geist Mono | 13–14px | 400 | 0 | As data, `--fg` |
| Streaming draft | Geist Mono | 13px, line height 1.6 | 400 | 0 | As written |
| Big numbers (run time, counts) | Instrument Serif | 2–3rem | 400 | 0 | Tabular feel; align on the decimal |

**Rules:**
- Mono numbers use tabular figures (`font-variant-numeric: tabular-nums`) so changing values never jitter.
- Never set serif in uppercase. Never set mono larger than 16px; the machine doesn't shout.
- Engraved labels on the machine itself are Geist Mono uppercase, tracked 0.15em, in a tone just above the panel colour. They read as engraved, not printed.

---

## 7. Layout and grid

- **Grid:** 12 columns, 24px gutters, outer margins 32px desktop / 20px mobile. Header and footer sit on the margin line.
- **The machine owns the centre band** (roughly the middle 50% of the screen height). Text never crosses the machine's silhouette in the establishing shot.
- **Text zones:**
  - **Top band:** the header: name · title · sound · skip to work.
  - **Upper-left void:** the serif headline.
  - **Lower-left:** run metadata in mono.
  - **Right edge:** the readout column (data from the active step).
- **Readouts attach to the machine.** Each readout panel has a 1px callout line in `--line` to a point on its station. The line is straight with one 90° bend at most, like a technical drawing, never curved.
- **Chapter index:** v1's 00–0N index stays on the left edge, small mono.
- **Persistent:** "Skip to work" in the header. "Run it live" appears only after the replay finishes.

---

## 8. The machine: industrial design

### 8.1 Form language
- **Proportions:** a long, low line, about 6 : 1 length to height. Heavy at the bottom (plinth), lighter on top (mechanisms). Stations sit on a 1-unit rhythm, so the line reads like a well-set paragraph.
- **Edges:**
  - **Radii:** every body has a small radius (2–3% of its height). Nothing is a raw box.
  - **Chamfers:** every *top* edge has a **diamond-cut chamfer**, a thin bevel that shows bright raw aluminium against the dark body. This is the single most important premium detail: it's what catches the key light and draws the silhouette.
- **Panel gaps:** parts meet with a dark shadow gap (about 0.8% of the part width) instead of touching. Gaps make it look assembled, not modelled.
- **Fasteners:** almost none. Where they appear, they're countersunk, flush and in groups of four, symmetric.
- **Controls:** each control does one thing and looks like it: a lamp is a lamp, a dial is a dial, a key is a key. No decorative knobs.
- **Labels:** engraved mono, small, aligned to a shared baseline across the whole line.

### 8.2 The line (left to right)
```
 ┌─────────┬──────────┬──────────┬──────────┬──────────┬──────────┬─────────┐
 │ INTAKE  │  READER  │ CHECKER  │  ROUTER  │  WRITER  │ SIGN-OFF │ OUT     │
 │ slot +  │ scanning │ lamp row │ detented │ print    │ hold key │ tray    │
 │ lid     │ gantry   │ + clamp  │ dial     │ head     │ + ring   │         │
 └─────────┴──────────┴──────────┴──────────┴──────────┴──────────┴─────────┘
 ══════════════════════ plinth (graphite, heavy) ═══════════════════════════
            ← the work order card travels along a machined channel →
```

### 8.3 Stations
Each station is a real pipeline step, has a single job, and has one readout.

| Station | What it really does | Physical form | Moving parts | Readout shows |
|---|---|---|---|---|
| **Intake** | Receives the document | A slot in a raised block, smoked-glass lid | Lid slides back; card feeds in on rollers | Source, received time, document type |
| **Reader** | Extracts structured fields (AI structured output) | A bridge over the channel with a scanning bar | Bar travels once across the card; a cool lamp blinks per field found | Each field appearing: label → value |
| **Checker** | Validates against rules | A row of small glass-dome lamps, one per rule, plus a clamp | Lamps light pass (cool) or flag (warm); clamp closes on a reject | Rule list: pass / flagged / rejected + reason |
| **Router** | Classifies and routes | A large detented rotary dial with engraved destinations | Dial turns in detent steps to the destination | Destination + confidence + the reason in one line |
| **Writer** | Drafts the reply (streamed) | A print head over a second, blank card | Head steps line by line; text appears on the card | The draft, streaming |
| **Sign-off** | Waits for human approval | One large key with a warm ring around it | Key depresses on hold; ring fills; latch drops | "Awaiting your sign-off" → "Signed off 14:02" |
| **Out tray** | Delivers the record and the reply | A shallow tray at the end of the channel | Both cards slide in and settle | The delivered output, shown large (the hero) |

### 8.4 The work order card (the hero object)
- A thick paper card in `--fg`-coloured paper with a subtle fibre texture. It's the only light-coloured object, so the eye follows it.
- It carries the real input text, printed in mono on a canvas texture, legible in close-ups.
- A small form number (WO-0142) and a corner notch, so it reads as a *work order*, not a sheet of paper.
- It's the one thing that travels. Everything else stays fixed and acts on it.

### 8.5 State lamps
- **Off:** smoked glass dome, dark, faint reflection of the key light.
- **On (cool / warm / fused):** an emissive core *inside* the dome plus a tiny bloom. A lamp lights only when its event fires and holds a steady state. Lamps **never pulse in a loop**.

---

## 9. Materials (three.js values)

All are `MeshPhysicalMaterial` unless noted. There's one instance of each in `materials.ts`, shared by every part.

| Material | Base colour | Metalness | Roughness | Extras | Used for |
|---|---|---|---|---|---|
| Graphite enamel | `#17191c` | 0 | 0.55 | clearcoat 0.3, clearcoatRoughness 0.4 | Station bodies, plinth top |
| Dark anodized aluminium | `#2b2e33` | 1 | 0.32 | anisotropy 0.5 along the line (brushed) | Faceplates, the dial, the bridge |
| Diamond-cut edge | `#a9adb3` | 1 | 0.22 | none | Chamfers on top edges only |
| Satin black rubber | `#0c0c0d` | 0 | 0.9 | none | Rollers, feet, the key's skirt |
| Smoked glass | `#0a0c0e` | 0 | 0.05 | clearcoat 1, transparent, opacity 0.35 | Lamp domes, the intake lid |
| Card paper | `#e9e4da` | 0 | 0.8 | sheen 0.2; canvas texture for print | Work order cards |
| Lamp core (on) | state hex | none | none | `MeshBasicMaterial`, `toneMapped: false`, colour scaled ×2–3 for bloom | Lit state lamps |
| Floor | `#08090b` | 0 | 0.95 | none | The ground the shadows fall on |

**Rules:**
- No real glass transmission (too expensive on phones). Smoked glass is a transparent clearcoated surface reflecting the environment.
- No image textures except the card print, which is drawn to a canvas at runtime. Everything else is procedural.

---

## 10. Lighting

| Light | Type | Colour | Intensity (relative) | Purpose |
|---|---|---|---|---|
| **Key** | SpotLight, above-left, angle 0.45, penumbra 0.8 | `#ffcf9a` (about 3200K) | 1.0 | The pool of light. Casts the only real-time shadow (1024 map). |
| **Rim** | Thin rectangular strip behind-right (in the environment) | `#bdebff` | 0.5 | Traces back edges so silhouettes separate from the dark |
| **Fill** | Large, faint front panel (in the environment) | neutral `#d9d6d0` | 0.08 | Keeps the shadows from going pure black |
| **Environment** | drei `<Environment>` built from `<Lightformer>`s, rendered once | above | above | Gives metal and chamfers their reflections. No HDRI file needed. |

- **Shadows:** a contact shadow under every part (drei `ContactShadows`, re-rendered only when something moves), plus the key light's shadow.
- **Haze:** scene fog in `--bg` colour, starting just behind the machine, so the room falls away into darkness.
- **Tone mapping:** AgX (filmic highlight roll-off; warm light stays warm without clipping). Exposure 1.0, tuned once in the look test.
- **The light tells the story:** when the run reaches a station, the key light's target eases toward it (about 10% of the distance). The pool of light follows the work, subtly.

---

## 11. Camera

- **Lens:** vertical FOV 30° (about a 45mm lens) for the establishing shot; FOV 18° (about 75mm) for inspection close-ups. Long lenses compress space and feel like product photography.
- **Shot list:**
  1. **Establishing:** three-quarter view, about 20° above the line, whole machine in frame with dark space above for the headline.
  2. **Inspection per station:** low and close (about 8° above), the station filling about 60% of the frame, slightly off-centre toward the readout side.
  3. **Sign-off:** frontal and slightly low, looking up at the key. The only frontal shot, which makes it feel important.
  4. **Delivery:** top-down onto the out tray, the cards readable. This is the hand-off to the 2D output.
- **Moves:**
  - Straight dolly and truck between shots, with ease-in-out. A slight push-in during inspection is allowed.
  - **No orbiting, no handheld wobble, no idle drift.**
- **Depth of field:** subtle and only in inspection shots, focused on the station.
- **Scroll mapping:** the camera moves between named shots; scroll never drives free rotation.

---

## 12. Post-processing

In this order: **Bloom** (mipmap blur, luminanceThreshold 1.0 so only `toneMapped: false` lamp cores bloom, intensity 0.6, radius 0.6) → **tone mapping (AgX)** → **Noise** (film grain, opacity 0.035) → **Vignette** (darkness 0.55) → **SMAA**.

The grain and vignette are inherited from v1 and give the look continuity. Bloom is far more restrained than v1: **only lamps glow, nothing else.**

---

## 13. Readouts and interface

- **Readout panel:**
  - **Surface:** `--surface` at 85% opacity, a 1px `--line` border, a 4px radius (almost square: this is an instrument, not an app), and 16px padding.
  - **Header:** a mono uppercase label (station name and step number).
  - **Callout:** one 1px line from the panel to its station anchor.
- **Field row:** label (11px mono, muted) on the left, value (13px mono, fg) on the right, separated by a dotted leader like a table of contents. New rows fade in from 0 to 1 opacity in 300ms with the field's cool highlight, which fades out over 1.2s.
- **Flags:** a warm left border (2px) on the row, the value in `--human`, and the reason in muted mono below.
- **Rejections:** the value struck through in muted, a "retry 1/2" tag, then the corrected value on a new row.
- **Streaming draft:** typed at the real token speed recorded in the run (the replay preserves timing), with a block cursor in `--machine` while streaming.
- **Hold-to-sign key (DOM twin):** v1's conic progress ring, now in `--human`, around a key label: *Hold to approve*. It works by mouse, touch, and Space or Enter.
- **Buttons:** text buttons in mono uppercase; the primary action has a 1px border in the state colour. No filled buttons, no shadows, no gradients.
- **The run bar:** a thin timeline at the bottom of the stage showing the run's events as ticks (cool, warm, fused). The scroll position is the playhead, and clicking a tick jumps there. This is what makes the machine *inspectable*.

---

## 14. Motion language

### Easing and duration tokens
| Token | Curve | Duration | Use |
|---|---|---|---|
| `actuate` | `cubic-bezier(0.5, 0, 0.1, 1)` | 160–220ms | Lids, clamps, the key, latches. Fast with a firm stop. |
| `travel` | `cubic-bezier(0.83, 0, 0.17, 1)` | 420–700ms (scaled by distance) | The card moving between stations |
| `detent` | `cubic-bezier(0.3, 0, 0, 1)` per step | 90ms per step, 40ms gap | Dial rotation, so you feel each click |
| `camera` | `cubic-bezier(0.65, 0, 0.35, 1)` | 1400–1800ms | Moves between named shots |
| `reveal` | `cubic-bezier(0.22, 1, 0.36, 1)` (v1's) | 600–900ms | Headlines and readout panels |
| `stagger` | none | 70ms | Between fields or rows appearing |

### Rules
- **Nothing moves without an event.** No idle bobbing, breathing, floating or looping pulses.
- **Firm stops:** no overshoot or bounce. Weight is shown by the contact shadow tightening as a part lands, not by the part bouncing.
- **One thing moves at a time** in the machine. The camera may move while the card travels, but never while a station actuates.

### Event → motion
| Event | Machine | Readout | Light |
|---|---|---|---|
| `run.start` | Intake lid slides open (`actuate`); card feeds in (`travel`) | Run header types in: *WO-0142 · Referral intake* | Intake lamp → cool |
| `read.field` | Scanning bar passes; one blink per field | Field row appears | Reader lamp cool while scanning |
| `check` pass | Rule lamp → cool, steady | ✓ on the row | none |
| `check` flag | Rule lamp → warm; the card stays in place | Warm row + reason | Warm appears for the first time |
| `check` reject | Clamp closes, then the card retracts to the Reader (`travel`) | Struck-through value + retry tag | Rule lamp warm, then back to off |
| `retry` | Scanning bar passes again over only the failed field | Corrected value on a new row | Reader lamp cool |
| `route` | Dial steps through detents to the destination | Destination, confidence, reason | Router lamp cool |
| `write.delta` | Print head steps once per line | Draft streams | Writer lamp cool |
| `approve.request` | The sign-off key rises 2mm (`actuate`) | *Awaiting your sign-off* | Key ring → warm (steady, no pulse) |
| holding | Key depresses with hold progress | Ring fills | Warm intensifies slightly with progress |
| `approve.done` | Latch drops (`actuate`) | *Signed off 14:02* | Ring → fused; all lamps settle off-white |
| `deliver` | Both cards slide to the out tray | The output takes over the screen (2D) | Key light eases to the tray |

---

## 15. Sound design

- **Palette:** quiet, close-miked mechanical foley, synthesised with Tone.js (no audio files). Under it sits v1's dark ambient pad at a lower level, filtered darker. Off by default and opt-in, using the same toggle as v1.
- **Mix:** pad −24 dB, events −14 dB to −10 dB, sign-off swell −8 dB peak. Events are short and dry with a small, dark reverb.

| Event | Sound | Synthesis idea |
|---|---|---|
| Lid / card feed | Soft slide plus a felt thunk | Filtered noise sweep + low MembraneSynth |
| Field found | A tiny tick, pitch rising slightly per field | Short MetalSynth, very high damping |
| Check pass | Small relay click | Click from a short noise burst through a bandpass |
| Check flag | Two low warm tones, one after the other | Sine pair, a minor third apart, soft attack |
| Reject | Muted relay clunk | Low MembraneSynth + a short noise thud |
| Dial detent | One crisp click per step | MetalSynth tick, randomised ±3% pitch |
| Print line | Soft mechanical tick per line (not per token) | Noise burst through a highpass |
| Awaiting sign-off | Low warm hum, enters and holds | Filtered sawtooth, very quiet |
| Holding | Hum rises in pitch and brightness with progress | Filter cutoff + detune mapped to progress |
| Signed off | Solid latch, then v1's chord resolves | MembraneSynth hit + the pad chord at full |
| Deliver | Paper settles | Short filtered noise |

---

## 16. Storyboard

The home page is one pinned stage. **Scroll is the playhead** through a recorded real run: scrolling scrubs time, stopping pauses, and scrolling back rewinds. Every frame is derived from the run log, so it's always inspectable.

| # | Beat | Camera | Machine | Page and copy (draft) | Sound |
|---|---|---|---|---|---|
| 00 | **Arrival** | Establishing; the key light fades up from black over 1.6s | At rest, all lamps off | Header (name · *AI Engineer & Creative Developer* · Sound · Skip to work). Serif: *Real AI workflows, made visible.* Mono: *From incoming work to working result.* | Pad fades in (if sound is on) |
| 01 | **Origin** (one quiet line) | Slow push toward Intake | None | Serif, small: *In 2020 I spent my days in a hospital and my nights building my first client website. I've been automating the work I saw there ever since.* | none |
| 02 | **Choose a work order** | Inspection: Intake | Three cards rise from a rack; the referral is lit as featured | Three choices: **Clinic referral** (featured), **Agency brief**, **Inbound lead**. Mono note: *Made-up data · replay of a real run.* | Card lift clicks |
| 03 | **Read** | Inspection: Reader | Card feeds in; scanning bar passes | Fields appear one by one with dotted leaders | Ticks |
| 04 | **Check** (the judgment moment) | Inspection: Checker | Rule lamps light; one flag; one reject, retract and retry | *Missing: referrer phone* (flag). *Date of birth unreadable → re-read* (reject → retry → fixed). | Clicks, flag tones, clunk |
| 05 | **Route** | Inspection: Router | Dial steps to the destination | *Routed → Dermatology clinic · 0.93 · "persistent skin lesion" named by referrer* | Detents |
| 06 | **Draft** | Inspection: Writer | Print head writes the reply to the referrer | Streaming draft: an acknowledgement plus a request for the missing phone number | Line ticks |
| 07 | **Sign-off** (climax) | Frontal, low, at the key | Key rises; warm ring | Serif, large: *Nothing leaves without a human.* Key: *Hold to approve.* | Hum rising, latch, chord |
| 08 | **Delivered** | Top-down to the tray, then the 2D output takes over | Cards in the tray | The structured record and the reply set large. Mono summary: *6.2s · 9 fields · 3 checks · 1 flag · 1 retry · 1 human approval.* Actions: **Inspect any step**, **Run it live**, **Try another work order**. | Paper settles |
| 09 | **Selected work** | Camera pulls back; the machine dims | At rest | Projects listed; each opens its Exploded View | none |
| 10 | **Working together** | none | none | IELTS 8.0, time zone, how you work with studios, testimonial, contact | none |

- **Copy tone:** short, declarative and specific. Serif lines are the human talking; mono is the machine reporting. No hype words ("revolutionary", "cutting-edge", "magic").
- **Safety line:** shown once near the work order choice: *Admin automation only. It routes and drafts; it never diagnoses. All records are made up.*

---

## 17. The three work orders

| | **Clinic referral** (featured) | **Agency brief** | **Inbound lead** |
|---|---|---|---|
| **Input** | A messy referral letter from a GP practice (made up) | An email brief from a studio | A website contact form |
| **Read** | Patient (fake), date of birth, referrer, referrer contact, reason as written, urgency *as stated by the referrer*, requested specialty, attachments | Client, deliverables, deadline, budget range, stack hints | Company, need, size, timeline, budget |
| **Check** | Required fields present; date of birth valid; referrer contact present (**flag**); unreadable date (**reject → retry**); a stated urgency is **flagged for a human**, never judged by the AI | Deadline realism (**flag** if too short); budget missing (**flag**) | Spam or off-topic (**reject**, run ends early, which is also a real outcome) |
| **Route** | The specialty clinic's intake queue | Design / Build / AI | Fit: strong / maybe / not now |
| **Draft** | Acknowledgement to the referrer plus a request for the missing information | Scoped proposal outline | A personal reply |
| **Sign-off by** | Clinic admin staff | You (the freelancer) | You |
| **Shows** | Judgment, safety, a human in the loop | That agencies can see themselves in it | That not every run should continue |

**Medical safety rules:** admin only. The machine extracts, checks, routes and drafts. It never diagnoses, triages clinically, or suggests treatment. Urgency is only *what the referrer wrote*, flagged for a human. All records are made up and labelled as such. Live runs use preset inputs only, so nobody can type real health details.

---

## 18. Exploded View (case studies)

The same machine, opened for inspection. Each project's **real** architecture is drawn with the machine's own parts library.

- **Opening frame:** the project's system as one assembled unit on the plinth, under the same key light. It has the project's name engraved on its faceplate.
- **Scroll 1, explode:** parts separate along clean axes (up and out, never spinning) to reveal the layers.
  - Thin off-white technical linework appears: dimension lines, axis lines, and numbered callout balloons in mono.
  - Each part is labelled with the **real** service: *Next.js app*, *API route*, *Queue*, *LLM (structured output)*, *Postgres*, *Vector index*, *Human review*.
- **Scroll 2, flow:**
  - A cool light travels through machined channels between parts in the order a real request moves.
  - Warm marks where a human is involved.
  - The light travels along the real connections only, never decoratively.
- **Scroll 3, reassemble:** the parts come back together, and a screen module shows the running product (a real screen recording or screenshot).
- **Below the stage:** a spec sheet in the page's type.
  - Credits: role · agency · client · year.
  - **Problem → Approach → Result.**
  - Stack, constraints, what you personally built.
  - "Private NDA work available on request."
- **Rules (from the review):**
  - Show relationships (what calls what, where data persists), not floating labelled slabs.
  - Never add a queue or vector index to fill the composition.
  - If a project is simple, the drawing is simple.

---

## 19. Mobile

Mobile isn't a shrunken diorama.

- **The line turns vertical:** the stations stack top to bottom and the card travels *down*. The camera is a fixed elevated three-quarter view that tracks down with the card.
- **Readouts:** full-width panels below the stage, one station at a time.
- **Sign-off:** a full-width hold key at thumb height.
- **Cost:** device pixel ratio capped at 1.5, no depth of field, simpler contact shadows, and bloom only on lit lamps.

---

## 20. Reduced motion and no WebGL (planned, polish later)

- **Reduced motion:**
  - The camera *cuts* between named shots instead of moving.
  - Parts jump to their end states.
  - Readouts still fill in, but instantly.
  - Hold-to-approve becomes a single press.
- **No WebGL:** a still render of each station (exported from the scene at build time) with the same readouts and run bar. The story still works as an annotated sequence.

---

## 21. Implementation

### 21.1 Stack and what carries over from v1
- **Stack:** Next.js 16 (App Router, Cache Components), React 19, React Three Fiber + drei + three, @react-three/postprocessing, GSAP (already installed; use timelines for actuations), Lenis, Tone.js, AI SDK with Vercel AI Gateway, zod.
- **Kept from v1:**
  - the layout-level `Background` (the canvas survives page changes)
  - routes `/work/[slug]` and `/about`
  - the chapter index, skip to work and welcome back
  - the sound toggle
  - the guide API guardrails (moved to the run route)
  - `HoldToMerge`, which becomes `SignOff`
  - the fonts and colour tokens
- **Removed:** `Organism.tsx`, `shaders.ts`, `targets.ts` and v1's scene copy.

### 21.2 File structure
```
components/machine/
  Stage.tsx            Canvas, camera rig, lighting, post-processing
  Machine.tsx          The line: plinth + stations; reads the run state each frame
  parts/               RoundedBody, Chamfer, Lamp, Dial, Clamp, Gantry, PrintHead, Key, Card, Tray, Roller
  stations/            Intake, Reader, Checker, Router, Writer, SignOff, OutTray
  materials.ts         One instance of each material (section 9)
  lighting.tsx         Lightformer environment, key, rim, fill
  shots.ts             Named camera shots + transitions
components/readouts/   DOM panels anchored to stations; RunBar; SignOffKey
components/exploded/   ExplodedView, Module, Channel, Callout
lib/run/
  events.ts            RunEvent types + zod schema
  state.ts             stateAt(run, t): the pure function from time → machine + readout state
  recordings/*.json    Recorded real runs (made-up inputs)
lib/pipeline/          The real automation (read, check, route, draft), shared by recorder + live route
content/work-orders.ts The three preset inputs
app/api/run/route.ts   Live run: streams RunEvents from the pipeline
scripts/record-run.ts  Runs the pipeline once and saves a recording
```

### 21.3 One event log drives everything
```ts
type RunEvent =
  | { t: number; type: "run.start"; order: "referral" | "brief" | "lead" }
  | { t: number; type: "read.field"; key: string; label: string; value: string }
  | { t: number; type: "check"; rule: string; result: "pass" | "flag" | "reject"; note?: string }
  | { t: number; type: "retry"; attempt: number; key: string }
  | { t: number; type: "route"; destination: string; confidence: number; reason: string }
  | { t: number; type: "write.delta"; text: string }
  | { t: number; type: "approve.request" }
  | { t: number; type: "approve.done" }
  | { t: number; type: "deliver"; record: Record<string, string>; reply: string };
```
- **`stateAt(run, t)`** is a pure function: it gives the pose of every part, every lamp state and every readout row at time `t`. Scrubbing, pausing, rewinding and replay are therefore free and deterministic. It gets an assert-based self-check.
- **Replay** feeds a recorded log. **Live** feeds events as they stream from `/api/run`. Same renderer, same look.

### 21.4 The pipeline
- **Steps:** read (AI structured output validated by a zod schema), check (plain code rules; the AI doesn't judge itself), route (AI classification with a confidence and a short reason), draft (streamed text), approve (waits for the client), deliver.
- **Retry on reject:** the failed field is re-read once with the validation error in the prompt. If it still fails, the run is flagged for a human.
- Check the AI SDK's structured-output API against the installed docs in `node_modules/ai/docs/` before writing it.

### 21.5 Live-run guardrails
- Preset inputs only (no free text).
- No tools with outside side effects.
- Every AI output is validated against its schema.
- Limits: Redis rate limit (Vercel Marketplace), AI Gateway monthly spending cap, 20s timeout, BotID.
- **Any failure falls back to the labelled replay.**

### 21.6 How the 3D is built
- **Geometry:** all procedural, from rounded and bevelled bodies (three's `RoundedBoxGeometry`, extruded shapes with bevels for chamfers). Repeated parts like lamps, rollers and fasteners are instanced.
- **Text on the machine:** engraved labels use drei `Text` (troika), with no font texture files.
- **Card print:** drawn on a canvas texture once per work order.
- **Rendering:** `frameloop="demand"`; the scene re-renders only when the run state, the camera or a hover changes.

### 21.7 Performance budget
| Item | Budget |
|---|---|
| Draw calls | ≤ 120 |
| Triangles | ≤ 250k |
| Shadow-casting lights | 1 (1024 map) |
| Image textures | 0 (canvas card print only) |
| Device pixel ratio | desktop [1, 1.75], mobile 1.5 |
| Frame rate | 60fps on a mid-range laptop, ≥ 30fps on a mid-range phone |
| JS for the stage | Loaded after the first paint; the header and headline render without it |

---

## 22. Milestones (this direction)

| Week | Work | Done when |
|---|---|---|
| 1 | Pipeline + event log + `stateAt` + recorder; the referral run shown as a **plain 2D replay** (readouts + run bar, no 3D) | The run is worth watching with no 3D at all |
| 2 | Look test: the **Checker** station (it has the most states) built in this direction *and* in the light direction, same event slice, side by side | You pick a direction from real renders |
| 3 | All seven stations, materials, lighting, camera shots, replay scrubbing | The featured run plays end to end and can be scrubbed |
| 4 | Sign-off key, sound, run bar, live run + guardrails | Live and replay look identical; the guardrails hold |
| 5 | Exploded View for the case studies | "Open the implementation" opens the machine up |
| 6 | Agency brief and lead runs, mobile vertical line, About, contact | Every work order and device type works |
| 7 | Accessibility, reduced motion and no-WebGL fallback, performance pass, 5-second test with agency people, launch | People say "builds real AI automations, beautifully made" |

---

## 23. Art director's checklist

Run this on every screen before it ships.

- [ ] **Squint test:** one focal point per frame. If two things compete, dim one.
- [ ] **Every light that's on means a state.** Point at any glow and name its event.
- [ ] Cool means working and warm means a human is needed, with no exceptions.
- [ ] **Every visible top edge has a diamond-cut chamfer** that catches the key light.
- [ ] Contact shadows under every part; nothing floats.
- [ ] **Nothing moves without an event.** Leave the page idle for 10 seconds: it should be perfectly still.
- [ ] No pure black or white; no colour outside the eight tokens.
- [ ] Text never crosses the machine's silhouette in the establishing shot.
- [ ] Readouts are legible at 1280×720, browser zoom 100%.
- [ ] Not Teenage Engineering: no coloured keycaps, no playful icons, no pastel.
- [ ] Not sci-fi: no scanlines, hex grids, neon or lens flares.
- [ ] The output gets more screen time than the mechanism.
- [ ] The healthcare run says "made up" and "admin only" where the visitor chooses it.
- [ ] Sound is off until the visitor turns it on.

---

## 24. Risks and open questions

| Risk | Mitigation |
|---|---|
| Looks like every other premium dark 3D site | The machine, the work order card and the inspectable run are the identity. Dark is only the room. Prove it in the week-2 look test. |
| Drifts toward Teenage Engineering | Graphite and aluminium only, and no coloured controls. Colour exists only as state light. |
| Too dark to read | Readouts sit on `--surface` panels; text contrast checked at WCAG AA in the accessibility pass. |
| The machine becomes the show and the output an afterthought | Storyboard beat 08 gives the output the full screen. Checklist item. |
| Live AI cost or downtime | Replay by default; live runs on request with a spending cap and a labelled fallback. |

**Still open (decide together):**
- The final name: WORKING ORDER is recommended.
- Whether the AI guide merges into the machine's input (asking a question becomes a work order). Recommended.
- The exact referral wording and the clinic names (content pass).
