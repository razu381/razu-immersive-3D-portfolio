"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { workOrder } from "@/content/work-orders";
import type { Run } from "@/lib/run/events";
import { fontOf, useTheme, type Theme } from "./materials";
import { approach, Body, Box, CHANNEL_Z, Glow, Lamp, Rod, X } from "./parts";
import { current, machine } from "./state";

const dtOf = (delta: number) => Math.min(delta, 1 / 30); // the canvas idles between frames; don't jump
const lamp = (i: number) => () => current().lamps[i];
const shared = { cardX: X(0) }; // the rollers turn with the card

// ── Canvas prints (drawn with the page's own fonts) ─────────────────────────────────────────────

const cardPrint = (() => {
  let canvas: HTMLCanvasElement | undefined;
  let texture: THREE.CanvasTexture | undefined;
  let drawn = "";
  return (run: Run, draft: string, theme: Theme) => {
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = 840;
      canvas.height = 600;
      texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
    }
    const key = `${run.order}|${draft.length}|${theme.paper}`;
    if (key === drawn) return texture!;
    drawn = key;
    const order = workOrder(run.order);
    const ctx = canvas.getContext("2d")!;
    const mono = fontOf(theme);
    ctx.fillStyle = theme.paper;
    ctx.fillRect(0, 0, 840, 600);
    ctx.fillStyle = "#3a3c40";
    ctx.font = `600 22px ${mono}`;
    ctx.fillText(`${order.number} · ${order.title.toUpperCase()}`, 40, 56);
    ctx.fillRect(40, 72, 760, 2);
    const lines = (text: string, y: number, max: number, size: number) => {
      ctx.font = `${size}px ${mono}`;
      for (const line of text.split("\n").flatMap((l) => l.match(new RegExp(`.{1,${Math.floor(760 / (size * 0.6))}}(\\s|$)`, "g")) ?? [""])) {
        if (y > max) break;
        ctx.fillText(line.trim(), 40, y);
        y += size * 1.35;
      }
    };
    ctx.fillStyle = "#55585d";
    lines(order.input, 108, draft ? 330 : 560, 15);
    if (draft) {
      ctx.fillStyle = "#3a3c40";
      ctx.fillRect(40, 352, 760, 1);
      ctx.font = `600 16px ${mono}`;
      ctx.fillText("REPLY", 40, 384);
      ctx.fillStyle = "#24262a";
      lines(draft, 414, 570, 15);
    }
    texture!.needsUpdate = true;
    return texture!;
  };
})();

const PARK = -2.6; // dial resting angle, before a route is chosen
const dialAngle = (i: number, n: number) => ((-120 + (240 * i) / Math.max(1, n - 1)) * Math.PI) / 180;

