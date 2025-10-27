import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, Brain, Users, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface ResolutionMethodProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  useCase: string;
  confidence: string;
}

function ResolutionMethod({ icon, title, description, useCase, confidence }: ResolutionMethodProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 rounded-lg bg-primary/10">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{title}</h3>
            <Badge variant="outline" className="text-xs">{confidence}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold">Use Case:</span> {useCase}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function Oracle() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      data-testid="page-oracle"
    >
      <Navbar />
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" data-testid="heading-oracle">
              Multi-Layer Oracle Resolution
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              We use a hybrid approach combining Chainlink oracles, AI verification, and community governance 
              to ensure accurate and fair results for every prediction market.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <ResolutionMethod
              icon={<Link2 className="w-6 h-6 text-primary" />}
              title="Chainlink Sports Oracles"
              description="Direct integration with Chainlink's decentralized oracle network for real-time sports data."
              useCase="Major league games with official statistics (NBA, NFL, FIFA)"
              confidence="99.9% Accurate"
            />
            <ResolutionMethod
              icon={<Brain className="w-6 h-6 text-primary" />}
              title="AI-Powered Verification"
              description="Advanced AI models cross-reference multiple data sources to verify outcomes for complex scenarios."
              useCase="E-sports tournaments, niche sports, and multi-condition bets"
              confidence="95%+ Confidence"
            />
            <ResolutionMethod
              icon={<Users className="w-6 h-6 text-primary" />}
              title="Community Dispute Resolution"
              description="BNBALL token holders can vote on disputed outcomes through decentralized governance."
              useCase="Edge cases where automated systems disagree or data is unclear"
              confidence="Democratic"
            />
            <ResolutionMethod
              icon={<Shield className="w-6 h-6 text-primary" />}
              title="Multi-Signature Validation"
              description="Critical markets require validation from multiple independent oracle sources before settlement."
              useCase="High-value predictions and championship events"
              confidence="Triple-Verified"
            />
          </div>
          
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h2 className="text-xl font-semibold mb-4" data-testid="heading-worst-case">Worst-Case Scenario Protection</h2>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold mb-1">Oracle Failure or Manipulation</div>
                  <p className="text-muted-foreground">
                    If primary oracle fails or shows suspicious data, system automatically triggers secondary verification 
                    through AI and requires manual review before settlement.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold mb-1">Conflicting Data Sources</div>
                  <p className="text-muted-foreground">
                    When oracle and AI disagree (confidence delta &gt; 10%), market enters 24-hour dispute period 
                    where community can vote. Requires 51% majority to resolve.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold mb-1">Game Cancellation or Postponement</div>
                  <p className="text-muted-foreground">
                    Smart contract automatically refunds all participants if event is cancelled before completion. 
                    For postponed games, deadline extends automatically to new date.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </motion.div>
  );
}
