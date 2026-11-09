"use client";

import { Environment, Lightformer, MeshReflectorMaterial, MeshTransmissionMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { canvasText, cssFont, span, useSequenceTime } from "../timeline";

// The work order as a beam of light. A prism splits it into the fields the model extracts;
// each lands on a glass card as projected text. A filter stops the value that fails its check.
const FIELDS = [
  { label: "PATIENT", value: "Clara Benning" },
  { label: "DATE OF BIRTH", value: "12/O3/1986", fixed: "1986-03-12" },
  { label: "PATIENT REF", value: "WFP-20417" },
  { label: "SPECIALTY", value: "Dermatology" },
  { label: "REFERRER", value: "Dr H. Okafor" },
  { label: "URGENCY · AS STATED", value: "Earlier appointment", flag: "FOR STAFF TO DECIDE" },
];
const Y = 0.62;
const SOURCE = new THREE.Vector3(-4.0, Y, 0);
const PRISM = new THREE.Vector3(-1.05, Y, 0);
const EXIT = new THREE.Vector3(-0.8, Y, 0);
const COOL = new THREE.Color("#bdebff");
const WARM = new THREE.Color("#ffb070");
const DOB = 1;
const FIX_AT = 6.4;

// A thin, bright core inside a faint haze, growing from a to b.
function beam(a: THREE.Vector3, b: THREE.Vector3, color: THREE.Color) {
  const dir = b.clone().sub(a);
  const length = dir.length();
  const group = new THREE.Group();
  group.position.copy(a);
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  const core = new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(3), toneMapped: false, transparent: true });
  const haze = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.07,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const geometries = [new THREE.CylinderGeometry(0.006, 0.006, 1, 8), new THREE.CylinderGeometry(0.045, 0.045, 1, 16, 1, true)];
  geometries.forEach((g) => g.translate(0, 0.5, 0));
  group.add(new THREE.Mesh(geometries[0], core), new THREE.Mesh(geometries[1], haze));
  return {
    group,
    set(progress: number, tint: THREE.Color = color) {
      group.visible = progress > 0.001;
      group.scale.set(1, Math.max(progress, 0.0001) * length, 1);
      core.color.copy(tint).multiplyScalar(3);
      haze.color.copy(tint);
    },
    dispose() {
      geometries.forEach((g) => g.dispose());
      core.dispose();
      haze.dispose();
    },
  };
}

// A frosted glass card on a stand; its text is projected light, typed in as the beam arrives.
function card(field: (typeof FIELDS)[number], at: THREE.Vector3) {
  const group = new THREE.Group();
  group.position.copy(at);
  group.lookAt(0.2, 3.4, 6.4); // turned toward the viewer, so the projected text reads
  const glass = new THREE.MeshPhysicalMaterial({ color: "#0e171b", roughness: 0.3, transparent: true, opacity: 0.6, clearcoat: 1 });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.62, 0.02), glass);
  const stand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, at.y - 0.31, 8),
    new THREE.MeshStandardMaterial({ color: "#1e2124", metalness: 0.8, roughness: 0.4 }),
  );
  stand.position.y = -(at.y - 0.31) / 2 - 0.31;
  const canvas = canvasText(768, 448, () => {});
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const light = new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false, depthWrite: false });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.62), light);
  face.position.z = 0.012;
  group.add(panel, stand, face);
  let drawn = "";
  return {
    group,
    // shown: 0..1 typed; state picks colour and the line under the value.
    set(shown: number, state: "cool" | "rejected" | "fixed" | "flag") {
      const value = state === "fixed" ? field.fixed! : field.value;
      const chars = Math.round(shown * value.length);
      const key = `${chars}|${state}`;
      light.opacity = Math.min(1, shown * 3);
      if (key === drawn) return;
      drawn = key;
      const ctx = canvas.getContext("2d")!;
      const mono = cssFont("--font-geist-mono");
      const warm = state === "rejected" || state === "flag";
      ctx.clearRect(0, 0, 768, 448);
      ctx.fillStyle = warm ? "#ffb070" : "#bdebff";
      ctx.font = `26px ${mono}`;
      ctx.fillText(field.label, 48, 92);
      ctx.font = `54px ${mono}`;
      ctx.fillStyle = warm ? "#ffd3a8" : "#e6f7ff";
      ctx.fillText(value.slice(0, chars), 48, 230);
      if (state === "rejected" && chars === value.length) {
        ctx.fillRect(44, 212, ctx.measureText(value).width + 8, 4);
        ctx.font = `24px ${mono}`;
        ctx.fillText("REJECTED · NOT A DATE · RE-READING", 48, 330);
      }
      if (state === "flag" && chars === value.length) {
        ctx.font = `24px ${mono}`;
        ctx.fillText(field.flag!, 48, 330);
      }
      texture.needsUpdate = true;
    },
    dispose() {
      [panel.geometry, stand.geometry, face.geometry].forEach((g) => g.dispose());
      [glass, stand.material as THREE.Material, light].forEach((m) => m.dispose());
      texture.dispose();
    },
  };
}