const dialFace = (() => {
  let canvas: HTMLCanvasElement | undefined;
  let texture: THREE.CanvasTexture | undefined;
  let drawn = "";
  return (destinations: string[], theme: Theme) => {
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1024;
      texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
    }
    if (drawn === destinations.join() + theme.ink) return texture!;
    drawn = destinations.join() + theme.ink;
    const ctx = canvas.getContext("2d")!;
    const mono = fontOf(theme);
    ctx.clearRect(0, 0, 1024, 1024);
    ctx.fillStyle = theme.ink;
    ctx.strokeStyle = theme.ink;
    ctx.lineWidth = 3;
    ctx.font = `26px ${mono}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Canvas "down" faces the viewer (+z); an angle a points along (sin a, cos a) in (x, z).
    for (let deg = -120; deg <= 120; deg += 10) {
      const a = (deg * Math.PI) / 180;
      const [r0, r1] = deg % 40 === 0 ? [330, 372] : [345, 365];
      ctx.beginPath();
      ctx.moveTo(512 + r0 * Math.sin(a), 512 + r0 * Math.cos(a));
      ctx.lineTo(512 + r1 * Math.sin(a), 512 + r1 * Math.cos(a));
      ctx.stroke();
    }
    destinations.forEach((d, i) => {
      const a = dialAngle(i, destinations.length);
      ctx.save();
      ctx.translate(512 + 430 * Math.sin(a), 512 + 430 * Math.cos(a));
      ctx.fillText(d.split(" ")[0].toUpperCase(), 0, 0);
      ctx.restore();
    });
    texture!.needsUpdate = true;
    return texture!;
  };
})();

// ── The work order card ─────────────────────────────────────────────────────────────────────────

function Card() {
  const theme = useTheme();
  const group = useRef<THREE.Group>(null);
  const face = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ invalidate }, delta) => {
    const s = current();
    const station = s.approved ? 6 : Math.min(Math.max(s.station, 0), 5);
    const g = group.current!;
    const moving = approach(g.position, "x", X(station), 3.2, dtOf(delta), 1e-3);
    shared.cardX = g.position.x;
    const map = cardPrint(machine.run, s.draft, theme);
    if (face.current && face.current.map !== map) {
      face.current.map = map;
      face.current.needsUpdate = true;
    }
    if (moving) invalidate();
  });
  return (
    <group ref={group} position={[X(0), 0.012, CHANNEL_Z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.012, 0.3]} />
        <meshStandardMaterial color={theme.paper} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.0065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.42, 0.3]} />
        <meshStandardMaterial ref={face} roughness={0.8} />
      </mesh>
    </group>
  );
}

// ── Stations, left to right ─────────────────────────────────────────────────────────────────────

function Intake() {
  const m = useTheme().materials;
  const lid = useRef<THREE.Mesh>(null);
  const rollers = useRef<THREE.Group>(null);
  useFrame(({ invalidate }, delta) => {
    const moving = approach(lid.current!.position, "z", machine.t > 0.05 ? CHANNEL_Z - 0.4 : CHANNEL_Z, 6, dtOf(delta));
    for (const roller of rollers.current!.children) roller.rotation.z = -shared.cardX * 14;
    if (moving) invalidate();
  });
  return (
    <group position={[X(0), 0, 0]}>
      <Body h={0.42} label="01 · Intake" lamp={lamp(0)} />
      <Box args={[0.04, 0.12, 0.46]} position={[-0.33, 0.06, CHANNEL_Z]} />
      <Box args={[0.04, 0.12, 0.46]} position={[0.33, 0.06, CHANNEL_Z]} />
      <mesh ref={lid} position={[0, 0.125, CHANNEL_Z]} material={m.glass}>
        <boxGeometry args={[0.62, 0.012, 0.46]} />
      </mesh>
      <group ref={rollers}>
        {[-0.22, 0.22].map((x) => (
          <mesh key={x} position={[x, 0.024, CHANNEL_Z]} rotation={[Math.PI / 2, 0, 0]} material={m.rubber} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.44, 20]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Reader() {
  const bar = useRef<THREE.Group>(null);
  useFrame(({ invalidate }, delta) => {
    if (approach(bar.current!.position, "x", -0.34 + 0.68 * current().readSweep, 7, dtOf(delta))) invalidate();
  });
  const scanning = () => {
    const s = current();
    return s.station === 1 && !s.approved ? "machine" : "off";
  };
  return (
    <group position={[X(1), 0, 0]}>
      <Body h={0.36} label="02 · Reader" lamp={lamp(1)} />
      {[-0.42, 0.42].flatMap((x) =>
        [-0.01, 0.49].map((z) => <Box key={`${x}${z}`} args={[0.03, 0.27, 0.03]} position={[x, 0.135, z]} />),
      )}
      <Rod length={0.87} position={[0, 0.27, -0.01]} />
      <Rod length={0.87} position={[0, 0.27, 0.49]} />
      <group ref={bar} position={[-0.34, 0.27, CHANNEL_Z]}>
        <Box args={[0.05, 0.035, 0.54]} position={[0, 0, 0]} />
        <Glow state={scanning} position={[0, -0.02, 0]}>
          <boxGeometry args={[0.006, 0.004, 0.44]} />
        </Glow>
      </group>
    </group>
  );
}

function Checker() {
  const clamp = useRef<THREE.Group>(null);
  useFrame(({ invalidate }, delta) => {
    const s = current();
    const down = s.retrying || s.checks.at(-1)?.result === "reject";
    if (approach(clamp.current!.position, "y", down ? 0.035 : 0.17, 9, dtOf(delta))) invalidate();
  });
  return (
    <group position={[X(2), 0, 0]}>
      <Body h={0.46} label="03 · Checker" lamp={lamp(2)} />
      {[0, 1, 2, 3].map((i) => (
        <Lamp
          key={i}
          position={[-0.24 + i * 0.13, 0.46, -0.3]}
          size={0.036}
          state={() => current().rules[i]?.lamp ?? "off"}
        />
      ))}
      <Box args={[0.05, 0.03, 0.36]} position={[0, 0.34, 0.1]} />
      <group ref={clamp} position={[0, 0.17, CHANNEL_Z]}>
        <Box args={[0.02, 0.2, 0.02]} position={[0, 0.1, 0]} />
        <Box args={[0.5, 0.03, 0.1]} position={[0, 0, 0]} />
      </group>
    </group>
  );
}

function Router() {
  const theme = useTheme();
  const m = theme.materials;
  const knob = useRef<THREE.Group>(null);
  const face = useRef<THREE.MeshStandardMaterial>(null);
  const angle = useRef({ value: PARK });
  useFrame(({ invalidate }, delta) => {
    const { destinations } = workOrder(machine.run.order);
    const route = current().route;
    const i = route ? destinations.indexOf(route.destination) : -1;
    const moving = approach(angle.current, "value", i < 0 ? PARK : dialAngle(i, destinations.length), 4, dtOf(delta), 1e-3);
    const step = Math.PI / 36; // 5° detents: the dial clicks rather than glides
    knob.current!.rotation.y = Math.round(angle.current.value / step) * step;
    const map = dialFace(destinations, theme);
    if (face.current && face.current.map !== map) {
      face.current.map = map;
      face.current.needsUpdate = true;
    }
    if (moving) invalidate();
  });
  return (
    <group position={[X(3), 0, 0]}>
      <Body h={0.4} label="04 · Router" lamp={lamp(3)} />
      <mesh position={[0, 0.401, -0.28]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.46, 0.46]} />
        <meshStandardMaterial ref={face} transparent roughness={0.6} depthWrite={false} />
      </mesh>
      <group ref={knob} position={[0, 0.4, -0.28]}>
        <mesh position={[0, 0.03, 0]} material={m.accent} castShadow>
          <cylinderGeometry args={[0.12, 0.13, 0.06, 48]} />
        </mesh>
        <Box args={[0.012, 0.008, 0.11]} position={[0, 0.062, 0.06]} material={m.edge} />
      </group>
    </group>
  );
}

const draftLength = new WeakMap<Run, number>();
function Writer() {
  const m = useTheme().materials;
  const head = useRef<THREE.Group>(null);
  useFrame(({ invalidate }, delta) => {
    const run = machine.run;
    if (!draftLength.has(run)) {
      draftLength.set(run, run.events.reduce((n, e) => n + (e.type === "write.delta" ? e.text.length : 0), 0));
    }
    const progress = current().draft.length / Math.max(1, draftLength.get(run)!);
    if (approach(head.current!.position, "z", CHANNEL_Z - 0.15 + 0.3 * progress, 8, dtOf(delta))) invalidate();
  });
  const writing = () => {
    const s = current();
    return s.station === 4 && !s.approved ? "machine" : "off";
  };
  return (
    <group position={[X(4), 0, 0]}>
      <Body h={0.38} label="05 · Writer" lamp={lamp(4)} />
      <Box args={[0.03, 0.24, 0.03]} position={[0, 0.12, 0.5]} />
      <Box args={[0.05, 0.04, 0.56]} position={[0, 0.24, 0.22]} />
      <group ref={head} position={[0, 0.17, CHANNEL_Z - 0.15]}>
        <RoundedBox args={[0.15, 0.08, 0.1]} radius={0.012} material={m.accent} castShadow />
        <Glow state={writing} position={[0, -0.042, 0]}>
          <boxGeometry args={[0.1, 0.004, 0.006]} />
        </Glow>
      </group>
    </group>
  );
}

function SignOff() {
  const m = useTheme().materials;
  const key = useRef<THREE.Group>(null);
  useFrame(({ invalidate }, delta) => {
    const s = current();
    const lift = s.approved ? -0.012 : s.waiting ? 0.014 - 0.03 * machine.hold : 0;
    if (approach(key.current!.position, "y", 0.34 + lift, 14, dtOf(delta))) invalidate();
  });
  const ring = () => {
    const s = current();
    return s.approved ? "fused" : s.waiting ? "human" : "off";
  };
  return (
    <group position={[X(5), 0, 0]}>
      <Body h={0.34} label="06 · Sign-off" lamp={lamp(5)} />
      <Glow state={ring} position={[0, 0.342, -0.28]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <torusGeometry args={[0.215, 0.006, 6, 4]} />
      </Glow>
      <group ref={key} position={[0, 0.34, -0.28]}>
        <RoundedBox args={[0.26, 0.07, 0.26]} radius={0.018} position={[0, 0.035, 0]} material={m.key} castShadow />
      </group>
    </group>
  );
}

function OutTray() {
  return (
    <group position={[X(6), 0, 0]}>
      <Body h={0.22} label="07 · Out" lamp={lamp(6)} />
      <Box args={[0.6, 0.008, 0.46]} position={[0, 0.004, CHANNEL_Z]} />
      <Box args={[0.6, 0.05, 0.015]} position={[0, 0.025, CHANNEL_Z + 0.235]} />
      <Box args={[0.015, 0.05, 0.46]} position={[0.3, 0.025, CHANNEL_Z]} />
    </group>
  );
}

// The line: one plinth, seven stations, one card.
export default function Machine() {
  const m = useTheme().materials;
  return (
    <group>
      <RoundedBox args={[7.7, 0.36, 1.45]} radius={0.03} smoothness={3} position={[0, -0.18, 0]} material={m.body} receiveShadow castShadow />
      <mesh position={[0, -0.009, 0.725 - 0.009]} material={m.edge}>
        <boxGeometry args={[7.64, 0.01, 0.01]} />
      </mesh>
      <mesh position={[0, 0.002, CHANNEL_Z]} material={m.channel} receiveShadow>
        <boxGeometry args={[7.5, 0.004, 0.42]} />
      </mesh>
      <Intake />
      <Reader />
      <Checker />
      <Router />
      <Writer />
      <SignOff />
      <OutTray />
      <Card />
    </group>
  );
}
