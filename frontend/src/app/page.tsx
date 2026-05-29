import { Navbar }       from "@/components/landing/Navbar";
import { HeroSection }  from "@/components/landing/HeroSection";
import { FeatureGrid }  from "@/components/landing/FeatureGrid";
import { ArchSection }  from "@/components/landing/ArchSection";
import { CTASection }   from "@/components/landing/CTASection";
import { Footer }       from "@/components/landing/Footer";

export const metadata = {
  title:       "MedGuard AI — Secure RAG Medical Assistant",
  description: "HIPAA-aligned, role-based RAG assistant for clinical and administrative teams.",
};

export default function LandingPage() {
  return (
    <>
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--brand-blue)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="hero" tabIndex={-1}>
        <HeroSection />
        <FeatureGrid />
        <ArchSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
