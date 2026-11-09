"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { machine } from "@/components/machine/state";

// Hero sketches and the light direction have their own canvas.
export const OWN_STAGE = ["/light", "/type", "/optics", "/paper"];

const Stage = dynamic(() => import("@/components/machine/Stage"), { ssr: false });

// Lives in the root layout, so the machine survives page changes.
export default function Background() {
  const pathname = usePathname();
  const home = pathname === "/";

  useEffect(() => {
    if (home) return; // the home page drives the machine by scroll
    machine.shot = "rest";
    machine.invalidate();
  }, [home]);

  if (OWN_STAGE.includes(pathname)) return null; // these pages bring their own scene
  return (
    // About is all text, so the machine stays a dim presence there.
    <div className={`scene fixed inset-0 -z-10 ${home ? "" : pathname === "/about" ? "opacity-25" : "scene-fade"}`} aria-hidden>
      <Stage />
    </div>
  );
}
