"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Noise, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { canvasText, cssFont, span, useSequenceTime } from "../timeline";

// The real referral letter on a desk under a lamp. The model reads it and annotates it in the margin,
// a bad date is circled and re-read, and the routing stamp lands.
type Key = "patient" | "dob" | "ref" | "specialty" | "urgency" | "referrer";
type Seg = string | [string, Key];
const W = 1400;
const H = 1980;
const PAPER_W = 2.1;
const PAPER_H = 2.97;
const MACHINE_INK = "#1f5a70";
const HUMAN_INK = "#c9541f";
const NOTES: Record<Key, string> = {
  patient: "01 PATIENT",
  dob: "02 DATE OF BIRTH",
  ref: "03 PATIENT REF",
  specialty: "04 SPECIALTY",
  urgency: "05 URGENCY, AS STATED",
  referrer: "06 REFERRER",
};

type Box = { x: number; y: number; w: number; h: number };

// Draws words with wrapping and returns where each marked phrase landed.
function drawRich(ctx: CanvasRenderingContext2D, segs: Seg[], x0: number, y: number, maxW: number, lh: number) {
  const boxes: Partial<Record<Key, Box>> = {};
  let x = x0;
  const space = ctx.measureText(" ").width;
  for (const seg of segs) {
    const [text, key] = typeof seg === "string" ? [seg, undefined] : seg;
    const words = key ? [text] : text.split(" ").filter(Boolean);
    for (const word of words) {
      const w = ctx.measureText(word).width;
      if (x + w > x0 + maxW && x > x0) {
        x = x0;
        y += lh;
      }
      ctx.fillText(word, x, y);
      if (key) boxes[key] = { x, y, w, h: lh * 0.7 };
      x += w + space;
    }
  }
  return { boxes, y };
}

function drawLetter() {
  let boxes: Partial<Record<Key, Box>> = {};
  const canvas = canvasText(W, H, (ctx) => {
    ctx.fillStyle = "#efe9dd";
    ctx.fillRect(0, 0, W, H);
    // Paper fibre: thousands of faint short strokes.
    for (let i = 0; i < 9000; i++) {
      ctx.strokeStyle = `rgba(${Math.random() < 0.5 ? "120,105,80" : "255,255,255"},${Math.random() * 0.05})`;
      const x = Math.random() * W;
      const y = Math.random() * H;
      const a = Math.random() * Math.PI;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14);
      ctx.stroke();
    }
    const serif = cssFont("--font-instrument-serif");
    const sans = cssFont("--font-geist-sans");
    const mono = cssFont("--font-geist-mono");
    ctx.fillStyle = "#23221f";
    ctx.font = `64px ${serif}`;
    ctx.fillText("Westbrook Family Practice", 130, 190);
    ctx.font = `22px ${mono}`;
    ctx.fillStyle = "#5d5a53";
    ctx.fillText("14 Mill Lane, Westbrook · info@westbrookfp.example", 130, 236);
    ctx.fillRect(130, 268, 850, 2);
    ctx.fillStyle = "#2a2926";
    ctx.font = `30px ${sans}`;
    const lh = 46;
    const add = (segs: Seg[], y: number) => {
      const r = drawRich(ctx, segs, 130, y, 850, lh);
      boxes = { ...boxes, ...r.boxes };
      return r.y;
    };
    add(["To:", ["Dermatology", "specialty"], "Outpatients, St Anne's Clinic"], 360);
    add(["Re: Ms", ["Clara Benning", "patient"]], 430);
    add(["DOB", ["12/O3/1986", "dob"], "   Ref", ["WFP-20417", "ref"]], 476);
    add(["Dear colleague,"], 572);
    let y = add(
      [
        "I would be grateful if you could see Ms Benning, who has had a persistent itchy rash on both forearms for around three months, not settling with emollients.",
      ],
      640,
    );
    y = add(["She would appreciate an", ["earlier appointment", "urgency"], "if at all possible."], y + lh * 1.6);
    y = add(["Photo attached (1)."], y + lh * 1.6);
    y = add(["Kind regards,"], y + lh * 1.8);
    ctx.font = `italic 54px ${serif}`;
    const sig = drawRich(ctx, [["Dr H. Okafor", "referrer"]], 130, y + 80, 850, lh);
    boxes = { ...boxes, ...sig.boxes };
  });
  return { canvas, boxes: boxes as Record<Key, Box> };
}

// Pen strokes drawn progressively: p is 0..1 along the stroke.
function underline(ctx: CanvasRenderingContext2D, b: Box, p: number) {
  if (p <= 0) return;
  ctx.beginPath();
  ctx.moveTo(b.x - 4, b.y + 10);
  ctx.lineTo(b.x - 4 + (b.w + 8) * p, b.y + 10 + 2 * p);
  ctx.stroke();
}
function circle(ctx: CanvasRenderingContext2D, b: Box, p: number) {
  if (p <= 0) return;
  ctx.beginPath();
  ctx.ellipse(b.x + b.w / 2, b.y - b.h / 2 + 4, b.w / 2 + 22, b.h / 2 + 18, -0.05, -2.2, -2.2 + Math.PI * 2.1 * p);
  ctx.stroke();
}
function typed(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, p: number) {
  ctx.fillText(text.slice(0, Math.round(text.length * p)), x, y);
}

