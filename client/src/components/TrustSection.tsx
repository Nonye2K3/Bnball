import { Shield, Lock, FileCheck, Copy, ExternalLink, Check, TrendingUp, Activity } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiBinance } from "react-icons/si";

const CONTRACT_ADDRESS = "0x...Deployment Pending";

export function TrustSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const trustFeatures = [
    {
      icon: Shield,
      title: "Smart Contract Audited",
      description: "Security-hardened contracts verified by blockchain experts",
      bgClass: "bg-gradient-to-br from-secondary/10 to-transparent",
      borderClass: "border-secondary/20",
      borderHoverClass: "hover:border-secondary/40",
      iconBgClass: "bg-secondary/10",
      iconBorderClass: "border-secondary/20",
      iconClass: "text-secondary"
    },
    {
      icon: Lock,
      title: "Non-Custodial",
      description: "Your funds remain in your wallet until you place a bet",
      bgClass: "bg-gradient-to-br from-primary/10 to-transparent",
      borderClass: "border-primary/20",
      borderHoverClass: "hover:border-primary/40",
      iconBgClass: "bg-primary/10",
      iconBorderClass: "border-primary/20",
      iconClass: "text-primary"
    },
    {
      icon: FileCheck,
      title: "Open Source",
      description: "Transparent code verified on BSCScan",
      bgClass: "bg-gradient-to-br from-accent/10 to-transparent",
      borderClass: "border-accent/20",
      borderHoverClass: "hover:border-accent/40",
      iconBgClass: "bg-accent/10",
      iconBorderClass: "border-accent/20",
      iconClass: "text-accent"
    }
  ];

  const securityStats = [
    { label: "Total Value Locked", value: "$2.8M", icon: TrendingUp, iconColor: "text-secondary" },
    { label: "Transactions", value: "45K+", icon: Activity, iconColor: "text-primary" },
    { label: "Uptime", value: "99.9%", icon: Check, iconColor: "text-secondary" }
  ];

  return (
    <div ref={ref} className="py-24 bg-gradient-to-b from-background to-card/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, hsl(var(--secondary)) 1px, transparent 1px), radial-gradient(circle at 70% 50%, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Built for Trust & Security
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your security is our priority. Every bet is protected by audited smart contracts on Binance Smart Chain.
          </p>
        </motion.div>

        {/* Trust Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {trustFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                data-testid={`trust-feature-${index + 1}`}
              >
                <Card className={`p-8 ${feature.bgClass} ${feature.borderClass} ${feature.borderHoverClass} transition-all duration-300 group hover:shadow-[0_0_30px_rgba(255,215,0,0.15)]`}>
                  <div className={`w-16 h-16 rounded-2xl ${feature.iconBgClass} border-2 ${feature.iconBorderClass} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${feature.iconClass}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Contract Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="p-8 bg-gradient-to-br from-card/80 to-card/50 border-primary/20 backdrop-blur-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left: Contract Address */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <SiBinance className="w-8 h-8 text-secondary" />
                  <h3 className="text-2xl font-bold">Smart Contract</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Deployed on Binance Smart Chain. All transactions are transparent and verifiable.
                </p>
                
                <div className="flex items-center gap-3 p-4 rounded-lg bg-black/20 dark:bg-white/5 border border-border/50">
                  <code className="text-sm font-mono flex-1 truncate">{CONTRACT_ADDRESS}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="shrink-0"
                    data-testid="button-copy-contract"
                  >
                    {copied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0"
                    data-testid="button-view-contract"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Right: Security Stats */}
              <div className="grid grid-cols-3 gap-4">
                {securityStats.map((stat, index) => {
                  const StatIcon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      className="text-center p-4 rounded-lg bg-card/50 border border-border/30"
                      data-testid={`security-stat-${index + 1}`}
                    >
                      <StatIcon className={`w-8 h-8 mx-auto mb-2 ${stat.iconColor}`} />
                      <div className="text-2xl font-bold font-mono mb-1" data-testid={`stat-value-${index + 1}`}>{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  );
                })
              }</div>
            </div>
          </Card>
        </motion.div>

        {/* Audit Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">Security Verified By</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-card/50 border border-secondary/20">
              <Check className="w-5 h-5 text-secondary" />
              <span className="font-semibold">Internal Audit</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-card/50 border border-primary/20">
              <SiBinance className="w-5 h-5 text-primary" />
              <span className="font-semibold">BSC Verified</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-card/50 border border-accent/20">
              <Shield className="w-5 h-5 text-accent" />
              <span className="font-semibold">Community Reviewed</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
