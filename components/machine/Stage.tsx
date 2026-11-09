"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Machine from "./Machine";
import { approach, X } from "./parts";
import { current, machine, type ShotName } from "./state";

type Shot = { position: [number, number, number]; target: [number, number, number]; fov: number };

// Named shots (art direction §11): one establishing shot, close inspections, the frontal sign-off, top-down delivery.
function shot(name: ShotName, station: number): Shot {
  const x = X(Math.min(Math.max(station, 0), 4));
  switch (name) {
    case "establishing":
      return { position: [-3.3, 2.3, 8.3], target: [0.25, 0.4, 0], fov: 30 };
    case "rest":
      return { position: [-2.2, 5.2, 13], target: [0.4, 1.6, 0], fov: 30 };
    case "station":
      return { position: [x - 1.1, 0.95, 2.75], target: [x + 0.45, 0.16, 0], fov: 18 };
    case "signoff":
      return { position: [X(5) + 0.35, 0.62, 2.3], target: [X(5) + 0.35, 0.3, -0.15], fov: 20 };
    case "delivery":
      return { position: [X(6) - 0.5, 2.6, 1.6], target: [X(6) - 0.15, 0, 0.12], fov: 20 };
  }
}

function CameraRig() {
  const look = useRef(new THREE.Vector3(0.25, 0.4, 0));
  useFrame(({ camera, invalidate }, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const s = shot(machine.shot, current().station);
    const cam = camera as THREE.PerspectiveCamera;
    let moving = false;
    (["x", "y", "z"] as const).forEach((axis, i) => {
      moving = approach(cam.position, axis, s.position[i], 2.4, dt, 1e-3) || moving;
      moving = approach(look.current, axis, s.target[i], 2.4, dt, 1e-3) || moving;
    });
    moving = approach(cam, "fov", s.fov, 2.4, dt, 1e-2) || moving;
    cam.updateProjectionMatrix();
    cam.lookAt(look.current);
    if (moving) invalidate();
  });
  return null;
}

// One warm key light that follows the work, a cool rim, a faint fill, and a light-only environment for reflections.
function Lighting() {
  const [target] = useState(() => new THREE.Object3D());
  const follow = useRef({ x: 0 });
  const key = useRef<THREE.SpotLight>(null);
  useFrame(({ invalidate }, delta) => {
    if (approach(follow.current, "x", X(Math.max(current().station, 0)) * 0.35, 1.5, Math.min(delta, 1 / 30), 1e-3)) invalidate();
    key.current!.target.position.set(follow.current.x, 0, 0);
    key.current!.target.updateMatrixWorld();
  });
  return (
    <>
      <primitive object={target} />
      <spotLight
        ref={key}
        target={target}
        position={[-3.2, 6.5, 4.2]}
        angle={0.5}
        penumbra={0.9}
        intensity={150}
        color="#ffcf9a"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[4, 2.5, -5]} intensity={0.7} color="#bdebff" />
      <ambientLight intensity={0.015} />
      <Environment resolution={256} frames={1} environmentIntensity={0.55}>
        <Lightformer form="rect" intensity={0.8} color="#ffd9b0" position={[-3, 5, 3]} scale={[6, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.3} color="#bdebff" position={[4, 1.2, -5]} scale={[10, 0.35, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.2} color="#d9d6d0" position={[0, 1, 8]} scale={[10, 3, 1]} target={[0, 0, 0]} />
      </Environment>
    </>
  );
}

// Lets the page ask for a frame: the canvas renders only when something changes, so an idle page is perfectly still.
function Invalidator() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    machine.invalidate = invalidate;
    invalidate();
    return () => {
      machine.invalidate = () => {};
    };
  }, [invalidate]);
  return null;
}

export default function Stage() {
  const [fontsReady, setFontsReady] = useState(false); // labels and prints use the page's fonts
  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);
  return (
    <Canvas
      frameloop="demand"
      flat
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ position: [-3.3, 2.3, 8.3], fov: 30, near: 0.1, far: 60 }}
    >
      <color attach="background" args={["#07080a"]} />
      <fog attach="fog" args={["#07080a", 8, 20]} />
      <Lighting />
      {fontsReady && <Machine />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.36, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#08090b" roughness={0.95} />
      </mesh>
      <ContactShadows position={[0, -0.355, 0]} scale={[12, 5]} blur={2.2} far={0.8} opacity={0.85} frames={1} />
      <CameraRig />
      <Invalidator />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={1} intensity={0.6} radius={0.6} />
        <ToneMapping mode={ToneMappingMode.AGX} />
        <Noise opacity={0.035} />
        <Vignette darkness={0.55} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}
