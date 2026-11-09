import type { Metadata } from "next";
import Hero from "@/components/heroes/Hero";

export const metadata: Metadata = { title: "Paper & Ink — hero sketch" };

export default function Page() {
  return <Hero name="paper" />;
}