function build() {
  const group = new THREE.Group();
  const { canvas, boxes } = drawLetter();
  const paperTex = new THREE.CanvasTexture(canvas);
  paperTex.colorSpace = THREE.SRGBColorSpace;
  paperTex.anisotropy = 8;

  // A sheet that isn't perfectly flat: a soft wave and a lifted bottom-right corner.
  const geometry = new THREE.PlaneGeometry(PAPER_W, PAPER_H, 40, 56);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / (PAPER_W / 2);
    const y = pos.getY(i) / (PAPER_H / 2);
    const corner = THREE.MathUtils.smoothstep((x - y) / 2, 0.55, 1.0);
    // Never below zero: a dip under the sheet's origin would sink it into the desk.
    pos.setZ(i, 0.11 * corner * corner + 0.006 * (1 + Math.sin(y * 2.4)) + 0.004 * (1 + Math.cos(x * 3.1)));
  }
  geometry.computeVertexNormals();
  const paperMat = new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.95, side: THREE.DoubleSide });
  const paper = new THREE.Mesh(geometry, paperMat);
  paper.castShadow = true; // onto the desk only: a double-sided wavy sheet shadowing itself blotches

  // Annotations live on their own layer so only that small canvas re-uploads while the pen moves.
  const scale = 0.5;
  const ink = canvasText(W * scale, H * scale, () => {});
  const inkTex = new THREE.CanvasTexture(ink);
  inkTex.colorSpace = THREE.SRGBColorSpace;
  inkTex.anisotropy = 8;
  const inkMat = new THREE.MeshStandardMaterial({
    map: inkTex,
    transparent: true,
    roughness: 0.6,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    depthWrite: false,
  });
  const inkLayer = new THREE.Mesh(geometry, inkMat);

  // The routing stamp: its own plane, so it can land.
  const stampCanvas = canvasText(900, 300, (ctx) => {
    ctx.strokeStyle = ctx.fillStyle = HUMAN_INK;
    ctx.lineWidth = 8;
    ctx.strokeRect(14, 14, 872, 272);
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, 840, 240);
    const condensed = cssFont("--font-geist-sans");
    ctx.font = `700 58px ${condensed}`;
    ctx.fillText("ROUTED · DERMATOLOGY", 60, 128);
    ctx.font = `500 34px ${cssFont("--font-geist-mono")}`;
    ctx.fillText("WO-0142 · ST ANNE'S CLINIC · 08 NOV 2026", 62, 210);
    // Uneven ink: knock out speckles so it reads as a real impression.
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 2600; i++) {
      ctx.globalAlpha = Math.random() * 0.8;
      ctx.beginPath();
      ctx.arc(Math.random() * 900, Math.random() * 300, Math.random() * 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  const stampTex = new THREE.CanvasTexture(stampCanvas);
  stampTex.colorSpace = THREE.SRGBColorSpace;
  const stampMat = new THREE.MeshStandardMaterial({ map: stampTex, transparent: true, roughness: 0.8, depthWrite: false });
  const stamp = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.3), stampMat);
  stamp.position.set(0.36, -0.86, 0.024);
  stamp.rotation.z = 0.09;

  const sheet = new THREE.Group();
  sheet.add(paper, inkLayer, stamp);
  sheet.rotation.set(-Math.PI / 2, 0, -0.07);
  sheet.position.set(0.55, 0.004, 0);
  group.add(sheet);

  // Reading order, top to bottom: the pen reaches each phrase as the scan passes it.
  const order = (Object.keys(boxes) as Key[]).sort((a, b) => boxes[a].y - boxes[b].y);
  const READ_FROM = 1.4;
  const READ_TO = 5.2;
  const reach = (k: Key) => READ_FROM + (boxes[k].y / H) * (READ_TO - READ_FROM) * 1.25;
  const DOB_FIX = reach("dob") + 1.6;
  const STAMP = 7.4;
  let drawnFrame = -1;
  // The desk lamp: the scene starts in darkness and the lamp comes on.
  const lamp = new THREE.SpotLight("#ffcf9a", 0, 0, 0.62, 0.9, 2);
  lamp.position.set(-2.4, 4.6, 1.2);
  lamp.castShadow = true;
  lamp.shadow.mapSize.set(2048, 2048);
  lamp.shadow.bias = -0.0002;
  lamp.target.position.set(0.5, 0, -0.2);
  group.add(lamp, lamp.target);

  return {
    group,
    update(t: number) {
      // Ink layer: redraw only while something is being written.
      lamp.intensity = 85 * span(t, 0.1, 1.3);
      const frame = Math.floor(Math.min(t, STAMP + 1) * 30); // ink redraws at 30fps, only while writing
      if (frame !== drawnFrame && t < STAMP + 1.2) {
        drawnFrame = frame;
        const ctx = ink.getContext("2d")!;
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        ctx.clearRect(0, 0, W, H);
        const mono = cssFont("--font-geist-mono");
        // The scan: a faint cool band moving down the page while the model reads.
        const scan = span(t, READ_FROM, READ_TO);
        if (scan > 0 && scan < 1) {
          const sy = 300 + scan * 1300;
          const g = ctx.createLinearGradient(0, sy - 60, 0, sy + 6);
          g.addColorStop(0, "rgba(31,90,112,0)");
          g.addColorStop(1, "rgba(31,90,112,0.16)");
          ctx.fillStyle = g;
          ctx.fillRect(110, sy - 60, 900, 66);
        }
        ctx.lineCap = "round";
        order.forEach((k, i) => {
          const b = boxes[k];
          const at = reach(k);
          const human = k === "urgency";
          ctx.strokeStyle = ctx.fillStyle = human ? HUMAN_INK : MACHINE_INK;
          ctx.lineWidth = 3.2;
          underline(ctx, b, span(t, at, at + 0.45));
          // A leader line out to the margin, then the field name typed in.
          const lead = span(t, at + 0.35, at + 0.7);
          const noteY = 360 + i * 120;
          if (lead > 0) {
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(b.x + b.w + 8, b.y + 10);
            ctx.lineTo(b.x + b.w + 8 + (1030 - b.x - b.w - 8) * lead, b.y + 10 + (noteY - b.y - 10) * lead);
            ctx.stroke();
          }
          ctx.font = `24px ${mono}`;
          typed(ctx, NOTES[k], 1040, noteY, span(t, at + 0.65, at + 1.1));
          if (human) {
            ctx.font = `22px ${mono}`;
            typed(ctx, "FOR STAFF TO DECIDE", 1040, noteY + 32, span(t, at + 1.1, at + 1.6));
          }
          if (k === "dob") {
            // Rejected: circled and struck in warm ink, then re-read and written above in the machine's ink.
            ctx.strokeStyle = ctx.fillStyle = HUMAN_INK;
            ctx.lineWidth = 3;
            circle(ctx, b, span(t, at + 0.6, at + 1.1));
            const strike = span(t, at + 1.1, at + 1.3);
            if (strike > 0) {
              ctx.beginPath();
              ctx.moveTo(b.x - 6, b.y - 10);
              ctx.lineTo(b.x - 6 + (b.w + 12) * strike, b.y - 12);
              ctx.stroke();
            }
            ctx.font = `22px ${mono}`;
            typed(ctx, "NOT A DATE · RE-READ", 1040, noteY + 32, span(t, at + 1.1, at + 1.6));
            ctx.fillStyle = MACHINE_INK;
            ctx.font = `28px ${mono}`;
            typed(ctx, "1986-03-12", b.x, b.y - 46, span(t, DOB_FIX, DOB_FIX + 0.6));
          }
        });
        inkTex.needsUpdate = true;
      }

      // The stamp lands: no fall, just the hit, a slight give in the paper, and the ink.
      const hit = span(t, STAMP, STAMP + 0.12);
      stampMat.opacity = hit > 0 ? 0.92 : 0;
      stamp.scale.setScalar(1.06 - 0.06 * hit);
      sheet.position.y = 0.004 - 0.008 * Math.sin(Math.PI * span(t, STAMP, STAMP + 0.3));
    },
    dispose() {
      geometry.dispose();
      stamp.geometry.dispose();
      [paperTex, inkTex, stampTex].forEach((x) => x.dispose());
      [paperMat, inkMat, stampMat].forEach((m) => m.dispose());
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

export default function PaperScene({ replay }: { replay: number }) {
  const [fontsReady, setFontsReady] = useState(false); // the letter is printed in the page's fonts
  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  return (
    <Canvas
      flat
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: false }}
      camera={{ position: [-0.15, 2.9, 1.95], fov: 32 }}
      onCreated={({ camera }) => camera.lookAt(0.62, 0, -0.3)}
    >
      <color attach="background" args={["#0b0b0c"]} />
      <ambientLight intensity={0.04} />
      <directionalLight position={[4, 2, -3]} intensity={0.25} color="#bdebff" />
      {fontsReady && <Sequence replay={replay} />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#141416" roughness={0.85} />
      </mesh>
      <EffectComposer multisampling={0}>
        <ToneMapping mode={ToneMappingMode.AGX} />
        <Noise opacity={0.04} />
        <Vignette darkness={0.7} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}
