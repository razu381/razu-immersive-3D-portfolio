"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { FontLoader, type Font } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { span, travel, useSequenceTime } from "../timeline";

// The real referral letter, set in metal type. Marked phrases are what the model extracts.
type Key = "patient" | "dob" | "ref" | "referrer" | "specialty" | "urgency";
const LETTER: (string | [string, Key])[][] = [
  ["WESTBROOK FAMILY PRACTICE"],
  ["To:", ["Dermatology", "specialty"], "Outpatients, St Anne's Clinic"],
  ["Re: Ms", ["Clara Benning", "patient"], " DOB", ["12/O3/1986", "dob"], " Ref", ["WFP-20417", "ref"]],
  ["Dear colleague,"],
  ["I would be grateful if you could see Ms Benning, who has"],
  ["had a persistent itchy rash on both forearms for three months."],
  ["She would appreciate an", ["earlier appointment", "urgency"], "if at all possible."],
  ["Kind regards,", ["Dr H. Okafor", "referrer"]],
];
const RECORD: { key: Key; label: string }[] = [
  { key: "patient", label: "PATIENT" },
  { key: "dob", label: "DATE OF BIRTH" },
  { key: "ref", label: "PATIENT REF" },
  { key: "referrer", label: "REFERRER" },
  { key: "specialty", label: "SPECIALTY" },
  { key: "urgency", label: "URGENCY · AS STATED" },
];

const SIZE = 0.13;
const LINE = 0.3;
const LETTER_AT = new THREE.Matrix4().compose(
  new THREE.Vector3(-3.7, 1.75, -0.2),
  new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.1, 0.42, 0.015)),
  new THREE.Vector3(1, 1, 1),
);
const RECORD_AT = new THREE.Matrix4().compose(
  new THREE.Vector3(1.3, 1.35, 0.7),
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -0.2, 0)),
  new THREE.Vector3(1, 1, 1),
);
const ROW = 0.38;
const COOL = new THREE.Color("#bdebff");
const WARM = new THREE.Color("#ffb070");

function text(font: Font, value: string, size = SIZE, depth = 0.035) {
  const g = new TextGeometry(value, {
    font,
    size,
    depth,
    curveSegments: 5,
    bevelEnabled: depth > 0.01,
    bevelThickness: 0.006,
    bevelSize: 0.0035,
    bevelSegments: 2,
  });
  g.computeBoundingBox();
  return g;
}