function build() {
  const group = new THREE.Group();
  const parts: { dispose(): void }[] = [];

  // The source: a dark housing with a bright aperture.
  const housingMat = new THREE.MeshStandardMaterial({ color: "#1b1d20", metalness: 0.85, roughness: 0.35 });
  const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.55, 32), housingMat);
  housing.rotation.z = Math.PI / 2;
  housing.position.copy(SOURCE).x -= 0.27;
  const apertureMat = new THREE.MeshBasicMaterial({ color: COOL, toneMapped: false });
  const aperture = new THREE.Mesh(new THREE.CircleGeometry(0.035, 24), apertureMat);
  aperture.position.copy(SOURCE).x += 0.005;
  aperture.rotation.y = Math.PI / 2;
  group.add(housing, aperture);

  const main = beam(SOURCE, PRISM, COOL);
  group.add(main.group);
  parts.push(main);
  const prismLight = new THREE.PointLight("#bdebff", 0, 4, 2);
  prismLight.position.copy(PRISM);
  group.add(prismLight);

  // Fields fan out horizontally, the way a real prism disperses light.
  const cards = FIELDS.map((f, i) => {
    const angle = THREE.MathUtils.degToRad(-42 + (84 * i) / (FIELDS.length - 1));
    const at = new THREE.Vector3(EXIT.x + Math.cos(angle) * 4.1, Y + 0.22, Math.sin(angle) * 4.1);
    const target = at.clone().setY(Y + 0.22);
    const c = card(f, at);
    const b = beam(EXIT, target, COOL);
    group.add(c.group, b.group);
    parts.push(c, b);
    return { c, b, at: target };
  });

  // The filter that stops the bad date: a small square of amber glass on the date's beam.
  const dob = cards[DOB];
  const filterAt = EXIT.clone().lerp(dob.at, 0.55);
  const filterMat = new THREE.MeshPhysicalMaterial({ color: "#ffb070", roughness: 0.15, transparent: true, opacity: 0.45, clearcoat: 1 });
  const filter = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.26, 0.26), filterMat);
  filter.position.copy(filterAt);
  filter.lookAt(EXIT.x, filterAt.y, EXIT.z);
  filter.rotateY(Math.PI / 2);
  group.add(filter);
  const past = beam(filterAt, dob.at, WARM);
  group.add(past.group);
  parts.push(past);

  const timing = (i: number) => 2.3 + i * 0.38;
  return {
    group,
    update(t: number) {
      apertureMat.color.copy(COOL).multiplyScalar(0.2 + 2.6 * span(t, 0.3, 1.0));
      main.set(span(t, 1.0, 1.8));
      prismLight.intensity = 3 * span(t, 1.7, 2.3);

      cards.forEach(({ c, b }, i) => {
        const start = timing(i);
        const reach = span(t, start, start + 0.7);
        if (i === DOB) {
          // Up to the filter cool; past it warm until the value is re-read, then the filter lifts.
          const fixedNow = t >= FIX_AT;
          b.set(Math.min(reach, fixedNow ? reach : 0.55));
          past.set(fixedNow ? span(t, FIX_AT, FIX_AT + 0.4) : Math.max(0, (reach - 0.55) / 0.45), fixedNow ? COOL : WARM);
          filterMat.opacity = 0.45 * span(t, start + 0.2, start + 0.5) * (1 - span(t, FIX_AT - 0.3, FIX_AT + 0.3));
          if (fixedNow) c.set(span(t, FIX_AT + 0.3, FIX_AT + 1.0), "fixed");
          else c.set(span(t, start + 0.6, start + 1.3), "rejected");
          return;
        }
        b.set(reach);
        c.set(span(t, start + 0.6, start + 1.3), i === FIELDS.length - 1 ? "flag" : "cool");
      });
    },
    dispose() {
      parts.forEach((p) => p.dispose());
      [housing.geometry, aperture.geometry, filter.geometry].forEach((g) => g.dispose());
      [housingMat, apertureMat, filterMat].forEach((m) => m.dispose());
    },
  };
}

function Sequence({ replay }: { replay: number }) {
  const scene = useMemo(() => build(), []);
  const time = useSequenceTime(replay);
  useEffect(() => () => scene.dispose(), [scene]);
  useFrame(({ clock }) => scene.update(time(clock)));
  return <primitive object={scene.group} />;
}

export default function OpticsScene({ replay }: { replay: number }) {
  const [fontsReady, setFontsReady] = useState(false); // card text uses the page's mono face
  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      gl={{ antialias: false }}
      camera={{ position: [0.2, 3.4, 6.4], fov: 32 }}
      onCreated={({ camera }) => camera.lookAt(0.6, 0.35, 0)}
    >
      <color attach="background" args={["#060708"]} />
      <fog attach="fog" args={["#060708", 7, 16]} />
      <ambientLight intensity={0.05} />
      <spotLight position={[-3, 5, 4]} angle={0.6} penumbra={1} intensity={30} color="#ffcf9a" />
      {/* Strip lights for the glass to catch: its edges are what make it read as a prism. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.5} position={[-2, 3, 3]} scale={[0.3, 4, 1]} target={[-1, 0.6, 0]} />
        <Lightformer form="rect" intensity={1.5} color="#bdebff" position={[2, 2, -3]} scale={[4, 0.3, 1]} target={[-1, 0.6, 0]} />
        <Lightformer form="rect" intensity={1} color="#ffd9b0" position={[0, 5, 0]} scale={[3, 3, 1]} target={[-1, 0.6, 0]} />
      </Environment>

      {/* The prism: real refraction, with a touch of chromatic aberration at the edges. */}
      <mesh position={PRISM} rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 1.0, 3]} />
        <MeshTransmissionMaterial
          samples={6}
          resolution={512}
          thickness={0.7}
          chromaticAberration={0.12}
          anisotropy={0.2}
          distortion={0}
          ior={1.5}
          roughness={0.02}
          backside
          backsideThickness={0.3}
          color="#f4fbff"
        />
      </mesh>
      {fontsReady && <Sequence replay={replay} />}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <MeshReflectorMaterial
          blur={[300, 90]}
          resolution={512}
          mixBlur={1}
          mixStrength={5}
          roughness={0.9}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#060708"
          metalness={0.5}
          mirror={0}
        />
      </mesh>

      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={1} intensity={0.9} radius={0.7} />
        <ToneMapping mode={ToneMappingMode.AGX} />
        <Noise opacity={0.035} />
        <Vignette darkness={0.6} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}
