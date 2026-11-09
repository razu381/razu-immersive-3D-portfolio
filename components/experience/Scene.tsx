"use client";

import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import Organism from "./Organism";

export default function Scene() {
  // ~16k particles on touch devices, ~65k elsewhere.
  const size = matchMedia("(pointer: coarse)").matches ? 128 : 256;
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 40 }} dpr={[1, 2]} gl={{ antialias: false, powerPreference: "high-performance" }}>
      <color attach="background" args={["#07080a"]} />
      <Organism size={size} />
      <EffectComposer>
        <Bloom mipmapBlur intensity={0.5} luminanceThreshold={0.4} luminanceSmoothing={0.3} />
        <Noise opacity={0.05} />
        <Vignette darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
