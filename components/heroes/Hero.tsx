"use client";

import dynamic from "next/dynamic";
import HeroFrame from "./HeroFrame";

const TypeScene = dynamic(() => import("./type/TypeScene"), { ssr: false });
const OpticsScene = dynamic(() => import("./optics/OpticsScene"), { ssr: false });
const PaperScene = dynamic(() => import("./paper/PaperScene"), { ssr: false });

const HEROES = {
  type: {
    index: 0,
    note: "The real referral letter, set in metal type. The model lifts out each field; the bad date is rejected and re-read; the stated urgency is left for a person.",
  },
  optics: {
    index: 1,
    note: "The work order as light. A prism splits it into the fields the model extracts; an amber filter stops the date that fails its check until it's re-read.",
  },
  paper: {
    index: 2,
    note: "The letter on a desk under a lamp. The model reads and annotates it, circles the bad date and re-reads it, and the routing stamp lands.",
  },
};

// Hero sketches for the three directions (hero only), to compare side by side.
export default function Hero({ name }: { name: keyof typeof HEROES }) {
  const { index, note } = HEROES[name];
  return (
    <HeroFrame index={index} note={note}>
      {(replay) =>
        name === "type" ? (
          <TypeScene replay={replay} />
        ) : name === "optics" ? (
          <OpticsScene replay={replay} />
        ) : (
          <PaperScene replay={replay} />
        )
      }
    </HeroFrame>
  );
}