// Builds the scene imperatively; update(t) poses everything for second t of the sequence.
function build(serif: Font, mono: Font) {
  const group = new THREE.Group();
  const letter = new THREE.Group();
  letter.applyMatrix4(LETTER_AT);
  group.add(letter);
  const letterMat = new THREE.MeshStandardMaterial({ color: "#d9d2c5", roughness: 0.42, metalness: 0.3, transparent: true });
  const labelMat = new THREE.MeshBasicMaterial({ color: "#8b8f96", transparent: true, opacity: 0 });
  const geometries: THREE.BufferGeometry[] = [];
  const space = ((serif.data.glyphs[" "]?.ha ?? 300) * SIZE) / serif.data.resolution;
  const lines: THREE.Mesh[][] = [];
  const phrases: { key: Key; mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; from: THREE.Vector3; line: number }[] = [];

  LETTER.forEach((segments, i) => {
    let x = 0;
    lines[i] = [];
    for (const seg of segments) {
      const [value, key] = typeof seg === "string" ? [seg, undefined] : seg;
      const words = key ? [value] : value.trim().split(/\s+/);
      for (const word of words) {
        const g = text(serif, word);
        geometries.push(g);
        const mat = key ? letterMat.clone() : letterMat;
        const mesh = new THREE.Mesh(g, mat);
        mesh.position.set(x, -i * LINE, 0);
        x += g.boundingBox!.max.x + space;
        if (key) {
          phrases.push({ key, mesh, mat: mat as THREE.MeshStandardMaterial, from: mesh.position.clone().applyMatrix4(LETTER_AT), line: i });
          group.add(mesh);
          mesh.applyMatrix4(LETTER_AT);
        } else {
          lines[i].push(mesh);
          letter.add(mesh);
        }
      }
    }
  });

  // The re-read value rises from where the bad one was.
  const dob = phrases.find((p) => p.key === "dob")!;
  const fixedMat = letterMat.clone();
  const fixed = new THREE.Mesh(text(serif, "1986-03-12"), fixedMat);
  geometries.push(fixed.geometry);
  group.add(fixed);

  RECORD.forEach((r, i) => {
    const g = text(mono, r.label, 0.055, 0.002);
    geometries.push(g);
    const mesh = new THREE.Mesh(g, labelMat);
    mesh.position.set(0, -i * ROW + 0.2, 0).applyMatrix4(RECORD_AT);
    mesh.quaternion.setFromRotationMatrix(RECORD_AT);
    group.add(mesh);
  });
  const noteMat = new THREE.MeshBasicMaterial({ color: WARM, transparent: true, opacity: 0 });
  const note = new THREE.Mesh(text(mono, "FOR STAFF TO DECIDE", 0.05, 0.002), noteMat);
  geometries.push(note.geometry);
  note.position.set(0, -RECORD.findIndex((r) => r.key === "urgency") * ROW - 0.12, 0).applyMatrix4(RECORD_AT);
  note.quaternion.setFromRotationMatrix(RECORD_AT);
  group.add(note);

  // The model reading: a thin line of cool light sweeping down the letter.
  const width = 5.2;
  const barMat = new THREE.MeshBasicMaterial({ color: COOL.clone().multiplyScalar(2.2), toneMapped: false, transparent: true });
  const bar = new THREE.Mesh(new THREE.PlaneGeometry(width, 0.008), barMat);
  geometries.push(bar.geometry);
  letter.add(bar);

  const letterQ = new THREE.Quaternion().setFromRotationMatrix(LETTER_AT);
  const recordQ = new THREE.Quaternion().setFromRotationMatrix(RECORD_AT);
  const slot = (key: Key) => new THREE.Vector3(0, -RECORD.findIndex((r) => r.key === key) * ROW, 0).applyMatrix4(RECORD_AT);
  const READ_FROM = 1.4;
  const READ_TO = 5.2;
  const liftAt = (line: number) => READ_FROM + ((line + 0.6) / LETTER.length) * (READ_TO - READ_FROM);
  const DOB_LAND = liftAt(dob.line) + 1.25;
  const END = READ_TO + 3.4;
  const tmp = new THREE.Vector3();
  const lift = new THREE.Vector3(0, 0, 0.25).applyQuaternion(letterQ);

  // Lift off the letter, arc toward the camera, and land in the record, turning upright.
  function fly(mesh: THREE.Mesh, from: THREE.Vector3, to: THREE.Vector3, start: number) {
    return (t: number) => {
      const l = span(t, start, start + 0.35);
      const f = travel(t, start + 0.35, start + 1.25);
      tmp.copy(from).addScaledVector(lift, l * (1 - f)).lerp(to, f);
      tmp.z += Math.sin(Math.PI * f) * 0.6;
      mesh.position.copy(tmp);
      mesh.quaternion.slerpQuaternions(letterQ, recordQ, f);
      mesh.scale.setScalar(1 + 0.22 * f);
      return { l, f };
    };
  }
  const flights = phrases.map((p) => fly(p.mesh, p.from, slot(p.key), liftAt(p.line)));
  const fixedFlight = fly(fixed, dob.from, slot("dob"), DOB_LAND + 0.9);

  return {
    group,
    update(t: number) {
      // The letter sets itself line by line, then steps back once the record is complete.
      const dim = 1 - 0.62 * span(t, END - 0.6, END + 0.8);
      letterMat.color.set("#d9d2c5").multiplyScalar(dim);
      lines.forEach((words, i) => {
        const a = span(t, 0.2 + i * 0.09, 1.0 + i * 0.09);
        for (const w of words) w.position.z = -0.3 * (1 - a);
      });
      letterMat.opacity = span(t, 0.2, 1.2);

      const r = span(t, READ_FROM, READ_TO);
      bar.position.set(width / 2 - 0.1, 0.2 - r * (LETTER.length * LINE), 0.02);
      barMat.opacity = span(t, READ_FROM - 0.2, READ_FROM) * (1 - span(t, READ_TO, READ_TO + 0.3));

      phrases.forEach((p, i) => {
        const { l, f } = flights[i](t);
        const landed = span(t, liftAt(p.line) + 1.25, liftAt(p.line) + 1.6);
        p.mat.opacity = letterMat.opacity;
        p.mat.color.set("#efe9df");
        // Cool while the model handles it; warm when a person is needed.
        const flagged = p.key === "urgency" ? landed : 0;
        const rejected = p.key === "dob" ? span(t, DOB_LAND + 0.3, DOB_LAND + 0.5) : 0;
        p.mat.emissive.copy(COOL).multiplyScalar(Math.max(l, f) * (1 - landed * 0.8) * 1.4);
        if (flagged || rejected) p.mat.emissive.copy(WARM).multiplyScalar(0.9);
        if (p.key === "dob") {
          const drop = span(t, DOB_LAND + 0.9, DOB_LAND + 1.6);
          p.mesh.position.y -= drop * 0.35;
          p.mesh.rotation.x += drop * 0.6;
          p.mat.opacity *= 1 - drop;
        }
      });

      const { l, f } = fixedFlight(t);
      fixedMat.opacity = span(t, DOB_LAND + 0.9, DOB_LAND + 1.2);
      fixedMat.color.set("#efe9df");
      fixedMat.emissive.copy(COOL).multiplyScalar(Math.max(l, f) * (1 - span(t, DOB_LAND + 2.15, DOB_LAND + 2.5) * 0.8) * 1.4);

      labelMat.opacity = span(t, READ_FROM + 0.6, READ_FROM + 1.4);
      noteMat.opacity = span(t, liftAt(LETTER.findIndex((s) => s.some((x) => typeof x !== "string" && x[1] === "urgency"))) + 1.3, END);
    },
    dispose() {
      geometries.forEach((g) => g.dispose());
      [letterMat, labelMat, noteMat, barMat, fixedMat, ...phrases.map((p) => p.mat)].forEach((m) => m.dispose());
    },
  };
}

