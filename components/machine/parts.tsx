"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import type { Lamp as LampState } from "@/lib/run/state";
import { labelTexture, useTheme } from "./materials";

export const X = (i: number) => -3 + i; // station positions along the line
export const CHANNEL_Z = 0.24; // where the card travels
export const BODY_Z = -0.28;
export const BODY_D = 0.5;
export const BODY_W = 0.82;

// Eases a value toward its target; true while still moving, so the caller can ask for another frame.
export function approach(obj: object, key: string, target: number, lambda: number, dt: number, eps = 1e-4) {
  const o = obj as Record<string, number>;
  const v = THREE.MathUtils.damp(o[key], target, lambda, dt);
  o[key] = Math.abs(v - target) < eps ? target : v;
  return o[key] !== target;
}

// An unlit core that only glows when its state is on (colour pushed past 1.0, so only it blooms).
export function Glow({ state, children, ...props }: { state: () => LampState; children: ReactNode } & ThreeMeshProps) {
  const theme = useTheme();
  const core = useRef<THREE.MeshBasicMaterial>(null);
  const last = useRef<LampState | null>(null);
  useFrame(() => {
    const s = state();
    if (s === last.current || !core.current) return;
    last.current = s;
    core.current.color.set(theme.lamp[s]);
    if (s !== "off") core.current.color.multiplyScalar(theme.lampGain);
  });
  return (
    <mesh {...props}>
      {children}
      <meshBasicMaterial ref={core} color={theme.lamp.off} toneMapped={false} />
    </mesh>
  );
}
type ThreeMeshProps = { position?: [number, number, number]; rotation?: [number, number, number] };

// A state lamp: smoked glass dome over a glowing core.
export function Lamp({ position, state, size = 0.03 }: { position: [number, number, number]; state: () => LampState; size?: number }) {
  const m = useTheme().materials;
  return (
    <group position={position}>
      <mesh material={m.accent} position={[0, 0.004, 0]}>
        <cylinderGeometry args={[size * 1.25, size * 1.25, 0.008, 24]} />
      </mesh>
      <Glow state={state} position={[0, 0.008, 0]}>
        <sphereGeometry args={[size * 0.62, 16, 12]} />
      </Glow>
      <mesh material={m.glass} position={[0, 0.008, 0]}>
        <sphereGeometry args={[size, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  );
}

export function Label({ text, position, width = 0.4 }: { text: string; position: [number, number, number]; width?: number }) {
  const theme = useTheme();
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ map: labelTexture(text, theme), transparent: true, roughness: 0.6, depthWrite: false }),
    [text, theme],
  );
  useEffect(() => () => (material.map?.dispose(), material.dispose()), [material]);
  return (
    <mesh position={position} material={material}>
      <planeGeometry args={[width, width / 8]} />
    </mesh>
  );
}

// A station body: graphite, a diamond-cut top edge that catches the key light, an engraved label and a state lamp.
export function Body({ h, label, lamp, w = BODY_W }: { h: number; label: string; lamp: () => LampState; w?: number }) {
  const r = 0.025;
  const m = useTheme().materials;
  return (
    <group position={[0, 0, BODY_Z]}>
      <RoundedBox
        args={[w, h, BODY_D]}
        radius={r}
        smoothness={3}
        position={[0, h / 2, 0]}
        material={m.body}
        castShadow
        receiveShadow
      />
      <mesh position={[0, h - r * 0.3, BODY_D / 2 - r * 0.3]} material={m.edge}>
        <boxGeometry args={[w - 2 * r, 0.009, 0.009]} />
      </mesh>
      <Label text={label} position={[-w / 2 + 0.25, h - 0.07, BODY_D / 2 + 0.001]} />
      <Lamp position={[w / 2 - 0.07, h, BODY_D / 2 - 0.08]} state={lamp} />
    </group>
  );
}

export function Box({ args, position, material, rotation }: {
  args: [number, number, number];
  position: [number, number, number];
  material?: THREE.Material;
  rotation?: [number, number, number];
}) {
  const m = useTheme().materials;
  return (
    <mesh position={position} rotation={rotation} material={material ?? m.metal} castShadow receiveShadow>
      <boxGeometry args={args} />
    </mesh>
  );
}

export function Rod({ length, position, axis = "x", radius = 0.01 }: {
  length: number;
  position: [number, number, number];
  axis?: "x" | "z";
  radius?: number;
}) {
  const m = useTheme().materials;
  return (
    <mesh
      position={position}
      rotation={axis === "x" ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0]}
      material={m.metal}
      castShadow
    >
      <cylinderGeometry args={[radius, radius, length, 16]} />
    </mesh>
  );
}
