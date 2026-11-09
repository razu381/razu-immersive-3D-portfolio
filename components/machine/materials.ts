import { createContext, useContext } from "react";
import * as THREE from "three";
import type { Lamp } from "@/lib/run/state";

// One machine, two art directions (docs/implementation-plan/*.md §9). Each theme is one instance per material,
// shared by every part. Slots: body, metal (posts, rails, bars), accent (knobs, bezels, print head), edge, etc.
export type Theme = {
  materials: Record<"body" | "metal" | "accent" | "edge" | "rubber" | "glass" | "channel" | "key", THREE.Material>;
  lamp: Record<Lamp, string>;
  lampGain: number; // lamp cores are unlit; past 1.0 they bloom (only the dark theme has bloom)
  ink: string; // engraved or printed labels
  paper: string; // the work order card
  font: string; // CSS variable of the mono face used for labels and prints
};

// Dark: anodized is satin, not brushed; full-metal anisotropic parts caught the warm key as tan stripes and read as wood.
const anodized = new THREE.MeshPhysicalMaterial({ color: "#1e2124", metalness: 0.8, roughness: 0.5 });
const rubber = new THREE.MeshStandardMaterial({ color: "#0c0c0d", roughness: 0.9 });
export const darkTheme: Theme = {
  materials: {
    body: new THREE.MeshPhysicalMaterial({ color: "#17191c", roughness: 0.55, clearcoat: 0.15, clearcoatRoughness: 0.45 }),
    metal: anodized,
    accent: anodized,
    edge: new THREE.MeshStandardMaterial({ color: "#a9adb3", metalness: 1, roughness: 0.22 }),
    rubber,
    glass: new THREE.MeshPhysicalMaterial({
      color: "#0a0c0e",
      roughness: 0.05,
      clearcoat: 1,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    }),
    channel: rubber,
    key: new THREE.MeshPhysicalMaterial({ color: "#1d2024", roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.3 }),
  },
  lamp: { off: "#1a1d20", machine: "#bdebff", human: "#ffb070", fused: "#f4efe6" },
  lampGain: 2.6,
  ink: "#7d8288",
  paper: "#e9e4da",
  font: "--font-geist-mono",
};

// Light: off-white enamel lab instrument, satin stainless, ink-black controls, one vermilion key.
const stainless = new THREE.MeshPhysicalMaterial({ color: "#c8cbcf", metalness: 1, roughness: 0.3 });
export const lightTheme: Theme = {
  materials: {
    body: new THREE.MeshPhysicalMaterial({ color: "#e6e2d9", roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
    metal: stainless,
    accent: new THREE.MeshPhysicalMaterial({ color: "#1b1c1f", metalness: 1, roughness: 0.35 }),
    edge: stainless,
    rubber: new THREE.MeshStandardMaterial({ color: "#151516", roughness: 0.9 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: "#f4f3ef",
      roughness: 0.6,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    }),
    channel: stainless,
    key: new THREE.MeshPhysicalMaterial({ color: "#e2401c", roughness: 0.5, clearcoat: 0.4 }),
  },
  lamp: { off: "#d3cfc7", machine: "#f2fbff", human: "#e2401c", fused: "#fff6ea" },
  lampGain: 1.1,
  ink: "#16171a",
  paper: "#f6f3ec",
  font: "--font-plex-mono",
};

export const ThemeContext = createContext(darkTheme);
export const useTheme = () => useContext(ThemeContext);

// Labels printed with the page's own fonts (no font files to ship), as canvas textures.
export const fontOf = (theme: Theme) =>
  getComputedStyle(document.documentElement).getPropertyValue(theme.font) || "monospace";

export function labelTexture(text: string, theme: Theme, width = 512, height = 64, size = 30) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.font = `${size}px ${fontOf(theme)}`;
  ctx.letterSpacing = `${size * 0.15}px`;
  ctx.fillStyle = theme.ink;
  ctx.textBaseline = "middle";
  ctx.fillText(text.toUpperCase(), 4, height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
