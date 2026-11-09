// Particle targets, packed as RGBA float data for size × size textures.

// Three layered "browser windows" (WordPress → frontend → full stack) as line segments [x1, y1, x2, y2, z].
function panelSegments() {
  const segs: number[][] = [];
  const line = (x1: number, y1: number, x2: number, y2: number, z: number) => segs.push([x1, y1, x2, y2, z]);
  const rect = (l: number, t: number, r: number, b: number, z: number) => {
    line(l, t, r, t, z);
    line(r, t, r, b, z);
    line(r, b, l, b, z);
    line(l, b, l, t, z);
  };
  [
    [-0.55, 0.32, -0.5],
    [0, 0, 0],
    [0.55, -0.32, 0.5],
  ].forEach(([cx, cy, z], k) => {
    const L = cx - 0.8, R = cx + 0.8, T = cy + 0.52, B = cy - 0.52;
    rect(L, T, R, B, z);
    line(L, T - 0.12, R, T - 0.12, z); // title bar
    if (k === 0) {
      line(L + 0.1, T - 0.25, L + 0.7, T - 0.25, z);
      for (let j = 0; j < 4; j++) line(L + 0.1, T - 0.4 - j * 0.1, L + 0.9 - j * 0.12, T - 0.4 - j * 0.1, z);
      rect(R - 0.55, T - 0.22, R - 0.1, B + 0.1, z); // image block
    } else if (k === 1) {
      line(L + 0.1, T - 0.25, L + 0.9, T - 0.25, z);
      for (let c = 0; c < 3; c++) rect(L + 0.1 + c * 0.5, B + 0.55, L + 0.5 + c * 0.5, B + 0.1, z); // component cards
    } else {
      for (let j = 0; j < 6; j++) line(L + 0.1 + (j % 3) * 0.12, T - 0.24 - j * 0.11, R - 0.2 - (j % 2) * 0.3, T - 0.24 - j * 0.11, z); // code
    }
  });
  return segs;
}

export function makeTargets(size: number) {
  const count = size * size;
  const seed = new Float32Array(count * 4); // xyz: random point in the unit ball, w: 1 = machine strand
  const grid = new Float32Array(count * 4); // machine: points along the edges of a cube lattice
  const sphere = new Float32Array(count * 4); // merge: Fibonacci sphere, unit radius
  const craft = new Float32Array(count * 4); // machine: points along the interface panels
  const cells = 5;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const snap = () => (Math.floor(Math.random() * (cells + 1)) / cells) * 2 - 1;

  const segs = panelSegments();
  const cumulative: number[] = [];
  let total = 0;
  for (const [x1, y1, x2, y2] of segs) cumulative.push((total += Math.hypot(x2 - x1, y2 - y1)));

  for (let i = 0; i < count; i++) {
    const o = i * 4;
    let x, y, z;
    do {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
      z = Math.random() * 2 - 1;
    } while (x * x + y * y + z * z > 1);
    seed.set([x, y, z, i % 2], o);

    // Two coordinates snap to the lattice, the third is quantised along the edge: reads as precise structure.
    const a = snap();
    const b = snap();
    const t = (Math.round(Math.random() * 48) / 48) * 2 - 1;
    const axis = i % 3;
    grid.set(axis === 0 ? [t, a, b, 1] : axis === 1 ? [a, t, b, 1] : [a, b, t, 1], o);
    grid[o] *= 0.8;
    grid[o + 1] *= 0.8;
    grid[o + 2] *= 0.8;

    const fy = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - fy * fy);
    sphere.set([Math.cos(golden * i) * r, fy, Math.sin(golden * i) * r, 1], o);

    const pick = Math.random() * total;
    const [x1, y1, x2, y2, sz] = segs[cumulative.findIndex((c) => c >= pick)];
    const u = Math.random();
    craft.set([x1 + (x2 - x1) * u, y1 + (y2 - y1) * u, sz, 1], o);
  }

  if (process.env.NODE_ENV !== "production") {
    const last = (count - 1) * 4;
    console.assert(
      Math.abs(Math.hypot(sphere[last], sphere[last + 1], sphere[last + 2]) - 1) < 1e-5 &&
        grid.every((v) => Math.abs(v) <= 1) &&
        craft.every((v) => Math.abs(v) <= 1.6) &&
        seed.every((v, k) => (k % 4 === 3 ? v === 0 || v === 1 : Math.abs(v) <= 1)),
      "makeTargets: target out of range",
    );
  }
  return { seed, grid, sphere, craft };
}

// Turns a picture (a project hero image, or its title drawn as text) into particle positions + colours.
// Brighter pixels attract more particles and sit slightly forward.
export function sampleCanvas(canvas: HTMLCanvasElement, size: number, width = 3.6) {
  const { width: w, height: h } = canvas;
  const px = canvas.getContext("2d")!.getImageData(0, 0, w, h).data;
  const lit: number[] = [];
  for (let i = 0; i < w * h; i++) if (px[i * 4 + 3] > 20 && px[i * 4] + px[i * 4 + 1] + px[i * 4 + 2] > 60) lit.push(i);

  const count = size * size;
  const pos = new Float32Array(count * 4);
  const color = new Float32Array(count * 4);
  for (let k = 0; k < count; k++) {
    let i = 0;
    let bright = 0;
    for (let tries = 0; tries < 8; tries++) {
      i = lit[Math.floor(Math.random() * lit.length)] ?? 0;
      bright = (px[i * 4] + px[i * 4 + 1] + px[i * 4 + 2]) / 765;
      if (Math.random() < bright) break;
    }
    const x = (((i % w) + Math.random()) / w - 0.5) * width;
    const y = (0.5 - (Math.floor(i / w) + Math.random()) / h) * width * (h / w);
    pos.set([x, y, bright * 0.25, 1], k * 4);
    color.set([px[i * 4] / 255, px[i * 4 + 1] / 255, px[i * 4 + 2] / 255, 1], k * 4);
  }
  return { pos, color };
}
