import type { Metadata } from "next";
import LabHero from "@/components/lab/LabHero";

export const metadata: Metadata = { title: "Light direction — look test" };

// The light art direction (docs/implementation-plan/lab-instrument-work-order-light.md), hero only, for comparison.
export default function Light() {
  return <LabHero />;
}
