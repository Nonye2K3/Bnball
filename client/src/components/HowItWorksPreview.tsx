import { Calendar, Wallet, CheckCircle, Shield, FileCheck } from "lucide-react";
import { motion } from "framer-motion";

export function HowItWorksPreview() {
  return (
    <div className="py-16 bg-card/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Steps */}
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-12"
            >
              How It Works
            </motion.h2>
            
            <div className="flex items-start gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-start gap-2"
              >
                <div className="w-14 h-14 rounded-lg border-2 border-primary bg-card flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-primary" />
                </div>
                <p className="text-xs font-medium">Pick a<br />match</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-start gap-2"
              >
                <div className="w-14 h-14 rounded-full border-2 border-primary bg-card flex items-center justify-center">
                  <div className="flex gap-1">
                    <span className="text-primary font-bold text-xs">YES</span>
                    <span className="text-primary font-bold text-xs">NO</span>
                  </div>
                </div>
                <p className="text-xs font-medium">Predict<br />YES or NO</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="flex flex-col items-start gap-2"
              >
                <div className="w-14 h-14 rounded-lg border-2 border-primary bg-card flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-primary" />
                </div>
                <p className="text-xs font-medium">Withdraw<br />on-chain</p>
              </motion.div>
            </div>
          </div>
          
          {/* Right Side - Features */}
          <div className="flex flex-col justify-center gap-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex items-start gap-3"
            >
              <span className="text-primary text-sm">•</span>
              <p className="text-sm">Price by oracles</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="flex items-start gap-3"
            >
              <span className="text-primary text-sm">•</span>
              <p className="text-sm">Audited smart contracts</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex items-start gap-3"
            >
              <span className="text-primary text-sm">•</span>
              <p className="text-sm">Secure treasury</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
