"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree, type RootState } from "@react-three/fiber";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import { experience } from "./state";
import { makeTargets, sampleCanvas } from "./targets";
import type { Project } from "@/content/projects";
import * as glsl from "./shaders";
import { projects } from "@/content/projects";

function dataTexture(data: Float32Array, size: number) {
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
  texture.needsUpdate = true;
  return texture;
}

// Placeholder visual for a project until it has a hero image: its title, drawn in its accent colour.
function projectCanvas(project: Project) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 576;
  const ctx = canvas.getContext("2d")!;
  const font = getComputedStyle(document.documentElement).getPropertyValue("--font-instrument-serif") || "serif";
  ctx.font = `180px ${font}`;
  const fontSize = Math.min(180, (180 * 940) / ctx.measureText(project.title).width);
  ctx.font = `${fontSize}px ${font}`;
  ctx.fillStyle = project.accent;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(project.title, 512, 288);
  return canvas;
}

function createOrganism(gl: THREE.WebGLRenderer, size: number) {
  const { seed, grid, sphere, craft } = makeTargets(size);
  // shortcut: FloatType render targets; switch to gpu.setDataType(THREE.HalfFloatType) if a device can't render to float.
  const gpu = new GPUComputationRenderer(size, size, gl);
  const pos0 = gpu.createTexture();
  const start = pos0.image.data as Float32Array;
  for (let i = 0; i < start.length; i++) start[i] = seed[i] * 0.06; // everything begins as one point of light
  const velVar = gpu.addVariable("textureVelocity", glsl.velocity, gpu.createTexture());
  const posVar = gpu.addVariable("texturePosition", glsl.position, pos0);
  gpu.setVariableDependencies(velVar, [velVar, posVar]);
  gpu.setVariableDependencies(posVar, [velVar, posVar]);

  const textures = [dataTexture(seed, size), dataTexture(grid, size), dataTexture(sphere, size), dataTexture(craft, size)];
  const sim = Object.assign(velVar.material.uniforms, {
    uTime: { value: 0 },
    uDelta: { value: 0 },
    uSplit: { value: 0 },
    uMerge: { value: 0 },
    uCraft: { value: 0 },
    uWork: { value: 0 },
    uLine: { value: 0 },
    uThink: { value: 0 },
    uSpeak: { value: 0 },
    uVoice: { value: 0 },
    uScale: { value: 1 },
    uPointerActive: { value: 0 },
    uPointer: { value: new THREE.Vector3() },
    uHumanCenter: { value: new THREE.Vector3() },
    uMachineCenter: { value: new THREE.Vector3() },
    tSeed: { value: textures[0] },
    tGrid: { value: textures[1] },
    tSphere: { value: textures[2] },
    tCraft: { value: textures[3] },
    tWork: { value: null as THREE.Texture | null },
  });
  posVar.material.uniforms.uDelta = sim.uDelta;
  const error = gpu.init();
  if (error) throw new Error(error);

  const uniforms = {
    tPos: { value: null as THREE.Texture | null },
    tVel: { value: null as THREE.Texture | null },
    tSeed: sim.tSeed,
    uMerge: sim.uMerge,
    uWork: sim.uWork,
    uLine: sim.uLine,
    tWorkColor: { value: null as THREE.Texture | null },
    uGlow: { value: 0 },
    uHuman: { value: new THREE.Color("#ffb070") },
    uMachine: { value: new THREE.Color("#bdebff") },
    uFused: { value: new THREE.Color("#f4efe6") },
    uSize: { value: 0 },
    uTrail: { value: 0.3 },
  };
  const material = (vertexShader: string, fragmentShader: string) =>
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

  const count = size * size;
  const points = new Float32Array(count * 3);
  const lines = new Float32Array(count * 6);
  for (let i = 0; i < count; i++) {
    const u = ((i % size) + 0.5) / size;
    const v = (Math.floor(i / size) + 0.5) / size;
    points.set([u, v, 0], i * 3);
    lines.set([u, v, 0, u, v, 1], i * 6);
  }
  const pointGeometry = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(points, 3));
  const lineGeometry = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(lines, 3));
  const pointMaterial = material(glsl.pointVertex, glsl.pointFragment);
  const lineMaterial = material(glsl.lineVertex, glsl.lineFragment);

  let split = 0;
  let craftMix = 0;
  let merge = 0;
  let work = 0;
  let line = 0;
  let projectTargets: { pos: THREE.DataTexture; color: THREE.DataTexture }[] = [];
  const ray = new THREE.Vector3();

  return {
    pointGeometry,
    lineGeometry,
    pointMaterial,
    lineMaterial,

    setProjects(list: Project[]) {
      projectTargets.forEach((t) => (t.pos.dispose(), t.color.dispose()));
      projectTargets = list.map((project) => {
        const { pos, color } = sampleCanvas(projectCanvas(project), size);
        return { pos: dataTexture(pos, size), color: dataTexture(color, size) };
      });
    },

    update(state: RootState, delta: number) {
      const dt = Math.min(delta, 1 / 30);
      split = THREE.MathUtils.damp(split, experience.split, 2.5, dt);
      craftMix = THREE.MathUtils.damp(craftMix, experience.craft, 2.5, dt);
      merge = THREE.MathUtils.damp(merge, experience.inMergeZone ? experience.merge : 0, 2.5, dt);
      work = THREE.MathUtils.damp(work, projectTargets.length ? experience.work : 0, 2.5, dt);
      line = THREE.MathUtils.damp(line, experience.line, 2, dt);
      const target = projectTargets[experience.project];
      if (target) {
        sim.tWork.value = target.pos;
        uniforms.tWorkColor.value = target.color;
      }

      // Strands sit side by side in landscape, stacked in portrait.
      const portrait = state.size.width < state.size.height;
      sim.uScale.value = portrait ? 0.62 : 1;
      sim.uHumanCenter.value.set(portrait ? 0 : -1.7, portrait ? 1.25 : 0, 0);
      sim.uMachineCenter.value.set(portrait ? 0 : 1.7, portrait ? -1.25 : 0, 0);

      // Pointer projected onto the z = 0 plane.
      const cam = state.camera;
      ray.set(experience.pointer.x, experience.pointer.y, 0.5).unproject(cam).sub(cam.position).normalize();
      sim.uPointer.value.copy(cam.position).addScaledVector(ray, -cam.position.z / ray.z);
      sim.uPointerActive.value = experience.pointer.active;

      sim.uTime.value = state.clock.elapsedTime;
      sim.uDelta.value = dt;
      sim.uSplit.value = split;
      sim.uCraft.value = craftMix;
      sim.uMerge.value = merge;
      sim.uWork.value = work;
      sim.uLine.value = line;
      const { uThink, uSpeak, uVoice } = sim;
      uThink.value = THREE.MathUtils.damp(uThink.value, experience.thinking, 3, dt);
      uSpeak.value = THREE.MathUtils.damp(uSpeak.value, experience.speaking, 3, dt);
      uVoice.value = THREE.MathUtils.damp(uVoice.value, experience.voice, 8, dt);
      uniforms.uGlow.value = Math.max(uThink.value, uSpeak.value, uVoice.value);
      gpu.compute();

      uniforms.tPos.value = gpu.getCurrentRenderTarget(posVar).texture;
      uniforms.tVel.value = gpu.getCurrentRenderTarget(velVar).texture;
      uniforms.uSize.value = 7 * state.viewport.dpr;
    },

    dispose() {
      gpu.dispose();
      textures.forEach((t) => t.dispose());
      projectTargets.forEach((t) => (t.pos.dispose(), t.color.dispose()));
      [pointGeometry, lineGeometry, pointMaterial, lineMaterial].forEach((o) => o.dispose());
    },
  };
}

// One GPU particle system: every scene is this organism in a different state.
export default function Organism({ size }: { size: number }) {
  const gl = useThree((s) => s.gl);
  const organism = useMemo(() => createOrganism(gl, size), [gl, size]);
  useEffect(() => {
    document.fonts.ready.then(() => organism.setProjects(projects));
    return () => organism.dispose();
  }, [organism]);
  useFrame((state, delta) => organism.update(state, delta));

  return (
    <>
      <points geometry={organism.pointGeometry} material={organism.pointMaterial} frustumCulled={false} />
      <lineSegments geometry={organism.lineGeometry} material={organism.lineMaterial} frustumCulled={false} />
    </>
  );
}
