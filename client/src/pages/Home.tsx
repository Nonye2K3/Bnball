import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { LiveMarketsPreview } from "@/components/LiveMarketsPreview";
import { HowItWorksPreview } from "@/components/HowItWorksPreview";
import { LeaderboardPreview } from "@/components/LeaderboardPreview";
import { TrustSection } from "@/components/TrustSection";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      data-testid="page-home"
    >
      <Navbar />
      <Hero />
      <LiveMarketsPreview />
      <HowItWorksPreview />
      <LeaderboardPreview />
      <TrustSection />
      <Footer />
    </motion.div>
  );
}
