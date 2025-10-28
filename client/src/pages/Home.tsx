import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { LiveMarketsPreview } from "@/components/LiveMarketsPreview";
import { HowItWorksPreview } from "@/components/HowItWorksPreview";
import { Footer } from "@/components/Footer";
import { Shield, Users, FileCheck } from "lucide-react";
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
      
      {/* Trust Badges Section */}
      <div className="py-16 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 p-6 rounded-xl bg-card border border-border/50"
            >
              <div className="p-3 rounded-lg bg-primary/10">
                <Shield className="w-8 h-8 text-primary icon-3d" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Oracle</h3>
                <p className="text-sm text-muted-foreground">Chainlink verified results</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 p-6 rounded-xl bg-card border border-border/50"
            >
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-8 h-8 text-primary icon-3d" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Multisig</h3>
                <p className="text-sm text-muted-foreground">Community governance</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 p-6 rounded-xl bg-card border border-border/50"
            >
              <div className="p-3 rounded-lg bg-primary/10">
                <FileCheck className="w-8 h-8 text-primary icon-3d" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Audits</h3>
                <p className="text-sm text-muted-foreground">Smart contract security</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <Footer />
    </motion.div>
  );
}
