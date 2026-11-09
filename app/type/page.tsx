import type { Metadata } from "next";
import Hero from "@/components/heroes/Hero";

export const metadata: Metadata = { title: "Living Type — hero sketch" };

export default function Page() {
  return <Hero name="type" />;
}
