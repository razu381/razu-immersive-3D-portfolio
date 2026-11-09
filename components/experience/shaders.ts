// Simplex noise by Ashima Arts / Stefan Gustavson (MIT), plus curl noise built from it.
const noise = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 snoise3(vec3 x) {
  return vec3(snoise(x), snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2)), snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4)));
}

vec3 curlNoise(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0), dy = vec3(0.0, e, 0.0), dz = vec3(0.0, 0.0, e);
  vec3 x0 = snoise3(p - dx), x1 = snoise3(p + dx);
  vec3 y0 = snoise3(p - dy), y1 = snoise3(p + dy);
  vec3 z0 = snoise3(p - dz), z1 = snoise3(p + dz);
  vec3 c = vec3(y1.z - y0.z - z1.y + z0.y, z1.x - z0.x - x1.z + x0.z, x1.y - x0.y - y1.x + y0.x);
  return c / max(length(c), 1e-4);
}
`;

// Spring toward the current target + curl-noise flow. Human particles: soft spring, strong flow (threads).
// Machine particles: stiff, critically damped spring, almost no flow (they lock into structure).
export const velocity = /* glsl */ `
uniform float uTime;
uniform float uDelta;
uniform float uSplit;
uniform float uMerge;
uniform float uCraft;
uniform float uWork;
uniform float uLine;
uniform float uThink;
uniform float uSpeak;
uniform float uVoice;
uniform float uScale;
uniform float uPointerActive;
uniform vec3 uPointer;
uniform vec3 uHumanCenter;
uniform vec3 uMachineCenter;
uniform sampler2D tSeed;
uniform sampler2D tGrid;
uniform sampler2D tSphere;
uniform sampler2D tCraft;
uniform sampler2D tWork;
${noise}
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;
  vec4 seed = texture2D(tSeed, uv);
  float machine = seed.w;
  float breath = 0.5 + 0.5 * sin(uTime * 1.4); // ~4.5 s breathing cycle

  vec3 signalT = seed.xyz * (0.06 + 0.03 * breath) + uPointer * 0.06 * uPointerActive;
  // A loose shell rather than a filled ball, so the threads read instead of a blown-out core.
  vec3 humanT = uHumanCenter + normalize(seed.xyz + 1e-4) * (0.7 + 0.3 * length(seed.xyz)) * vec3(1.1, 1.4, 0.9) * uScale;
  vec3 machineT = uMachineCenter + rotY(uTime * 0.12 + 0.6) * texture2D(tGrid, uv).xyz * uScale;
  vec3 mergeT = (rotY(uTime * 0.06) * texture2D(tSphere, uv).xyz * (1.0 + 0.05 * breath) + vec3(0.0, 0.35, 0.0)) * uScale; // sits above the headline
  // Craft: the lattice becomes interface panels, the threads orbit around them as a band.
  float a = atan(seed.z, seed.x) + uTime * 0.15;
  float ring = 1.9 + seed.y * 0.25;
  vec3 craftHuman = vec3(cos(a) * ring, sin(a) * ring * 0.6 + seed.y * 0.1, sin(a) * 0.7);
  vec3 craftMachine = rotY(sin(uTime * 0.2) * 0.25) * texture2D(tCraft, uv).xyz;
  vec3 craftT = mix(craftHuman, craftMachine, machine) * uScale;
  vec3 workT = (texture2D(tWork, uv).xyz + vec3(0.0, 0.3, 0.0)) * uScale;
  vec3 lineT = vec3(seed.x * 2.8, 0.55 + seed.y * 0.015, seed.z * 0.05) * uScale;

  vec3 target = mix(signalT, mix(humanT, machineT, machine), uSplit);
  target = mix(target, craftT, uCraft);
  target = mix(target, mergeT, uMerge);
  target = mix(target, workT, uWork);
  target = mix(target, lineT, uLine);
  // Guide states: speech and the visitor's voice send ripples through the form.
  float ripple = sin(length(target.xy) * 7.0 - uTime * 8.0);
  target += normalize(target + 1e-4) * ripple * (uSpeak * 0.04 + uVoice * 0.14);

  float shaped = max(uSplit, uMerge);
  float stiffness = mix(5.0, mix(0.7, 9.0, machine), shaped);
  stiffness = mix(stiffness, mix(1.8, 9.0, machine), uCraft);
  stiffness = mix(stiffness, mix(5.0, 8.0, machine), uWork);
  stiffness = mix(stiffness, 4.0, uLine) + uThink * 2.0; // thinking: threads tighten
  float flow = mix(0.35, mix(2.6, 0.05, machine), shaped);
  flow = mix(flow, mix(1.2, 0.03, machine), uCraft);
  flow = mix(flow, 0.06, uWork);
  flow = mix(flow, 0.1, uLine) + sin(uLine * 3.14159) * 2.2 + uThink * 0.8; // a tangle mid-way that resolves into the line
  vec3 curl = curlNoise(pos * 0.8 + vec3(0.0, 0.0, uTime * 0.07));
  vec3 n = normalize(pos + 1e-4);
  curl = mix(curl, curl - n * dot(curl, n), uMerge); // threads glide along the merged surface

  vec3 toPointer = uPointer - pos;
  vec3 lean = toPointer * exp(-dot(toPointer, toPointer) * 1.5) * uPointerActive * (1.0 - 0.85 * machine);

  vec3 force = (target - pos) * stiffness + curl * flow + lean * 2.0;
  vel += force * uDelta;
  vel *= exp(-2.0 * sqrt(stiffness) * mix(0.75, 1.0, machine) * uDelta);
  gl_FragColor = vec4(vel, 1.0);
}
`;

export const position = /* glsl */ `
uniform float uDelta;
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  gl_FragColor = vec4(texture2D(texturePosition, uv).xyz + texture2D(textureVelocity, uv).xyz * uDelta, 1.0);
}
`;

// Render shaders read particle state from the simulation textures; position.xy = texture lookup, position.z = 0 head / 1 tail.
const colorize = /* glsl */ `
uniform sampler2D tPos;
uniform sampler2D tVel;
uniform sampler2D tSeed;
uniform float uMerge;
uniform float uWork;
uniform float uLine;
uniform sampler2D tWorkColor;
uniform float uGlow;
uniform vec3 uHuman;
uniform vec3 uMachine;
uniform vec3 uFused;
varying vec3 vColor;
varying float vAlpha;
`;

export const pointVertex = /* glsl */ `
${colorize}
uniform float uSize;
void main() {
  vec3 pos = texture2D(tPos, position.xy).xyz;
  float machine = texture2D(tSeed, position.xy).w;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * mix(0.7, 1.3, machine) / -mv.z;
  vColor = mix(mix(mix(uHuman, uMachine, machine), uFused, uMerge * 0.5), texture2D(tWorkColor, position.xy).rgb, uWork * (1.0 - uLine));
  vAlpha = mix(0.05, 0.16, machine) * (1.0 - 0.6 * uWork * (1.0 - uLine)) * (1.0 + 0.6 * uGlow); // dense glyphs blow out otherwise
}
`;

export const pointFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.0, d));
}
`;

export const lineVertex = /* glsl */ `
${colorize}
uniform float uTrail;
void main() {
  vec3 vel = texture2D(tVel, position.xy).xyz;
  vec3 pos = texture2D(tPos, position.xy).xyz - vel * uTrail * position.z;
  float machine = texture2D(tSeed, position.xy).w;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  vColor = mix(mix(mix(uHuman, uMachine, machine), uFused, uMerge * 0.5), texture2D(tWorkColor, position.xy).rgb, uWork * (1.0 - uLine));
  vAlpha = (1.0 - position.z) * clamp(length(vel) * 0.6, 0.0, 1.0) * mix(0.35, 0.05, machine) * (1.0 + 0.6 * uGlow);
}
`;

export const lineFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() { gl_FragColor = vec4(vColor, vAlpha); }
`;