function Sequence({ serif, mono, replay }: { serif: Font; mono: Font; replay: number }) {
  const scene = useMemo(() => build(serif, mono), [serif, mono]);
  const time = useSequenceTime(replay);
  useEffect(() => () => scene.dispose(), [scene]);
  useFrame(({ clock }) => scene.update(time(clock)));
  return <primitive object={scene.group} />;
}

export default function TypeScene({ replay }: { replay: number }) {
  const [fonts, setFonts] = useState<[Font, Font] | null>(null);
  useEffect(() => {
    const loader = new FontLoader();
    Promise.all([
      loader.loadAsync("/fonts/droid-serif.typeface.json"),
      loader.loadAsync("/fonts/droid-sans-mono.typeface.json"),
    ]).then(setFonts);
  }, []);

  return (
    <Canvas flat dpr={[1, 1.75]} gl={{ antialias: false }} camera={{ position: [0, 0.25, 7.2], fov: 34 }}>
      <color attach="background" args={["#07080a"]} />
      <fog attach="fog" args={["#07080a", 7, 14]} />
      <spotLight position={[-4.5, 5, 5.5]} angle={0.75} penumbra={1} intensity={140} color="#ffcf9a" />
      <directionalLight position={[5, 2, -4]} intensity={1.4} color="#bdebff" />
      <ambientLight intensity={0.05} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.2} color="#ffd9b0" position={[-3, 4, 4]} scale={[6, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1} color="#bdebff" position={[4, 1, -5]} scale={[8, 0.4, 1]} target={[0, 0, 0]} />
      </Environment>
      {fonts && <Sequence serif={fonts[0]} mono={fonts[1]} replay={replay} />}
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={1} intensity={0.7} radius={0.65} />
        <ToneMapping mode={ToneMappingMode.AGX} />
        <Noise opacity={0.035} />
        <Vignette darkness={0.6} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}
