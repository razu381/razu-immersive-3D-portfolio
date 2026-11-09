// Shared between the DOM overlay and the WebGL scene; read every frame, so it's a plain object, not React state.
export const experience = {
  split: 0, // 0 = one point of light, 1 = two strands
  craft: 0, // 1 = machine forms interface panels, threads wrap them
  merge: 0, // 0..1, driven by press-and-hold; 1 = locked
  inMergeZone: false,
  work: 0, // 1 = organism forms the current project
  project: 0,
  line: 0, // 1 = everything resolves into one clean line
  pointer: { x: 0, y: 0, active: 0 }, // normalized device coordinates
  guideReady: false, // the guide is introduced in scene 04, then stays on every page
  thinking: 0, // guide states: 1 while waiting for a reply
  speaking: 0, // 1 while a reply streams in or is read aloud
  voice: 0, // 0..1 microphone level while listening
};
