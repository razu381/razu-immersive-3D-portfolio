import * as Tone from "tone";
import { experience } from "@/components/experience/state";
import { machine } from "@/components/machine/state";
import { waitTime } from "@/lib/run/state";

// Generative ambient bed: a slow sine pad on the breathing cycle plus soft pink noise.
// The low-pass filter opens as the story progresses, so the merge swells.
const CHORDS = [
  ["C3", "G3", "D4"],
  ["A2", "E3", "B3"],
  ["F2", "C3", "G3"],
  ["G2", "D3", "A3"],
];

let built = false;
let filter: Tone.Filter;

function build() {
  const reverb = new Tone.Reverb({ decay: 8, wet: 0.6 }).toDestination();
  filter = new Tone.Filter(300, "lowpass").connect(reverb);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 3, decay: 1, sustain: 0.6, release: 6 },
  }).connect(filter);
  pad.volume.value = -14;
  const noise = new Tone.Noise("pink").connect(new Tone.Filter(900, "bandpass").connect(reverb));
  noise.volume.value = -34;
  noise.start();

  let i = 0;
  new Tone.Loop((time) => pad.triggerAttackRelease(CHORDS[i++ % CHORDS.length], 4, time), 4.5).start(0);
  Tone.getTransport().start();
  setInterval(() => {
    const progress = machine.t / Math.max(1, waitTime(machine.run)) + (machine.approved ? 0.6 : 0) + 0.4 * experience.speaking;
    filter.frequency.rampTo(300 + 900 * Math.min(progress, 1.6), 0.6);
  }, 250);
  built = true;
}

export async function setSound(on: boolean) {
  if (on) {
    await Tone.start(); // must run inside a click (browser autoplay rule)
    if (!built) build();
  }
  Tone.getDestination().volume.rampTo(on ? -8 : -Infinity, on ? 2 : 1);
}
