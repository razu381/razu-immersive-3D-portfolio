"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, N8AO, SMAA, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useState } from "react";
import Machine from "@/components/machine/Machine";
import { lightTheme, ThemeContext } from "@/components/machine/materials";
import { machine } from "@/components/machine/state";

const STUDIO = "#eeece6"; // a hair darker than the paper, so the plate reads as a figure

// Fig. 1: the instrument on a seamless white sweep under a big overhead softbox (light direction §10–12).
export default function LabStage() {
  const [fontsReady, setFontsReady] = useState(false); // labels and prints use the page's fonts
  useEffect(() => {
    machine.t = 0.6; // a card is feeding into the intake: lid open, nothing read yet, no colour on the machine
    machine.approved = false;
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  return (
    <Canvas
      frameloop="demand"
      flat
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: false }}
      camera={{ position: [-3.1, 2.3, 7.3], fov: 22, near: 0.1, far: 60 }}
      onCreated={({ camera }) => camera.lookAt(0.15, 0.2, 0)}
    >
      <color attach="background" args={[STUDIO]} />

      <hemisphereLight args={["#ffffff", "#e8e6e0", 0.45]} />
      <directionalLight
        position={[-4, 8, 5]}
        intensity={2.3}
        color="#fffaf4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <Environment resolution={256} frames={1}>
        {/* A bright studio, so satin steel reflects light grey instead of black. */}
        <color attach="background" args={["#d9d7d1"]} />
        <Lightformer form="rect" intensity={2.4} color="#fffaf2" position={[0, 6, 1]} scale={[9, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1} position={[-7, 2, 0]} scale={[0.6, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1} position={[7, 2, 0]} scale={[0.6, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.5} color="#f4efe6" position={[0, 1, 9]} scale={[12, 3, 1]} target={[0, 0, 0]} />
      </Environment>

      <ThemeContext.Provider value={lightTheme}>{fontsReady && <Machine />}</ThemeContext.Provider>

      {/* The floor only carries shadows, so it melts into the backdrop like a seamless sweep. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.36, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <shadowMaterial opacity={0.12} color="#3a342c" />
      </mesh>
      <ContactShadows position={[0, -0.355, 0]} scale={[12, 5]} blur={2.8} far={0.9} opacity={0.4} color="#3a342c" frames={1} />

      <EffectComposer multisampling={0}>
        <N8AO aoRadius={0.35} distanceFalloff={0.6} intensity={1.6} color="#2b2620" quality="medium" />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}
