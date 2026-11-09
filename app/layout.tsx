import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Serif } from "next/font/google";
import Background from "@/components/experience/Background";
import Guide from "@/components/experience/Guide";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

// The light direction's faces (/light). Not preloaded: the dark home page never uses them.
const plexSans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin"], axes: ["wdth"], preload: false });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"], preload: false });

export const metadata: Metadata = {
  title: "Your Name — AI Engineer & Creative Developer",
  description: "I build AI-powered products and immersive web experiences.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}
    >
      <body>
        <Background />
        {children}
        <Guide />
      </body>
    </html>
  );
}
