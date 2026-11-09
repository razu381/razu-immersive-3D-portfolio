import { useEffect, useRef } from "react";
import type * as THREE from "three";

// Seconds since the sequence started; a new `replay` value restarts it.
export function useSequenceTime(replay: number) {
  const start = useRef(-1);
  useEffect(() => {
    start.current = -1;
  }, [replay]);
  return (clock: THREE.Clock) => {
    if (start.current < 0) start.current = clock.elapsedTime;
    return clock.elapsedTime - start.current;
  };
}

// 0 → 1 between a and b, eased (smoothstep). The heroes are choreographed with these.
export const span = (t: number, a: number, b: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
// Strong in-out, for things that travel.
export const travel = (t: number, a: number, b: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};

// A crisp canvas texture drawn with the page's own fonts.
export function canvasText(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d")!);
  return canvas;
}

export const cssFont = (variable: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(variable) || "sans-serif";
