"use client";

import { MotionConfig } from "motion/react";
import { GalaxyBackground, Footer } from "@/components";
import { LiquidNav } from "@/components/LiquidNav";
import { ContactFlow } from "@/components/ContactFlow";

export default function ContactPage() {
  return (
    <MotionConfig reducedMotion="user">
      <GalaxyBackground />
      <LiquidNav />
      <main id="main-content" className="site-main contact-page-main">
        <ContactFlow />
        <Footer />
      </main>
    </MotionConfig>
  );
}

